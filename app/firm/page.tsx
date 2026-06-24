import type { Metadata } from 'next';
import { Building2, Scale, SearchCheck } from 'lucide-react';
import { PageIntro } from '@/components/InstitutionalShell';
import { PageShell, SectionCard } from '@/components/PageChrome';

export const metadata: Metadata = { title: 'Firm | QSentia' };

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
