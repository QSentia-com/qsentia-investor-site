import { NextResponse } from 'next/server';
import { upsertLead } from '@/lib/adminBackOffice';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    await upsertLead({
      name,
      email,
      organization: body.organization,
      source: body.source,
      interest: body.interest,
      modelId: body.modelId,
      notes: body.notes,
      stage: 'new',
    });

    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Error capturing lead:', error);
    return NextResponse.json(
      { error: 'Failed to capture lead' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
