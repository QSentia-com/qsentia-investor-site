'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import QSentiaMotionBackground from '@/components/QSentiaMotionBackground';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { fmtDollar, fmtNum, fmtPct } from '@/lib/metrics';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const [model, setModel] = useState<string | null>(null);

  const { data, error, isLoading } = useSWR(
    `/api/dashboard${model ? `?model=${model}` : ''}`,
    fetcher,
    { refreshInterval: 120000 }
  );

  useEffect(() => {
    if (!model && data?.selectedModel) {
      setModel(data.selectedModel);
    }
  }, [data?.selectedModel, model]);

  if (isLoading) return <LoadingScreen text="Loading live QSentia research terminal..." />;
  if (error) return <LoadingScreen text="Unable to load GitHub trading logs." />;

  const stats = data?.stats || {};
  const latestDecision = data?.latest?.decision || {};
  const latestPortfolioValue = data?.latest?.portfolioValue;
  const firstPortfolioValue = data?.latest?.firstPortfolioValue;

  const pnl =
    latestPortfolioValue !== null && latestPortfolioValue !== undefined && firstPortfolioValue
      ? latestPortfolioValue - firstPortfolioValue
      : null;

  const selectedModelName =
    data?.registry?.find((m: any) => m.id === data?.selectedModel)?.name ||
    data?.selectedModel ||
    'Selected Strategy';

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fbfbfb] text-black">
      <QSentiaMotionBackground />

      <div className="relative z-10 mx-auto max-w-[1620px] px-6 py-8">
        <TopNav />

        <section className="mb-10 grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="relative overflow-hidden rounded-[42px] border border-[#4b3fd1]/20 bg-white/76 p-9 shadow-[0_36px_130px_rgba(25,20,90,0.14)] backdrop-blur-2xl">
            <CornerMarks />
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#4b3fd1]/10 blur-3xl" />
            <div className="absolute -bottom-24 left-16 h-64 w-64 rounded-full bg-black/5 blur-3xl" />

            <div className="relative mb-8 flex items-center gap-4">
              <QLogo />
              <div>
                <div className="tracking-[0.42em] text-2xl font-black">SENTIA</div>
                <div className="mt-1 text-xs font-black uppercase tracking-[0.24em] text-[#4b3fd1]">
                  Institutional Research Terminal
                </div>
              </div>
            </div>

            <div className="relative mb-4 text-xs font-black uppercase tracking-[0.28em] text-[#4b3fd1]">
              Live Reinforcement Learning Portfolio Monitor
            </div>

            <h1 className="relative max-w-3xl text-7xl font-light leading-[0.90] tracking-[-0.09em] text-black max-xl:text-6xl max-md:text-5xl">
              More Alpha
              <br />
              Less Risk
              <br />
              Live.
            </h1>

            <p className="relative mt-7 max-w-2xl text-lg leading-8 text-neutral-600">
              A live investor-grade interface for BR-PPO paper trading, portfolio exposure,
              execution monitoring, model diagnostics, and institutional benchmark discipline.
            </p>

            <div className="relative mt-8 flex flex-wrap gap-3">
              <Pill>GitHub Logs</Pill>
              <Pill>Alpaca Paper Trading</Pill>
              <Pill>BR-PPO</Pill>
              <Pill>Auto Refresh 120s</Pill>
              <Pill>{selectedModelName}</Pill>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <MetricTile
              label="Portfolio Value"
              value={fmtDollar(latestPortfolioValue)}
              detail="Latest committed portfolio observation"
              large
            />
            <MetricTile label="Total P&L" value={fmtDollar(pnl)} detail="Paper trading basis" large />
            <MetricTile
              label="Total Return"
              value={fmtPct(stats.totalReturn, true)}
              detail={historyStatus(stats)}
            />
            <MetricTile
              label="Sharpe"
              value={fmtNum(stats.sharpe)}
              detail={stats?.status === 'partial' ? 'Pending more return observations' : 'Annualized'}
            />
            <MetricTile label="Max Drawdown" value={fmtPct(stats.maxDrawdown, true)} detail="Peak to trough" />
            <MetricTile
              label="Current Signal"
              value={latestDecision?.action || 'Pending'}
              detail="Latest model allocation"
            />
          </div>
        </section>

        <section className="mb-10 rounded-[44px] border border-[#4b3fd1]/20 bg-[#4b3fd1] p-10 text-white shadow-[0_40px_140px_rgba(75,63,209,0.30)]">
          <div className="text-xs font-black uppercase tracking-[0.28em] text-white/70">
            Institutional Research Program
          </div>
          <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_0.55fr]">
            <h2 className="text-6xl font-light leading-[0.95] tracking-[-0.085em]">
              Building the next generation adaptive allocation engine.
            </h2>
            <p className="text-lg leading-8 text-white/78">
              QSentia is designed around measurable signal quality, transparent execution,
              benchmark discipline, and risk-first portfolio construction.
            </p>
          </div>
        </section>

        <section className="mb-10 grid gap-4 md:grid-cols-4">
          <ThesisCard
            number="01"
            title="Adaptive Allocation"
            text="BR-PPO and alpha models update exposure from live state, target weights, risk behavior, and execution constraints."
          />
          <ThesisCard
            number="02"
            title="Benchmark Discipline"
            text="Each model is normalized and compared through a single relative performance framework."
          />
          <ThesisCard
            number="03"
            title="Risk First"
            text="Drawdown, return quality, volatility, and model health are surfaced before allocation decisions."
          />
          <ThesisCard
            number="04"
            title="Execution Traceability"
            text="Positions, target weights, planned orders, submitted orders, and decisions remain visible from GitHub logs."
          />
        </section>

        <section className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-[34px] border border-black/10 bg-white/76 p-5 shadow-[0_26px_100px_rgba(25,20,90,0.10)] backdrop-blur-2xl">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.24em] text-neutral-500">
              Strategy Selection
            </div>
            <select
              className="mt-2 min-w-[360px] rounded-none border border-black/20 bg-white px-5 py-4 text-sm font-bold text-black outline-none transition focus:border-[#4b3fd1]"
              value={model || data?.selectedModel || ''}
              onChange={(e) => setModel(e.target.value)}
            >
              {(data?.registry || []).map((m: any) => (
                <option key={m.id} value={m.id}>
                  {m.name || m.id}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-3">
            <StatusBadge
              label={latestDecision?.account_status === 'connected' ? 'Live Paper' : 'Research Mode'}
            />
            <StatusBadge label={`Models: ${data?.registry?.length || 0}`} muted />
            <StatusBadge label={`Last Run: ${data?.latest?.lastRun || 'No data'}`} muted />
          </div>
        </section>

        <Tabs
          tabs={[
            'Model Comparison',
            'Executive Overview',
            'Performance Analytics',
            'Portfolio Exposure',
            'Execution Monitor',
            'Decision History',
            'Model Health',
          ]}
          panels={[
            <ModelComparison key="compare" data={data} />,
            <ExecutiveOverview key="overview" data={data} />,
            <PerformanceAnalytics key="perf" data={data} />,
            <PortfolioExposure key="portfolio" data={data} />,
            <ExecutionMonitor key="orders" data={data} />,
            <DecisionHistory key="history" data={data} />,
            <ModelHealth key="health" data={data} />,
          ]}
        />

        <footer className="mt-12 border-t border-black/10 py-8 text-xs text-neutral-500">
          QSentia Research Terminal · Live paper trading intelligence · Not investment advice · Last
          refreshed: {data?.updatedAt || '—'}
        </footer>
      </div>
    </main>
  );
}

function TopNav() {
  return (
    <header className="mb-8 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center border-2 border-[#4b3fd1] text-2xl font-black">
          Q
        </div>
        <div className="tracking-[0.38em] text-lg font-black">SENTIA</div>
      </Link>

      <div className="hidden items-center gap-8 text-xs font-black uppercase tracking-[0.20em] text-neutral-500 md:flex">
        <a href="/dashboard" className="text-[#4b3fd1] hover:text-[#372db8]">
          Live Research Terminal
        </a>

        <a
          href="mailto:Lucas.Zarzeczny@qsentia.com?subject=QSentia Investor Information Request"
          className="border border-[#4b3fd1] px-5 py-3 text-[#4b3fd1] transition hover:bg-[#4b3fd1] hover:text-white"
        >
          Request Information
        </a>
      </div>
    </header>
  );
}

function ModelComparison({ data }: { data: any }) {
  const chartData = useMemo(() => {
    const strategySeries =
      (data?.modelComparison || []).map((m: any) => ({
        key: m.name,
        points: m.points || [],
      })) || [];

    const benchmarkSeries =
      (data?.benchmarks || []).map((b: any) => ({
        key: `${b.name} (${b.ticker})`,
        points: b.points || [],
      })) || [];

    return mergeSeries([...strategySeries, ...benchmarkSeries]);
  }, [data]);

  const hasBenchmarkData = (data?.benchmarks || []).some((b: any) => b.points?.length);

  return (
    <Panel
      eyebrow="Institutional Benchmark Discipline"
      title="Model Comparison"
      subtitle="Solid lines represent live model portfolios normalized to 100. Benchmark overlays appear as dashed lines when benchmark data is available."
    >
      <ChartFrame title="Normalized Equity Curves">
        <div className="h-[620px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid stroke="rgba(75,63,209,0.10)" vertical={false} />
              <XAxis
                dataKey="timestamp"
                stroke="#737373"
                tick={{ fontSize: 11, fill: '#525252' }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(0,0,0,0.15)' }}
                minTickGap={36}
              />
              <YAxis
                stroke="#737373"
                tick={{ fontSize: 12, fill: '#525252' }}
                tickLine={false}
                axisLine={false}
                domain={['auto', 'auto']}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12, fontWeight: 700 }} />
              <ReferenceLine y={100} stroke="rgba(0,0,0,0.22)" strokeDasharray="4 4" />

              {(data?.modelComparison || []).map((m: any) => (
                <Line
                  key={m.name}
                  type="monotone"
                  dataKey={m.name}
                  stroke={m.color || '#4b3fd1'}
                  strokeWidth={m.id === data?.selectedModel ? 4.4 : 2.8}
                  dot={false}
                  connectNulls
                  activeDot={{ r: 5 }}
                />
              ))}
              
              {(data?.benchmarks || []).map((b: any) => (
  <Line
    key={`${b.name} (${b.ticker})`}
    type="monotone"
    dataKey={`${b.name} (${b.ticker})`}
    stroke={b.color || '#737373'}
    strokeWidth={2.4}
    strokeDasharray="8 6"
    dot={false}
    connectNulls
    activeDot={false}
  />
))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {!hasBenchmarkData && (
          <div className="mt-4 rounded-2xl border border-[#4b3fd1]/20 bg-[#4b3fd1]/5 p-4 text-sm leading-6 text-neutral-600">
            Benchmark overlay is ready in the chart layer. The API needs market benchmark series
            wired for SPY, QQQ, DIA, IWM, and VTI to render dashed benchmark lines.
          </div>
        )}
      </ChartFrame>
    <DataTable
  title="Relative Performance Table"
  rows={[
    ...(data?.modelComparison || []).map((m: any) => ({
      Asset: m.name,
      Type: 'QSentia Model',
      Status:
        m.stats?.status === 'partial'
          ? `Partial history (${m.stats?.nObservations || 0} observations)`
          : m.stats?.status === 'insufficient'
            ? 'Insufficient history'
            : 'Ready',
      'Latest Value': fmtDollar(m.latestValue),
      'Total Return': fmtPct(m.stats?.totalReturn, true),
      Sharpe: fmtNum(m.stats?.sharpe),
      'Max Drawdown': fmtPct(m.stats?.maxDrawdown, true),
      Volatility: fmtPct(m.stats?.volatility),
    })),

    ...(data?.benchmarks || []).map((b: any) => ({
      Asset: `${b.name} (${b.ticker})`,
      Type: 'Benchmark',
      Status:
        b.stats?.status === 'partial'
          ? `Partial history (${b.stats?.nObservations || 0} observations)`
          : b.stats?.status === 'insufficient'
            ? 'Insufficient history'
            : 'Ready',
      'Latest Value': 'Index = 100',
      'Total Return': fmtPct(b.stats?.totalReturn, true),
      Sharpe: fmtNum(b.stats?.sharpe),
      'Max Drawdown': fmtPct(b.stats?.maxDrawdown, true),
      Volatility: fmtPct(b.stats?.volatility),
    })),
  ]}
/>
    </Panel>
  );
}

function ExecutiveOverview({ data }: { data: any }) {
  const latestDecision = data?.latest?.decision || {};

  return (
    <Panel
      eyebrow="Command Center"
      title="Executive Overview"
      subtitle="Current model state, portfolio trajectory, latest signal, account state, and live operating posture."
    >
      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <ChartFrame title="Portfolio Value">
          <div className="h-[520px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.equityCurve || []}>
                <defs>
                  <linearGradient id="portfolioFillLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4b3fd1" stopOpacity={0.28} />
                    <stop offset="58%" stopColor="#4b3fd1" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="#4b3fd1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(75,63,209,0.10)" vertical={false} />
                <XAxis dataKey="timestamp" stroke="#737373" tick={{ fontSize: 11, fill: '#525252' }} />
                <YAxis stroke="#737373" tick={{ fontSize: 12, fill: '#525252' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="portfolioValue"
                  stroke="#4b3fd1"
                  strokeWidth={4}
                  fill="url(#portfolioFillLight)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartFrame>

        <div className="rounded-[34px] border border-black/10 bg-white/82 p-7 shadow-[0_28px_100px_rgba(25,20,90,0.12)] backdrop-blur-2xl">
          <div className="mb-2 text-xs font-black uppercase tracking-[0.24em] text-[#4b3fd1]">
            Operating State
          </div>
          <h3 className="mb-6 text-4xl font-light tracking-[-0.07em]">Live Status</h3>
          <InfoRow label="Account Status" value={latestDecision.account_status || 'Pending'} />
          <InfoRow label="Submit Orders" value={String(latestDecision.submit_orders ?? 'Pending')} />
          <InfoRow label="Current Signal" value={latestDecision.action || 'Pending'} />
          <InfoRow label="Last Run" value={data?.latest?.lastRun || 'Pending'} />
          <InfoRow label="Health" value={data?.healthStatus?.overall_status || 'Pending'} />
          <InfoRow label="Observations" value={String(data?.stats?.nObservations ?? 'Pending')} />
          <InfoRow label="Return Points" value={String(data?.stats?.nReturns ?? 'Pending')} />
        </div>
      </div>
    </Panel>
  );
}

function PerformanceAnalytics({ data }: { data: any }) {
  return (
    <Panel
      eyebrow="Risk Intelligence"
      title="Performance Analytics"
      subtitle="Return quality, drawdown behavior, volatility, hit rate, and risk adjusted performance."
    >
      <div className="mb-6 grid gap-4 md:grid-cols-5">
        <MetricTile label="Total Return" value={fmtPct(data?.stats?.totalReturn, true)} detail={historyStatus(data?.stats)} />
        <MetricTile label="Annual Return" value={fmtPct(data?.stats?.annualizedReturn, true)} detail="Annualized if enough history" />
        <MetricTile label="Volatility" value={fmtPct(data?.stats?.volatility)} detail="Annualized volatility" />
        <MetricTile label="Hit Rate" value={fmtPct(data?.stats?.hitRate)} detail="Positive periods" />
        <MetricTile label="Calmar" value={fmtNum(data?.stats?.calmar)} detail="Return / drawdown" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartFrame title="Drawdown Profile">
          <div className="h-[460px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.drawdowns || []}>
                <CartesianGrid stroke="rgba(75,63,209,0.10)" vertical={false} />
                <XAxis dataKey="timestamp" stroke="#737373" tick={{ fontSize: 11, fill: '#525252' }} />
                <YAxis stroke="#737373" tick={{ fontSize: 12, fill: '#525252' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <ReferenceLine y={0} stroke="rgba(0,0,0,0.22)" strokeDasharray="4 4" />
                <Area type="monotone" dataKey="drawdown" stroke="#111111" strokeWidth={2.6} fill="#4b3fd1" fillOpacity={0.12} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartFrame>

        <ChartFrame title="Return Series">
          <div className="h-[460px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.returns || []}>
                <CartesianGrid stroke="rgba(75,63,209,0.10)" vertical={false} />
                <XAxis dataKey="timestamp" stroke="#737373" tick={{ fontSize: 11, fill: '#525252' }} />
                <YAxis stroke="#737373" tick={{ fontSize: 12, fill: '#525252' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <ReferenceLine y={0} stroke="rgba(0,0,0,0.22)" strokeDasharray="4 4" />
                <Bar dataKey="return" fill="#4b3fd1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartFrame>
      </div>
    </Panel>
  );
}

function PortfolioExposure({ data }: { data: any }) {
  return (
    <Panel eyebrow="Portfolio Construction" title="Portfolio Exposure" subtitle="Current holdings, target weights, and historical target allocations produced by the model.">
      <div className="grid gap-6 lg:grid-cols-2">
        <DataTable title="Current Positions" rows={data?.positions || []} />
        <DataTable title="Latest Target Weights" rows={data?.targetWeights || []} />
      </div>
      <div className="mt-6">
        <DataTable title="Target Weight History" rows={data?.targetWeightHistory || []} />
      </div>
    </Panel>
  );
}

function ExecutionMonitor({ data }: { data: any }) {
  return (
    <Panel eyebrow="Execution Intelligence" title="Execution Monitor" subtitle="Planned orders, submitted orders, and full execution history from the paper trading workflow.">
      <div className="grid gap-6 lg:grid-cols-2">
        <DataTable title="Latest Planned Orders" rows={data?.plannedOrders || []} />
        <DataTable title="Latest Submitted Orders" rows={data?.submittedOrders || []} />
      </div>
      <div className="mt-6">
        <DataTable title="Submitted Orders History" rows={data?.ordersHistory || []} />
      </div>
    </Panel>
  );
}

function DecisionHistory({ data }: { data: any }) {
  const actionCounts = data?.actionCounts || [];
  const hasActionCounts = actionCounts.length > 0;

  return (
    <Panel
      eyebrow="Model Intent"
      title="Decision History"
      subtitle="Historical allocation decisions, model signals, and action frequency from the committed decision logs."
    >
      <div className="grid gap-6">
        <DataTable title="Decision Log" rows={data?.decisions || []} />

        <ChartFrame title="Action Frequency">
          {!hasActionCounts ? (
            <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-black/10 bg-white/70 p-8 text-center">
              <div>
                <div className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-[#4b3fd1]">
                  Pending Signal History
                </div>
                <p className="max-w-xl text-sm leading-6 text-neutral-600">
                  No action-frequency data is available yet. This chart will populate once the
                  decision log includes model actions, signals, or decision labels.
                </p>
              </div>
            </div>
          ) : (
            <div className="h-[420px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={actionCounts} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
                  <CartesianGrid stroke="rgba(75,63,209,0.10)" vertical={false} />
                  <XAxis
                    dataKey="action"
                    stroke="#737373"
                    tick={{ fontSize: 11, fill: '#525252' }}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(0,0,0,0.15)' }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke="#737373"
                    tick={{ fontSize: 12, fill: '#525252' }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="#4b3fd1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartFrame>
      </div>
    </Panel>
  );
}

function ModelHealth({ data }: { data: any }) {
  return (
    <Panel eyebrow="Operational Trust" title="Model Health" subtitle="Central health monitor outputs, signal history, data diagnostics, and live model diagnostics.">
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <MetricTile label="Health Status" value={data?.healthStatus?.overall_status || 'Pending'} detail="Current monitor state" />
        <MetricTile label="Decision Count" value={String(data?.healthStatus?.n_decisions ?? 'Pending')} detail="Logged decisions" />
        <MetricTile label="Signal Rows" value={String(data?.signalHistory?.length || 0)} detail="Health observations" />
        <MetricTile label="Portfolio Rows" value={String(data?.equityCurve?.length || 0)} detail="Equity records" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[34px] border border-black/10 bg-white/82 p-6 shadow-[0_28px_100px_rgba(25,20,90,0.12)] backdrop-blur-2xl">
          <div className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-[#4b3fd1]">
            Health Status JSON
          </div>
          <pre className="max-h-[520px] overflow-auto rounded-2xl border border-black/10 bg-[#fbfbfb] p-4 text-xs text-neutral-700">
            {JSON.stringify(data?.healthStatus || {}, null, 2)}
          </pre>
        </div>
        <DataTable title="Signal History" rows={data?.signalHistory || []} />
      </div>

      <div className="mt-6">
        <DataTable
          title="Data Diagnostics"
          rows={[
            {
              selectedModel: data?.debug?.selectedModel,
              registryCount: data?.debug?.registryCount,
              models: data?.debug?.registry?.map((m: any) => m.id).join(', '),
              portfolioRows: data?.debug?.rowCounts?.portfolioRows,
              decisionsRows: data?.debug?.rowCounts?.decisionsRows,
              positionsRows: data?.debug?.rowCounts?.positionsRows,
              ordersRows: data?.debug?.rowCounts?.ordersHistoryRows,
              signalRows: data?.debug?.rowCounts?.signalHistoryRows,
            },
          ]}
        />
      </div>
    </Panel>
  );
}

function Tabs({ tabs, panels }: { tabs: string[]; panels: React.ReactNode[] }) {
  const [active, setActive] = useState(0);

  return (
    <section>
      <div className="mb-6 flex flex-wrap gap-2 rounded-[34px] border border-black/10 bg-white/76 p-2 shadow-[0_26px_100px_rgba(25,20,90,0.10)] backdrop-blur-2xl">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActive(i)}
            className={`rounded-none px-5 py-4 text-xs font-black uppercase tracking-[0.16em] transition ${
              active === i
                ? 'bg-[#4b3fd1] text-white shadow-[0_18px_40px_rgba(75,63,209,0.25)]'
                : 'text-neutral-500 hover:bg-black/5 hover:text-black'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      {panels[active]}
    </section>
  );
}

function Panel({ eyebrow, title, subtitle, children }: { eyebrow: string; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden rounded-[42px] border border-black/10 bg-white/76 p-7 shadow-[0_36px_130px_rgba(25,20,90,0.13)] backdrop-blur-2xl">
      <CornerMarks />
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#4b3fd1]/8 blur-3xl" />
      <div className="relative mb-7">
        <div className="mb-2 text-xs font-black uppercase tracking-[0.24em] text-[#4b3fd1]">{eyebrow}</div>
        <h2 className="text-5xl font-light tracking-[-0.078em] text-black">{title}</h2>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-neutral-600">{subtitle}</p>
      </div>
      <div className="relative">{children}</div>
    </section>
  );
}

function ChartFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-[34px] border border-black/10 bg-white/82 p-6 shadow-[0_28px_100px_rgba(25,20,90,0.12)] backdrop-blur-2xl">
      <div className="absolute right-0 top-0 h-24 w-24 border-b border-l border-[#4b3fd1]/20" />
      <div className="absolute bottom-0 left-0 h-20 w-20 border-r border-t border-[#4b3fd1]/20" />

      <div className="relative mb-5 flex items-start justify-between">
        <div>
          <div className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#4b3fd1]">Live Quant Intelligence</div>
          <h3 className="text-3xl font-light tracking-[-0.065em] text-black">{title}</h3>
        </div>
        <div className="h-4 w-4 rotate-45 border-2 border-[#4b3fd1]" />
      </div>

      <div className="relative rounded-[24px] border border-black/10 bg-[#fbfbfb]/92 p-4">{children}</div>
    </div>
  );
}

function MetricTile({ label, value, detail, large = false }: { label: string; value: string; detail: string; large?: boolean }) {
  return (
    <div className="group relative overflow-hidden rounded-[34px] border border-black/10 bg-white/80 p-6 shadow-[0_26px_100px_rgba(25,20,90,0.10)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_34px_120px_rgba(75,63,209,0.18)]">
      <div className="absolute right-5 top-5 h-4 w-4 rotate-45 border border-[#4b3fd1]/70 transition group-hover:rotate-90" />
      <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-[#4b3fd1]/8 blur-3xl" />
      <div className="relative mb-4 text-xs font-black uppercase tracking-[0.20em] text-neutral-500">{label}</div>
      <div className={`relative font-light tracking-[-0.078em] text-black ${large ? 'text-5xl' : 'text-4xl'}`}>
        {value}
      </div>
      <div className="relative mt-4 text-sm text-neutral-500">{detail}</div>
    </div>
  );
}

function DataTable({ title, rows }: { title: string; rows: Record<string, any>[] }) {
  const columns = rows?.length ? Object.keys(rows[0]).slice(0, 9) : [];

  return (
    <div className="rounded-[34px] border border-black/10 bg-white/82 p-6 shadow-[0_28px_100px_rgba(25,20,90,0.12)] backdrop-blur-2xl">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <div className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#4b3fd1]">Source of Truth</div>
          <h3 className="text-3xl font-light tracking-[-0.065em] text-black">{title}</h3>
        </div>
        <div className="border border-black/10 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-neutral-400">
          {rows?.length || 0} rows
        </div>
      </div>

      {!rows?.length ? (
        <p className="rounded-2xl border border-black/10 bg-[#fbfbfb] p-5 text-sm text-neutral-500">
          No data available yet.
        </p>
      ) : (
        <div className="max-h-[560px] overflow-auto border border-black/10">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="sticky top-0 bg-[#fbfbfb] text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                {columns.map((col) => (
                  <th key={col} className="border-b border-black/10 px-4 py-4">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...rows].reverse().slice(0, 140).map((row, i) => (
                <tr key={i} className="border-b border-black/5 transition hover:bg-[#4b3fd1]/5">
                  {columns.map((col) => (
                    <td key={col} className="px-4 py-4 text-neutral-700">
                      {String(row[col] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ThesisCard({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <div className="relative overflow-hidden rounded-[34px] border border-black/10 bg-white/78 p-6 shadow-[0_26px_100px_rgba(25,20,90,0.10)] backdrop-blur-2xl">
      <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#4b3fd1]/8 blur-2xl" />
      <div className="relative mb-10 text-xs font-black tracking-[0.24em] text-[#4b3fd1]">{number}</div>
      <h3 className="relative mb-4 text-3xl font-light tracking-[-0.065em] text-black">{title}</h3>
      <p className="relative text-sm leading-6 text-neutral-600">{text}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-black/10 py-4">
      <div className="text-xs font-black uppercase tracking-[0.16em] text-neutral-500">{label}</div>
      <div className="max-w-[55%] text-right text-sm font-bold text-black">{value}</div>
    </div>
  );
}

function StatusBadge({ label, muted = false }: { label: string; muted?: boolean }) {
  return (
    <div
      className={`rounded-none border px-5 py-3 text-xs font-black uppercase tracking-[0.18em] ${
        muted
          ? 'border-black/10 bg-white text-neutral-500'
          : 'border-[#4b3fd1] bg-[#4b3fd1] text-white shadow-[0_18px_40px_rgba(75,63,209,0.25)]'
      }`}
    >
      {label}
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="border border-black/10 bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-neutral-600 backdrop-blur-xl">
      {children}
    </span>
  );
}

function QLogo() {
  return (
    <div className="flex h-16 w-16 items-center justify-center border-[3px] border-[#4b3fd1] text-4xl font-black text-black">
      Q
    </div>
  );
}

function CornerMarks() {
  return (
    <>
      <div className="absolute left-5 top-5 h-5 w-5 border-l border-t border-[#4b3fd1]/40" />
      <div className="absolute right-5 top-5 h-5 w-5 border-r border-t border-[#4b3fd1]/40" />
      <div className="absolute bottom-5 left-5 h-5 w-5 border-b border-l border-[#4b3fd1]/40" />
      <div className="absolute bottom-5 right-5 h-5 w-5 border-b border-r border-[#4b3fd1]/40" />
    </>
  );
}

function LoadingScreen({ text }: { text: string }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fbfbfb] text-black">
      <QSentiaMotionBackground />
      <div className="relative z-10 rounded-[40px] border border-[#4b3fd1]/20 bg-white/82 p-10 text-center shadow-[0_36px_130px_rgba(25,20,90,0.14)] backdrop-blur-2xl">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border-[3px] border-[#4b3fd1] text-4xl font-black">
          Q
        </div>
        <div className="text-sm font-black uppercase tracking-[0.22em] text-[#4b3fd1]">{text}</div>
      </div>
    </main>
  );
}

const tooltipStyle = {
  background: '#ffffff',
  border: '1px solid rgba(0,0,0,0.12)',
  borderRadius: 0,
  color: '#111111',
  boxShadow: '0 20px 80px rgba(25,20,90,0.16)',
};

function mergeSeries(series: { key: string; points: { timestamp: string; value: number }[] }[]) {
  const byTimestamp: Record<string, any> = {};

  for (const s of series) {
    for (const point of s.points || []) {
      const t = point.timestamp;
      if (!byTimestamp[t]) byTimestamp[t] = { timestamp: t };
      byTimestamp[t][s.key] = point.value;
    }
  }

  return Object.values(byTimestamp).sort(
    (a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

function historyStatus(stats: any) {
  if (!stats) return 'Pending data';
  if (stats.status === 'partial') {
    return `Partial history: ${stats.nObservations || 0} observations`;
  }
  if (stats.status === 'insufficient') {
    return 'Insufficient history';
  }
  return `${stats.nObservations || 0} observations`;
}
