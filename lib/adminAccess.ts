import type { User } from '@supabase/supabase-js';

export type AdminRole = 'super_admin' | 'admin' | 'operations_admin';
export type AdminGrantStatus = 'invited' | 'active' | 'revoked';

export type AdminAccessGrant = {
  email: string;
  role: AdminRole;
  status: AdminGrantStatus;
  invitedByEmail: string | null;
  supabaseUserId: string | null;
  inviteSentAt: string | null;
  lastInviteError: string | null;
  createdAt: string;
  updatedAt: string;
};

const ADMIN_ROLES = new Set<AdminRole>(['super_admin', 'admin', 'operations_admin']);
const ACTIVE_GRANT_STATUSES = new Set<AdminGrantStatus>(['invited', 'active']);

function hasSupabaseAdminConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

async function supabaseAdminClient() {
  if (!hasSupabaseAdminConfig()) return null;
  const { supabaseAdmin } = await import('../backend/lib/supabase');
  return supabaseAdmin;
}

export function validAdminRole(value: unknown): value is AdminRole {
  return typeof value === 'string' && ADMIN_ROLES.has(value as AdminRole);
}

export function configuredAdminEmails() {
  return new Set(
    (process.env.QSENTIA_ADMIN_EMAILS || '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
}

function normalizeEmail(value: unknown) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function rowToGrant(row: Record<string, unknown>): AdminAccessGrant {
  return {
    email: String(row.email),
    role: row.role as AdminRole,
    status: row.status as AdminGrantStatus,
    invitedByEmail: typeof row.invited_by_email === 'string' ? row.invited_by_email : null,
    supabaseUserId: typeof row.supabase_user_id === 'string' ? row.supabase_user_id : null,
    inviteSentAt: typeof row.invite_sent_at === 'string' ? row.invite_sent_at : null,
    lastInviteError: typeof row.last_invite_error === 'string' ? row.last_invite_error : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function roleFromUserMetadata(user: User | null | undefined): AdminRole | null {
  const role = typeof user?.app_metadata?.role === 'string' ? user.app_metadata.role.toLowerCase() : '';
  return validAdminRole(role) ? role : null;
}

export async function findAdminAccessGrant(email: string) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;

  const client = await supabaseAdminClient();
  if (!client) return null;

  const { data, error } = await client
    .from('admin_access_grants')
    .select('*')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (error) return null;
  return data ? rowToGrant(data) : null;
}

export async function resolveAdminRole(user: User | null | undefined): Promise<AdminRole | null> {
  if (!user?.email) return null;

  const metadataRole = roleFromUserMetadata(user);
  if (metadataRole) return metadataRole;

  if (configuredAdminEmails().has(user.email.toLowerCase())) return 'super_admin';

  const grant = await findAdminAccessGrant(user.email);
  if (grant && ACTIVE_GRANT_STATUSES.has(grant.status)) return grant.role;

  return null;
}

export async function listAdminAccessGrants() {
  const client = await supabaseAdminClient();
  if (!client) return [];

  const { data, error } = await client
    .from('admin_access_grants')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return (data || []).map((row) => rowToGrant(row));
}

async function findAuthUserByEmail(
  client: NonNullable<Awaited<ReturnType<typeof supabaseAdminClient>>>,
  email: string
) {
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage: 100 });
    if (error) return null;

    const user = data.users.find((item) => item.email?.toLowerCase() === email);
    if (user) return user;
    if (data.users.length < 100) return null;
  }

  return null;
}

function inviteRedirectUrl(request: Request) {
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    request.headers.get('origin') ||
    new URL(request.url).origin;
  const callback = new URL('/auth/callback', origin);
  callback.searchParams.set('next', '/admin');
  return callback.toString();
}

export async function grantAdminAccess({
  email,
  role,
  actorEmail,
  request,
}: {
  email: string;
  role: AdminRole;
  actorEmail: string;
  request: Request;
}) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !normalizedEmail.includes('@')) throw new Error('Enter a valid admin email address');
  if (!validAdminRole(role)) throw new Error('Select a valid admin role');

  const client = await supabaseAdminClient();
  if (!client) throw new Error('Supabase service role is required to manage admin access');

  const now = new Date().toISOString();
  let userId: string | null = null;
  let inviteSentAt: string | null = null;
  let lastInviteError: string | null = null;
  let status: AdminGrantStatus = 'invited';

  const { data: invited, error: inviteError } = await client.auth.admin.inviteUserByEmail(
    normalizedEmail,
    {
      redirectTo: inviteRedirectUrl(request),
      data: {
        qsentia_admin_role: role,
        invited_by: actorEmail,
      },
    }
  );

  if (inviteError) {
    lastInviteError = inviteError.message;
    const existingUser = await findAuthUserByEmail(client, normalizedEmail);
    if (!existingUser) throw new Error(`Supabase invite failed: ${inviteError.message}`);
    userId = existingUser.id;
    status = 'active';
  } else {
    userId = invited.user?.id || null;
    inviteSentAt = now;
  }

  if (userId) {
    const { data: existing } = await client.auth.admin.getUserById(userId);
    const { error: metadataError } = await client.auth.admin.updateUserById(userId, {
      app_metadata: {
        ...(existing.user?.app_metadata || {}),
        role,
      },
    });
    if (metadataError) throw new Error(`Admin role metadata could not be updated: ${metadataError.message}`);
  }

  const { error } = await client.from('admin_access_grants').upsert(
    {
      email: normalizedEmail,
      role,
      status,
      invited_by_email: actorEmail,
      supabase_user_id: userId,
      invite_sent_at: inviteSentAt,
      last_invite_error: lastInviteError,
      updated_at: now,
    },
    { onConflict: 'email' }
  );

  if (error) throw error;
  return {
    grant: await findAdminAccessGrant(normalizedEmail),
    emailSent: Boolean(inviteSentAt),
    inviteError: lastInviteError,
  };
}

export async function revokeAdminAccess(email: string) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) throw new Error('Admin email is required');

  const client = await supabaseAdminClient();
  if (!client) throw new Error('Supabase service role is required to manage admin access');

  const grant = await findAdminAccessGrant(normalizedEmail);
  if (grant?.supabaseUserId) {
    const { data: existing } = await client.auth.admin.getUserById(grant.supabaseUserId);
    const appMetadata = { ...(existing.user?.app_metadata || {}) };
    delete appMetadata.role;
    await client.auth.admin.updateUserById(grant.supabaseUserId, { app_metadata: appMetadata });
  }

  const { error } = await client
    .from('admin_access_grants')
    .update({ status: 'revoked', updated_at: new Date().toISOString() })
    .eq('email', normalizedEmail);

  if (error) throw error;
}
