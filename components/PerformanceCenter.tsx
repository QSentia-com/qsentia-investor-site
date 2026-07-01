'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ApiLoadingPanel, EmptyState, SectionCard } from '@/components/PageChrome';
import { fmtNum, fmtPct } from '@/lib/metrics';

type Stats = {
  totalReturn?: number | null;
  sharpe?: number | null;
  maxDrawdown?: number | null;
};

type Point = {
  timestamp?: string | null;
  portfolio?: number | null;
  value?: number | null;
  drawdown?: number | null;
  return?: number | null;
};

type Benchmark = {
  name?: string;
  ticker?: string;
  points?: Array<{ timestamp?: string | null; value?: number | null }>;
};

type ModelComparison = {
  id?: string;
  name?: string;
  description?: string;
  color?: string;
  dailyRowCount?: number | null;
  rowCount?: number | null;
  inceptionDate?: string | null;
  points?: Array<{ timestamp?: string | null; value?: number | null }>;
  stats?: Stats;
  benchmarks?: Benchmark[];
};

type Payload = {
  selectedModel?: string;
  selectedModelConfig?: { id?: string; name?: string; description?: string };
  equityCurve?: Point[];
  benchmarks?: Benchmark[];
  stats?: Stats;
  modelComparison?: ModelComparison[];
  updatedAt?: string;
};

type StrategyOption = ModelComparison & {
  id: string;
  name: string;
};

const fetcher = async (url: string): Promise<Payload> => {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error('Unavailable');
  return response.json();
};

const safePct = (value?: number | null) => {
  const x = fmtPct(value, true);
  return x === 'Pending' ? 'Not reported' : x;
};

const safeNum = (value?: number | null) => {
  const x = fmtNum(value, 2);
  return x === 'Pending' ? 'Not reported' : x;
};

function finiteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function cleanText(value: unknown) {
  return String(value ?? '')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function PerformanceCenter() {
  const [basis, setBasis] = useState<'net' | 'gross'>('net');
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('');
  const { data, error, isLoading } = useSWR<Payload>('/api/dashboard', fetcher, {
    refreshInterval: 60000,
  });

  const strategies = useMemo(() => strategyOptions(data), [data]);
  const activeStrategyId =
    (selectedStrategyId && strategies.some((strategy) => strategy.id === selectedStrategyId)
      ? selectedStrategyId
      : '') ||
    (data?.selectedModel && strategies.some((strategy) => strategy.id === data.selectedModel)
      ? data.selectedModel
      : '') ||
    strategies[0]?.id ||
    '';

  const selectedStrategy =
    strategies.find((strategy) => strategy.id === activeStrategyId) || strategies[0] || null;

  const analysis = useMemo(
    () => calculate(data, selectedStrategy),
    [data, selectedStrategy]
  );

  if (isLoading && !data) {
    return (
      <ApiLoadingPanel
        title="Loading performance evidence"
        items={['Strategy list', 'Equity observations', 'Benchmark series', 'Return statistics']}
      />
    );
  }

  if (error || !data) {
    return <EmptyState title="Performance data unavailable" body="The dashboard API did not return a usable payload." />;
  }

  if (!strategies.length) {
    return <EmptyState title="No strategies available" body="No published strategies were returned by the dashboard API." />;
  }

  return (
    <div className="grid gap-6">
      <SectionCard className="p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-[#3d52da]">
              Performance center
            </div>
            <h2 className="mt-2 text-2xl font-semibold text-[#06130c]">
              {selectedStrategy?.name || 'Select a strategy'}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5a685f]">
              Select any published strategy to review its source-backed return series, risk
              measures, monthly outcomes, and benchmark context.
            </p>
          </div>

          <div className="grid gap-3">
            <label className="grid gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-[#647269]">
                Strategy
              </span>
              <select
                value={activeStrategyId}
                onChange={(event) => setSelectedStrategyId(event.target.value)}
                className="min-h-11 rounded-md border border-[#cbd5ff] bg-white px-3 py-2 text-sm font-semibold text-[#06130c] outline-none transition focus:border-[#3d52da]"
              >
                {strategies.map((strategy) => (
                  <option key={strategy.id} value={strategy.id}>
                    {strategy.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="inline-flex w-fit rounded-md border border-[#cbd5ff] bg-white p-1" aria-label="Return basis">
              <button
                type="button"
                onClick={() => setBasis('net')}
                className={`rounded px-4 py-2 text-sm font-semibold ${basis === 'net' ? 'bg-[#172554] text-white' : 'text-[#5a685f]'}`}
              >
                Net
              </button>
              <button
                type="button"
                onClick={() => setBasis('gross')}
                className={`rounded px-4 py-2 text-sm font-semibold ${basis === 'gross' ? 'bg-[#172554] text-white' : 'text-[#5a685f]'}`}
              >
                Gross
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <StrategyMeta label="Available strategies" value={String(strategies.length)} />
          <StrategyMeta label="Selected observations" value={String(analysis.points.length)} />
          <StrategyMeta label="Inception" value={selectedStrategy?.inceptionDate || 'Not reported'} />
        </div>
      </SectionCard>

      {basis === 'gross' ? (
        <EmptyState
          title="Gross return series not reported"
          body="The source currently publishes one normalized portfolio series. QSentia does not relabel net observations as gross performance."
        />
      ) : !analysis.points.length ? (
        <EmptyState
          title="No observations for selected strategy"
          body="Choose another strategy or publish portfolio observations for this model to populate performance analytics."
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <Stat label="Since inception" value={safePct(analysis.stats.totalReturn)} />
            <Stat label="Sharpe" value={safeNum(analysis.stats.sharpe)} />
            <Stat label="Max drawdown" value={safePct(analysis.stats.maxDrawdown)} />
            <Stat label="Best month" value={safePct(analysis.bestMonth)} />
            <Stat label="Worst month" value={safePct(analysis.worstMonth)} />
            <Stat label="Observations" value={String(analysis.points.length)} />
          </div>

          <SectionCard className="min-w-0 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-[#06130c]">Normalized performance and benchmark</h3>
              <span className="text-xs text-[#647269]">Base 100</span>
            </div>
            <div className="mt-5 h-[360px] min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <LineChart data={analysis.chart}>
                  <CartesianGrid stroke="#e7ebf7" strokeDasharray="4 4" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#647269' }} minTickGap={30} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#647269' }} width={48} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="strategy" name="Strategy" stroke="#3d52da" strokeWidth={2.5} dot={false} />
                  {analysis.benchmarkKey ? (
                    <Line
                      type="monotone"
                      dataKey="benchmark"
                      name={analysis.benchmarkKey}
                      stroke="#111827"
                      strokeWidth={1.8}
                      strokeDasharray="5 4"
                      dot={false}
                    />
                  ) : null}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <div className="grid min-w-0 gap-6 lg:grid-cols-2">
            <SectionCard className="min-w-0 p-5 sm:p-6">
              <h3 className="text-lg font-semibold text-[#06130c]">Rolling risk view</h3>
              <div className="mt-5 h-[260px] min-w-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <AreaChart data={analysis.rolling}>
                    <CartesianGrid stroke="#e7ebf7" strokeDasharray="4 4" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#647269' }} minTickGap={24} />
                    <YAxis tick={{ fontSize: 11, fill: '#647269' }} width={48} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="rollingSharpe" name="Rolling Sharpe" stroke="#3d52da" fill="#dfe4ff" />
                    <Line type="monotone" dataKey="drawdownPct" name="Drawdown %" stroke="#be123c" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
            <MonthlyTable rows={analysis.months} />
          </div>
        </>
      )}

      <p className="text-xs leading-5 text-[#647269]">
        Returns, Sharpe, and drawdown are calculated from the selected strategy&apos;s visible source
        observations. Benchmark comparison is informational; fee treatment is not reported by the
        source. Historical and paper results do not guarantee future performance.
      </p>
    </div>
  );
}

function strategyOptions(data?: Payload): StrategyOption[] {
  const rows = data?.modelComparison || [];

  if (rows.length) {
    return rows.map((row, index) => ({
      ...row,
      id: row.id || `strategy-${index}`,
      name: cleanText(row.name || row.id || `Strategy ${index + 1}`),
    }));
  }

  if (data?.selectedModelConfig || data?.equityCurve?.length) {
    return [
      {
        id: data.selectedModel || data.selectedModelConfig?.id || 'selected-strategy',
        name: cleanText(data.selectedModelConfig?.name || data.selectedModel || 'Selected strategy'),
        description: data.selectedModelConfig?.description,
        points: (data.equityCurve || []).map((point) => ({
          timestamp: point.timestamp,
          value: point.portfolio ?? null,
        })),
        stats: data.stats,
        benchmarks: data.benchmarks,
        dailyRowCount: data.equityCurve?.length || 0,
      },
    ];
  }

  return [];
}

function calculate(data: Payload | undefined, strategy: StrategyOption | null) {
  const points = strategyPoints(data, strategy);
  const benchmarks = strategy?.benchmarks?.length ? strategy.benchmarks : data?.benchmarks || [];
  const benchmark = benchmarks.find((row) => row.points?.length);
  const benchmarkMap = new Map((benchmark?.points || []).map((point) => [point.timestamp, point.value]));
  const chart = points.map((point) => ({
    date: point.timestamp,
    strategy: point.portfolio,
    benchmark: benchmarkMap.get(point.timestamp) ?? null,
  }));

  const groups = new Map<string, { first: number; last: number }>();
  points.forEach((point) => {
    const key = point.timestamp.slice(0, 7);
    const row = groups.get(key);
    groups.set(key, row ? { first: row.first, last: point.portfolio } : { first: point.portfolio, last: point.portfolio });
  });

  const months = Array.from(groups).map(([month, row]) => ({
    month,
    value: row.first ? row.last / row.first - 1 : null,
  }));
  const monthValues = months.map((month) => month.value).filter((value): value is number => typeof value === 'number');
  const returns = points.map((point, index) => {
    if (finiteNumber(point.return)) return point.return;
    const previous = points[index - 1]?.portfolio;
    if (!finiteNumber(previous) || previous === 0) return null;
    return point.portfolio / previous - 1;
  });
  const stats = statsFromPoints(points, returns);

  let peak = Number.NEGATIVE_INFINITY;
  const rolling = points.map((point, index) => {
    peak = Math.max(peak, point.portfolio);
    const window = returns
      .slice(Math.max(1, index - 19), index + 1)
      .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
    const mean = window.reduce((a, b) => a + b, 0) / Math.max(window.length, 1);
    const variance = window.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(window.length - 1, 1);
    const computedDrawdown = peak > 0 ? point.portfolio / peak - 1 : null;

    return {
      date: point.timestamp,
      rollingSharpe: variance > 0 ? (mean / Math.sqrt(variance)) * Math.sqrt(252) : null,
      drawdownPct: finiteNumber(point.drawdown) ? point.drawdown * 100 : finiteNumber(computedDrawdown) ? computedDrawdown * 100 : null,
    };
  });

  return {
    points,
    chart,
    months,
    rolling,
    stats,
    benchmarkKey: benchmark ? `${benchmark.name || benchmark.ticker}` : null,
    bestMonth: monthValues.length ? Math.max(...monthValues) : null,
    worstMonth: monthValues.length ? Math.min(...monthValues) : null,
  };
}

function statsFromPoints(
  points: Array<{ portfolio: number }>,
  returns: Array<number | null>
): Stats {
  if (points.length < 2) {
    return {
      totalReturn: null,
      sharpe: null,
      maxDrawdown: null,
    };
  }

  const first = points[0].portfolio;
  const last = points[points.length - 1].portfolio;
  const totalReturn = first ? last / first - 1 : null;
  const cleanReturns = returns.filter((value): value is number => finiteNumber(value));
  const sharpe = sharpeFromReturns(cleanReturns);
  let peak = Number.NEGATIVE_INFINITY;
  let maxDrawdown = 0;

  for (const point of points) {
    peak = Math.max(peak, point.portfolio);
    const drawdown = peak > 0 ? point.portfolio / peak - 1 : 0;
    maxDrawdown = Math.min(maxDrawdown, drawdown);
  }

  return {
    totalReturn,
    sharpe,
    maxDrawdown,
  };
}

function sharpeFromReturns(returns: number[]) {
  if (returns.length < 2) return null;

  const mean = returns.reduce((sum, value) => sum + value, 0) / returns.length;
  const variance =
    returns.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
    Math.max(returns.length - 1, 1);
  const std = Math.sqrt(variance);

  return std > 0 ? (mean / std) * Math.sqrt(252) : null;
}

function strategyPoints(data: Payload | undefined, strategy: StrategyOption | null) {
  const sourcePoints = strategy?.points?.length
    ? strategy.points
    : (data?.equityCurve || []).map((point) => ({
        timestamp: point.timestamp,
        value: point.portfolio,
      }));

  return sourcePoints
    .map((point, index) => ({
      timestamp: cleanText(point.timestamp),
      portfolio: point.value,
      return: 'return' in point ? point.return : null,
      drawdown: 'drawdown' in point ? point.drawdown : null,
      index,
    }))
    .filter((point): point is { timestamp: string; portfolio: number; return: number | null; drawdown: number | null; index: number } =>
      Boolean(point.timestamp) && finiteNumber(point.portfolio)
    )
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

function StrategyMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[#e2e7fb] bg-[#f8faff] px-4 py-3">
      <div className="text-[11px] font-bold uppercase tracking-wide text-[#647269]">{label}</div>
      <div className="mt-1 text-sm font-semibold text-[#06130c]">{value}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[#e2e7fb] bg-white p-4">
      <div className="text-xs font-bold uppercase tracking-wide text-[#647269]">{label}</div>
      <div className="mt-2 text-xl font-semibold text-[#06130c]">{value}</div>
    </div>
  );
}

function MonthlyTable({ rows }: { rows: Array<{ month: string; value: number | null }> }) {
  return (
    <SectionCard className="overflow-hidden">
      <div className="border-b border-[#e2e7fb] px-5 py-4">
        <h3 className="text-lg font-semibold text-[#06130c]">Monthly returns</h3>
      </div>
      <div className="max-h-[280px] overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-[#f8faff] text-xs uppercase tracking-wide text-[#647269]">
            <tr>
              <th className="px-5 py-3">Month</th>
              <th className="px-5 py-3 text-right">Return</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2e7fb]">
            {rows.map((row) => (
              <tr key={row.month}>
                <td className="px-5 py-3 font-semibold text-[#26352c]">{row.month}</td>
                <td className={`px-5 py-3 text-right font-semibold ${(row.value || 0) < 0 ? 'text-[#be123c]' : 'text-[#047857]'}`}>
                  {safePct(row.value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
