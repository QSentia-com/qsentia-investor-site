import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, LineChart, SearchCheck, ShieldCheck, Workflow } from 'lucide-react';
import { Eyebrow, PageShell, SectionCard } from '@/components/PageChrome';

export const metadata: Metadata = {
  title: 'Problem & Solution | Qsentia',
  description:
    'Qsentia problem statement and solution overview for systematic model diligence, telemetry, and investor research workflows.',
};

const problemPoints = [
  [
    'Fragmented evidence',
    'Model claims, code repositories, portfolio logs, benchmark context, and execution status often live in separate places, making diligence slow and inconsistent.',
  ],
  [
    'Unclear model readiness',
    'Investors need to know whether a strategy is producing current observations, whether paper execution is active, and whether outputs are backed by source rows.',
  ],
  [
    'Weak comparison workflows',
    'Research teams need normalized curves, benchmark context, and audit-friendly missing states instead of screenshots, static decks, or unverifiable summaries.',
  ],
] as const;

const solutionCards = [
  {
    title: 'Source-connected telemetry',
    body: 'Qsentia connects model registry metadata, portfolio observations, execution rows, health status, and benchmark data into one review surface.',
    icon: Workflow,
  },
  {
    title: 'Diligence-ready research',
    body: 'The platform gives investors a structured path to compare strategies, inspect model state, and understand when data is present or unavailable.',
    icon: SearchCheck,
  },
  {
    title: 'Transparent monitoring',
    body: 'Dashboards and research terminals are designed around live telemetry, visible gaps, and repeatable evidence rather than marketing-only performance claims.',
    icon: ShieldCheck,
  },
];

const outcomes = [
  'Reduce time spent collecting model evidence across repositories and dashboards.',
  'Help investors compare strategies with consistent telemetry and benchmark context.',
  'Make missing data visible so diligence teams can separate unavailable rows from real observations.',
  'Support a professional workflow from discovery to monitoring and review.',
];

export default function ProblemSolutionPage() {
  return (
    <PageShell active="/problem-solution">
      <section className="border-b border-[#e2e7fb] bg-[#f8faff]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
          <Eyebrow>Problem & solution</Eyebrow>
          <h1 className="mt-6 max-w-5xl text-5xl font-semibold leading-[1.04] tracking-normal text-[#06130c] md:text-7xl">
            Systematic strategy diligence needs better evidence.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-[#46554b] md:text-lg">
            Qsentia helps investors move from fragmented model claims to structured telemetry,
            benchmark context, and audit-ready research workflows.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/research"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#172554] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2437b5]"
            >
              Open research terminal
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-[#cbd5ff] bg-white px-5 py-3 text-sm font-bold text-[#172554] transition hover:bg-[#f7f8ff]"
            >
              Review API docs
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <SectionCard className="p-6 md:p-8">
          <div className="flex items-center gap-2 text-[#3d52da]">
            <LineChart className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wide">Problem statement</span>
          </div>
          <h2 className="mt-4 text-3xl font-semibold text-[#06130c]">Model performance is difficult to trust when evidence is scattered.</h2>
          <p className="mt-4 text-sm leading-7 text-[#5a685f]">
            Investors evaluating quantitative and machine-learning strategies need more than a return
            number. They need the model source, the telemetry trail, the benchmark context, and the
            current operating state in one professional review workflow.
          </p>
        </SectionCard>

        <div className="grid gap-4">
          {problemPoints.map(([title, body]) => (
            <SectionCard key={title} className="p-5">
              <h3 className="text-lg font-semibold text-[#06130c]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#5a685f]">{body}</p>
            </SectionCard>
          ))}
        </div>
      </section>

      <section className="border-y border-[#e2e7fb] bg-[#07112a] text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#aebcff]">Qsentia solution</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-normal">A single intelligence layer for model diligence.</h2>
            <p className="mt-4 text-sm leading-7 text-[#b8c2e8]">
              Qsentia organizes live model telemetry, API-backed research views, strategy context,
              and compliance-aware disclosures so investors can evaluate systems with discipline.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {solutionCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="rounded-[10px] border border-white/12 bg-white/[0.06] p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-[#172554]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-xl font-semibold">{card.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#c7d2fe]">{card.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <SectionCard className="p-6 md:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#3d52da]">Operating objectives</p>
              <h2 className="mt-3 text-3xl font-semibold text-[#06130c]">What the solution is designed to improve</h2>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {outcomes.map((outcome) => (
                <li key={outcome} className="flex gap-3 rounded-md border border-[#e2e7fb] bg-[#fbfcff] p-4 text-sm leading-6 text-[#26352c]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#2b36ff]" />
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
          </div>
        </SectionCard>
      </section>
    </PageShell>
  );
}
