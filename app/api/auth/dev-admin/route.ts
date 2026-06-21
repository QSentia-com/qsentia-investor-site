import { timingSafeEqual } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import {
  DEV_ADMIN_COOKIE,
  devAdminEnabled,
  devAdminPassword,
  devAdminSessionValue,
} from '@/lib/devAdminAuth';

function passwordsMatch(received: string, expected: string) {
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  return receivedBuffer.length === expectedBuffer.length && timingSafeEqual(receivedBuffer, expectedBuffer);
}

export function GET() {
  return NextResponse.json(
    { enabled: devAdminEnabled() },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

export async function POST(request: NextRequest) {
  if (!devAdminEnabled()) {
    return NextResponse.json({ error: 'Temporary access is unavailable' }, { status: 404 });
  }

  const body = (await request.json().catch(() => null)) as { password?: unknown } | null;
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!passwordsMatch(password, devAdminPassword())) {
    return NextResponse.json({ error: 'Incorrect temporary access password' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(DEV_ADMIN_COOKIE, devAdminSessionValue(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: 60 * 60 * 8,
  });
  return response;
}
