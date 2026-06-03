'use client';

import { FormEvent, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import {
  getStoredProfile,
  nameFromEmail,
  saveStoredProfile,
  saveStoredSession,
} from '@/lib/clientSession';

export function SignInForm() {
  const [email, setEmail] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const profile = getStoredProfile();
    const name =
      profile?.email?.toLowerCase() === email.trim().toLowerCase()
        ? profile.name
        : nameFromEmail(email.trim());

    saveStoredSession({
      name,
      email: email.trim(),
      organization: profile?.organization,
    });

    window.location.href = '/dashboard';
  }

  return (
    <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
      <label className="text-xs font-bold uppercase tracking-wide text-[#647269]" htmlFor="email">
        Email
      </label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@institution.com"
        required
        className="rounded-md border border-[#cbd5ff] bg-white px-4 py-3 text-sm text-[#06130c] outline-none focus:border-[#3d52da]"
      />

      <label className="text-xs font-bold uppercase tracking-wide text-[#647269]" htmlFor="password">
        Password
      </label>
      <input
        id="password"
        type="password"
        placeholder="Enter your password"
        required
        className="rounded-md border border-[#cbd5ff] bg-white px-4 py-3 text-sm text-[#06130c] outline-none focus:border-[#3d52da]"
      />

      <a href="/contact" className="text-right text-xs font-semibold text-[#3d52da] hover:underline">
        Forgot password?
      </a>

      <button
        type="submit"
        className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-[#172554] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2437b5]"
      >
        Continue to dashboard
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}

export function CreateAccountForm() {
  const [fullName, setFullName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [organization, setOrganization] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    saveStoredProfile({
      name: fullName.trim(),
      email: workEmail.trim(),
      organization: organization.trim(),
    });

    window.location.href = '/dashboard';
  }

  return (
    <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <label className="text-xs font-bold uppercase tracking-wide text-[#647269]" htmlFor="fullName">
          Full name
        </label>
        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder="Your full name"
          required
          className="rounded-md border border-[#cbd5ff] bg-white px-4 py-3 text-sm text-[#06130c] outline-none focus:border-[#3d52da]"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-xs font-bold uppercase tracking-wide text-[#647269]" htmlFor="workEmail">
          Work email
        </label>
        <input
          id="workEmail"
          type="email"
          value={workEmail}
          onChange={(event) => setWorkEmail(event.target.value)}
          placeholder="name@institution.com"
          required
          className="rounded-md border border-[#cbd5ff] bg-white px-4 py-3 text-sm text-[#06130c] outline-none focus:border-[#3d52da]"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-xs font-bold uppercase tracking-wide text-[#647269]" htmlFor="organization">
          Organization
        </label>
        <input
          id="organization"
          type="text"
          value={organization}
          onChange={(event) => setOrganization(event.target.value)}
          placeholder="Firm or company name"
          className="rounded-md border border-[#cbd5ff] bg-white px-4 py-3 text-sm text-[#06130c] outline-none focus:border-[#3d52da]"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-xs font-bold uppercase tracking-wide text-[#647269]" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="Create password"
          required
          className="rounded-md border border-[#cbd5ff] bg-white px-4 py-3 text-sm text-[#06130c] outline-none focus:border-[#3d52da]"
        />
      </div>

      <button
        type="submit"
        className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-[#172554] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2437b5]"
      >
        Create account
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
