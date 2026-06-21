import { NextResponse, type NextRequest } from 'next/server';
import { unauthorizedAdminResponse } from '@/lib/adminAuth';
import {
  advanceModelSubmission,
  createModelSubmission,
  readModelOnboarding,
  validateModelSubmission,
} from '@/lib/modelOnboarding';

export async function GET(request: NextRequest) {
  const authError = await unauthorizedAdminResponse(request);
  if (authError) return authError;
  try {
    return NextResponse.json(await readModelOnboarding(), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Error loading model onboarding:', error);
    return NextResponse.json({ error: 'Failed to load model onboarding' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = await unauthorizedAdminResponse(request);
  if (authError) return authError;
  try {
    const body = (await request.json()) as { action?: string; payload?: unknown; id?: string };
    if (body.action === 'submit') return NextResponse.json({ ok: true, submission: await createModelSubmission(body.payload) });
    if (body.action === 'validate' && body.id) return NextResponse.json({ ok: true, validation: await validateModelSubmission(body.id) });
    return NextResponse.json({ error: 'Unsupported onboarding action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Onboarding update failed' }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  const authError = await unauthorizedAdminResponse(request);
  if (authError) return authError;
  try {
    return NextResponse.json({ ok: true, submission: await advanceModelSubmission(await request.json()) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Onboarding update failed' }, { status: 400 });
  }
}
