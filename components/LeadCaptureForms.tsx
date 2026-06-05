'use client';

import { FormEvent, useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export function ContactLeadForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [interest, setInterest] = useState('Institutional access');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('saving');

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          organization,
          interest,
          notes,
          source: 'contact',
        }),
      });

      if (!response.ok) throw new Error('Unable to submit inquiry');

      setName('');
      setEmail('');
      setOrganization('');
      setInterest('Institutional access');
      setNotes('');
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  }

  return (
    <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <label className="text-xs font-bold uppercase tracking-wide text-[#647269]" htmlFor="leadName">
          Full name
        </label>
        <input
          id="leadName"
          type="text"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="rounded-md border border-[#cbd5ff] bg-white px-4 py-3 text-sm text-[#06130c] outline-none focus:border-[#3d52da]"
          placeholder="Your full name"
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-xs font-bold uppercase tracking-wide text-[#647269]" htmlFor="leadEmail">
            Work email
          </label>
          <input
            id="leadEmail"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded-md border border-[#cbd5ff] bg-white px-4 py-3 text-sm text-[#06130c] outline-none focus:border-[#3d52da]"
            placeholder="name@institution.com"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-xs font-bold uppercase tracking-wide text-[#647269]" htmlFor="leadOrganization">
            Organization
          </label>
          <input
            id="leadOrganization"
            type="text"
            value={organization}
            onChange={(event) => setOrganization(event.target.value)}
            className="rounded-md border border-[#cbd5ff] bg-white px-4 py-3 text-sm text-[#06130c] outline-none focus:border-[#3d52da]"
            placeholder="Firm or company"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-xs font-bold uppercase tracking-wide text-[#647269]" htmlFor="leadInterest">
          Inquiry type
        </label>
        <select
          id="leadInterest"
          value={interest}
          onChange={(event) => setInterest(event.target.value)}
          className="rounded-md border border-[#cbd5ff] bg-white px-4 py-3 text-sm text-[#06130c] outline-none focus:border-[#3d52da]"
        >
          <option>Institutional access</option>
          <option>Model licensing</option>
          <option>Due diligence</option>
          <option>Partnership</option>
          <option>Support</option>
        </select>
      </div>

      <div className="grid gap-2">
        <label className="text-xs font-bold uppercase tracking-wide text-[#647269]" htmlFor="leadNotes">
          Context
        </label>
        <textarea
          id="leadNotes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={4}
          className="resize-none rounded-md border border-[#cbd5ff] bg-white px-4 py-3 text-sm text-[#06130c] outline-none focus:border-[#3d52da]"
          placeholder="Models, timeline, or access needs"
        />
      </div>

      <button
        type="submit"
        disabled={status === 'saving'}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-[#172554] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2437b5] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === 'saving' ? 'Submitting' : 'Submit inquiry'}
        <ArrowRight className="h-4 w-4" />
      </button>

      {status === 'saved' && (
        <div className="flex items-center gap-2 rounded-md border border-[#bbf7d0] bg-[#f0fdf4] p-3 text-sm font-semibold text-[#047857]">
          <CheckCircle2 className="h-4 w-4" />
          Inquiry captured for QSentia follow-up.
        </div>
      )}
      {status === 'error' && (
        <div className="rounded-md border border-[#fecdd3] bg-[#fff1f2] p-3 text-sm font-semibold text-[#be123c]">
          The inquiry could not be submitted. Please use the email channel.
        </div>
      )}
    </form>
  );
}
