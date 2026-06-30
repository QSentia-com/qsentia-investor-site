import { NextResponse } from 'next/server';
import { readBackOfficeStore, uploadCandidateCv, upsertApplication } from '@/lib/adminBackOffice';

const MAX_CV_BYTES = 6 * 1024 * 1024;
const ALLOWED_CV_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

function isLinkedInProfileUrl(value: string) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    return hostname === 'linkedin.com' || hostname.endsWith('.linkedin.com');
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    const body = contentType.includes('multipart/form-data')
      ? await request.formData()
      : ((await request.json()) as Record<string, unknown>);
    const value = (key: string) => body instanceof FormData ? body.get(key) : body[key];
    const textValue = (key: string) => {
      const item = value(key);
      return typeof item === 'string' ? item.trim() : '';
    };
    const roleId = textValue('roleId');
    const candidateName = textValue('candidateName');
    const email = textValue('email');
    const linkedInUrl = textValue('linkedInUrl');
    const profileConsentValue = value('profileConsent');
    const profileConsent = profileConsentValue === 'true' || profileConsentValue === true;

    if (!roleId || !candidateName || !email || !linkedInUrl || !profileConsent) {
      return NextResponse.json(
        { error: 'Role, name, email, LinkedIn profile, and consent are required' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    if (!isLinkedInProfileUrl(linkedInUrl)) {
      return NextResponse.json(
        { error: 'LinkedIn profile must be a valid linkedin.com URL' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const store = await readBackOfficeStore();
    const role = store.careerRoles.find((candidate) => candidate.id === roleId && candidate.status === 'open');

    if (!role) {
      return NextResponse.json(
        { error: 'This role is not open for applications' },
        { status: 404, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const cv = body instanceof FormData ? body.get('cv') : null;
    let cvMeta: { cvFileName: string; cvStoragePath: string } | null = null;

    if (!(cv instanceof File) || cv.size <= 0) {
      return NextResponse.json(
        { error: 'CV or resume upload is required' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    if (cv.size > MAX_CV_BYTES) {
      return NextResponse.json(
        { error: 'CV must be 6MB or smaller' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    if (cv.type && !ALLOWED_CV_TYPES.has(cv.type)) {
      return NextResponse.json(
        { error: 'CV must be a PDF, DOC, or DOCX file' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    cvMeta = await uploadCandidateCv({ file: cv, roleId, email });

    await upsertApplication({
      roleId,
      candidateName,
      email,
      linkedInUrl,
      profileConsent,
      cvFileName: cvMeta?.cvFileName || null,
      cvStoragePath: cvMeta?.cvStoragePath || null,
      source: textValue('source') || 'careers-page',
      stage: 'received',
    });

    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Error submitting career application:', error);
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
