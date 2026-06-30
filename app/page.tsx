'use client';

import Link from 'next/link';
import useSWR from 'swr';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Code2,
  Database,
  FileSearch,
  LineChart,
  ShieldCheck,
} from 'lucide-react';
import { SiteHeader, TechnicalBackdrop } from '@/components/PageChrome';
import { fmtNum, fmtPct } from '@/lib/metrics';

type PerfStats = {
  totalReturn?: number | null;
  sharpe?: number | null;
  maxDrawdown?: number | null;
  hitRate?: number | null;
};

type ModelComparisonEntry = {
  id?: string;
  name?: string;
  latestValue?: number | null;
  rowCount?: number | null;
  dailyRowCount?: number | null;
  stats?: PerfStats;
};

type DashboardPayload = {
  selectedModel?: string;
  registry?: Array<{ id?: string; name?: string }>;
  latest?: {
    portfolioValue?: number | null;
    submittedOrderCount?: number | null;
    lastRun?: string | null;
  };
  stats?: PerfStats;
  modelComparison?: ModelComparisonEntry[];
  decisions?: Record<string, unknown>[];
  submittedOrders?: Record<string, unknown>[];
  updatedAt?: string;
  debug?: {
    rowCounts?: Record<string, number>;
  };
};

const fetcher = async (url: string) => {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
};

const investorItems = [
  {
    title: 'Strategy mandate',
    body: 'Objective, instruments, holding period, liquidity profile, current status, and capacity context.',
    href: '/strategies',
    icon: FileSearch,
  },
  {
    title: 'Performance package',
    body: 'Normalized return history, benchmark comparison, rolling risk, best and worst periods, and methodology notes.',
    href: '/performance',
    icon: LineChart,
  },
  {
    title: 'Risk policy',
    body: 'Confidence thresholds, drawdown brakes, stale quote gates, blackout rules, and kill-switch logic.',
    href: '/risk-management',
    icon: ShieldCheck,
  },
  {
    title: 'Methodology',
    body: 'Plain-English process from signal ingestion to confidence scoring, sizing, execution, and monitoring.',
    href: '/methodology',
    icon: BarChart3,
  },
  {
    title: 'Investor data room',
    body: 'Controlled access for tear sheets, DDQ, legal documents, technical papers, and approved materials.',
    href: '/data-room',
    icon: Database,
  },
  {
    title: 'Qualification flow',
    body: 'Investor type, expected ticket size, accreditation status, strategy interest, and timing for follow-up.',
    href: '/contact',
    icon: CheckCircle2,
  },
];

const platformItems = [
  'Model registry and access workflow',
  'Paper or live monitoring readiness',
  'API credentials and usage controls',
  'Audit trails for operating decisions',
];

function cleanText(value: unknown) {
  return String(value ?? '')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function display(value: string) {
  return value === 'Pending' ? 'Not available' : value;
}

function displayPct(value: number | null | undefined, signed = false) {
  return display(fmtPct(value, signed));
}

function displayNum(value: number | null | undefined, digits = 2) {
  return display(fmtNum(value, digits));
}

function displayCount(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) {
    return 'Not available';
  }
  return Number(value).toLocaleString('en-US');
}

export default function HomePage() {
  const { data, error, isLoading } = useSWR<DashboardPayload>('/api/dashboard', fetcher, {
    refreshInterval: 60000,
  });

  const modelRows = data?.modelComparison || [];
  const selectedModel =
    modelRows.find((row) => row.id === data?.selectedModel) ||
    modelRows.find((row) => cleanText(row.name).toLowerCase().includes('qsentia')) ||
    modelRows[0];
  const stats = selectedModel?.stats || data?.stats || {};
  const registryCount = data?.registry?.length ?? modelRows.length;
  const statusLabel = error ? 'Telemetry unavailable' : isLoading ? 'Loading telemetry' : 'Telemetry connected';

  const metrics = [
    {
      label: 'Strategy return',
      value: displayPct(stats.totalReturn, true),
      detail: 'Selected model',
    },
    {
      label: 'Sharpe',
      value: displayNum(stats.sharpe, 2),
      detail: 'Risk-adjusted',
    },
    {
      label: 'Max drawdown',
      value: displayPct(stats.maxDrawdown, true),
      detail: 'Observed control band',
    },
    {
      label: 'Models',
      value: displayCount(registryCount),
      detail: 'Registry count',
    },
  ];

  return (
    <main className="min-h-screen bg-white text-[#06130c]">
      <SiteHeader />

      <section className="relative overflow-hidden border-b border-[#dfe6fb] bg-[#f8faff]">
        <TechnicalBackdrop />
        <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.08fr_0.82fr] lg:items-center lg:py-20">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-[#3046c8]">
              QSentia for allocators and systematic investors
            </p>
            <h1 className="mt-5 max-w-3xl text-[48px] font-semibold leading-[1.03] tracking-normal text-[#06130c] sm:text-[68px] lg:text-[82px]">
              More alpha. Less unmanaged risk.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[#46554b] sm:text-lg">
              QSentia gives investors a disciplined way to review machine-learning
              strategies through source-backed telemetry, benchmark context, risk controls,
              and execution readiness.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/performance"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#172554] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2437b5]"
              >
                Review performance
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/data-room"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-[#cbd5ff] bg-white px-5 py-3 text-sm font-bold text-[#172554] transition hover:border-[#3d52da]"
              >
                Request investor materials
                <ShieldCheck className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-[10px] border border-[#1d2f67] bg-[#07112a] text-white shadow-[0_18px_48px_rgba(23,37,84,0.15)] lg:max-w-[460px] lg:justify-self-end">
            <div className="flex items-center justify-between gap-4 border-b border-[#1b2a55] bg-[#0b1430] px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#ff6b6b]" />
                <span className="h-2 w-2 rounded-full bg-[#fbbf24]" />
                <span className="h-2 w-2 rounded-full bg-[#35e0a1]" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wide text-[#aebcff]">
                QSentia signal terminal
              </span>
            </div>

            <div className="p-3.5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="font-mono text-xs uppercase tracking-wide text-[#7f94e8]">
                    live_telemetry.snapshot
                  </div>
                  <h2 className="mt-1.5 text-lg font-semibold leading-tight text-white">
                    {cleanText(selectedModel?.name || 'Selected strategy')}
                  </h2>
                </div>
                <span className="inline-flex w-fit items-center gap-1.5 rounded-md border border-[#3854bd] bg-[#13245a] px-2.5 py-1 text-[11px] font-bold text-[#b7c5ff]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {statusLabel}
                </span>
              </div>

              <div className="mt-3 rounded-md border border-[#182852] bg-[#050b1d] p-2.5 font-mono text-[11px] leading-5 text-[#dbe4ff]">
                <TerminalLine number="01" label="strategy" value={cleanText(selectedModel?.name || 'Selected strategy')} />
                <TerminalLine number="02" label="registry_models" value={displayCount(registryCount)} />
              </div>

              <div className="mt-3 grid gap-px overflow-hidden rounded-md border border-[#1b2a55] bg-[#1b2a55] sm:grid-cols-2">
                {metrics.map((metric) => (
                  <div key={metric.label} className="bg-[#0b1430] p-3">
                    <div className="text-[11px] font-bold uppercase tracking-wide text-[#9fb2ff]">
                      {metric.label}
                    </div>
                    <div className="mt-1.5 text-[24px] font-semibold leading-none tracking-normal text-white">
                      {metric.value}
                    </div>
                    <div className="mt-1 text-xs text-[#91a0c8]">{metric.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#e2e7fb] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
          <div className="mb-8 max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-wide text-[#3046c8]">
              Investor diligence
            </p>
            <h2 className="mt-3 text-4xl font-semibold leading-tight tracking-normal text-[#06130c]">
              The core materials investors expect before a serious review.
            </h2>
            <p className="mt-4 text-base leading-7 text-[#5a685f]">
              The homepage should route allocators to the evidence they need: strategy scope,
              performance quality, risk controls, methodology, and controlled access to diligence materials.
            </p>
          </div>

          <div className="grid gap-px overflow-hidden rounded-[10px] border border-[#dbe3ff] bg-[#dbe3ff] md:grid-cols-2 lg:grid-cols-3">
            {investorItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.title} href={item.href} className="group bg-white p-7 transition hover:bg-[#f8faff]">
                  <span className="flex h-11 w-11 items-center justify-center rounded-md bg-[#eef2ff] text-[#3046c8]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h2 className="mt-6 text-2xl font-semibold text-[#06130c]">{item.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-[#5a685f]">{item.body}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#3046c8]">
                    Open section
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#f8faff]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-[#3046c8]">
              Platform lane
            </p>
            <h2 className="mt-3 max-w-xl text-4xl font-semibold leading-tight tracking-normal text-[#06130c]">
              Research validation, API access, and operating evidence in one workflow.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[#5a685f]">
              QSentia is built for teams that need more than a dashboard. It connects
              model discovery, telemetry review, entitlement controls, and broker-readiness
              checks before live operation.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/platform"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#172554] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2437b5]"
              >
                Platform overview
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/developers"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-[#cbd5ff] bg-white px-5 py-3 text-sm font-bold text-[#172554] transition hover:border-[#3d52da]"
              >
                Developer center
                <Code2 className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {platformItems.map((item, index) => (
              <div key={item} className="rounded-[10px] border border-[#dbe3ff] bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#eef2ff] text-[#3046c8]">
                    {index === 0 && <Database className="h-5 w-5" />}
                    {index === 1 && <BarChart3 className="h-5 w-5" />}
                    {index === 2 && <Code2 className="h-5 w-5" />}
                    {index === 3 && <ShieldCheck className="h-5 w-5" />}
                  </span>
                  <span className="text-xs font-bold text-[#9aa7c7]">0{index + 1}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-[#06130c]">{item}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}

function TerminalLine({ number, label, value }: { number: string; label: string; value: string }) {
  return (
    <div className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3">
      <span className="select-none text-[#5f709f]">{number}</span>
      <span className="min-w-0">
        <span className="text-[#5de4ff]">{label}</span>
        <span className="text-[#64749f]"> = </span>
        <span className="break-words text-white">&quot;{value}&quot;</span>
      </span>
    </div>
  );
}
