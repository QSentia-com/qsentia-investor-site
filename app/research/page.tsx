import Link from 'next/link';
import { ArrowRight, BarChart3, Database, Workflow } from 'lucide-react';
import { Eyebrow, PageShell, SectionCard } from '@/components/PageChrome';
import { ResearchTerminal } from '@/components/ResearchTerminal';

const thesis = [
  ['01', 'Source transparency', 'Models are linked to repositories and log paths before performance is displayed.'],
  ['02', 'Benchmark discipline', 'Returns are shown only when enough observations exist for the same source window.'],
  ['03', 'Risk first', 'Drawdown, volatility, and status remain visible alongside return metrics.'],
  ['04', 'Execution audit', 'Orders, positions, decisions, and signal history stay in table form for review.'],
] as const;

export default function ResearchPage() {
  return (
    <PageShell active="/research">
      <section className="border-b border-[#e2e7fb] bg-[#f8faff]">
        <div className="mx-auto max-w-7xl px-4 py-14 text-left sm:px-6 lg:py-20">
          <Eyebrow>Research overview</Eyebrow>
          <h1 className="mt-6 max-w-5xl text-5xl font-semibold leading-[1.04] tracking-normal text-[#06130c] md:text-7xl">
            Model research, grounded in published telemetry
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-[#46554b] md:text-lg">
            Qsentia presents systematic model context, benchmark comparison, and auditability in a
            focused research workspace for institutional review.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-md bg-[#172554] px-5 py-3 text-sm font-bold text-white hover:bg-[#2437b5]">
              Open live dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/marketplace" className="inline-flex items-center justify-center rounded-md border border-[#cbd5ff] bg-white px-5 py-3 text-sm font-bold text-[#172554] hover:bg-[#f7f8ff]">
              View registry
            </Link>
          </div>
        </div>
      </section>

      <ResearchTerminal />

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:px-6 md:grid-cols-4">
        {thesis.map(([number, title, text]) => (
          <SectionCard key={number} className="p-6">
            <div className="text-xs font-bold uppercase tracking-wide text-[#3d52da]">{number}</div>
            <h2 className="mt-4 text-xl font-semibold text-[#06130c]">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-[#5a685f]">{text}</p>
          </SectionCard>
        ))}
      </section>

      <section className="border-y border-[#e2e7fb] bg-[#f8faff]">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:px-6 md:grid-cols-3">
          <ResearchCard icon={<Database className="h-5 w-5" />} title="Repository-backed">
            Model cards and dashboard rows cite repository, branch, and log-path context whenever available.
          </ResearchCard>
          <ResearchCard icon={<BarChart3 className="h-5 w-5" />} title="Metrics with status">
            Partial and insufficient histories are labeled directly instead of being hidden behind polished charts.
          </ResearchCard>
          <ResearchCard icon={<Workflow className="h-5 w-5" />} title="Operational review">
            The dashboard keeps decisions, orders, positions, and signals inspectable as structured tables.
          </ResearchCard>
        </div>
      </section>
    </PageShell>
  );
}

function ResearchCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <SectionCard className="p-6">
      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#eef2ff] text-[#3d52da]">{icon}</span>
      <h2 className="mt-5 text-xl font-semibold text-[#06130c]">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-[#5a685f]">{children}</p>
    </SectionCard>
  );
}
