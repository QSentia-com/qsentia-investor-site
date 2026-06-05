import { NextResponse } from 'next/server';
import { unauthorizedAdminResponse } from '@/lib/adminAuth';
import {
  upsertApplication,
  upsertCareerRole,
  upsertLead,
  upsertOffer,
  upsertTicket,
} from '@/lib/adminBackOffice';

type BackOfficePayload = {
  type?: unknown;
  id?: unknown;
  payload?: unknown;
};

async function writeRecord(body: BackOfficePayload) {
  const id = typeof body.id === 'string' ? body.id : undefined;

  if (body.type === 'lead') {
    return upsertLead(body.payload, id);
  }

  if (body.type === 'ticket') {
    return upsertTicket(body.payload, id);
  }

  if (body.type === 'careerRole') {
    return upsertCareerRole(body.payload, id);
  }

  if (body.type === 'application') {
    return upsertApplication(body.payload, id);
  }

  if (body.type === 'offer') {
    return upsertOffer(body.payload, id);
  }

  return null;
}

export async function POST(request: Request) {
  const authError = unauthorizedAdminResponse(request);
  if (authError) return authError;

  try {
    const body = (await request.json()) as BackOfficePayload;
    const store = await writeRecord(body);

    if (!store) {
      return NextResponse.json(
        { error: 'Unsupported back-office record type' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    return NextResponse.json({ ok: true, store }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Error creating back-office record:', error);
    return NextResponse.json(
      { error: 'Failed to create back-office record' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

export async function PATCH(request: Request) {
  const authError = unauthorizedAdminResponse(request);
  if (authError) return authError;

  try {
    const body = (await request.json()) as BackOfficePayload;

    if (typeof body.id !== 'string') {
      return NextResponse.json(
        { error: 'Record id is required' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const store = await writeRecord(body);

    if (!store) {
      return NextResponse.json(
        { error: 'Unsupported back-office record type' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    return NextResponse.json({ ok: true, store }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Error updating back-office record:', error);
    return NextResponse.json(
      { error: 'Failed to update back-office record' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
