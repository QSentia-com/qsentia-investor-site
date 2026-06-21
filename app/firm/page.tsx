import type { Metadata } from 'next';
import { Building2, Scale, SearchCheck, Users } from 'lucide-react';
import { PageIntro } from '@/components/InstitutionalShell';
import { PageShell, SectionCard } from '@/components/PageChrome';

export const metadata: Metadata = { title: 'Firm | QSentia' };

const profileGroups = ['Leadership profiles', 'Research team', 'Advisers and operating partners'];

export default function FirmPage() {
  return (
    <PageShell active="/firm">
      <PageIntro
        eyebrow="Firm"
        title="Systematic research, operated with accountability"
        body="QSentia develops model telemetry and systematic investment infrastructure around inspectable evidence, explicit controls, and disciplined change management."
      />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-5 md:grid-cols-3">
          <Value icon={<SearchCheck />} title="Research philosophy" body="Treat every result as a claim that needs source data, methodology, and repeatable evidence." />
          <Value icon={<Scale />} title="Operating discipline" body="Separate model research, commercial approval, risk review, and production publication." />
          <Value icon={<Building2 />} title="Institutional objective" body="Make model diligence and execution monitoring legible to investors and platform customers." />
        </div>
        <SectionCard className="mt-8 overflow-hidden">
          <div className="flex items-center gap-2 border-b border-[#e2e7fb] px-6 py-5 text-[#3d52da]">
            <Users className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wide">Team and advisers</span>
          </div>
          <div className="grid gap-px bg-[#e2e7fb] md:grid-cols-3">
            {profileGroups.map((group) => (
              <div key={group} className="bg-white p-6">
                <span className="rounded-md border border-[#dbe3ff] bg-[#f8faff] px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-[#647269]">
                  Coming soon
                </span>
                <h2 className="mt-5 text-lg font-semibold text-[#06130c]">{group}</h2>
                <p className="mt-2 text-sm leading-6 text-[#5a685f]">
                  No verified public profile has been published for this section.
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>
    </PageShell>
  );
}

function Value({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <SectionCard className="p-6">
      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#eef2ff] text-[#3d52da] [&>svg]:h-5 [&>svg]:w-5">{icon}</span>
      <h2 className="mt-5 text-xl font-semibold text-[#06130c]">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-[#5a685f]">{body}</p>
    </SectionCard>
  );
}
