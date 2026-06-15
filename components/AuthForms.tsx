"use client";

import { FormEvent, useState } from "react";
import { ArrowRight } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
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
        disabled={loading}
        className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-[#172554] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2437b5] disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Continue to dashboard"}
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}

export function CreateAccountForm() {
  const [fullName, setFullName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signUp({
      email: workEmail.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          organization: organization.trim(),
        },
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

    window.location.href = "/dashboard";
  }

  return (
    <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
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
        disabled={loading}
        className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-[#172554] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2437b5] disabled:opacity-60"
      >
        {loading ? "Creating account..." : "Create account"}
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
