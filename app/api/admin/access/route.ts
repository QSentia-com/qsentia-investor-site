import { NextResponse, type NextRequest } from 'next/server';
import {
  grantAdminAccess,
  listAdminAccessGrants,
  revokeAdminAccess,
  resolveAdminRole,
  validAdminRole,
  type AdminRole,
} from '@/lib/adminAccess';
import { getRequestUser, unauthorizedAdminResponse } from '@/lib/adminAuth';

async function requireSuperAdmin(request: NextRequest) {
  const authError = await unauthorizedAdminResponse(request);
  if (authError) return { error: authError };

  const user = await getRequestUser(request);
  const role = await resolveAdminRole(user);
  if (role !== 'super_admin') {
    return {
      error: NextResponse.json(
        { error: 'Super admin role required' },
        { status: 403, headers: { 'Cache-Control': 'no-store' } }
      ),
    };
  }

  return { user };
}

export async function GET(request: NextRequest) {
  const authError = await unauthorizedAdminResponse(request);
  if (authError) return authError;

  const user = await getRequestUser(request);
  const role = await resolveAdminRole(user);

  try {
    return NextResponse.json(
      {
        currentUser: {
          email: user?.email || null,
          role,
          canGrantAccess: role === 'super_admin',
        },
        grants: await listAdminAccessGrants(),
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Admin access could not be loaded' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

export async function POST(request: NextRequest) {
  const guard = await requireSuperAdmin(request);
  if (guard.error) return guard.error;

  const body = (await request.json().catch(() => null)) as {
    email?: unknown;
    role?: unknown;
  } | null;
  const role = validAdminRole(body?.role) ? (body.role as AdminRole) : null;

  if (!role || typeof body?.email !== 'string') {
    return NextResponse.json(
      { error: 'Email and valid admin role are required' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  try {
    const result = await grantAdminAccess({
      email: body.email,
      role,
      actorEmail: guard.user?.email || 'unknown-admin',
      request,
    });

    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Admin invite could not be sent' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const guard = await requireSuperAdmin(request);
  if (guard.error) return guard.error;

  const body = (await request.json().catch(() => null)) as { email?: unknown; action?: unknown } | null;
  if (body?.action !== 'revoke' || typeof body.email !== 'string') {
    return NextResponse.json(
      { error: 'A revoke action and email are required' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  try {
    await revokeAdminAccess(body.email);
    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Admin access could not be revoked' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
