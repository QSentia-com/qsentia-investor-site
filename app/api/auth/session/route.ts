import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { resolveAdminRole } from '@/lib/adminAccess';

function authConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return { supabaseUrl, supabaseAnonKey };
}

function providerFor(user: { app_metadata?: Record<string, unknown>; identities?: Array<{ provider?: string }> }) {
  const provider = user.app_metadata?.provider;
  if (typeof provider === 'string') return provider;
  return user.identities?.[0]?.provider || 'email';
}

function displayNameFor(user: {
  email?: string;
  user_metadata?: Record<string, unknown>;
}) {
  const metadataName = user.user_metadata?.full_name || user.user_metadata?.name;
  if (typeof metadataName === 'string' && metadataName.trim()) return metadataName.trim();
  return user.email?.split('@')[0] || 'QSentia user';
}

export async function GET(request: NextRequest) {
  const config = authConfig();

  if (!config) {
    return NextResponse.json(
      { authenticated: false, user: null, authConfigured: false },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const supabase = createServerClient(config.supabaseUrl, config.supabaseAnonKey, {
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
  const adminRole = user ? await resolveAdminRole(user) : null;

  const response = NextResponse.json(
    {
      authenticated: Boolean(user),
      authConfigured: true,
      user: user
        ? {
            id: user.id,
            email: user.email,
            name: displayNameFor(user),
            avatarUrl:
              typeof user.user_metadata?.avatar_url === 'string' ? user.user_metadata.avatar_url : null,
            provider: providerFor(user),
            adminRole,
            lastSignInAt: user.last_sign_in_at,
          }
        : null,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );

  return response;
}
