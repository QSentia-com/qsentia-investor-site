'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, LogOut, UserCircle2 } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabaseClient';

type SessionPayload = {
  authenticated: boolean;
  authConfigured?: boolean;
  user: null | {
    email?: string | null;
    name?: string | null;
    avatarUrl?: string | null;
    provider?: string | null;
  };
};

function providerLabel(provider?: string | null) {
  if (!provider) return 'Email';
  if (provider === 'github') return 'GitHub';
  if (provider === 'google') return 'Google';
  return provider.charAt(0).toUpperCase() + provider.slice(1);
}

function ProviderMark({ provider }: { provider?: string | null }) {
  if (provider === 'github') return <GitHubMark />;
  if (provider === 'google') return <span className="text-xs font-black">G</span>;
  return <UserCircle2 className="h-3.5 w-3.5" />;
}

export default function AuthSessionMenu({ theme = 'light' }: { theme?: 'light' | 'dark' }) {
  const [session, setSession] = useState<SessionPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const dark = theme === 'dark';

  useEffect(() => {
    let active = true;
    const supabase = getSupabaseBrowserClient();

    async function refreshSession() {
      try {
        const response = await fetch('/api/auth/session', { cache: 'no-store' });
        const payload = (await response.json()) as SessionPayload;
        if (active) setSession(payload);
      } catch {
        if (active) setSession({ authenticated: false, user: null });
      } finally {
        if (active) setLoading(false);
      }
    }

    refreshSession();

    if (!supabase) return () => {
      active = false;
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      refreshSession();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    const supabase = getSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => null);
    setSession({ authenticated: false, user: null });
    window.location.href = '/signin';
  }

  if (loading) {
    return (
      <div
        className={`rounded-md px-3 py-2 text-sm font-semibold ${
          dark ? 'text-[#d7dfed]' : 'text-[#647269]'
        }`}
      >
        Checking session
      </div>
    );
  }

  if (session?.authenticated && session.user) {
    const name = session.user.name || session.user.email || 'Signed in';
    const provider = session.user.provider || 'email';

    return (
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/customer"
          className={`inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-semibold transition ${
            dark
              ? 'border-[#24304d] bg-[#10172b] text-[#d7dfed] hover:border-[#b7c5ff] hover:text-white'
              : 'border-[#cbd5ff] bg-white text-[#172554] hover:border-[#3d52da] hover:bg-[#f8faff]'
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Settings</span>
        </Link>
        <Link
          href="/dashboard"
          className={`inline-flex max-w-[260px] items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition ${
            dark
              ? 'border-[#24304d] bg-[#10172b] text-white hover:border-[#b7c5ff]'
              : 'border-[#cbd5ff] bg-[#f8faff] text-[#172554] hover:border-[#3d52da]'
          }`}
          title={`${name} via ${providerLabel(provider)}`}
        >
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
              dark ? 'bg-[#050714] text-[#b7c5ff]' : 'bg-[#eef2ff] text-[#3d52da]'
            }`}
          >
            <ProviderMark provider={provider} />
          </span>
          <span className="min-w-0">
            <span className="block truncate leading-4">{name}</span>
            <span className={`block truncate text-[11px] leading-4 ${dark ? 'text-[#9ba7c2]' : 'text-[#647269]'}`}>
              Logged in with {providerLabel(provider)}
            </span>
          </span>
        </Link>
        <button
          type="button"
          suppressHydrationWarning
          onClick={signOut}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-md border transition ${
            dark
              ? 'border-[#24304d] text-[#d7dfed] hover:border-[#b7c5ff]'
              : 'border-[#cbd5ff] text-[#172554] hover:border-[#3d52da]'
          }`}
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/signin"
        className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
          dark ? 'text-[#d7dfed] hover:bg-[#10172b]' : 'text-[#26352c] hover:bg-[#eef2ff]'
        }`}
      >
        Sign in
      </Link>
      <Link
        href="/dashboard"
        className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-semibold transition ${
          dark ? 'bg-white text-[#050714] hover:bg-[#dce2ff]' : 'bg-[#172554] text-white hover:bg-[#2437b5]'
        }`}
      >
        Dashboard
      </Link>
    </div>
  );
}

function GitHubMark() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.72c-2.78.6-3.37-1.18-3.37-1.18a2.65 2.65 0 0 0-1.11-1.47c-.91-.62.07-.61.07-.61a2.1 2.1 0 0 1 1.53 1.03 2.13 2.13 0 0 0 2.91.83 2.12 2.12 0 0 1 .63-1.34c-2.22-.25-4.56-1.11-4.56-4.95a3.88 3.88 0 0 1 1.03-2.69 3.6 3.6 0 0 1 .1-2.65s.84-.27 2.75 1.03a9.46 9.46 0 0 1 5 0c1.91-1.3 2.75-1.03 2.75-1.03.37.85.41 1.82.1 2.65a3.87 3.87 0 0 1 1.03 2.69c0 3.85-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
    </svg>
  );
}
