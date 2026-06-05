import type { Metadata } from 'next';
import { BriefcaseBusiness, ShieldCheck, UsersRound } from 'lucide-react';
import CareersBoard from '@/components/CareersBoard';
import { Eyebrow, PageShell, SectionCard } from '@/components/PageChrome';

export const metadata: Metadata = {
  title: 'Careers | QSentia',
  description: 'Open QSentia roles and career application intake.',
};

export default function CareersPage() {
  return (
    <PageShell active="/careers">
      <section className="border-b border-[#e2e7fb] bg-[#f8faff]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
          <Eyebrow>Careers</Eyebrow>
          <h1 className="mt-6 max-w-5xl text-5xl font-semibold leading-[1.04] tracking-normal text-[#06130c] md:text-7xl">
            Build institutional AI investment infrastructure
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-[#46554b] md:text-lg">
            Join QSentia across research, engineering, operations, and institutional platform
            workflows. Open roles are published from the live back-office career board.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
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
