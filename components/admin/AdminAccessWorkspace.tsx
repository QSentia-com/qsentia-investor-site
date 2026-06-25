'use client';

import { useState } from 'react';
import useSWR from 'swr';
import {
  CheckCircle2,
  Mail,
  RefreshCw,
  ShieldCheck,
  ShieldOff,
  UserPlus,
} from 'lucide-react';

type AdminRole = 'super_admin' | 'admin' | 'operations_admin';
type AdminGrant = {
  email: string;
  role: AdminRole;
  status: 'invited' | 'active' | 'revoked';
  invitedByEmail: string | null;
  supabaseUserId: string | null;
  inviteSentAt: string | null;
  lastInviteError: string | null;
  createdAt: string;
  updatedAt: string;
};

type AdminAccessResponse = {
  currentUser: {
    email: string | null;
    role: AdminRole | null;
    canGrantAccess: boolean;
  };
  grants: AdminGrant[];
};

const roles: Array<{ value: AdminRole; label: string; detail: string }> = [
  {
    value: 'super_admin',
    label: 'Super admin',
    detail: 'Can grant access, manage admins, and operate all admin workspaces.',
  },
  {
    value: 'admin',
    label: 'Admin',
    detail: 'Can manage commercial, customer, model, billing, and operations records.',
  },
  {
    value: 'operations_admin',
    label: 'Operations admin',
    detail: 'Can operate workspace data, support queues, tickets, and onboarding tasks.',
  },
];

async function fetcher(url: string) {
  const response = await fetch(url, { cache: 'no-store' });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Request failed: ${response.status}`);
  return payload;
}

function roleLabel(role: string | null | undefined) {
  if (!role) return 'Not assigned';
  return role
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function dateLabel(value: string | null | undefined) {
  if (!value) return 'Not sent';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not sent';
  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

function statusClass(status: AdminGrant['status']) {
  if (status === 'active') return 'border-[#a7e8cc] bg-[#ecfdf5] text-[#047857]';
  if (status === 'invited') return 'border-[#c7d2fe] bg-[#eef2ff] text-[#3046c8]';
  return 'border-[#fecdd3] bg-[#fff1f2] text-[#be123c]';
}

export default function AdminAccessWorkspace() {
  const { data, error, isLoading, mutate } = useSWR<AdminAccessResponse>('/api/admin/access', fetcher, {
    shouldRetryOnError: false,
  });
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AdminRole>('admin');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  const grants = data?.grants || [];
  const activeCount = grants.filter((grant) => grant.status === 'active').length;
  const invitedCount = grants.filter((grant) => grant.status === 'invited').length;

  async function inviteAdmin() {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch('/api/admin/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Admin invite failed');
      setEmail('');
      setMessage({
        tone: 'success',
        text: payload.emailSent
          ? 'Admin access granted and Supabase invite email sent.'
          : 'Admin access granted. Existing Supabase user metadata was updated.',
      });
      await mutate();
    } catch (inviteError) {
      setMessage({ tone: 'error', text: inviteError instanceof Error ? inviteError.message : 'Admin invite failed' });
    } finally {
      setSaving(false);
    }
  }

  async function revoke(emailToRevoke: string) {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch('/api/admin/access', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'revoke', email: emailToRevoke }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Admin access could not be revoked');
      setMessage({ tone: 'success', text: 'Admin access revoked.' });
      await mutate();
    } catch (revokeError) {
      setMessage({ tone: 'error', text: revokeError instanceof Error ? revokeError.message : 'Unable to revoke access' });
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <AccessPanel title="Loading access control" icon={<RefreshCw className="h-4 w-4 animate-spin" />}>
        <div className="grid gap-3 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-md border border-[#dfe5f2] bg-[#f8faff]" />
          ))}
        </div>
      </AccessPanel>
    );
  }

  return (
    <div className="grid gap-5">
      {error ? (
        <div className="rounded-md border border-[#fecdd3] bg-[#fff1f2] px-4 py-3 text-sm font-semibold text-[#be123c]">
          {error.message}
        </div>
      ) : null}

      {message ? (
        <div
          className={`rounded-md border px-4 py-3 text-sm font-semibold ${
            message.tone === 'success'
              ? 'border-[#a7e8cc] bg-[#ecfdf5] text-[#047857]'
              : 'border-[#fecdd3] bg-[#fff1f2] text-[#be123c]'
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-4">
        <Metric label="Your role" value={roleLabel(data?.currentUser.role)} icon={<ShieldCheck />} />
        <Metric label="Active admins" value={String(activeCount)} icon={<CheckCircle2 />} />
        <Metric label="Pending invites" value={String(invitedCount)} icon={<Mail />} />
        <Metric label="Total grants" value={String(grants.length)} icon={<UserPlus />} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <AccessPanel title="Grant admin access" icon={<UserPlus className="h-4 w-4" />}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-xs font-bold uppercase tracking-wide text-[#647269]" htmlFor="admin-email">
                Email address
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@qsentia.com"
                disabled={!data?.currentUser.canGrantAccess || saving}
                className="rounded-md border border-[#dbe3ff] bg-white px-3 py-2.5 text-sm text-[#06130c] outline-none focus:border-[#3d52da] disabled:bg-[#f8fafc]"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-bold uppercase tracking-wide text-[#647269]" htmlFor="admin-role">
                Role
              </label>
              <select
                id="admin-role"
                value={role}
                onChange={(event) => setRole(event.target.value as AdminRole)}
                disabled={!data?.currentUser.canGrantAccess || saving}
                className="rounded-md border border-[#dbe3ff] bg-white px-3 py-2.5 text-sm font-semibold text-[#06130c] outline-none focus:border-[#3d52da] disabled:bg-[#f8fafc]"
              >
                {roles.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="rounded-md border border-[#dfe5f2] bg-[#f8faff] p-3 text-xs leading-5 text-[#5a685f]">
              {roles.find((item) => item.value === role)?.detail}
            </div>
            <button
              type="button"
              onClick={inviteAdmin}
              disabled={!data?.currentUser.canGrantAccess || saving || !email.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#172554] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#2437b5] disabled:cursor-not-allowed disabled:opacity-55"
            >
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              Send Supabase invite
            </button>
            {!data?.currentUser.canGrantAccess ? (
              <div className="rounded-md border border-[#fde68a] bg-[#fffbeb] p-3 text-xs font-semibold leading-5 text-[#a16207]">
                Only a super admin can grant or revoke admin access.
              </div>
            ) : null}
          </div>
        </AccessPanel>

        <AccessPanel title="Admin directory" icon={<ShieldCheck className="h-4 w-4" />}>
          {grants.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-[#647269]">
                  <tr className="border-b border-[#e2e7fb]">
                    <th className="py-3 pr-4">Email</th>
                    <th className="py-3 pr-4">Role</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Invite</th>
                    <th className="py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf1fb]">
                  {grants.map((grant) => (
                    <tr key={grant.email}>
                      <td className="py-3 pr-4">
                        <div className="font-semibold text-[#06130c]">{grant.email}</div>
                        <div className="mt-1 text-xs text-[#647269]">By {grant.invitedByEmail || 'system'}</div>
                      </td>
                      <td className="py-3 pr-4 text-[#172554]">{roleLabel(grant.role)}</td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-bold ${statusClass(grant.status)}`}>
                          {roleLabel(grant.status)}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-[#647269]">
                        <div>{dateLabel(grant.inviteSentAt)}</div>
                        {grant.lastInviteError ? <div className="mt-1 max-w-[220px] truncate text-xs text-[#be123c]">{grant.lastInviteError}</div> : null}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => revoke(grant.email)}
                          disabled={!data?.currentUser.canGrantAccess || saving || grant.status === 'revoked'}
                          className="inline-flex items-center justify-center gap-2 rounded-md border border-[#fecdd3] px-3 py-2 text-xs font-bold text-[#be123c] hover:bg-[#fff1f2] disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          <ShieldOff className="h-3.5 w-3.5" />
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-[#cbd5ff] bg-[#f8faff] p-6 text-center">
              <div className="font-semibold text-[#06130c]">No admin grants found</div>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#647269]">
                Run the Supabase admin access setup SQL, then grant access from this workspace.
              </p>
            </div>
          )}
        </AccessPanel>
      </div>
    </div>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-[10px] border border-[#dfe5f2] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-[#647269]">{label}</div>
          <div className="mt-3 text-2xl font-semibold text-[#0f172a]">{value}</div>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#eef2ff] text-[#3d52da] [&>svg]:h-4 [&>svg]:w-4">
          {icon}
        </span>
      </div>
    </div>
  );
}

function AccessPanel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-[10px] border border-[#dfe5f2] bg-white shadow-sm">
      <header className="flex items-center gap-3 border-b border-[#edf1fb] px-5 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#eef2ff] text-[#3d52da]">
          {icon}
        </span>
        <h2 className="text-base font-semibold text-[#0f172a]">{title}</h2>
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}
