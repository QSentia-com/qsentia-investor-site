import { NextResponse } from 'next/server';

export function configuredAdminKey() {
  return process.env.QSENTIA_ADMIN_KEY || process.env.ADMIN_KEY || '';
}

export function adminAuthMode(): 'development' | 'protected' {
  return configuredAdminKey() ? 'protected' : 'development';
}

export function unauthorizedAdminResponse(request: Request) {
  const expected = configuredAdminKey();
  if (!expected) return null;

  const provided = request.headers.get('x-qsentia-admin-key') || '';
  if (provided === expected) return null;

  return NextResponse.json(
    { error: 'Admin access key required' },
    { status: 401, headers: { 'Cache-Control': 'no-store' } }
  );
}
