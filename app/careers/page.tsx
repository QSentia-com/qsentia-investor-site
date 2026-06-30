import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BriefcaseBusiness,
  FileCheck2,
  Link2,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';
import CareersBoard from '@/components/CareersBoard';
import { Eyebrow, PageShell, SectionCard, TechnicalBackdrop } from '@/components/PageChrome';

export const metadata: Metadata = {
  title: 'Careers | QSentia',
  description: 'Open QSentia roles and career application intake.',
};

const candidateRequirements = [
  {
    title: 'LinkedIn profile',
    body: 'Required for professional background review.',
    icon: Link2,
  },
  {
    title: 'CV or resume',
    body: 'Required in PDF, DOC, or DOCX format.',
    icon: FileCheck2,
  },
  {
    title: 'Consent record',
    body: 'Required before QSentia reviews submitted materials.',
    icon: ShieldCheck,
  },
];

const hiringSteps = [
  {
    step: '1',
    title: 'Role publication',
    body: 'Hiring managers publish only approved role types from the admin console.',
  },
  {
    step: '2',
    title: 'Candidate submission',
    body: 'Applicants provide contact details, LinkedIn, CV, and review consent.',
  },
  {
    step: '3',
    title: 'Team screening',
    body: 'Applications move through received, screening, interview, offer, or rejection states.',
  },
  {
    step: '4',
    title: 'Decision record',
    body: 'Status changes remain visible in the admin careers pipeline.',
  },
];

export default function CareersPage() {
  return (
    <PageShell active="/careers">
      <section className="relative overflow-hidden border-b border-[#e2e7fb] bg-[#f8faff]">
        <TechnicalBackdrop />
        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_420px] lg:items-end lg:py-20">
          <div>
          <Eyebrow>Careers</Eyebrow>
          <h1 className="mt-6 max-w-5xl text-5xl font-semibold leading-[1.04] tracking-normal text-[#06130c] md:text-7xl">
            Build the operating layer for systematic investment models
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-[#46554b] md:text-lg">
            QSentia hires across quantitative research, software engineering, investor operations,
            and model infrastructure. Open roles are published from the back-office career board,
            and every application is routed through one controlled intake workflow.
          </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="#open-roles"
                className="inline-flex min-h-12 items-center gap-2 rounded-md bg-[#172554] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2437b5]"
              >
                View open roles
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/faq#careers"
                className="inline-flex min-h-12 items-center gap-2 rounded-md border border-[#cbd5ff] bg-white px-5 py-3 text-sm font-bold text-[#172554] transition hover:border-[#3d52da]"
              >
                Careers FAQ
              </Link>
            </div>
          </div>

          <SectionCard className="p-6">
            <div className="text-xs font-bold uppercase tracking-wide text-[#3046c8]">
              Candidate intake
            </div>
            <div className="mt-5 grid gap-4">
              {candidateRequirements.map(({ title, body, icon: Icon }) => (
                <div key={title} className="flex gap-3 rounded-md border border-[#e2e7fb] bg-[#fbfcff] p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#eef2ff] text-[#3d52da]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-[#06130c]">{title}</div>
                    <p className="mt-1 text-sm leading-6 text-[#5a685f]">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </section>

      <section className="border-b border-[#e2e7fb] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="grid gap-px overflow-hidden rounded-[10px] border border-[#e2e7fb] bg-[#e2e7fb] md:grid-cols-4">
            {hiringSteps.map(({ step, title, body }) => (
              <div key={step} className="bg-white p-6">
                <div className="text-xs font-bold uppercase tracking-wide text-[#3046c8]">Step {step}</div>
                <h2 className="mt-3 text-lg font-semibold text-[#06130c]">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-[#5a685f]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="open-roles" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-10 sm:px-6">
        <CareersBoard />
      </section>

      <section className="border-y border-[#e2e7fb] bg-[#f8faff]">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:px-6 md:grid-cols-3">
          <SectionCard className="p-6">
            <BriefcaseBusiness className="h-5 w-5 text-[#3d52da]" />
            <h2 className="mt-4 text-xl font-semibold text-[#06130c]">Research and product</h2>
            <p className="mt-3 text-sm leading-6 text-[#5a685f]">
              Roles are shaped around live telemetry, model evaluation, and institutional workflows.
            </p>
          </SectionCard>
          <SectionCard className="p-6">
            <UsersRound className="h-5 w-5 text-[#3d52da]" />
            <h2 className="mt-4 text-xl font-semibold text-[#06130c]">Small team standards</h2>
            <p className="mt-3 text-sm leading-6 text-[#5a685f]">
              We value careful execution, ownership, and clear communication around financial systems.
            </p>
          </SectionCard>
          <SectionCard className="p-6">
            <ShieldCheck className="h-5 w-5 text-[#3d52da]" />
            <h2 className="mt-4 text-xl font-semibold text-[#06130c]">Security minded</h2>
            <p className="mt-3 text-sm leading-6 text-[#5a685f]">
              Do not include passwords, API keys, broker credentials, or private tokens in applications.
            </p>
          </SectionCard>
        </div>
      </section>
    </PageShell>
  );
}
