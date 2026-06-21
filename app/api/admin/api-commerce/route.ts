import { NextResponse, type NextRequest } from 'next/server';
import { unauthorizedAdminResponse } from '@/lib/adminAuth';
import {
  createApiCustomer,
  createModelEntitlement,
  issueApiCredential,
  readCommerceOverview,
  updateCommerceRecord,
} from '@/lib/adminApiCommerce';

export async function GET(request: NextRequest) {
  const authError = await unauthorizedAdminResponse(request);
  if (authError) return authError;
  try {
    return NextResponse.json(await readCommerceOverview(), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Error loading API commerce:', error);
    return NextResponse.json({ error: 'Failed to load API commerce data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = await unauthorizedAdminResponse(request);
  if (authError) return authError;
  try {
    const body = (await request.json()) as { action?: string; payload?: unknown };
    if (body.action === 'create_customer') return NextResponse.json({ ok: true, record: await createApiCustomer(body.payload) });
    if (body.action === 'create_entitlement') return NextResponse.json({ ok: true, record: await createModelEntitlement(body.payload) });
    if (body.action === 'issue_api_key') return NextResponse.json({ ok: true, ...(await issueApiCredential(body.payload)) });
    return NextResponse.json({ error: 'Unsupported API commerce action' }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'API commerce update failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  const authError = await unauthorizedAdminResponse(request);
  if (authError) return authError;
  try {
    await updateCommerceRecord(await request.json());
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'API commerce update failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
