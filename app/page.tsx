'use client';

import Image from 'next/image';
import Link from 'next/link';
import useSWR from 'swr';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Code2,
  Database,
  ExternalLink,
  LineChart,
  Menu,
  ShieldCheck,
  X,
} from 'lucide-react';
import { TechnicalBackdrop } from '@/components/PageChrome';
import { fmtDollar, fmtNum, fmtPct } from '@/lib/metrics';

type PerfStats = {
  totalReturn?: number | null;
  annualizedReturn?: number | null;
  sharpe?: number | null;
  maxDrawdown?: number | null;
  volatility?: number | null;
  hitRate?: number | null;
  nObservations?: number | null;
  nReturns?: number | null;
  status?: 'ready' | 'partial' | 'insufficient' | string;
};

type RegistryEntry = {
  id?: string;
  name?: string;
  description?: string;
  repo?: string;
  logs_path?: string;
  branch?: string;
};

type EquityPoint = {
  timestamp?: string | null;
  portfolio?: number | null;
  portfolioValue?: number | null;
  drawdown?: number | null;
  return?: number | null;
};

type BenchmarkEntry = {
  name?: string;
  ticker?: string;
  stats?: PerfStats;
  rowCount?: number;
};

type ModelComparisonEntry = {
  id?: string;
  name?: string;
  description?: string;
  repo?: string;
  logsPath?: string;
  branch?: string;
  latestValue?: number | null;
  startingCapital?: number | null;
  rowCount?: number | null;
  dailyRowCount?: number | null;
  inceptionDate?: string | null;
  points?: Array<{ timestamp?: string | null; value?: number | null }>;
  stats?: PerfStats;
  benchmarks?: BenchmarkEntry[];
};

type DashboardPayload = {
  repo?: {
    owner?: string;
    repo?: string;
    branch?: string;
    rawBase?: string;
  };
  selectedModel?: string;
  selectedModelConfig?: RegistryEntry;
  registry?: RegistryEntry[];
  latest?: {
    decision?: Record<string, unknown> | null;
    portfolioValue?: number | null;
    portfolioValueTimestamp?: string | null;
    portfolioValueSource?: string | null;
    firstPortfolioValue?: number | null;
    startingCapital?: number | null;
    portfolioPnl?: number | null;
    portfolioReturn?: number | null;
    paperStatus?: string | null;
    paperReplayStatus?: string | null;
    isLivePaperActive?: boolean;
    submittedOrderCount?: number | null;
    hasLivePositions?: boolean;
    lastRun?: string | null;
    latestSignalDate?: string | null;
    lastActiveSignalDate?: string | null;
    realismWarningCount?: number | null;
    realismHardFail?: boolean | null;
  };
  stats?: PerfStats;
  equityCurve?: EquityPoint[];
  benchmarks?: BenchmarkEntry[];
  returns?: Array<{ timestamp?: string | null; return?: number | null }>;
  modelComparison?: ModelComparisonEntry[];
  decisions?: Record<string, unknown>[];
  actionCounts?: Array<{ action?: string; count?: number }>;
  targetWeights?: Record<string, unknown>[];
  positions?: Record<string, unknown>[];
  plannedOrders?: Record<string, unknown>[];
  submittedOrders?: Record<string, unknown>[];
  updatedAt?: string;
  debug?: {
    rowCounts?: Record<string, number>;
  };
};

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
};

const navItems = [
  { href: '/marketplace', label: 'Products' },
  {
    href: '/research',
    label: 'Research',
    children: [
      {
        href: '/research',
        label: 'Research terminal',
        description: 'Live fund tickers, filters, and normalized curves.',
      },
      {
        href: '/mleq',
        label: 'MLEQ engine',
        description: 'Machine Learning Equity Quant system overview.',
      },
    ],
  },
  { href: '/docs', label: 'Docs' },
  { href: '/contact', label: 'Contact' },
];

function cleanText(value: unknown) {
  return String(value ?? '')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u00e2\u0080[\u0093\u0094]/g, '-')
    .replace(/\u00e2\u0080\u0099/g, "'")
    .replace(/\u00c2/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function display(value: string) {
  return value === 'Pending' ? 'Not available' : value;
}

function displayDollar(value: number | null | undefined) {
  return display(fmtDollar(value));
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

function formatDateTime(value?: string | null) {
  if (!value) return 'Not available';
  const normalized = String(value).replace('_', 'T');
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return cleanText(value);

  return date.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateLabel(value?: string | null) {
  if (!value) return 'Not available';
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return formatDateTime(value);
  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC',
    year: 'numeric',
  });
}

function repoUrl(repo?: string | null) {
  if (!repo) return null;
  return `https://github.com/${repo}`;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function modelStatus(row: ModelComparisonEntry) {
  const dailyRows = Number(row.dailyRowCount ?? 0);
  const rawRows = Number(row.rowCount ?? 0);
  const hasValue = isFiniteNumber(row.latestValue);

  if (dailyRows > 0) return { label: 'Telemetry available', tone: 'good' as const };
  if (rawRows > 0) return { label: 'Raw rows available', tone: 'neutral' as const };
  if (hasValue) return { label: 'Baseline only', tone: 'warn' as const };
  return { label: 'Awaiting source rows', tone: 'muted' as const };
}

function statusClass(tone: 'good' | 'warn' | 'neutral' | 'muted' | 'bad') {
  if (tone === 'good') return 'border-[#3d52da]/30 bg-[#eef2ff] text-[#3d52da]';
  if (tone === 'warn') return 'border-amber-300 bg-amber-50 text-amber-800';
  if (tone === 'bad') return 'border-red-200 bg-red-50 text-red-700';
  if (tone === 'neutral') return 'border-blue-200 bg-blue-50 text-blue-700';
  return 'border-stone-200 bg-stone-50 text-stone-600';
}

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data, error, isLoading } = useSWR<DashboardPayload>('/api/dashboard', fetcher, {
    refreshInterval: 60000,
  });

  const modelRows = useMemo<ModelComparisonEntry[]>(() => {
    if (data?.modelComparison?.length) {
      return data.modelComparison;
    }

    return (data?.registry || []).map((model) => ({
      id: model.id,
      name: model.name,
      description: model.description,
      repo: model.repo,
      logsPath: model.logs_path,
      branch: model.branch,
    }));
  }, [data]);

  const selectedModel = useMemo(() => {
    const selectedId = data?.selectedModel;
    return (
      modelRows.find((row) => row.id === selectedId) ||
      modelRows.find((row) => cleanText(row.name).toLowerCase().includes('qsentia')) ||
      modelRows[0] ||
      null
    );
  }, [data?.selectedModel, modelRows]);

  const stats = selectedModel?.stats || data?.stats || {};
  const latest = data?.latest || {};
  const selectedName = cleanText(selectedModel?.name || data?.selectedModelConfig?.name || data?.selectedModel || 'Model not selected');
  const registryCount = data?.registry?.length ?? modelRows.length;
  const portfolioRowCount = data?.debug?.rowCounts?.dailyPortfolioRows ?? selectedModel?.dailyRowCount ?? 0;
  const decisionCount = data?.decisions?.length ?? data?.debug?.rowCounts?.decisionsRows ?? 0;
  const submittedOrderCount = latest.submittedOrderCount ?? data?.submittedOrders?.length ?? 0;
  const hasPortfolioHistory = Boolean(data?.equityCurve?.some((point) => isFiniteNumber(point.portfolio)));
  const hasModelTelemetry = modelRows.some((row) => Number(row.dailyRowCount || row.rowCount || 0) > 0);
  const sourceRepo = cleanText(data?.selectedModelConfig?.repo || selectedModel?.repo || '');
  const sourceLogs = cleanText(data?.selectedModelConfig?.logs_path || selectedModel?.logsPath || '');

  const summaryStatus = error
    ? { label: 'API unavailable', tone: 'bad' as const }
    : isLoading
      ? { label: 'Loading telemetry', tone: 'neutral' as const }
      : hasModelTelemetry
        ? { label: 'Telemetry connected', tone: 'good' as const }
        : { label: 'Registry connected', tone: 'warn' as const };

  const heroMetrics = [
    { label: 'Registered models', value: displayCount(registryCount) },
    { label: 'Portfolio rows', value: displayCount(portfolioRowCount) },
    { label: 'Decision rows', value: displayCount(decisionCount) },
    { label: 'Submitted orders', value: displayCount(submittedOrderCount) },
  ];

  const productCards = [
    {
      title: 'Model Registry API',
      body: 'Registered strategies, repositories, branches, and log paths keep model diligence organized.',
      value: displayCount(registryCount),
      label: 'models',
      icon: Database,
    },
    {
      title: 'Portfolio Telemetry',
      body: 'Normalized equity curves, drawdown context, and return quality help evaluate alpha persistence over time.',
      value: displayCount(portfolioRowCount),
      label: 'daily rows',
      icon: LineChart,
    },
    {
      title: 'Execution Audit',
      body: 'Decision history, paper status, submitted orders, and run timestamps support operational risk review.',
      value: displayCount(decisionCount),
      label: 'decisions',
      icon: ShieldCheck,
    },
  ];

  const auditRows = [
    { label: 'Paper status', value: cleanText(latest.paperStatus || 'Not available') },
    { label: 'Paper replay status', value: cleanText(latest.paperReplayStatus || 'Not available') },
    { label: 'Last run', value: formatDateTime(latest.lastRun) },
    { label: 'Portfolio timestamp', value: formatDateTime(latest.portfolioValueTimestamp) },
    { label: 'Submitted orders', value: displayCount(submittedOrderCount) },
    { label: 'Decision rows', value: displayCount(decisionCount) },
  ];

  return (
    <main className="min-h-screen bg-white text-[#0a0f0c]">
      <header className="sticky top-0 z-50 border-b border-[#e2e7fb] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3" aria-label="Qsentia home">
            <Image
              src="/logo/qsentia-primary.png"
              alt="Qsentia"
              width={138}
              height={34}
              priority
              className="h-7 w-auto"
            />
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
            {navItems.map((item) => {
              if (item.children) {
                return (
                  <div key={item.href} className="group relative">
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold text-[#26352c] transition hover:bg-[#eef2ff]"
                      aria-haspopup="menu"
                    >
                      {item.label}
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Link>
                    <div className="pointer-events-none absolute left-0 top-full z-50 w-[310px] translate-y-2 pt-2 opacity-0 transition group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
                      <div className="rounded-[10px] border border-[#e2e7fb] bg-white p-2 shadow-[0_18px_50px_rgba(15,31,22,0.14)]" role="menu">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block rounded-md px-3 py-3 transition hover:bg-[#f8faff]"
                            role="menuitem"
                          >
                            <span className="block text-sm font-semibold text-[#06130c]">{child.label}</span>
                            <span className="mt-1 block text-xs leading-5 text-[#647269]">{child.description}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-2 text-sm font-semibold text-[#26352c] transition hover:bg-[#eef2ff]"
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/signin"
              className="rounded-md px-3 py-2 text-sm font-semibold text-[#26352c] transition hover:bg-[#eef2ff]"
            >
              Sign in
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-md bg-[#172554] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2437b5]"
            >
              Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#e2e7fb] text-[#26352c] md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-[#e2e7fb] bg-white px-4 py-3 md:hidden">
            <nav className="grid gap-1" aria-label="Mobile navigation">
              {navItems.map((item) => (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded-md px-3 py-2 text-sm font-semibold text-[#26352c] hover:bg-[#eef2ff]"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <div className="ml-3 grid gap-1 border-l border-[#e2e7fb] pl-3">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="rounded-md px-3 py-2 text-sm font-semibold text-[#46554b] hover:bg-[#eef2ff]"
                          onClick={() => setMenuOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Link
                href="/signin"
                className="rounded-md px-3 py-2 text-sm font-semibold text-[#26352c] hover:bg-[#eef2ff]"
                onClick={() => setMenuOpen(false)}
              >
                Sign in
              </Link>
            </nav>
          </div>
        )}
      </header>

      <section className="relative overflow-hidden border-b border-[#e2e7fb] bg-[#f8faff]">
        <TechnicalBackdrop />
        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.98fr_1.02fr] lg:py-20">
            <div className="flex flex-col justify-between gap-10">
            <div>
              <p className="mb-4 text-sm font-semibold text-[#3046c8]">
                QSentia investment research platform
              </p>
              <h1 className="max-w-2xl text-[44px] font-semibold leading-[1.04] tracking-normal text-[#06130c] sm:text-[64px] lg:text-[72px]">
                More alpha. Less unmanaged risk.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-[#46554b] sm:text-lg">
                Qsentia helps investors evaluate machine-learning strategies with live performance
                telemetry, benchmark context, drawdown controls, and execution evidence in one workspace.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#172554] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2437b5]"
              >
                Start with dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-[#cbd5ff] bg-white px-5 py-3 text-sm font-bold text-[#172554] transition hover:bg-[#f7f8ff]"
              >
                API docs
                <Code2 className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="relative min-w-0 overflow-hidden rounded-[10px] border border-[#cbd5ff] bg-white shadow-[0_24px_70px_rgba(23,37,84,0.13)]">
            <div aria-hidden className="absolute -right-10 -top-10 h-32 w-32 rounded-full border border-[#3d52da]/10" />
            <div aria-hidden className="absolute right-16 top-16 h-12 w-12 rotate-[18deg] rounded-[5px] border border-[#3d52da]/14" />
            <div aria-hidden className="absolute bottom-20 left-8 h-2.5 w-2.5 rounded-full bg-[#3d52da]/14 ring-8 ring-[#3d52da]/5" />
            <div className="flex items-center justify-between gap-4 border-b border-[#e2e7fb] px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-amber-300" />
                <span className="h-3 w-3 rounded-full bg-[#00d26a]" />
              </div>
              <span className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-bold ${statusClass(summaryStatus.tone)}`}>
                {summaryStatus.tone === 'bad' ? <AlertCircle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                {summaryStatus.label}
              </span>
            </div>

            <ApiPreview
              selectedName={selectedName}
              sourceRepo={sourceRepo}
              sourceLogs={sourceLogs}
              portfolioValue={latest.portfolioValue ?? selectedModel?.latestValue ?? null}
              portfolioReturn={latest.portfolioReturn ?? stats.totalReturn ?? null}
              sharpe={stats.sharpe ?? null}
              updatedAt={data?.updatedAt}
              hasPortfolioHistory={hasPortfolioHistory}
            />

            <div className="grid border-t border-[#e2e7fb] sm:grid-cols-4">
              {heroMetrics.map((metric) => (
                <div key={metric.label} className="border-t border-[#e2e7fb] p-4 sm:border-l sm:border-t-0 first:sm:border-l-0">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-[#647269]">{metric.label}</div>
                  <div className="mt-1 text-xl font-semibold text-[#06130c]">{metric.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#e2e7fb] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-[#3d52da]">Product surface</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal text-[#06130c]">Build on source-of-truth telemetry</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-[#5a685f]">
              These modules connect model discovery, portfolio telemetry, execution review, and
              benchmark analytics into a disciplined diligence workflow.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {productCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="rounded-[10px] border border-[#e2e7fb] bg-[#fbfcff] p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#eef2ff] text-[#3d52da]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-xl font-semibold text-[#06130c]">{card.title}</h3>
                  <p className="mt-3 min-h-20 text-sm leading-6 text-[#5a685f]">{card.body}</p>
                  <div className="mt-5 border-t border-[#e2e7fb] pt-4">
                    <span className="text-3xl font-semibold text-[#06130c]">{card.value}</span>
                    <span className="ml-2 text-sm font-semibold text-[#647269]">{card.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#f8faff]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.45fr_0.85fr]">
          <div className="min-w-0 rounded-[10px] border border-[#e2e7fb] bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-[#e2e7fb] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#06130c]">Model registry</h2>
                <p className="mt-1 text-sm text-[#5a685f]">
                  Strategy names, sources, rows, and status are read from the dashboard API.
                </p>
              </div>
              {data?.repo?.owner && data?.repo?.repo && (
                <a
                  href={repoUrl(`${data.repo.owner}/${data.repo.repo}`) || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-[#cbd5ff] px-3 py-2 text-sm font-bold text-[#172554] hover:bg-[#f7f8ff]"
                >
                  Registry source
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[900px] divide-y divide-[#e2e7fb] text-sm">
                <thead className="bg-[#f8faff] text-left text-xs font-bold uppercase tracking-wide text-[#647269]">
                  <tr>
                    <th className="px-5 py-3">Model</th>
                    <th className="px-5 py-3">Source</th>
                    <th className="px-5 py-3 text-right">Rows</th>
                    <th className="px-5 py-3 text-right">Return</th>
                    <th className="px-5 py-3 text-right">Sharpe</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e7fb]">
                  {modelRows.length ? (
                    modelRows.map((row) => {
                      const status = modelStatus(row);
                      const source = repoUrl(row.repo);

                      return (
                        <tr key={row.id || row.name} className="align-top">
                          <td className="max-w-xs px-5 py-4">
                            <div className="font-semibold text-[#06130c]">{cleanText(row.name || row.id)}</div>
                            {row.description && (
                              <div className="mt-1 line-clamp-2 text-xs leading-5 text-[#5a685f]">
                                {cleanText(row.description)}
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-4 text-[#5a685f]">
                            {source ? (
                              <a
                                href={source}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 font-semibold text-[#172554] underline-offset-4 hover:underline"
                              >
                                {cleanText(row.repo)}
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            ) : (
                              'Not available'
                            )}
                            {row.logsPath && <div className="mt-1 text-xs text-[#647269]">{cleanText(row.logsPath)}</div>}
                          </td>
                          <td className="px-5 py-4 text-right tabular-nums text-[#26352c]">
                            {displayCount(row.dailyRowCount ?? row.rowCount)}
                          </td>
                          <td className="px-5 py-4 text-right tabular-nums text-[#26352c]">
                            {displayPct(row.stats?.totalReturn, true)}
                          </td>
                          <td className="px-5 py-4 text-right tabular-nums text-[#26352c]">
                            {displayNum(row.stats?.sharpe, 2)}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-bold ${statusClass(status.tone)}`}>
                              {status.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-sm text-[#647269]">
                        {isLoading ? 'Loading model registry.' : 'No registered models returned by the API.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="min-w-0 space-y-6">
            <Panel title="Source details" icon={<ShieldCheck className="h-4 w-4" />}>
              <DefinitionList
                rows={[
                  ['Registry', data?.repo?.owner && data?.repo?.repo ? `${data.repo.owner}/${data.repo.repo}` : 'Not available'],
                  ['Branch', cleanText(data?.repo?.branch || data?.selectedModelConfig?.branch || 'Not available')],
                  ['Model source', sourceRepo || 'Not available'],
                  ['Logs path', sourceLogs || 'Not available'],
                ]}
              />
            </Panel>

            <Panel title="Execution audit" icon={<Clock3 className="h-4 w-4" />}>
              <DefinitionList rows={auditRows.map((row) => [row.label, row.value])} />
            </Panel>
          </div>
        </div>
      </section>

      <section className="border-y border-[#e2e7fb] bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Panel title="Selected model equity index" icon={<LineChart className="h-4 w-4" />}>
            <p className="mb-4 text-sm leading-6 text-[#5a685f]">
              This is an index-style track record for the selected strategy. The first portfolio observation is set to 100, so values above 100 show cumulative gain over the displayed window.
            </p>
            {isLoading ? (
              <LoadingState title="Loading performance history" body="Retrieving selected-model telemetry." />
            ) : (
              <EquityChart points={data?.equityCurve || []} />
            )}
          </Panel>

          <Panel title="Benchmark comparison" icon={<BarChart3 className="h-4 w-4" />}>
            {isLoading ? (
              <LoadingState title="Loading benchmarks" body="Retrieving market comparison data." />
            ) : (
              <BenchmarkList rows={data?.benchmarks || []} />
            )}
          </Panel>
        </div>
      </section>

      <section className="bg-[#07112a] text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-[#c7d2fe]">Mission, vision, objective</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal">
              Building trust in systematic investing
            </h2>
            <p className="mt-4 text-sm leading-6 text-[#b8c2e8]">
              Qsentia exists to make quantitative strategy evaluation more transparent, disciplined,
              and usable for investors who need evidence before conviction.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <DataPolicyItem
              title="Mission"
              body="Unify model telemetry, research context, and audit trails so investors can evaluate strategies from verifiable source data."
            />
            <DataPolicyItem
              title="Vision"
              body="Become the trusted intelligence layer for machine-learning driven investment research, diligence, and model monitoring."
            />
            <DataPolicyItem
              title="Objective"
              body="Give users a clear path from model discovery to live telemetry, benchmark comparison, and professional due diligence review."
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function ApiPreview({
  selectedName,
  sourceRepo,
  sourceLogs,
  portfolioValue,
  portfolioReturn,
  sharpe,
  updatedAt,
  hasPortfolioHistory,
}: {
  selectedName: string;
  sourceRepo: string;
  sourceLogs: string;
  portfolioValue: number | null;
  portfolioReturn: number | null;
  sharpe: number | null;
  updatedAt?: string;
  hasPortfolioHistory: boolean;
}) {
  const lines = [
    ['model', selectedName || null],
    ['source_repo', sourceRepo || null],
    ['logs_path', sourceLogs || null],
    ['portfolio_value', isFiniteNumber(portfolioValue) ? displayDollar(portfolioValue) : null],
    ['portfolio_return', isFiniteNumber(portfolioReturn) ? displayPct(portfolioReturn, true) : null],
    ['sharpe', isFiniteNumber(sharpe) ? displayNum(sharpe, 2) : null],
    ['portfolio_history', hasPortfolioHistory ? 'available' : null],
    ['updated_at', updatedAt || null],
  ] as const;

  return (
    <div className="p-5">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#647269]">GET /api/dashboard</p>
          <h2 className="mt-1 text-xl font-semibold text-[#06130c]">Live response preview</h2>
        </div>
        <span className="hidden rounded-md bg-[#eef2ff] px-3 py-1.5 text-xs font-bold text-[#3d52da] sm:inline-flex">
          Source-backed telemetry
        </span>
      </div>

      <pre className="max-h-[430px] overflow-auto whitespace-pre-wrap break-all rounded-md bg-[#07112a] p-4 text-[11px] leading-6 text-[#dbe4ff] sm:text-xs">
        <code>
          {'{\n'}
          {lines.map(([key, value], index) => (
            <span key={key}>
              {'  '}
              <span className="text-[#c7d2fe]">&quot;{key}&quot;</span>
              {': '}
              {value === null ? (
                <span className="text-[#93a69a]">null</span>
              ) : (
                <span className="text-white">&quot;{cleanText(value)}&quot;</span>
              )}
              {index < lines.length - 1 ? ',' : ''}
              {'\n'}
            </span>
          ))}
          {'}'}
        </code>
      </pre>

      {!hasPortfolioHistory && (
        <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          Performance history has not been published for the selected model yet.
        </div>
      )}
    </div>
  );
}

function Panel({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-[10px] border border-[#e2e7fb] bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-[#e2e7fb] px-5 py-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#eef2ff] text-[#3d52da]">{icon}</span>
        <h2 className="text-base font-semibold text-[#06130c]">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function DefinitionList({ rows }: { rows: Array<[string, string]> }) {
  return (
    <dl className="divide-y divide-[#e2e7fb] text-sm">
      {rows.map(([label, value]) => (
        <div key={label} className="grid gap-1 py-3 sm:grid-cols-[0.75fr_1.25fr]">
          <dt className="font-medium text-[#647269]">{label}</dt>
          <dd className="break-words font-semibold text-[#06130c]">{cleanText(value) || 'Not available'}</dd>
        </div>
      ))}
    </dl>
  );
}

function EquityChart({ points }: { points: EquityPoint[] }) {
  const series = points
    .filter((point) => isFiniteNumber(point.portfolio))
    .map((point) => ({
      timestamp: point.timestamp || '',
      value: point.portfolio as number,
    }));

  if (series.length < 2) {
    return (
      <EmptyState
        title="No portfolio history available"
        body="Performance history is not available for this model yet."
      />
    );
  }

  const width = 760;
  const height = 300;
  const chart = {
    bottom: 42,
    left: 56,
    right: 22,
    top: 22,
  };
  const values = series.map((point) => point.value);
  const latest = values[values.length - 1];
  const first = values[0];
  const periodReturn = first ? latest / first - 1 : null;
  const minValue = Math.min(...values, 100);
  const maxValue = Math.max(...values, 100);
  const paddingValue = Math.max((maxValue - minValue) * 0.18, 0.25);
  const min = Math.floor((minValue - paddingValue) * 10) / 10;
  const max = Math.ceil((maxValue + paddingValue) * 10) / 10;
  const range = max - min || 1;
  const plotWidth = width - chart.left - chart.right;
  const plotHeight = height - chart.top - chart.bottom;
  const xStep = plotWidth / Math.max(series.length - 1, 1);
  const xFor = (index: number) => chart.left + index * xStep;
  const yFor = (value: number) => chart.top + (1 - (value - min) / range) * plotHeight;
  const path = series
    .map((point, index) => {
      const x = xFor(index);
      const y = yFor(point.value);
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
  const areaPath = `${path} L ${xFor(series.length - 1).toFixed(2)} ${yFor(min).toFixed(2)} L ${xFor(0).toFixed(2)} ${yFor(min).toFixed(2)} Z`;
  const ticks = [max, max - range / 3, max - (range / 3) * 2, min];
  const baselineY = yFor(100);
  const lastX = xFor(series.length - 1);
  const lastY = yFor(latest);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-md border border-[#e2e7fb] bg-[#fbfcff] px-4 py-3">
          <div className="text-[11px] font-bold uppercase tracking-wide text-[#647269]">Period return</div>
          <div className="mt-1 text-xl font-semibold text-[#06130c]">{displayPct(periodReturn, true)}</div>
        </div>
        <div className="rounded-md border border-[#e2e7fb] bg-[#fbfcff] px-4 py-3">
          <div className="text-[11px] font-bold uppercase tracking-wide text-[#647269]">Current index</div>
          <div className="mt-1 text-xl font-semibold text-[#06130c]">{latest.toFixed(2)}</div>
        </div>
        <div className="rounded-md border border-[#e2e7fb] bg-[#fbfcff] px-4 py-3">
          <div className="text-[11px] font-bold uppercase tracking-wide text-[#647269]">Source points</div>
          <div className="mt-1 text-xl font-semibold text-[#06130c]">{series.length}</div>
        </div>
      </div>

      <div className="rounded-md border border-[#e2e7fb] bg-[#fbfcff] p-4">
        <div className="mb-3 flex flex-col gap-1 text-xs text-[#647269] sm:flex-row sm:items-center sm:justify-between">
          <span>Model equity index - first observation = 100</span>
          <span>
            {formatDateLabel(series[0]?.timestamp)} - {formatDateLabel(series[series.length - 1]?.timestamp)}
          </span>
        </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Selected model normalized equity curve">
        <defs>
          <linearGradient id="equityAreaGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#3d52da" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#3d52da" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {ticks.map((tick) => {
          const y = yFor(tick);
          return (
            <g key={tick.toFixed(3)}>
              <line x1={chart.left} y1={y} x2={width - chart.right} y2={y} stroke="#e4e9f8" strokeDasharray="4 4" />
              <text x={14} y={y + 4} fill="#647269" fontSize="12">
                {tick.toFixed(1)}
              </text>
            </g>
          );
        })}
        <line x1={chart.left} y1={baselineY} x2={width - chart.right} y2={baselineY} stroke="#9aa7d9" strokeDasharray="5 5" />
        <text x={width - chart.right - 86} y={baselineY - 7} fill="#647269" fontSize="12">
          Start 100
        </text>
        <path d={areaPath} fill="url(#equityAreaGradient)" />
        <path d={path} fill="none" stroke="#3d52da" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" />
        {series.map((point, index) => (
          <circle key={`${point.timestamp}-${index}`} cx={xFor(index)} cy={yFor(point.value)} r={index === series.length - 1 ? 4.5 : 3} fill="#3d52da" stroke="#ffffff" strokeWidth="2" />
        ))}
        <line x1={chart.left} y1={chart.top} x2={chart.left} y2={height - chart.bottom} stroke="#d7ddf7" />
        <line x1={chart.left} y1={height - chart.bottom} x2={width - chart.right} y2={height - chart.bottom} stroke="#d7ddf7" />
        <text x={chart.left} y={height - 10} fill="#647269" fontSize="12">
          {formatDateLabel(series[0]?.timestamp)}
        </text>
        <text x={width - chart.right - 78} y={height - 10} fill="#647269" fontSize="12">
          {formatDateLabel(series[series.length - 1]?.timestamp)}
        </text>
        <text x={Math.min(lastX + 10, width - 118)} y={lastY - 8} fill="#172554" fontSize="12" fontWeight="700">
          {latest.toFixed(2)}
        </text>
      </svg>
      </div>
    </div>
  );
}

function BenchmarkList({ rows }: { rows: BenchmarkEntry[] }) {
  const usableRows = rows.filter((row) => isFiniteNumber(row.stats?.totalReturn));

  if (!usableRows.length) {
    return (
      <EmptyState
        title="No benchmark return data"
        body="Benchmark return data is not available for the selected period."
      />
    );
  }

  return (
    <div className="space-y-3">
      {usableRows.map((row) => (
        <div key={row.ticker || row.name} className="rounded-md border border-[#e2e7fb] p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-[#06130c]">{cleanText(row.name || row.ticker)}</div>
              <div className="mt-1 text-xs text-[#647269]">{cleanText(row.ticker || 'Benchmark')}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold tabular-nums text-[#06130c]">{displayPct(row.stats?.totalReturn, true)}</div>
              <div className="mt-1 text-xs text-[#647269]">{displayCount(row.rowCount)} rows</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-md border border-dashed border-[#cbd5ff] bg-[#f8faff] p-6 text-center">
      <AlertCircle className="mx-auto h-5 w-5 text-[#647269]" />
      <div className="mt-3 font-semibold text-[#06130c]">{title}</div>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#5a685f]">{body}</p>
    </div>
  );
}

function LoadingState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-md border border-[#e2e7fb] bg-[#fbfcff] p-6 text-center">
      <Activity className="mx-auto h-5 w-5 animate-pulse text-[#3d52da]" />
      <div className="mt-3 font-semibold text-[#06130c]">{title}</div>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#5a685f]">{body}</p>
    </div>
  );
}

function DataPolicyItem({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[10px] border border-white/10 bg-white/[0.06] p-4">
      <div className="font-semibold text-white">{title}</div>
      <p className="mt-2 text-sm leading-6 text-[#b8c2e8]">{body}</p>
    </div>
  );
}
