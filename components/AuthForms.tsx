"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, KeyRound, Loader2 } from "lucide-react";
import { authConfigMissingMessage, getSupabaseBrowserClient } from "@/lib/supabaseClient";

type OAuthProvider = "google" | "github";

function callbackUrl(nextPath: string) {
  const callback = new URL("/auth/callback", window.location.origin);
  callback.searchParams.set("next", nextPath);
  return callback.toString();
}

function nextPathFromLocation() {
  if (typeof window === "undefined") return "/dashboard";
  return new URLSearchParams(window.location.search).get("next") || "/dashboard";
}

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [providerLoading, setProviderLoading] = useState<OAuthProvider | null>(null);
  const [devAdminPassword, setDevAdminPassword] = useState("");
  const [devAdminError, setDevAdminError] = useState("");
  const [devAdminLoading, setDevAdminLoading] = useState(false);
  const [showDevAdmin, setShowDevAdmin] = useState(false);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("error");
    if (!code) return;

    const timer = window.setTimeout(() => {
      if (code === "auth_not_configured") setError(authConfigMissingMessage());
      if (code === "oauth_exchange_failed") {
        setError("OAuth sign-in could not be completed. Please try again.");
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!nextPathFromLocation().startsWith("/admin")) return;
    let active = true;
    fetch("/api/auth/dev-admin", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => {
        if (active) setShowDevAdmin(Boolean(payload.enabled));
      })
      .catch(() => null);
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setError(authConfigMissingMessage());
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    window.location.href = nextPathFromLocation();
  }

  async function handleOAuth(provider: OAuthProvider) {
    setProviderLoading(provider);
    setError("");
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setError(authConfigMissingMessage());
      setProviderLoading(null);
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: callbackUrl(nextPathFromLocation()),
        queryParams: provider === "google" ? { prompt: "select_account" } : undefined,
      },
    });

    if (error) {
      setError(error.message);
      setProviderLoading(null);
    }
  }

  async function handleDevAdmin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDevAdminLoading(true);
    setDevAdminError("");

    try {
      const response = await fetch("/api/auth/dev-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: devAdminPassword }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        setDevAdminError(payload?.error || "Temporary admin access failed");
        return;
      }

      window.location.href = nextPathFromLocation();
    } catch {
      setDevAdminError("Temporary admin access could not be completed");
    } finally {
      setDevAdminLoading(false);
    }
  }

  return (
    <div className="mt-6 grid gap-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <ProviderButton
          provider="google"
          label="Continue with Google"
          loading={providerLoading === "google"}
          disabled={Boolean(providerLoading) || loading}
          onClick={() => handleOAuth("google")}
        />
        <ProviderButton
          provider="github"
          label="Continue with GitHub"
          loading={providerLoading === "github"}
          disabled={Boolean(providerLoading) || loading}
          onClick={() => handleOAuth("github")}
        />
      </div>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-[#e2e7fb]" />
        <span className="text-xs font-bold uppercase tracking-wide text-[#8a958e]">or use email</span>
        <span className="h-px flex-1 bg-[#e2e7fb]" />
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit}>
      <label
        className="text-xs font-bold uppercase tracking-wide text-[#647269]"
        htmlFor="email"
      >
        Email
      </label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@institution.com"
        required
        className="rounded-md border border-[#cbd5ff] bg-white px-4 py-3 text-sm text-[#06130c] outline-none focus:border-[#3d52da]"
      />
      <label
        className="text-xs font-bold uppercase tracking-wide text-[#647269]"
        htmlFor="password"
      >
        Password
      </label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter your password"
        required
        className="rounded-md border border-[#cbd5ff] bg-white px-4 py-3 text-sm text-[#06130c] outline-none focus:border-[#3d52da]"
      />
      <a
        href="/contact"
        className="text-right text-xs font-semibold text-[#3d52da] hover:underline"
      >
        Forgot password?
      </a>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading || Boolean(providerLoading)}
        className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-[#172554] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2437b5] disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Continue to dashboard"}
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>

      {showDevAdmin && (
        <>
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-[#e2e7fb]" />
            <span className="text-xs font-bold uppercase tracking-wide text-[#8a958e]">Local development</span>
            <span className="h-px flex-1 bg-[#e2e7fb]" />
          </div>
          <form
            className="grid gap-3 rounded-md border border-[#cbd5ff] bg-[#f8faff] p-4"
            onSubmit={handleDevAdmin}
          >
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#e8edff] text-[#3d52da]">
                <KeyRound className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-bold text-[#172554]">Temporary admin access</p>
                <p className="mt-1 text-xs leading-5 text-[#647269]">Available only on the local development server.</p>
              </div>
            </div>
            <label className="sr-only" htmlFor="devAdminPassword">Temporary access password</label>
            <input
              id="devAdminPassword"
              type="password"
              value={devAdminPassword}
              onChange={(event) => setDevAdminPassword(event.target.value)}
              placeholder="Temporary access password"
              required
              autoComplete="current-password"
              className="rounded-md border border-[#cbd5ff] bg-white px-4 py-3 text-sm text-[#06130c] outline-none focus:border-[#3d52da]"
            />
            {devAdminError && <p className="text-sm text-red-600">{devAdminError}</p>}
            <button
              type="submit"
              disabled={devAdminLoading}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#172554] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2437b5] disabled:opacity-60"
            >
              {devAdminLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {devAdminLoading ? "Opening workspace..." : "Open admin workspace"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export function CreateAccountForm() {
  const [fullName, setFullName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [providerLoading, setProviderLoading] = useState<OAuthProvider | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setError(authConfigMissingMessage());
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: workEmail.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          organization: organization.trim(),
        },
        emailRedirectTo: callbackUrl(nextPathFromLocation()),
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // also create lead in database
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fullName.trim(),
        email: workEmail.trim(),
        organization: organization.trim(),
        source: "signup",
        interest: "Account access request",
      }),
    }).catch(() => null);

    window.location.href = nextPathFromLocation();
  }

  async function handleOAuth(provider: OAuthProvider) {
    setProviderLoading(provider);
    setError("");
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setError(authConfigMissingMessage());
      setProviderLoading(null);
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: callbackUrl(nextPathFromLocation()),
        queryParams: provider === "google" ? { prompt: "select_account" } : undefined,
      },
    });

    if (error) {
      setError(error.message);
      setProviderLoading(null);
    }
  }

  return (
    <div className="mt-6 grid gap-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <ProviderButton
          provider="google"
          label="Sign up with Google"
          loading={providerLoading === "google"}
          disabled={Boolean(providerLoading) || loading}
          onClick={() => handleOAuth("google")}
        />
        <ProviderButton
          provider="github"
          label="Sign up with GitHub"
          loading={providerLoading === "github"}
          disabled={Boolean(providerLoading) || loading}
          onClick={() => handleOAuth("github")}
        />
      </div>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-[#e2e7fb]" />
        <span className="text-xs font-bold uppercase tracking-wide text-[#8a958e]">or create with email</span>
        <span className="h-px flex-1 bg-[#e2e7fb]" />
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <label
          className="text-xs font-bold uppercase tracking-wide text-[#647269]"
          htmlFor="fullName"
        >
          Full name
        </label>
        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your full name"
          required
          className="rounded-md border border-[#cbd5ff] bg-white px-4 py-3 text-sm text-[#06130c] outline-none focus:border-[#3d52da]"
        />
      </div>
      <div className="grid gap-2">
        <label
          className="text-xs font-bold uppercase tracking-wide text-[#647269]"
          htmlFor="workEmail"
        >
          Work email
        </label>
        <input
          id="workEmail"
          type="email"
          value={workEmail}
          onChange={(e) => setWorkEmail(e.target.value)}
          placeholder="name@institution.com"
          required
          className="rounded-md border border-[#cbd5ff] bg-white px-4 py-3 text-sm text-[#06130c] outline-none focus:border-[#3d52da]"
        />
      </div>
      <div className="grid gap-2">
        <label
          className="text-xs font-bold uppercase tracking-wide text-[#647269]"
          htmlFor="organization"
        >
          Organization
        </label>
        <input
          id="organization"
          type="text"
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          placeholder="Firm or company name"
          className="rounded-md border border-[#cbd5ff] bg-white px-4 py-3 text-sm text-[#06130c] outline-none focus:border-[#3d52da]"
        />
      </div>
      <div className="grid gap-2">
        <label
          className="text-xs font-bold uppercase tracking-wide text-[#647269]"
          htmlFor="password"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create password"
          required
          className="rounded-md border border-[#cbd5ff] bg-white px-4 py-3 text-sm text-[#06130c] outline-none focus:border-[#3d52da]"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading || Boolean(providerLoading)}
        className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-[#172554] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2437b5] disabled:opacity-60"
      >
        {loading ? "Creating account..." : "Create account"}
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
    </div>
  );
}

function ProviderButton({
  provider,
  label,
  loading,
  disabled,
  onClick,
}: {
  provider: OAuthProvider;
  label: string;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#cbd5ff] bg-white px-4 py-2.5 text-sm font-bold text-[#172554] transition hover:border-[#3d52da] hover:bg-[#f8faff] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : provider === "github" ? (
        <GitHubMark />
      ) : (
        <span className="flex h-4 w-4 items-center justify-center rounded-full text-sm font-black text-[#3d52da]">G</span>
      )}
      {label}
    </button>
  );
}

function GitHubMark() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.72c-2.78.6-3.37-1.18-3.37-1.18a2.65 2.65 0 0 0-1.11-1.47c-.91-.62.07-.61.07-.61a2.1 2.1 0 0 1 1.53 1.03 2.13 2.13 0 0 0 2.91.83 2.12 2.12 0 0 1 .63-1.34c-2.22-.25-4.56-1.11-4.56-4.95a3.88 3.88 0 0 1 1.03-2.69 3.6 3.6 0 0 1 .1-2.65s.84-.27 2.75 1.03a9.46 9.46 0 0 1 5 0c1.91-1.3 2.75-1.03 2.75-1.03.37.85.41 1.82.1 2.65a3.87 3.87 0 0 1 1.03 2.69c0 3.85-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
    </svg>
  );
}
