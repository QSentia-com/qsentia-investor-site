'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { ArrowRight, BriefcaseBusiness, CheckCircle2, FileText, Link2, MapPin, UploadCloud } from 'lucide-react';
import { ApiLoadingPanel, EmptyState, SectionCard } from '@/components/PageChrome';

type CareerRole = {
  id: string;
  title: string;
  department: string;
  location: string;
  notes: string | null;
  updatedAt: string;
};

type CareersResponse = {
  roles?: CareerRole[];
};

const fetcher = async (url: string) => {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
};

export default function CareersBoard() {
  const { data, error, isLoading } = useSWR<CareersResponse>('/api/careers', fetcher);
  const roles = useMemo(() => data?.roles || [], [data?.roles]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const selectedRole = roles.find((role) => role.id === selectedRoleId) || roles[0] || null;
  const [candidateName, setCandidateName] = useState('');
  const [email, setEmail] = useState('');
  const [linkedInUrl, setLinkedInUrl] = useState('');
  const [profileConsent, setProfileConsent] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [source, setSource] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  async function submitApplication() {
    if (!selectedRole || !candidateName.trim() || !email.trim() || !linkedInUrl.trim() || !profileConsent) {
      setStatus('error');
      return;
    }

    setStatus('saving');

    try {
      const formData = new FormData();
      formData.set('roleId', selectedRole.id);
      formData.set('candidateName', candidateName);
      formData.set('email', email);
      formData.set('linkedInUrl', linkedInUrl);
      formData.set('profileConsent', String(profileConsent));
      formData.set('source', source || 'careers-page');
      if (cvFile) formData.set('cv', cvFile);

      const response = await fetch('/api/careers/apply', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Application failed');

      setCandidateName('');
      setEmail('');
      setLinkedInUrl('');
      setProfileConsent(false);
      setCvFile(null);
      setSource('');
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  }

  if (isLoading) {
    return (
      <ApiLoadingPanel
        title="Loading open roles"
        body="Reading currently open QSentia roles from the back-office career board."
        items={['Open roles', 'Hiring teams', 'Application intake']}
      />
    );
  }

  if (error) {
    return <EmptyState title="Careers unavailable" body="The careers API did not respond successfully." />;
  }

  if (!roles.length) {
    return (
      <EmptyState
        title="No open roles"
        body="There are no public roles open right now. New openings will appear here when the QSentia team publishes them from the admin console."
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
      <div className="grid gap-4">
        {roles.map((role) => (
          <button
            key={role.id}
            type="button"
            onClick={() => {
              setSelectedRoleId(role.id);
              setStatus('idle');
            }}
            className={`rounded-[10px] border bg-white p-5 text-left shadow-sm transition ${
              selectedRole?.id === role.id
                ? 'border-[#3d52da] ring-2 ring-[#c7d2fe]'
                : 'border-[#e2e7fb] hover:border-[#c7d2fe]'
            }`}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#3d52da]">
                  <BriefcaseBusiness className="h-4 w-4" />
                  {role.department}
                </div>
                <h2 className="mt-3 text-2xl font-semibold text-[#06130c]">{role.title}</h2>
                <div className="mt-2 flex items-center gap-2 text-sm text-[#5a685f]">
                  <MapPin className="h-4 w-4" />
                  {role.location}
                </div>
              </div>
              <span className="inline-flex rounded-md border border-[#bbf7d0] bg-[#f0fdf4] px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-[#047857]">
                Open
              </span>
            </div>
            {role.notes && <p className="mt-4 text-sm leading-6 text-[#5a685f]">{role.notes}</p>}
          </button>
        ))}
      </div>

      <SectionCard className="h-fit p-6">
        <div className="text-xs font-bold uppercase tracking-wide text-[#647269]">Apply</div>
        <h2 className="mt-2 text-2xl font-semibold text-[#06130c]">
          {selectedRole ? selectedRole.title : 'Select a role'}
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#5a685f]">
          Applications submitted here are routed to the QSentia admin careers pipeline.
        </p>

        <div className="mt-6 grid gap-4">
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase tracking-wide text-[#647269]">Full name</span>
            <input
              type="text"
              value={candidateName}
              onChange={(event) => setCandidateName(event.target.value)}
              className="rounded-md border border-[#cbd5ff] bg-white px-4 py-3 text-sm text-[#06130c] outline-none focus:border-[#3d52da]"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase tracking-wide text-[#647269]">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-md border border-[#cbd5ff] bg-white px-4 py-3 text-sm text-[#06130c] outline-none focus:border-[#3d52da]"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase tracking-wide text-[#647269]">Source or profile link</span>
            <input
              type="text"
              value={source}
              onChange={(event) => setSource(event.target.value)}
              placeholder="Referral, portfolio, or source"
              className="rounded-md border border-[#cbd5ff] bg-white px-4 py-3 text-sm text-[#06130c] outline-none focus:border-[#3d52da]"
            />
          </label>
          <label className="grid gap-2">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#647269]">
              <Link2 className="h-3.5 w-3.5" />
              LinkedIn profile
            </span>
            <input
              type="url"
              value={linkedInUrl}
              onChange={(event) => setLinkedInUrl(event.target.value)}
              placeholder="https://www.linkedin.com/in/..."
              className="rounded-md border border-[#cbd5ff] bg-white px-4 py-3 text-sm text-[#06130c] outline-none focus:border-[#3d52da]"
            />
          </label>
          <label className="grid gap-2">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#647269]">
              <UploadCloud className="h-3.5 w-3.5" />
              CV / resume
            </span>
            <input
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(event) => setCvFile(event.target.files?.[0] || null)}
              className="rounded-md border border-[#cbd5ff] bg-white px-4 py-3 text-sm text-[#06130c] file:mr-3 file:rounded-md file:border-0 file:bg-[#eef2ff] file:px-3 file:py-2 file:text-xs file:font-bold file:text-[#3d52da] focus:border-[#3d52da]"
            />
            {cvFile ? (
              <span className="flex items-center gap-2 text-xs font-semibold text-[#5a685f]">
                <FileText className="h-3.5 w-3.5" />
                {cvFile.name}
              </span>
            ) : null}
          </label>
          <label className="flex items-start gap-3 rounded-md border border-[#dfe5f2] bg-[#f8faff] p-3 text-xs leading-5 text-[#46554b]">
            <input
              type="checkbox"
              checked={profileConsent}
              onChange={(event) => setProfileConsent(event.target.checked)}
              className="mt-1 h-4 w-4 accent-[#3d52da]"
            />
            I authorize QSentia to review the LinkedIn profile and CV I provide for recruitment evaluation.
          </label>
          <button
            type="button"
            disabled={!selectedRole || status === 'saving'}
            onClick={submitApplication}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#172554] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2437b5] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === 'saving' ? 'Submitting' : 'Submit application'}
            <ArrowRight className="h-4 w-4" />
          </button>
          {status === 'saved' && (
            <div className="flex items-center gap-2 rounded-md border border-[#bbf7d0] bg-[#f0fdf4] p-3 text-sm font-semibold text-[#047857]">
              <CheckCircle2 className="h-4 w-4" />
              Application received.
            </div>
          )}
          {status === 'error' && (
            <div className="rounded-md border border-[#fecdd3] bg-[#fff1f2] p-3 text-sm font-semibold text-[#be123c]">
              Please select a role, provide your name, email, LinkedIn profile, and consent.
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
