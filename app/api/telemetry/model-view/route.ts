import { NextResponse } from 'next/server';
import { recordModelView } from '@/lib/adminBackOffice';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await recordModelView(body);
    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Error recording model view:', error);
    return NextResponse.json(
      { error: 'Failed to record model view' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
