import { NextResponse } from 'next/server';
import { readBackOfficeStore, upsertApplication } from '@/lib/adminBackOffice';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const roleId = typeof body.roleId === 'string' ? body.roleId.trim() : '';
    const candidateName = typeof body.candidateName === 'string' ? body.candidateName.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';

    if (!roleId || !candidateName || !email) {
      return NextResponse.json(
        { error: 'Role, name, and email are required' },
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

    await upsertApplication({
      roleId,
      candidateName,
      email,
      source: body.source || 'careers-page',
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
