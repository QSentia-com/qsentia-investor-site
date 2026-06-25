'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import {
  ArrowRight,
  BarChart3,
  Database,
  LineChart as LineChartIcon,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
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
import { ApiLoadingPanel, EmptyState, Eyebrow, PageShell, SectionCard, TechnicalBackdrop } from '@/components/PageChrome';
import { fmtDollar, fmtNum, fmtPct } from '@/lib/metrics';

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
};

type RegistryEntry = {
  id: string;
  name: string;
  repo?: string;
  logs_path?: string;
};

type Stats = {
  totalReturn?: number | null;
  annualizedReturn?: number | null;
  sharpe?: number | null;
  maxDrawdown?: number | null;
  volatility?: number | null;
  hitRate?: number | null;
  nObservations?: number | null;
  nReturns?: number | null;
  status?: string;
};

type EquityPoint = {
  timestamp?: string;
  portfolio?: number | null;
  portfolioValue?: number | null;
  drawdown?: number | null;
  return?: number | null;
};

type Benchmark = {
  name?: string;
  ticker?: string;
  stats?: Stats;
  rowCount?: number;
};

type ModelComparison = {
  id?: string;
  name?: string;
  repo?: string;
  logsPath?: string;
  latestValue?: number | null;
  rowCount?: number | null;
  dailyRowCount?: number | null;
  inceptionDate?: string | null;
  stats?: Stats;
};

type DashboardPayload = {
  selectedModel?: string;
  selectedModelConfig?: RegistryEntry;
  registry?: RegistryEntry[];
  latest?: {
    portfolioValue?: number | null;
    portfolioValueTimestamp?: string | null;
    portfolioValueSource?: string | null;
    firstPortfolioValue?: number | null;
    portfolioReturn?: number | null;
    paperStatus?: string | null;
    paperReplayStatus?: string | null;
    submittedOrderCount?: number | null;
    lastRun?: string | null;
  };
  stats?: Stats;
  equityCurve?: EquityPoint[];
  benchmarks?: Benchmark[];
  modelComparison?: ModelComparison[];
  decisions?: Record<string, unknown>[];
  targetWeights?: Record<string, unknown>[];
  positions?: Record<string, unknown>[];
  plannedOrders?: Record<string, unknown>[];
  submittedOrders?: Record<string, unknown>[];
  signalHistory?: Record<string, unknown>[];
  updatedAt?: string;
  debug?: {
    rowCounts?: Record<string, number>;
  };
};

type CurveRange = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '3Y' | '5Y' | 'All';
type CurveMetric = 'equity' | 'drawdown' | 'rollingSharpe';

const curveRanges: CurveRange[] = ['1D', '1W', '1M', '3M', '6M', '1Y', '3Y', '5Y', 'All'];
const curveMetrics: Array<{ key: CurveMetric; label: string }> = [
  { key: 'equity', label: 'Equity Curve' },
  { key: 'drawdown', label: 'Drawdown' },
  { key: 'rollingSharpe', label: 'Rolling Sharpe' },
];

function display(value: string) {
  return value === 'Pending' ? 'Not available' : value;
}

function displayPct(value: number | null | undefined, signed = false) {
  return display(fmtPct(value, signed));
}

function displayNum(value: number | null | undefined, digits = 2) {
  return display(fmtNum(value, digits));
}

function displayDollar(value: number | null | undefined) {
  return display(fmtDollar(value));
}

function displayCount(value: number | null | undefined) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'Not available';
  return value.toLocaleString('en-US');
}

function formatDate(value?: string | null) {
  if (!value) return 'Not available';
  const date = new Date(String(value).replace('_', 'T'));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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

function finiteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function filterByRange<T extends { timestamp?: string }>(rows: T[], range: CurveRange) {
  const days = rangeToDays(range);
  if (!days || rows.length < 2) return rows;

  const latestTime = Math.max(...rows.map((row) => new Date(row.timestamp || '').getTime()).filter(Number.isFinite));
  if (!Number.isFinite(latestTime)) return rows;

  const cutoff = latestTime - days * 24 * 60 * 60 * 1000;
  const filtered = rows.filter((row) => {
    const time = new Date(row.timestamp || '').getTime();
    return Number.isFinite(time) && time >= cutoff;
  });

  return filtered.length >= 2 ? filtered : rows.slice(-2);
}

function rollingSharpe(points: EquityPoint[]) {
  const values = points.map((point) => point.portfolio);
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

export default function DashboardPage() {
  const [selectedModel, setSelectedModel] = useState('');
  const [curveRange, setCurveRange] = useState<CurveRange>('1Y');
  const [curveMetric, setCurveMetric] = useState<CurveMetric>('equity');
  const endpoint = selectedModel ? `/api/dashboard?model=${encodeURIComponent(selectedModel)}` : '/api/dashboard';
  const { data, error, isLoading } = useSWR<DashboardPayload>(endpoint, fetcher, { refreshInterval: 60000 });
  const initialLoading = isLoading && !data;

  const selectedId = selectedModel || data?.selectedModel || '';
  const registry = data?.registry || [];
  const stats = data?.stats || {};
  const latest = data?.latest || {};
  const portfolioRows = data?.debug?.rowCounts?.dailyPortfolioRows ?? data?.equityCurve?.length ?? 0;
  const decisionRows = data?.decisions?.length ?? data?.debug?.rowCounts?.decisionsRows ?? 0;
  const selectedName =
    registry.find((model) => model.id === selectedId)?.name ||
    data?.selectedModelConfig?.name ||
    selectedId ||
    'Default model';

  const chartRows = useMemo(() => {
    const sourceRows = (data?.equityCurve || []).filter((point) => finiteNumber(point.portfolio));
    const rolling = rollingSharpe(sourceRows);
    const rows = sourceRows.map((point, index) => {
      const value =
        curveMetric === 'drawdown'
          ? finiteNumber(point.drawdown)
            ? point.drawdown * 100
            : null
          : curveMetric === 'rollingSharpe'
            ? rolling[index]?.value
            : point.portfolio;

      return {
        timestamp: point.timestamp || '',
        value,
      };
    });

    return filterByRange(rows, curveRange);
  }, [curveMetric, curveRange, data?.equityCurve]);

  const selectedCurveMetric = curveMetrics.find((metric) => metric.key === curveMetric) || curveMetrics[0];
  const hasChartRows = chartRows.filter((point) => finiteNumber(point.value)).length >= 2;

  const metricTiles = [
    {
      label: 'Portfolio value',
      value: displayDollar(latest.portfolioValue),
      detail: latest.portfolioValueSource || 'Source not available',
      icon: Database,
    },
    {
      label: 'Portfolio return',
      value: displayPct(latest.portfolioReturn ?? stats.totalReturn, true),
      detail: 'From published portfolio observations',
      icon: LineChartIcon,
    },
    {
      label: 'Sharpe ratio',
      value: displayNum(stats.sharpe),
      detail: stats.status ? `Status: ${stats.status}` : 'Requires return history',
      icon: BarChart3,
    },
    {
      label: 'Max drawdown',
      value: displayPct(stats.maxDrawdown, true),
      detail: `${displayCount(stats.nReturns ?? null)} return rows`,
      icon: ShieldCheck,
    },
  ];

  return (
    <PageShell active="/dashboard">
      <section className="relative overflow-hidden border-b border-[#e2e7fb] bg-[#f8faff]">
        <TechnicalBackdrop />
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Eyebrow>Live dashboard</Eyebrow>
              <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.04] text-[#06130c] md:text-6xl">
                Qsentia telemetry terminal
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-[#46554b]">
                Live portfolio, model registry, benchmark, and execution data from the dashboard API.
                Source coverage, execution state, and portfolio observations remain available for review.
              </p>
            </div>

            <div className="flex min-w-0 flex-col gap-3">
              <Link
                href="/customer"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#172554] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2437b5]"
              >
                Open settings
                <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="rounded-[10px] border border-[#e2e7fb] bg-white p-4 shadow-sm">
                <label className="text-xs font-bold uppercase tracking-wide text-[#647269]" htmlFor="model-select">
                  Selected model
                </label>
                <select
                  id="model-select"
                  value={selectedId}
                  onChange={(event) => setSelectedModel(event.target.value)}
                  className="mt-2 w-full min-w-[280px] rounded-md border border-[#cbd5ff] bg-white px-3 py-2 text-sm font-semibold text-[#06130c] outline-none focus:border-[#3d52da]"
                >
                  {registry.length ? (
                    registry.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name || model.id}
                      </option>
                    ))
                  ) : (
                    <option value={selectedId}>{selectedName}</option>
                  )}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {error && (
          <EmptyState
            title="Dashboard API unavailable"
            body="The dashboard endpoint did not respond successfully. Reload the page or check upstream connectivity."
          />
        )}

        {initialLoading && (
          <ApiLoadingPanel
            title="Loading dashboard telemetry"
            body="Preparing model registry, portfolio history, benchmarks, and execution rows."
            items={['Model registry', 'Equity curves', 'Execution audit']}
          />
        )}

        {!error && !initialLoading && (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {metricTiles.map((metric) => {
                const Icon = metric.icon;
                return (
                  <SectionCard key={metric.label} className="relative overflow-hidden p-5">
                    <div aria-hidden className="absolute -right-5 -top-5 h-20 w-20 rounded-full border border-[#3d52da]/10" />
                    <div aria-hidden className="absolute right-12 top-8 h-7 w-7 rotate-[18deg] rounded-[4px] border border-[#3d52da]/14" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-xs font-bold uppercase tracking-wide text-[#647269]">{metric.label}</div>
                        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#eef2ff] text-[#3d52da]">
                          <Icon className="h-4 w-4" />
                        </span>
                      </div>
                      <div className="mt-4 text-2xl font-semibold text-[#06130c]">{isLoading ? 'Loading' : metric.value}</div>
                      <div className="mt-2 min-h-5 text-xs leading-5 text-[#5a685f]">{metric.detail}</div>
                    </div>
                  </SectionCard>
                );
              })}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              <Fact label="Current model" value={selectedName} />
              <Fact label="Portfolio rows" value={displayCount(portfolioRows)} />
              <Fact label="Decision rows" value={displayCount(decisionRows)} />
              <Fact label="Last refresh" value={formatDate(data?.updatedAt)} />
            </div>
          </>
        )}
      </section>

      {!error && !initialLoading && (
        <>
          <section className="relative overflow-hidden border-y border-[#e2e7fb] bg-[#f8faff]">
            <TechnicalBackdrop className="opacity-80" />
            <div className="relative z-10 mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1.25fr_0.75fr]">
              <SectionCard className="p-5">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-[#06130c]">Normalized equity curves</h2>
                    <p className="mt-1 text-sm text-[#5a685f]">
                      Range and metric controls are computed from published portfolio observations.
                    </p>
                  </div>
                  <RefreshCw className="h-4 w-4 text-[#647269]" />
                </div>

                <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center">
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

                {hasChartRows ? (
                  <div className="h-[360px] overflow-hidden rounded-md border border-[#e2e7fb] bg-[#fbfcff] p-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartRows}>
                        <CartesianGrid stroke="#e2e7fb" strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" tick={{ fill: '#647269', fontSize: 11 }} minTickGap={24} />
                        <YAxis tick={{ fill: '#647269', fontSize: 11 }} width={56} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <ReferenceLine
                          y={curveMetric === 'equity' ? 100 : 0}
                          stroke="#a7b3ea"
                          strokeDasharray="4 4"
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          name={selectedCurveMetric.label}
                          stroke="#3d52da"
                          strokeWidth={2.5}
                          dot={false}
                          activeDot={{ r: 5, fill: '#3d52da', stroke: '#ffffff', strokeWidth: 2 }}
                          connectNulls
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyState
                    title={`${selectedCurveMetric.label} unavailable`}
                    body="The selected model has not published enough observations for this view."
                  />
                )}
              </SectionCard>

              <SectionCard className="p-5">
                <h2 className="text-xl font-semibold text-[#06130c]">Execution status</h2>
                <dl className="mt-4 divide-y divide-[#e2e7fb] text-sm">
                  <InfoRow label="Paper status" value={latest.paperStatus || 'Not available'} />
                  <InfoRow label="Paper replay" value={latest.paperReplayStatus || 'Not available'} />
                  <InfoRow label="Last run" value={formatDate(latest.lastRun)} />
                  <InfoRow label="Portfolio timestamp" value={formatDate(latest.portfolioValueTimestamp)} />
                  <InfoRow label="Submitted orders" value={displayCount(latest.submittedOrderCount ?? data?.submittedOrders?.length ?? null)} />
                </dl>
              </SectionCard>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
              <SectionCard className="p-5">
                <h2 className="text-xl font-semibold text-[#06130c]">Model registry comparison</h2>
                <div className="mt-5 overflow-x-auto">
                  <table className="min-w-[760px] text-left text-sm">
                    <thead className="bg-[#f8faff] text-xs font-bold uppercase tracking-wide text-[#647269]">
                      <tr>
                        <th className="px-3 py-3">Model</th>
                        <th className="px-3 py-3 text-right">Rows</th>
                        <th className="px-3 py-3 text-right">Return</th>
                        <th className="px-3 py-3 text-right">Sharpe</th>
                        <th className="px-3 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e2e7fb]">
                      {(data?.modelComparison || []).map((model) => (
                        <tr key={model.id || model.name}>
                          <td className="px-3 py-3 font-semibold text-[#06130c]">{model.name || model.id}</td>
                          <td className="px-3 py-3 text-right text-[#26352c]">{displayCount(model.dailyRowCount ?? model.rowCount ?? null)}</td>
                          <td className="px-3 py-3 text-right text-[#26352c]">{displayPct(model.stats?.totalReturn, true)}</td>
                          <td className="px-3 py-3 text-right text-[#26352c]">{displayNum(model.stats?.sharpe)}</td>
                          <td className="px-3 py-3 text-[#26352c]">{model.stats?.status || 'Not available'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!(data?.modelComparison || []).length && (
                    <EmptyState title="No registry rows" body="Model comparison rows are not available yet." />
                  )}
                </div>
              </SectionCard>

              <SectionCard className="p-5">
                <h2 className="text-xl font-semibold text-[#06130c]">Benchmarks</h2>
                <div className="mt-5 space-y-3">
                  {(data?.benchmarks || []).length ? (
                    (data?.benchmarks || []).map((benchmark) => (
                      <div key={benchmark.ticker || benchmark.name} className="rounded-md border border-[#e2e7fb] bg-[#fbfcff] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="font-semibold text-[#06130c]">{benchmark.name || benchmark.ticker}</div>
                            <div className="mt-1 text-xs text-[#647269]">{benchmark.ticker || 'Benchmark'}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-[#06130c]">{displayPct(benchmark.stats?.totalReturn, true)}</div>
                            <div className="mt-1 text-xs text-[#647269]">{displayCount(benchmark.rowCount ?? null)} rows</div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState title="No benchmark data" body="Benchmark rows are not available for this model yet." />
                  )}
                </div>
              </SectionCard>
            </div>
          </section>

          <section className="relative overflow-hidden border-y border-[#e2e7fb] bg-[#f8faff]">
            <TechnicalBackdrop className="opacity-60" />
            <div className="relative z-10 mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
              <DataTable title="Decisions" rows={data?.decisions || []} />
              <DataTable title="Submitted orders" rows={data?.submittedOrders || []} />
              <DataTable title="Planned orders" rows={data?.plannedOrders || []} />
              <DataTable title="Positions" rows={data?.positions || []} />
              <DataTable title="Target weights" rows={data?.targetWeights || []} />
              <DataTable title="Signal history" rows={data?.signalHistory || []} />
            </div>
          </section>
        </>
      )}
    </PageShell>
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

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <SectionCard className="p-4">
      <div className="text-xs font-bold uppercase tracking-wide text-[#647269]">{label}</div>
      <div className="mt-1 truncate text-sm font-semibold text-[#06130c]">{value}</div>
    </SectionCard>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 py-3">
      <dt className="font-medium text-[#647269]">{label}</dt>
      <dd className="break-words font-semibold text-[#06130c]">{value}</dd>
    </div>
  );
}

function DataTable({ title, rows }: { title: string; rows: Record<string, unknown>[] }) {
  const columns = useMemo(() => {
    const names = new Set<string>();
    rows.slice(0, 20).forEach((row) => Object.keys(row || {}).forEach((key) => names.add(key)));
    return Array.from(names).slice(0, 10);
  }, [rows]);

  return (
    <SectionCard>
      <div className="flex items-center justify-between gap-4 border-b border-[#e2e7fb] px-5 py-4">
        <h2 className="text-xl font-semibold text-[#06130c]">{title}</h2>
        <span className="text-xs font-bold uppercase tracking-wide text-[#647269]">{displayCount(rows.length)} rows</span>
      </div>
      {rows.length && columns.length ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#f8faff] text-xs font-bold uppercase tracking-wide text-[#647269]">
              <tr>
                {columns.map((column) => (
                  <th key={column} className="px-3 py-3">{prettyColumnName(column)}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e7fb]">
              {rows.slice(0, 50).map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((column) => (
                    <td key={column} className="max-w-[280px] whitespace-normal break-words px-3 py-3 text-[#26352c]">
                      {formatCell(row[column])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-5">
          <EmptyState title={`No ${title.toLowerCase()} rows`} body="Rows are not available for this table yet." />
        </div>
      )}
    </SectionCard>
  );
}

function prettyColumnName(column: string) {
  return column
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatCell(value: unknown) {
  if (value === null || value === undefined || value === '') return 'Not available';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'Not available';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
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
