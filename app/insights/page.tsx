import type { Metadata } from 'next';
import { BookOpen, CalendarClock, FileText } from 'lucide-react';
import { PageIntro } from '@/components/InstitutionalShell';
import { PageShell, SectionCard } from '@/components/PageChrome';

export const metadata: Metadata = { title: 'Research and Monthly Letters | QSentia' };

const publicationTypes = [
  {
    title: 'Monthly investor letter',
    body: 'Portfolio commentary, material developments, risk observations, and the period under review.',
    icon: CalendarClock,
  },
  {
    title: 'Market research',
    body: 'Firm-approved analysis of market structure, sentiment, volatility, and systematic investment themes.',
    icon: BookOpen,
  },
  {
    title: 'Strategy and methodology notes',
    body: 'Documented changes to model research, validation methods, risk controls, and performance methodology.',
    icon: FileText,
  },
];

export default function InsightsPage() {
  return (
    <PageShell active="/insights">
      <PageIntro
        eyebrow="Research"
        title="Monthly letters and market research"
        body="Firm-approved commentary and research will be published with a named author, publication date, review period, and relevant disclosures."
      />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-5 md:grid-cols-3">
          {publicationTypes.map((item) => {
            const Icon = item.icon;
            return (
              <SectionCard key={item.title} className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#eef2ff] text-[#3d52da]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="rounded-md border border-[#dbe3ff] bg-[#f8faff] px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-[#647269]">
                    Coming soon
                  </span>
                </div>
                <h2 className="mt-5 text-xl font-semibold text-[#06130c]">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-[#5a685f]">{item.body}</p>
                <div className="mt-5 border-t border-[#e2e7fb] pt-4 text-xs text-[#647269]">
                  No publication released
                </div>
              </SectionCard>
            );
          })}
        </div>
        <p className="mt-6 text-xs leading-5 text-[#647269]">
          QSentia does not publish generated, backdated, or unapproved investment commentary.
        </p>
      </section>
    </PageShell>
  );
}
