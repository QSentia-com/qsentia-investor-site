import { createServerClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { DEV_ADMIN_COOKIE, validDevAdminSession } from '@/lib/devAdminAuth';

const ADMIN_ROLES = new Set(['admin', 'super_admin', 'operations_admin']);

function configuredAdminEmails() {
  return new Set(
    (process.env.QSENTIA_ADMIN_EMAILS || '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function isAdminUser(user: User | null | undefined) {
  if (!user) return false;
  const role = typeof user.app_metadata?.role === 'string' ? user.app_metadata.role.toLowerCase() : '';
  const email = user.email?.toLowerCase() || '';
  return ADMIN_ROLES.has(role) || configuredAdminEmails().has(email);
}

export function adminRoleLabel(user: User | null | undefined) {
  if (!user) return null;
  const role = typeof user.app_metadata?.role === 'string' ? user.app_metadata.role : '';
  if (ADMIN_ROLES.has(role.toLowerCase())) return role;
  return configuredAdminEmails().has(user.email?.toLowerCase() || '') ? 'admin' : null;
}

export async function getRequestUser(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return null;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll() {},
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function unauthorizedAdminResponse(request: NextRequest) {
  if (validDevAdminSession(request.cookies.get(DEV_ADMIN_COOKIE)?.value)) return null;

  const user = await getRequestUser(request);

  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  if (!isAdminUser(user)) {
    return NextResponse.json(
      { error: 'Admin role required' },
      { status: 403, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  return null;
}
