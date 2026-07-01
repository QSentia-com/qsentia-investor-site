'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ApiLoadingPanel, EmptyState, SectionCard } from '@/components/PageChrome';
import { fmtDollar, fmtNum, fmtPct } from '@/lib/metrics';

type CurveRange = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '3Y' | '5Y' | 'All';
type CurveMetric = 'equity' | 'drawdown' | 'rollingSharpe';

type Stats = {
  totalReturn?: number | null;
  annualizedReturn?: number | null;
  sharpe?: number | null;
  sortino?: number | null;
  calmar?: number | null;
  maxDrawdown?: number | null;
  volatility?: number | null;
  hitRate?: number | null;
  nObservations?: number | null;
  nReturns?: number | null;
  status?: string | null;
};

type ModelComparison = {
  id?: string;
  name?: string;
  color?: string;
  latestValue?: number | null;
  dailyRowCount?: number | null;
  rowCount?: number | null;
  inceptionDate?: string | null;
  points?: Array<{ timestamp?: string | null; value?: number | null }>;
  stats?: Stats;
};

type EquityPoint = {
  timestamp?: string;
  portfolio?: number | null;
  portfolioValue?: number | null;
  drawdown?: number | null;
  return?: number | null;
};

type BenchmarkPoint = {
  timestamp?: string;
  value?: number | null;
  close?: number | null;
};

type Benchmark = {
  name?: string;
  ticker?: string;
  color?: string;
  points?: BenchmarkPoint[];
  rowCount?: number | null;
  stats?: Stats;
};

type DashboardDebug = {
  dataSource?: {
    githubTokenPresent?: boolean;
    mode?: string;
    upstreamFetch?: {
      status?: string;
    } | null;
  };
  rowCounts?: Record<string, number | null | undefined>;
};

type DashboardPayload = {
  selectedModel?: string;
  latest?: {
    portfolioValue?: number | null;
    portfolioValueTimestamp?: string | null;
    portfolioValueSource?: string | null;
    portfolioPnl?: number | null;
    portfolioReturn?: number | null;
    paperStatus?: string | null;
    paperReplayStatus?: string | null;
    isLivePaperActive?: boolean | null;
    submittedOrderCount?: number | null;
    hasLivePositions?: boolean | null;
    lastRun?: string | null;
    latestSignalDate?: string | null;
    lastActiveSignalDate?: string | null;
    realismWarningCount?: number | null;
    realismHardFail?: boolean | null;
  };
  stats?: Stats;
  modelComparison?: ModelComparison[];
  equityCurve?: EquityPoint[];
  benchmarks?: Benchmark[];
  decisions?: Record<string, unknown>[];
  actionCounts?: Array<{ action?: string; count?: number }>;
  targetWeights?: Record<string, unknown>[];
  targetWeightHistory?: Record<string, unknown>[];
  positions?: Record<string, unknown>[];
  plannedOrders?: Record<string, unknown>[];
  submittedOrders?: Record<string, unknown>[];
  ordersHistory?: Record<string, unknown>[];
  signalHistory?: Record<string, unknown>[];
  healthStatus?: Record<string, unknown> | null;
  executionRealism?: Record<string, unknown> | null;
  readinessChecks?: Record<string, unknown>[];
  debug?: DashboardDebug;
  updatedAt?: string;
};

type FundSummary = {
  id: string;
  name: string;
  color: string;
  latestValue: number | null;
  dailyReturn: number | null;
  dailyDate: string | null;
  ytdReturn: number | null;
  ytdStart: string | null;
  totalReturn: number | null;
  annualizedReturn: number | null;
  sharpe: number | null;
  sortino: number | null;
  calmar: number | null;
  volatility: number | null;
  hitRate: number | null;
  maxDrawdown: number | null;
  rowCount: number | null;
  curve: EquityPoint[];
};

type ChartSeries = {
  id: string;
  key: string;
  name: string;
  color: string;
  kind: 'model' | 'benchmark';
  points: Array<{ timestamp: string; value: number | null }>;
};

const curveRanges: CurveRange[] = ['1D', '1W', '1M', '3M', '6M', '1Y', '3Y', '5Y', 'All'];
const curveMetrics: Array<{ key: CurveMetric; label: string }> = [
  { key: 'equity', label: 'Equity Curve' },
  { key: 'drawdown', label: 'Drawdown' },
  { key: 'rollingSharpe', label: 'Rolling Sharpe' },
];

const terminalTabs = [
  { id: 'modelComparison', label: 'Model Comparison' },
  { id: 'executiveOverview', label: 'Executive Overview' },
  { id: 'performanceAnalytics', label: 'Performance Analytics' },
  { id: 'portfolioExposure', label: 'Portfolio Exposure' },
  { id: 'executionMonitor', label: 'Execution Monitor' },
  { id: 'decisionHistory', label: 'Decision History' },
  { id: 'modelHealth', label: 'Model Health' },
] as const;

type TerminalTab = (typeof terminalTabs)[number]['id'];

const dashboardFetcher = async (url: string): Promise<DashboardPayload> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
};

const modelDetailsFetcher = async ([, ids]: [string, string[]]) => {
  const entries = await Promise.all(
    ids.map(async (id) => {
      try {
        const response = await fetch(`/api/dashboard?model=${encodeURIComponent(id)}`);
        if (!response.ok) return null;
        return [id, (await response.json()) as DashboardPayload] as const;
      } catch {
        return null;
      }
    })
  );

  return Object.fromEntries(entries.filter((entry): entry is readonly [string, DashboardPayload] => Boolean(entry)));
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

function finiteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function formatPercent(value: number | null | undefined) {
  if (!finiteNumber(value)) return 'Not available';
  return fmtPct(value, true);
}

function formatPlainPercent(value: number | null | undefined) {
  if (!finiteNumber(value)) return 'Not available';
  return fmtPct(value, false);
}

function formatNumber(value: number | null | undefined) {
  if (!finiteNumber(value)) return 'Not available';
  return fmtNum(value, 2);
}

function formatMoney(value: number | null | undefined) {
  if (!finiteNumber(value)) return 'Not available';
  return fmtDollar(value);
}

function formatDate(value: string | null | undefined) {
  if (!value) return 'Not available';
  const date = new Date(String(value).replace('_', 'T'));
  if (Number.isNaN(date.getTime())) return cleanText(value);
  return date.toISOString().slice(0, 10);
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return 'Not available';
  const date = new Date(String(value).replace('_', 'T'));
  if (Number.isNaN(date.getTime())) return cleanText(value);
  return date.toLocaleString('en-US', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatBoolean(value: boolean | null | undefined) {
  if (value === null || value === undefined) return 'Not available';
  return value ? 'Yes' : 'No';
}

function formatUnknown(value: unknown): string {
  if (value === null || value === undefined || value === '') return 'Not available';
  if (typeof value === 'number') return Number.isFinite(value) ? fmtNum(value, Math.abs(value) >= 100 ? 0 : 2) : 'Not available';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.map(formatUnknown).join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return cleanText(value);
}

function formatHealthValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return 'Not available';
  if (Array.isArray(value)) return value.map(formatUnknown).join(', ');
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, entry]) => {
        const numeric = Number(entry);
        const formatted = Number.isFinite(numeric) ? fmtPct(numeric, false) : formatUnknown(entry);
        return `${key} ${formatted}`;
      })
      .join(' / ');
  }
  return formatUnknown(value);
}

function latestRows(rows: Record<string, unknown>[] | undefined, count = 5) {
  return (rows || []).slice(-count).reverse();
}

function pickField(row: Record<string, unknown> | undefined, keys: string[]) {
  if (!row) return null;
  const foundKey = keys.find((key) => row[key] !== null && row[key] !== undefined && row[key] !== '');
  return foundKey ? row[foundKey] : null;
}

function friendlyLabel(value: string) {
  return cleanText(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function compactRows(rows: Record<string, unknown>[] | undefined, mappings: Array<[string, string[]]>, count = 6) {
  return latestRows(rows, count).map((row) =>
    Object.fromEntries(mappings.map(([label, keys]) => [label, formatUnknown(pickField(row, keys))]))
  );
}

function pctTone(value: number | null | undefined) {
  if (!finiteNumber(value) || value === 0) return 'text-[#4b5563]';
  return value > 0 ? 'text-[#00875a]' : 'text-[#d92d20]';
}

function rangeToDays(range: CurveRange) {
  if (range === '1D') return 1;
  if (range === '1W') return 7;
  if (range === '1M') return 31;
  if (range === '3M') return 93;
  if (range === '6M') return 186;
  if (range === '1Y') return 366;
  if (range === '3Y') return 366 * 3;
  if (range === '5Y') return 366 * 5;
  return null;
}

function filterPointsByRange<T extends { timestamp?: string }>(points: T[], range: CurveRange) {
  const days = rangeToDays(range);
  if (!days || points.length < 2) return points;

  const latestTime = Math.max(...points.map((point) => new Date(point.timestamp || '').getTime()).filter(Number.isFinite));
  if (!Number.isFinite(latestTime)) return points;

  const cutoff = latestTime - days * 24 * 60 * 60 * 1000;
  const filtered = points.filter((point) => {
    const time = new Date(point.timestamp || '').getTime();
    return Number.isFinite(time) && time >= cutoff;
  });

  return filtered.length >= 2 ? filtered : points.slice(-2);
}

function rebaseToRangeStart(points: Array<{ timestamp: string; value: number | null }>) {
  const baseline = points.find((point) => finiteNumber(point.value) && point.value !== 0)?.value;

  if (!finiteNumber(baseline) || baseline === 0) return points;

  return points.map((point) => ({
    ...point,
    value: finiteNumber(point.value) ? (point.value / baseline) * 100 : null,
  }));
}

function drawdownFromPoints(points: Array<{ timestamp: string; value: number | null }>) {
  let peak: number | null = null;

  return points.map((point) => {
    if (!finiteNumber(point.value)) {
      return { timestamp: point.timestamp, value: null };
    }

    peak = peak === null ? point.value : Math.max(peak, point.value);

    return {
      timestamp: point.timestamp,
      value: peak ? (point.value / peak - 1) * 100 : null,
    };
  });
}

function sortCurve(points: EquityPoint[]) {
  return points
    .filter((point) => point.timestamp && finiteNumber(point.portfolio))
    .sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)));
}

function modelPointsToCurve(points: ModelComparison['points'] | undefined) {
  return (points || [])
    .filter((point) => point.timestamp && finiteNumber(point.value))
    .map((point) => ({
      timestamp: point.timestamp || '',
      portfolio: point.value,
    }));
}

function dailyReturn(points: EquityPoint[]) {
  if (points.length < 2) return null;
  const latest = points[points.length - 1]?.portfolio;
  const previous = points[points.length - 2]?.portfolio;
  if (!finiteNumber(latest) || !finiteNumber(previous) || previous === 0) return null;
  return latest / previous - 1;
}

function ytdReturn(points: EquityPoint[]) {
  const latest = points[points.length - 1];
  if (!latest?.timestamp || !finiteNumber(latest.portfolio)) return null;

  const latestYear = new Date(latest.timestamp).getFullYear();
  const start = points.find((point) => {
    if (!point.timestamp || !finiteNumber(point.portfolio)) return false;
    return new Date(point.timestamp).getFullYear() === latestYear;
  });

  if (!start || !finiteNumber(start.portfolio) || start.portfolio === 0) return null;
  return latest.portfolio / start.portfolio - 1;
}

function rollingSharpe(points: Array<{ timestamp?: string; value?: number | null }>) {
  const values = points.map((point) => point.value);
  const returns = values.map((value, index) => {
    const previous = values[index - 1];
    if (!finiteNumber(value) || !finiteNumber(previous) || previous === 0) return null;
    return value / previous - 1;
  });

  return points.map((point, index) => {
    const window = returns
      .slice(Math.max(0, index - 4), index + 1)
      .filter((value): value is number => finiteNumber(value));

    if (window.length < 2) return { timestamp: point.timestamp || '', value: null };

    const average = window.reduce((sum, value) => sum + value, 0) / window.length;
    const variance =
      window.reduce((sum, value) => sum + (value - average) ** 2, 0) / Math.max(1, window.length - 1);
    const volatility = Math.sqrt(variance);

    return {
      timestamp: point.timestamp || '',
      value: volatility ? (average / volatility) * Math.sqrt(252) : null,
    };
  });
}

function seriesKey(id: string) {
  return id.replace(/[^a-zA-Z0-9_]/g, '_');
}

function bestOf(items: FundSummary[], key: 'dailyReturn' | 'ytdReturn') {
  const values = items.filter((item) => finiteNumber(item[key]));
  if (!values.length) return null;
  return values.reduce((best, item) => ((item[key] as number) > (best[key] as number) ? item : best), values[0]);
}

function weakestOf(items: FundSummary[], key: 'dailyReturn' | 'ytdReturn') {
  const values = items.filter((item) => finiteNumber(item[key]));
  if (!values.length) return null;
  return values.reduce((weakest, item) => ((item[key] as number) < (weakest[key] as number) ? item : weakest), values[0]);
}

export function ResearchTerminal() {
  const { data, error, isLoading } = useSWR<DashboardPayload>('/api/dashboard', dashboardFetcher, {
    refreshInterval: 60000,
  });
  const modelIds = useMemo(
    () => (data?.modelComparison || []).map((model) => model.id).filter((id): id is string => Boolean(id)),
    [data?.modelComparison]
  );
  const hasModelComparisonPoints = useMemo(
    () => (data?.modelComparison || []).some((model) => (model.points || []).length >= 2),
    [data?.modelComparison]
  );
  const { data: modelDetails, isLoading: isLoadingDetails } = useSWR(
    modelIds.length && !hasModelComparisonPoints ? ['research-model-details', modelIds] : null,
    modelDetailsFetcher,
    { refreshInterval: 90000 }
  );

  const [selectedModelIds, setSelectedModelIds] = useState<string[] | null>(null);
  const [selectedBenchmarkIds, setSelectedBenchmarkIds] = useState<string[] | null>(null);
  const [focusedModelId, setFocusedModelId] = useState('');
  const [modelSearch, setModelSearch] = useState('');
  const [curveRange, setCurveRange] = useState<CurveRange>('1Y');
  const [curveMetric, setCurveMetric] = useState<CurveMetric>('equity');
  const [activeTab, setActiveTab] = useState<TerminalTab>('modelComparison');

  const activeSelectedModelIds = selectedModelIds ?? modelIds;
  const activeFocusedModelId = focusedModelId || data?.selectedModel || modelIds[0] || '';
  const benchmarks = useMemo(() => data?.benchmarks || [], [data?.benchmarks]);
  const benchmarkIds = useMemo(
    () => benchmarks.map((benchmark) => benchmark.ticker || benchmark.name).filter((id): id is string => Boolean(id)),
    [benchmarks]
  );
  const activeSelectedBenchmarkIds = selectedBenchmarkIds ?? benchmarkIds;

  const summaries = useMemo<FundSummary[]>(() => {
    return (data?.modelComparison || [])
      .filter((model): model is ModelComparison & { id: string } => Boolean(model.id))
      .map((model) => {
        const detail = modelDetails?.[model.id];
        const curve = sortCurve(
          detail?.equityCurve?.length
            ? detail.equityCurve
            : model.points?.length
              ? modelPointsToCurve(model.points)
              : model.id === data?.selectedModel
                ? data?.equityCurve || []
                : []
        );
        const latestPoint = curve[curve.length - 1];
        const firstYtdPoint = curve.find((point) => {
          if (!latestPoint?.timestamp || !point.timestamp) return false;
          return new Date(point.timestamp).getFullYear() === new Date(latestPoint.timestamp).getFullYear();
        });

        return {
          id: model.id,
          name: cleanText(model.name || model.id),
          color: model.color || '#2563eb',
          latestValue: finiteNumber(latestPoint?.portfolioValue)
            ? latestPoint?.portfolioValue ?? null
            : finiteNumber(model.latestValue)
              ? model.latestValue ?? null
              : null,
          dailyReturn: dailyReturn(curve),
          dailyDate: latestPoint?.timestamp || null,
          ytdReturn: ytdReturn(curve) ?? (finiteNumber(model.stats?.totalReturn) ? model.stats?.totalReturn ?? null : null),
          ytdStart: firstYtdPoint?.timestamp || model.inceptionDate || null,
          totalReturn: finiteNumber(model.stats?.totalReturn) ? model.stats?.totalReturn ?? null : null,
          annualizedReturn: finiteNumber(model.stats?.annualizedReturn) ? model.stats?.annualizedReturn ?? null : null,
          sharpe: finiteNumber(model.stats?.sharpe) ? model.stats?.sharpe ?? null : null,
          sortino: finiteNumber(model.stats?.sortino) ? model.stats?.sortino ?? null : null,
          calmar: finiteNumber(model.stats?.calmar) ? model.stats?.calmar ?? null : null,
          volatility: finiteNumber(model.stats?.volatility) ? model.stats?.volatility ?? null : null,
          hitRate: finiteNumber(model.stats?.hitRate) ? model.stats?.hitRate ?? null : null,
          maxDrawdown: finiteNumber(model.stats?.maxDrawdown) ? model.stats?.maxDrawdown ?? null : null,
          rowCount: finiteNumber(model.dailyRowCount) ? model.dailyRowCount ?? null : null,
          curve,
        };
      });
  }, [data?.equityCurve, data?.modelComparison, data?.selectedModel, modelDetails]);

  const filteredSummaries = useMemo(() => {
    const query = modelSearch.toLowerCase().trim();
    if (!query) return summaries;
    return summaries.filter((summary) => summary.name.toLowerCase().includes(query) || summary.id.toLowerCase().includes(query));
  }, [modelSearch, summaries]);

  const chartSeries = useMemo<ChartSeries[]>(() => {
    const modelSeries = summaries
      .filter((summary) => activeSelectedModelIds.includes(summary.id))
      .map((summary) => buildModelSeries(summary, curveMetric, curveRange));

    const benchmarkSeries = benchmarks
      .filter((benchmark) => activeSelectedBenchmarkIds.includes(benchmark.ticker || benchmark.name || ''))
      .map((benchmark) => buildBenchmarkSeries(benchmark, curveMetric, curveRange));

    return [...modelSeries, ...benchmarkSeries].filter((series) => series.points.some((point) => finiteNumber(point.value)));
  }, [activeSelectedBenchmarkIds, activeSelectedModelIds, benchmarks, curveMetric, curveRange, summaries]);

  const chartRows = useMemo(() => {
    const byDate = new Map<string, Record<string, string | number | null>>();
    chartSeries.forEach((series) => {
      series.points.forEach((point) => {
        if (!point.timestamp) return;
        const row = byDate.get(point.timestamp) || { timestamp: point.timestamp };
        row[series.key] = point.value;
        byDate.set(point.timestamp, row);
      });
    });

    return Array.from(byDate.values()).sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)));
  }, [chartSeries]);

  const dailyBest = bestOf(summaries, 'dailyReturn');
  const dailyWeakest = weakestOf(summaries, 'dailyReturn');
  const ytdBest = bestOf(summaries, 'ytdReturn');
  const ytdWeakest = weakestOf(summaries, 'ytdReturn');
  const selectedMetric = curveMetrics.find((metric) => metric.key === curveMetric) || curveMetrics[0];
  const focusedSummary =
    summaries.find((summary) => summary.id === activeFocusedModelId) ||
    summaries.find((summary) => activeSelectedModelIds.includes(summary.id)) ||
    summaries[0] ||
    null;
  const modelCurvePointCount = summaries.reduce((sum, summary) => sum + summary.curve.length, 0);
  const hasModelCurveData = modelCurvePointCount > 0;
  const hasVisibleModelSeries = chartSeries.some((series) => series.kind === 'model');
  const dataSource = data?.debug?.dataSource;
  const noCurveSourceNote =
    dataSource?.githubTokenPresent === false
      ? 'GitHub read token is not configured, so private portfolio logs cannot be read locally.'
      : 'Portfolio log rows are not available yet.';
  const noCurveUpstreamNote =
    dataSource?.upstreamFetch?.status === 'unusable'
      ? 'Public QSentia API attempts also returned benchmark rows but zero model curve rows.'
      : '';

  if (error) {
    return (
      <section className="border-y border-[#e2e7fb] bg-[#f8faff]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <EmptyState
            title="Research terminal unavailable"
            body="Live research rows are unavailable right now. Reload the page or check upstream connectivity."
          />
        </div>
      </section>
    );
  }

  if (isLoading && !data) {
    return (
      <section className="border-y border-[#e2e7fb] bg-[#f8faff]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <ApiLoadingPanel
            title="Loading research terminal"
            body="Preparing model tickers, normalized curves, benchmark series, and execution review tabs."
            items={['Fund tickers', 'Model curves', 'Benchmark series']}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="border-y border-[#e2e7fb] bg-[#f8faff]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#2b36ff]">Research terminal</p>
            <h2 className="mt-3 text-3xl font-semibold text-[#06130c]">Fund performance and normalized curves</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5a685f]">
              Live model performance, benchmark context, portfolio exposure, and execution audit views for research review.
            </p>
          </div>
          <div className="rounded-md border border-[#e2e7fb] bg-white px-3 py-2 text-xs font-semibold text-[#647269]">
            {isLoading || isLoadingDetails ? 'Loading live model curves' : `Updated ${formatDate(data?.updatedAt)}`}
          </div>
        </div>

        <div className="space-y-5">
          {!isLoading && !hasModelCurveData && (
            <div className="rounded-[10px] border border-amber-300 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-950">
              The dashboard API returned {summaries.length} model configs but no model curve observations.
              {' '}
              {noCurveSourceNote}
              {' '}
              {noCurveUpstreamNote}
            </div>
          )}

          <TerminalTabNav activeTab={activeTab} onChange={setActiveTab} />

          {activeTab === 'modelComparison' ? (
            <>
              <LiveMetricStrip summary={focusedSummary} />

              <TickerStrip
                title="Daily fund performance"
                subtitle="Latest one-day gain/loss from committed portfolio logs"
                metric="daily"
                summaries={summaries}
                best={dailyBest}
                weakest={dailyWeakest}
                focusedModelId={activeFocusedModelId}
                onFocus={(id) => {
                  setFocusedModelId(id);
                  setSelectedModelIds((current) => {
                    const base = current ?? modelIds;
                    return base.includes(id) ? base : [...base, id];
                  });
                }}
              />

              <TickerStrip
                title="YTD fund return"
                subtitle="Calendar year return from each fund's first available live observation this year"
                metric="ytd"
                summaries={summaries}
                best={ytdBest}
                weakest={ytdWeakest}
                focusedModelId={activeFocusedModelId}
                onFocus={(id) => {
                  setFocusedModelId(id);
                  setSelectedModelIds((current) => {
                    const base = current ?? modelIds;
                    return base.includes(id) ? base : [...base, id];
                  });
                }}
              />
            </>
          ) : (
            <ResearchTerminalTabContent
              activeTab={activeTab}
              benchmarks={benchmarks}
              data={data}
              focusedSummary={focusedSummary}
              summaries={summaries}
            />
          )}
        </div>

        {activeTab === 'modelComparison' && (
        <div className="mt-5 grid min-w-0 gap-5 lg:grid-cols-[280px_1fr]">
          <SectionCard className="p-4">
            <FilterPanel
              summaries={filteredSummaries}
              searchValue={modelSearch}
              selectedModelIds={activeSelectedModelIds}
              benchmarks={benchmarks}
              selectedBenchmarkIds={activeSelectedBenchmarkIds}
              onSearchChange={setModelSearch}
              onSelectAllModels={() => setSelectedModelIds(modelIds)}
              onSelectNoModels={() => setSelectedModelIds([])}
              onToggleModel={(id) =>
                setSelectedModelIds((current) => {
                  const base = current ?? modelIds;
                  return base.includes(id) ? base.filter((modelId) => modelId !== id) : [...base, id];
                })
              }
              onToggleBenchmark={(id) =>
                setSelectedBenchmarkIds((current) => {
                  const base = current ?? benchmarkIds;
                  return base.includes(id) ? base.filter((benchmarkId) => benchmarkId !== id) : [...base, id];
                })
              }
            />
          </SectionCard>

          <SectionCard className="min-w-0">
            <div className="border-b border-[#e2e7fb] px-5 py-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[#06130c]">Normalized Equity Curves</h3>
                  <p className="mt-1 text-xs text-[#647269]">
                    Reference line at {curveMetric === 'equity' ? '100: selected range baseline' : '0: neutral threshold'}
                  </p>
                </div>
                <div className="flex flex-col gap-2 xl:flex-row xl:items-center">
                  <SegmentedControl
                    label="Range"
                    options={curveRanges.map((range) => ({ key: range, label: range }))}
                    value={curveRange}
                    onChange={(value) => setCurveRange(value as CurveRange)}
                  />
                  <SegmentedControl
                    label="Metric"
                    options={curveMetrics}
                    value={curveMetric}
                    onChange={(value) => setCurveMetric(value as CurveMetric)}
                  />
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="mb-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-[#647269]">
                <span className="inline-flex items-center gap-2">
                  <span className="h-px w-8 bg-[#4b5563]" />
                  Strategy
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-px w-8 border-t border-dashed border-[#7d8580]" />
                  Benchmark
                </span>
              </div>

              {chartSeries.length && chartRows.length && hasVisibleModelSeries ? (
                <div className="h-[440px] min-w-0 rounded-md bg-[#fbfcfb] p-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartRows}>
                      <CartesianGrid stroke="#e3e8e4" strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" tick={{ fill: '#647269', fontSize: 11 }} minTickGap={28} />
                      <YAxis tick={{ fill: '#647269', fontSize: 11 }} width={58} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <ReferenceLine
                        y={curveMetric === 'equity' ? 100 : 0}
                        stroke="#a7b3ea"
                        strokeDasharray="4 4"
                      />
                      {chartSeries.map((series) => (
                        <Line
                          key={series.key}
                          type="monotone"
                          dataKey={series.key}
                          name={series.name}
                          stroke={series.color}
                          strokeWidth={series.kind === 'model' ? 2.4 : 1.7}
                          strokeDasharray={series.kind === 'benchmark' ? '4 4' : undefined}
                          dot={false}
                          connectNulls
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState
                  title={`${selectedMetric.label} unavailable`}
                  body={
                    hasModelCurveData
                      ? 'Select at least one model with published observations.'
                      : 'The API returned benchmark observations, but no model curve observations for a valid model-to-benchmark comparison.'
                  }
                />
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {chartSeries.slice(0, 14).map((series) => (
                  <span
                    key={series.key}
                    className="inline-flex max-w-full items-center gap-2 rounded-md border border-[#e2e7fb] bg-white px-2.5 py-1 text-xs font-semibold text-[#46554b]"
                  >
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: series.color }} />
                    <span className="truncate">{series.name}</span>
                  </span>
                ))}
              </div>
            </div>
          </SectionCard>
        </div>
        )}
      </div>
    </section>
  );
}

function TerminalTabNav({
  activeTab,
  onChange,
}: {
  activeTab: TerminalTab;
  onChange: (tab: TerminalTab) => void;
}) {
  return (
    <div className="rounded-[10px] border border-[#d7ddf7] bg-white p-2 shadow-sm">
      <div className="flex flex-wrap gap-2">
        {terminalTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
              activeTab === tab.id
                ? 'bg-[#eef2ff] text-[#2b36ff]'
                : 'text-[#7b849c] hover:bg-[#f8faff] hover:text-[#2b36ff]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ResearchTerminalTabContent({
  activeTab,
  benchmarks,
  data,
  focusedSummary,
  summaries,
}: {
  activeTab: Exclude<TerminalTab, 'modelComparison'>;
  benchmarks: Benchmark[];
  data?: DashboardPayload;
  focusedSummary: FundSummary | null;
  summaries: FundSummary[];
}) {
  if (activeTab === 'executiveOverview') {
    return <ExecutiveOverview data={data} focusedSummary={focusedSummary} summaries={summaries} benchmarks={benchmarks} />;
  }

  if (activeTab === 'performanceAnalytics') {
    return <PerformanceAnalytics data={data} focusedSummary={focusedSummary} benchmarks={benchmarks} />;
  }

  if (activeTab === 'portfolioExposure') {
    return <PortfolioExposure data={data} />;
  }

  if (activeTab === 'executionMonitor') {
    return <ExecutionMonitor data={data} />;
  }

  if (activeTab === 'decisionHistory') {
    return <DecisionHistory data={data} />;
  }

  return <ModelHealth data={data} />;
}

function ExecutiveOverview({
  benchmarks,
  data,
  focusedSummary,
  summaries,
}: {
  benchmarks: Benchmark[];
  data?: DashboardPayload;
  focusedSummary: FundSummary | null;
  summaries: FundSummary[];
}) {
  return (
    <div className="space-y-5">
      <LiveMetricStrip summary={focusedSummary} />
      <ValueGrid
        items={[
          ['Portfolio value', formatMoney(data?.latest?.portfolioValue ?? focusedSummary?.latestValue), 'Latest account or portfolio observation'],
          ['Portfolio P&L', formatMoney(data?.latest?.portfolioPnl), 'Portfolio value minus configured baseline'],
          ['Paper status', cleanText(data?.latest?.paperStatus || 'Not available'), 'Current execution state'],
          ['Last run', formatDateTime(data?.latest?.lastRun), 'Latest model or health timestamp'],
          ['Models tracked', String(summaries.length || 0), 'Registered model comparison rows'],
          ['Benchmarks tracked', String(benchmarks.length || 0), 'Benchmark series returned by API'],
          ['Decision rows', String(data?.decisions?.length ?? data?.debug?.rowCounts?.decisionsRows ?? 0), 'Committed decision log entries'],
          ['Submitted orders', String(data?.submittedOrders?.length ?? data?.latest?.submittedOrderCount ?? 0), 'Submitted execution rows'],
        ]}
      />
    </div>
  );
}

function PerformanceAnalytics({
  benchmarks,
  data,
  focusedSummary,
}: {
  benchmarks: Benchmark[];
  data?: DashboardPayload;
  focusedSummary: FundSummary | null;
}) {
  const selectedStats: Stats = focusedSummary
    ? {
        totalReturn: focusedSummary.totalReturn,
        annualizedReturn: focusedSummary.annualizedReturn,
        sharpe: focusedSummary.sharpe,
        sortino: focusedSummary.sortino,
        calmar: focusedSummary.calmar,
        volatility: focusedSummary.volatility,
        hitRate: focusedSummary.hitRate,
        maxDrawdown: focusedSummary.maxDrawdown,
      }
    : data?.stats || {};

  return (
    <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <ValueGrid
        items={[
          ['Total return', formatPercent(selectedStats.totalReturn), 'Selected model return'],
          ['Annualized return', formatPercent(selectedStats.annualizedReturn), 'Annualized from available observations'],
          ['Sharpe ratio', formatNumber(selectedStats.sharpe), 'Risk-adjusted return'],
          ['Sortino ratio', formatNumber(selectedStats.sortino), 'Downside-risk adjusted return'],
          ['Calmar ratio', formatNumber(selectedStats.calmar), 'Return versus max drawdown'],
          ['Volatility', formatPlainPercent(selectedStats.volatility), 'Annualized volatility'],
          ['Hit rate', formatPlainPercent(selectedStats.hitRate), 'Positive return frequency'],
          ['Max drawdown', formatPlainPercent(selectedStats.maxDrawdown), 'Peak-to-trough drawdown'],
        ]}
      />
      <ApiTable
        title="Benchmark analytics"
        rows={benchmarks.map((benchmark) => ({
          benchmark: `${cleanText(benchmark.name || benchmark.ticker || 'Benchmark')}${benchmark.ticker ? ` (${benchmark.ticker})` : ''}`,
          rows: benchmark.rowCount ?? 0,
          total_return: formatPercent(benchmark.stats?.totalReturn),
          sharpe: formatNumber(benchmark.stats?.sharpe),
          max_drawdown: formatPlainPercent(benchmark.stats?.maxDrawdown),
        }))}
      />
    </div>
  );
}

function PortfolioExposure({ data }: { data?: DashboardPayload }) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <ApiTable title="Current positions" rows={latestRows(data?.positions, 10)} />
      <ApiTable title="Latest target weights" rows={latestRows(data?.targetWeights, 10)} />
      <ApiTable title="Target weight history" rows={latestRows(data?.targetWeightHistory, 8)} />
      <ValueGrid
        items={[
          ['Position rows', String(data?.positions?.length ?? data?.debug?.rowCounts?.positionsRows ?? 0), 'Rows returned by positions logs'],
          ['Target weight rows', String(data?.targetWeights?.length ?? data?.debug?.rowCounts?.targetWeightsRows ?? 0), 'Rows returned by target-weight logs'],
          ['Live positions', formatBoolean(data?.latest?.hasLivePositions), 'Current live-position signal'],
          ['Portfolio source', cleanText(data?.latest?.portfolioValueSource || 'Not available'), 'Portfolio value source row'],
        ]}
      />
    </div>
  );
}

function ExecutionMonitor({ data }: { data?: DashboardPayload }) {
  return (
    <div className="space-y-5">
      <ValueGrid
        items={[
          ['Paper status', cleanText(data?.latest?.paperStatus || 'Not available'), 'Execution mode from API'],
          ['Paper active', formatBoolean(data?.latest?.isLivePaperActive), 'Live paper execution status'],
          ['Replay status', cleanText(data?.latest?.paperReplayStatus || 'Not available'), 'Execution realism replay state'],
          ['Submitted orders', String(data?.submittedOrders?.length ?? data?.latest?.submittedOrderCount ?? 0), 'Submitted order rows'],
          ['Planned orders', String(data?.plannedOrders?.length ?? data?.debug?.rowCounts?.plannedOrdersRows ?? 0), 'Planned order rows'],
          ['Warning count', formatUnknown(data?.latest?.realismWarningCount), 'Execution realism warnings'],
        ]}
      />
      <div className="grid gap-5 xl:grid-cols-3">
        <ApiTable title="Planned orders" rows={latestRows(data?.plannedOrders, 8)} />
        <ApiTable title="Submitted orders" rows={latestRows(data?.submittedOrders, 8)} />
        <ApiTable title="Readiness checks" rows={latestRows(data?.readinessChecks, 8)} />
      </div>
    </div>
  );
}

function DecisionHistory({ data }: { data?: DashboardPayload }) {
  const decisionRows = compactRows(
    data?.decisions,
    [
      ['Timestamp', ['timestamp_utc', 'timestamp', 'date', 'created_at']],
      ['Action', ['action', 'decision', 'signal', 'trade_action']],
      ['Signal', ['signal', 'model_signal', 'trade_signal']],
      ['Selected assets', ['selected_assets', 'selected_asset', 'symbol', 'asset', 'ticker']],
      ['Orders', ['orders_count', 'submitted_order_count']],
      ['Portfolio value', ['portfolio_value', 'net_liquidation', 'equity']],
      ['Account', ['account_status', 'paper_status', 'status']],
    ],
    8
  );
  const signalRows = compactRows(
    data?.signalHistory,
    [
      ['Timestamp', ['timestamp_utc', 'timestamp', 'date']],
      ['Selected assets', ['selected_assets', 'selected_asset', 'symbol', 'asset', 'ticker']],
      ['Predicted vol', ['predicted_vol', 'volatility', 'vol']],
      ['Portfolio value', ['portfolio_value', 'net_liquidation', 'equity']],
      ['Regime', ['regime', 'market_regime', 'state', 'regime_json']],
    ],
    6
  );
  const actionRows = (data?.actionCounts || []).map((row) => ({
    Action: cleanText(row.action || 'Unknown'),
    Count: row.count ?? 0,
  }));

  return (
    <div className="space-y-5">
      <ValueGrid
        columns="four"
        items={[
          ['Decision rows', String(data?.decisions?.length ?? data?.debug?.rowCounts?.decisionsRows ?? 0), 'Historical decision entries'],
          ['Signal rows', String(data?.signalHistory?.length ?? data?.debug?.rowCounts?.signalHistoryRows ?? 0), 'Signal-history entries'],
          ['Latest signal', formatDateTime(data?.latest?.latestSignalDate), 'Latest signal timestamp'],
          ['Last active signal', formatDateTime(data?.latest?.lastActiveSignalDate), 'Last active signal timestamp'],
        ]}
      />

      <div className="grid gap-5 xl:grid-cols-[0.7fr_1.3fr]">
        <SectionCard className="overflow-hidden">
          <div className="border-b border-[#e2e7fb] px-5 py-4">
            <h3 className="text-base font-semibold text-[#06130c]">Action summary</h3>
            <p className="mt-1 text-xs text-[#647269]">Aggregated from committed decision rows</p>
          </div>
          <div className="space-y-3 p-5">
            {actionRows.length ? (
              actionRows.map((row) => (
                <div key={String(row.Action)} className="flex items-center justify-between gap-4 rounded-md border border-[#e2e7fb] bg-[#fbfcff] px-4 py-3">
                  <span className="text-sm font-semibold text-[#26352c]">{String(row.Action)}</span>
                  <span className="rounded-md bg-[#eef2ff] px-2.5 py-1 text-xs font-bold text-[#2b36ff]">{String(row.Count)}</span>
                </div>
              ))
            ) : (
              <EmptyState title="No actions" body="Action count rows are not available yet." />
            )}
          </div>
        </SectionCard>

        <ApiTable title="Decision log" rows={decisionRows} columns={['Timestamp', 'Action', 'Signal', 'Selected assets', 'Orders', 'Portfolio value', 'Account']} />
      </div>

      <ApiTable title="Signal history" rows={signalRows} columns={['Timestamp', 'Selected assets', 'Predicted vol', 'Portfolio value', 'Regime']} />
    </div>
  );
}

function ModelHealth({ data }: { data?: DashboardPayload }) {
  const healthDetails = [
    ['Overall status', data?.healthStatus?.overall_status ?? data?.healthStatus?.status],
    ['Account status', data?.healthStatus?.account_status],
    ['Net liquidation', data?.healthStatus?.net_liquidation ?? data?.healthStatus?.net_liquidation_value],
    ['Portfolio value', data?.healthStatus?.portfolio_value ?? data?.healthStatus?.equity],
    ['Selected assets', data?.healthStatus?.selected_assets],
    ['Target weights', data?.healthStatus?.target_weights],
    ['Submitted orders', data?.healthStatus?.submitted_order_count],
    ['Source', data?.healthStatus?.source],
    ['Paper base URL', data?.healthStatus?.paper_base_url],
    ['Health updated', data?.healthStatus?.updated_at_utc ?? data?.healthStatus?.date],
  ] as const;
  const rowCounts = data?.debug?.rowCounts
    ? Object.entries(data.debug.rowCounts)
        .filter(([, value]) => (value ?? 0) > 0)
        .map(([key, value]) => ({ Metric: friendlyLabel(key), Rows: value ?? 0 }))
    : [];
  const realismDetails = data?.executionRealism
    ? Object.entries(data.executionRealism)
        .slice(0, 10)
        .map(([key, value]) => ({ Metric: friendlyLabel(key), Value: formatUnknown(value) }))
    : [];

  return (
    <div className="space-y-5">
      <ValueGrid
        columns="four"
        items={[
          ['Health status', formatUnknown(data?.healthStatus?.overall_status ?? data?.healthStatus?.status), 'Current model health field'],
          ['Last run', formatDateTime(data?.latest?.lastRun), 'Latest dashboard timestamp'],
          ['Hard fail', formatBoolean(data?.latest?.realismHardFail), 'Execution realism hard-fail flag'],
          ['Updated', formatDateTime(data?.updatedAt), 'Dashboard API update time'],
        ]}
      />

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <SectionCard className="overflow-hidden">
          <div className="border-b border-[#e2e7fb] px-5 py-4">
            <h3 className="text-base font-semibold text-[#06130c]">Health details</h3>
            <p className="mt-1 text-xs text-[#647269]">Selected fields from the live health payload</p>
          </div>
          <div className="divide-y divide-[#e2e7fb]">
            {healthDetails.map(([label, value]) => (
              <div key={label} className="grid gap-2 px-5 py-3 sm:grid-cols-[180px_1fr]">
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#7f89a8]">{label}</span>
                <span className="min-w-0 break-words text-sm font-semibold text-[#26352c]">{formatHealthValue(value)}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <ApiTable title="Active row-count diagnostics" rows={rowCounts} columns={['Metric', 'Rows']} />
      </div>

      <ApiTable title="Execution realism diagnostics" rows={realismDetails} columns={['Metric', 'Value']} />
    </div>
  );
}

function ValueGrid({
  columns = 'auto',
  items,
}: {
  columns?: 'auto' | 'four';
  items: Array<[label: string, value: string, detail?: string]>;
}) {
  const gridClass = columns === 'four' ? 'grid gap-3 md:grid-cols-2 xl:grid-cols-4' : 'grid gap-3 md:grid-cols-2';

  return (
    <div className={gridClass}>
      {items.map(([label, value, detail]) => (
        <div key={`${label}-${value}`} className="rounded-[10px] border border-[#e2e7fb] bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7f89a8]">{label}</p>
          <div className="mt-3 break-words text-2xl font-semibold text-[#06130c]">{value}</div>
          {detail && <p className="mt-2 text-xs leading-5 text-[#647269]">{detail}</p>}
        </div>
      ))}
    </div>
  );
}

function ApiTable({
  columns: requestedColumns,
  rows,
  title,
}: {
  columns?: string[];
  rows: Record<string, unknown>[];
  title: string;
}) {
  const columns = requestedColumns || Array.from(
    rows.reduce((keys, row) => {
      Object.keys(row || {}).forEach((key) => keys.add(key));
      return keys;
    }, new Set<string>())
  ).slice(0, 7);

  return (
    <SectionCard className="min-w-0 overflow-hidden">
      <div className="border-b border-[#e2e7fb] px-5 py-4">
        <h3 className="text-base font-semibold text-[#06130c]">{title}</h3>
        <p className="mt-1 text-xs text-[#647269]">{rows.length ? `${rows.length} source row${rows.length === 1 ? '' : 's'} shown` : 'No source rows available'}</p>
      </div>
      {rows.length && columns.length ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-[#f8faff] text-[#687083]">
              <tr>
                {columns.map((column) => (
                  <th key={column} className="whitespace-nowrap px-4 py-3 font-bold uppercase tracking-[0.12em]">
                    {cleanText(column).replace(/_/g, ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e7fb] bg-white">
              {rows.map((row, index) => (
                <tr key={`${title}-${index}`}>
                  {columns.map((column) => (
                    <td key={`${title}-${index}-${column}`} className="max-w-[260px] truncate px-4 py-3 font-medium text-[#354038]">
                      {formatUnknown(row[column])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-5">
          <EmptyState title="No rows available" body="Rows are not available for this section yet." />
        </div>
      )}
    </SectionCard>
  );
}

function LiveMetricStrip({ summary }: { summary: FundSummary | null }) {
  const metrics = [
    {
      label: 'Platform return',
      value: formatPercent(summary?.totalReturn),
      detail: 'Total return from API stats',
    },
    {
      label: 'Sharpe ratio',
      value: formatNumber(summary?.sharpe),
      detail: 'Risk-adjusted return',
    },
    {
      label: 'Signal accuracy',
      value: formatPlainPercent(summary?.hitRate),
      detail: 'Positive-return hit rate',
    },
    {
      label: 'Maximum peak risk',
      value: formatPlainPercent(summary?.maxDrawdown),
      detail: 'Maximum drawdown',
    },
  ];

  return (
    <SectionCard className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-[#e2e7fb] bg-[#fbfcff] px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#2b36ff]">Live API model metrics</p>
          <h3 className="mt-2 max-w-3xl text-xl font-semibold text-[#06130c]">{summary?.name || 'Model metrics pending'}</h3>
        </div>
        <p className="rounded-md border border-[#d7ddf7] bg-white px-3 py-1.5 text-xs font-semibold text-[#647269]">
          Fetched from /api/dashboard
        </p>
      </div>

      <div className="grid gap-0 divide-y divide-[#e2e7fb] sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
        {metrics.map((metric) => {
          const pending = metric.value === 'Not available';

          return (
            <div key={metric.label} className="p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7f89a8]">{metric.label}</p>
              <div
                className={`mt-3 font-semibold leading-none tracking-normal ${
                  pending ? 'text-2xl text-[#687083]' : 'text-4xl text-[#06130c]'
                }`}
              >
                {metric.value}
              </div>
              <p className="mt-3 text-xs font-semibold leading-5 text-[#3d52da]">{metric.detail}</p>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

function buildModelSeries(summary: FundSummary, metric: CurveMetric, range: CurveRange): ChartSeries {
  const basePoints = summary.curve.map((point) => ({
    timestamp: point.timestamp || '',
    value: finiteNumber(point.portfolio) ? point.portfolio : null,
  }));
  const rolling = rollingSharpe(basePoints);
  const rangedBasePoints = filterPointsByRange(basePoints, range);
  const rangedRollingPoints = filterPointsByRange(
    basePoints.map((point, index) => ({
      timestamp: point.timestamp,
      value: rolling[index]?.value ?? null,
    })),
    range
  );
  const points =
    metric === 'drawdown'
      ? drawdownFromPoints(rangedBasePoints)
      : metric === 'rollingSharpe'
        ? rangedRollingPoints
        : rebaseToRangeStart(rangedBasePoints);

  return {
    id: summary.id,
    key: seriesKey(`model_${summary.id}`),
    name: summary.name,
    color: summary.color,
    kind: 'model',
    points,
  };
}

function buildBenchmarkSeries(benchmark: Benchmark, metric: CurveMetric, range: CurveRange): ChartSeries {
  const id = benchmark.ticker || benchmark.name || 'benchmark';
  const basePoints = (benchmark.points || [])
    .filter((point) => point.timestamp && finiteNumber(point.value))
    .sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)));
  const rolling = rollingSharpe(basePoints);
  const rangedBasePoints = filterPointsByRange(
    basePoints.map((point) => ({
      timestamp: point.timestamp || '',
      value: finiteNumber(point.value) ? point.value : null,
    })),
    range
  );
  const rangedRollingPoints = filterPointsByRange(
    basePoints.map((point, index) => ({
      timestamp: point.timestamp || '',
      value: rolling[index]?.value ?? null,
    })),
    range
  );
  const points =
    metric === 'drawdown'
      ? drawdownFromPoints(rangedBasePoints)
      : metric === 'rollingSharpe'
        ? rangedRollingPoints
        : rebaseToRangeStart(rangedBasePoints);

  return {
    id,
    key: seriesKey(`benchmark_${id}`),
    name: `${cleanText(benchmark.name || id)}${benchmark.ticker ? ` (${benchmark.ticker})` : ''}`,
    color: benchmark.color || '#111111',
    kind: 'benchmark',
    points,
  };
}

function TickerStrip({
  title,
  subtitle,
  metric,
  summaries,
  best,
  weakest,
  focusedModelId,
  onFocus,
}: {
  title: string;
  subtitle: string;
  metric: 'daily' | 'ytd';
  summaries: FundSummary[];
  best: FundSummary | null;
  weakest: FundSummary | null;
  focusedModelId: string;
  onFocus: (id: string) => void;
}) {
  return (
    <SectionCard className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-[#e2e7fb] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#2b36ff]">{title}</p>
          <p className="mt-2 text-sm text-[#46554b]">{subtitle}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <PerformanceBadge label={metric === 'daily' ? 'Best Today' : 'Best YTD'} item={best} metric={metric} tone="good" />
          <PerformanceBadge
            label={metric === 'daily' ? 'Weakest Today' : 'Weakest YTD'}
            item={weakest}
            metric={metric}
            tone="bad"
          />
        </div>
      </div>

      <div className="overflow-x-auto p-3">
        <div className="flex min-w-max gap-3">
          {summaries.length ? (
            summaries.map((summary) => {
              const value = metric === 'daily' ? summary.dailyReturn : summary.ytdReturn;
              const dateLabel =
                metric === 'daily' ? formatDate(summary.dailyDate) : `From ${formatDate(summary.ytdStart)}`;

              return (
                <button
                  key={`${metric}-${summary.id}`}
                  type="button"
                  onClick={() => onFocus(summary.id)}
                  className={`min-h-[132px] w-[300px] shrink-0 rounded-[10px] border bg-white p-5 text-left transition hover:border-[#2b36ff] ${
                    focusedModelId === summary.id ? 'border-[#2b36ff] bg-[#f3f2ff]' : 'border-[#dfe3e6]'
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: summary.color }} />
                    <span className="truncate text-xs font-bold uppercase tracking-[0.18em] text-[#687083]">
                      {summary.name}
                    </span>
                  </div>
                  <div className={`mt-6 text-3xl font-light ${pctTone(value)}`}>{formatPercent(value)}</div>
                  <div className="mt-5 flex items-center justify-between gap-4 text-xs font-semibold text-[#9198ad]">
                    <span>{dateLabel}</span>
                    <span>{formatMoney(summary.latestValue)}</span>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="w-full min-w-[320px]">
              <EmptyState title="No fund rows" body="Model comparison rows are not available yet." />
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}

function PerformanceBadge({
  label,
  item,
  metric,
  tone,
}: {
  label: string;
  item: FundSummary | null;
  metric: 'daily' | 'ytd';
  tone: 'good' | 'bad';
}) {
  const value = metric === 'daily' ? item?.dailyReturn : item?.ytdReturn;
  const colors =
    tone === 'good'
      ? 'border-[#ace8cf] bg-[#eafff4] text-[#00875a]'
      : 'border-[#ffc3c3] bg-[#fff1f1] text-[#d92d20]';

  return (
    <div className={`min-w-0 rounded-md border px-3 py-2 text-xs font-semibold ${colors}`}>
      <span className="mr-2 inline-block h-2 w-2 rounded-full bg-current" />
      {item ? `${label}: ${item.name} ${formatPercent(value)}` : `${label}: Not available`}
    </div>
  );
}

function FilterPanel({
  summaries,
  searchValue,
  selectedModelIds,
  benchmarks,
  selectedBenchmarkIds,
  onSearchChange,
  onSelectAllModels,
  onSelectNoModels,
  onToggleModel,
  onToggleBenchmark,
}: {
  summaries: FundSummary[];
  searchValue: string;
  selectedModelIds: string[];
  benchmarks: Benchmark[];
  selectedBenchmarkIds: string[];
  onSearchChange: (value: string) => void;
  onSelectAllModels: () => void;
  onSelectNoModels: () => void;
  onToggleModel: (id: string) => void;
  onToggleBenchmark: (id: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#2b36ff]">Models</p>
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={onSelectAllModels} className="rounded-md border border-[#ccd3d8] bg-[#eef1f5] px-3 py-1.5 text-xs font-semibold text-[#687083]">
          All
        </button>
        <button type="button" onClick={onSelectNoModels} className="rounded-md border border-[#ccd3d8] bg-[#eef1f5] px-3 py-1.5 text-xs font-semibold text-[#687083]">
          None
        </button>
      </div>
      <input
        type="search"
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search models..."
        className="mt-3 w-full rounded-md border border-[#ccd3d8] bg-[#f3f5f8] px-3 py-2.5 text-xs text-[#06130c] outline-none focus:border-[#2b36ff]"
      />

      <div className="mt-3 max-h-[360px] space-y-2 overflow-y-auto pr-2">
        {summaries.map((summary) => (
          <label
            key={`filter-${summary.id}`}
            className="flex cursor-pointer items-center gap-2 rounded-md border border-[#dfe3e6] bg-white px-3 py-2 text-xs font-semibold text-[#354038]"
          >
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: summary.color }} />
            <span className="min-w-0 flex-1 truncate">{summary.name}</span>
            <input
              type="checkbox"
              checked={selectedModelIds.includes(summary.id)}
              onChange={() => onToggleModel(summary.id)}
              className="h-4 w-4 accent-[#0ea5b7]"
            />
          </label>
        ))}
      </div>

      <p className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-[#2b36ff]">Benchmarks</p>
      <div className="mt-3 space-y-2">
        {benchmarks.map((benchmark) => {
          const id = benchmark.ticker || benchmark.name || '';
          if (!id) return null;
          return (
            <label
              key={`benchmark-${id}`}
              className="flex cursor-pointer items-center gap-2 rounded-md border border-[#dfe3e6] bg-white px-3 py-2 text-xs font-semibold text-[#354038]"
            >
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: benchmark.color || '#111111' }} />
              <span className="min-w-0 flex-1 truncate">
                {cleanText(benchmark.name || id)} {benchmark.ticker ? `(${benchmark.ticker})` : ''}
              </span>
              <input
                type="checkbox"
                checked={selectedBenchmarkIds.includes(id)}
                onChange={() => onToggleBenchmark(id)}
                className="h-4 w-4 accent-[#0ea5b7]"
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}

function SegmentedControl({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<{ key: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-md border border-[#d7ddf7] bg-[#f2f5ff] p-2">
      <span className="shrink-0 px-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8a958e]">
        {label}
      </span>
      <div className="flex min-w-0 gap-1 overflow-x-auto">
        {options.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => onChange(option.key)}
            className={`shrink-0 rounded px-3 py-1.5 text-xs font-semibold transition ${
              value === option.key
                ? 'border border-[#2b36ff] bg-white text-[#2b36ff]'
                : 'border border-transparent text-[#68756d] hover:bg-white'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const tooltipStyle = {
  background: '#ffffff',
  border: '1px solid #e2e7fb',
  borderRadius: '10px',
  color: '#06130c',
  boxShadow: '0 16px 50px rgba(15,31,22,0.12)',
  padding: '10px 12px',
  fontSize: '12px',
  fontWeight: 600,
};
