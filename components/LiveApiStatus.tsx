'use client';

import Link from 'next/link';
import useSWR from 'swr';
import { Activity, AlertCircle, Clock3, Database, GitBranch, Layers3 } from 'lucide-react';

type DashboardPayload = {
  repo?: {
    owner?: string;
    repo?: string;
    branch?: string;
  };
  selectedModel?: string;
  selectedModelConfig?: {
    name?: string;
    repo?: string;
    logs_path?: string;
    branch?: string;
  };
  registry?: Array<{ id?: string; name?: string }>;
  benchmarks?: Array<{ ticker?: string; name?: string; rowCount?: number | null }>;
  modelComparison?: Array<{ rowCount?: number | null; dailyRowCount?: number | null }>;
  latest?: {
    paperStatus?: string | null;
  };
  debug?: {
    registryCount?: number;
    benchmarkCount?: number;
  };
  updatedAt?: string;
};

const fetcher = async (url: string) => {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
};

function cleanText(value: unknown) {
  return String(value ?? '')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u00e2\u0080[\u0093\u0094]/g, '-')
    .replace(/\u00e2\u0080\u0099/g, "'")
    .replace(/\u00c2/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function displayCount(value: number | null | undefined) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'Not returned';
  return value.toLocaleString('en-US');
}

function formatUpdatedAt(value?: string | null) {
  if (!value) return 'Not returned';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return cleanText(value);

  return date.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function LiveApiRibbon({
  theme = 'light',
  embedded = false,
  className = '',
}: {
  theme?: 'light' | 'dark';
  embedded?: boolean;
  className?: string;
}) {
  const dark = theme === 'dark';
  const {
    data: dashboard,
    error: dashboardError,
    isLoading: dashboardLoading,
  } = useSWR<DashboardPayload>('/api/dashboard?summary=1', fetcher, { refreshInterval: 60000 });

  const hasError = Boolean(dashboardError);
  const isLoading = dashboardLoading;
  const modelCount = dashboard?.debug?.registryCount ?? dashboard?.registry?.length ?? null;
  const benchmarkCount = dashboard?.debug?.benchmarkCount ?? dashboard?.benchmarks?.length ?? null;
  const comparisonRows = dashboard?.modelComparison || [];
  const hasRowCounts = comparisonRows.some(
    (model) =>
      typeof model.dailyRowCount === 'number' ||
      typeof model.rowCount === 'number'
  );
  const rowCount = hasRowCounts
    ? comparisonRows.reduce((sum, model) => sum + Number(model.dailyRowCount ?? model.rowCount ?? 0), 0)
    : null;
  const selectedModel = cleanText(
    dashboard?.selectedModelConfig?.name || dashboard?.selectedModel || 'Not returned'
  );
  const sourceRepo = cleanText(
    dashboard?.selectedModelConfig?.repo ||
      (dashboard?.repo?.owner && dashboard?.repo?.repo
        ? `${dashboard.repo.owner}/${dashboard.repo.repo}`
        : '')
  );
  const updatedAt = dashboard?.updatedAt;
  const statusText = hasError ? 'API unavailable' : isLoading ? 'Loading API' : 'App API';

  const frameClass = embedded
    ? dark
      ? 'rounded-[10px] border border-[#1d2a55] bg-[#07112a]/92'
      : 'rounded-[10px] border border-[#cbd5ff] bg-white/90 shadow-sm backdrop-blur'
    : dark
      ? 'border-b border-[#18233f] bg-[#07112a] text-[#dbe4ff]'
      : 'border-b border-[#e2e7fb] bg-white/92 text-[#172554] backdrop-blur';
  const innerClass = embedded
    ? 'flex flex-col gap-3 p-3 lg:flex-row lg:items-center lg:justify-between'
    : 'mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between';

  return (
    <div data-live-api-ribbon className={`${frameClass} ${className}`}>
      <div className={innerClass}>
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs font-bold ${
              hasError
                ? 'border-red-200 bg-red-50 text-red-700'
                : dark
                  ? 'border-[#33449f] bg-[#101a44] text-[#c7d2fe]'
                  : 'border-[#cbd5ff] bg-[#eef2ff] text-[#3d52da]'
            }`}
          >
            {hasError ? <AlertCircle className="h-3.5 w-3.5" /> : <Activity className="h-3.5 w-3.5" />}
            {statusText}
          </span>
          <span className={`truncate text-xs font-semibold ${dark ? 'text-[#dbe4ff]' : 'text-[#172554]'}`}>
            {selectedModel}
          </span>
        </div>

        <div className={`flex min-w-0 flex-wrap items-center gap-2 text-xs ${dark ? 'text-[#b8c2e8]' : 'text-[#46554b]'}`}>
          <ApiDatum icon={<Layers3 className="h-3.5 w-3.5" />} label="Models" value={displayCount(modelCount)} />
          <ApiDatum icon={<Database className="h-3.5 w-3.5" />} label="Benchmarks" value={displayCount(benchmarkCount)} />
          <ApiDatum icon={<GitBranch className="h-3.5 w-3.5" />} label="Rows" value={displayCount(rowCount)} />
          <ApiDatum icon={<Clock3 className="h-3.5 w-3.5" />} label="Updated" value={formatUpdatedAt(updatedAt)} />
        </div>

        <Link
          href="/docs"
          className={`shrink-0 text-xs font-bold underline-offset-4 hover:underline ${
            dark ? 'text-[#c7d2fe]' : 'text-[#3d52da]'
          }`}
        >
          {sourceRepo || '/api/dashboard'}
        </Link>
      </div>
    </div>
  );
}

function ApiDatum({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-current/10 bg-white/45 px-2 py-1">
      {icon}
      <span className="font-bold">{label}:</span>
      <span>{value}</span>
    </span>
  );
}
