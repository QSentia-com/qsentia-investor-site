import { NextResponse } from 'next/server';
import { createInvestorRequest } from '@/lib/investorRequests';

export async function POST(request: Request) {
  try {
    const record = await createInvestorRequest(await request.json());
    return NextResponse.json({ requestId: record.id, status: record.status }, { status: 201, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Request could not be submitted' }, { status: 400 });
  }
}
