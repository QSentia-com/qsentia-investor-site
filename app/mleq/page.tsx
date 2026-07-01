"use client";

import Link from "next/link";
import useSWR from "swr";
import { useMemo, useState } from "react";
import type { ElementType, ReactNode } from "react";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  Database,
  Gauge,
  GitBranch,
  LineChart,
  LockKeyhole,
  Radar,
  ShieldCheck,
  Sigma,
  Workflow,
} from "lucide-react";
import { ApiLoadingPanel, PageShell } from "@/components/PageChrome";
import { fmtDollar, fmtNum, fmtPct } from "@/lib/metrics";

type Stats = {
  totalReturn?: number | null;
  annualizedReturn?: number | null;
  sharpe?: number | null;
  maxDrawdown?: number | null;
  hitRate?: number | null;
  nObservations?: number | null;
  nReturns?: number | null;
  status?: string | null;
};

type ModelComparison = {
  id?: string;
  name?: string;
  description?: string;
  color?: string;
  latestValue?: number | null;
  rowCount?: number | null;
  dailyRowCount?: number | null;
  points?: Array<{ timestamp?: string | null; value?: number | null }>;
  stats?: Stats;
};

type Benchmark = {
  name?: string;
  ticker?: string;
  rowCount?: number | null;
  stats?: Stats;
};

type DashboardPayload = {
  selectedModel?: string;
  latest?: {
    portfolioValue?: number | null;
    portfolioReturn?: number | null;
    paperStatus?: string | null;
  };
  stats?: Stats;
  equityCurve?: Array<{
    timestamp?: string | null;
    portfolio?: number | null;
    portfolioValue?: number | null;
  }>;
  benchmarks?: Benchmark[];
  modelComparison?: ModelComparison[];
  decisions?: Record<string, unknown>[];
  positions?: Record<string, unknown>[];
  submittedOrders?: Record<string, unknown>[];
  updatedAt?: string;
  debug?: {
    rowCounts?: Record<string, number>;
  };
};

const fetcher = async (url: string): Promise<DashboardPayload> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
};

function cleanText(value: unknown) {
  return String(value ?? "")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u00e2\u0080[\u0093\u0094]/g, "-")
    .replace(/\u00e2\u0080\u0099/g, "'")
    .replace(/\u00c2/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function finiteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function display(value: string) {
  return value === "Pending" ? "Not available" : value;
}

function displayCount(value: number | null | undefined) {
  if (!finiteNumber(value)) return "Not available";
  return value.toLocaleString("en-US");
}

function pctClass(value: number | null | undefined) {
  if (!finiteNumber(value) || value === 0) return "text-[#cbd5e1]";
  return value > 0 ? "text-[#00d6b8]" : "text-[#fb7185]";
}

function selectedModelFrom(data?: DashboardPayload) {
  const rows = data?.modelComparison || [];
  return (
    rows.find((model) => model.id === data?.selectedModel) || rows[0] || null
  );
}

function sourceRowCount(data?: DashboardPayload) {
  const modelRows = (data?.modelComparison || []).reduce(
    (sum, model) => sum + Number(model.rowCount || model.dailyRowCount || 0),
    0,
  );
  const benchmarkRows = (data?.benchmarks || []).reduce(
    (sum, row) => sum + Number(row.rowCount || 0),
    0,
  );
  const auditRows = Object.values(data?.debug?.rowCounts || {}).reduce(
    (sum, value) => sum + Number(value || 0),
    0,
  );
  return modelRows + benchmarkRows + auditRows;
}

function chartPoints(model: ModelComparison | null, data?: DashboardPayload) {
  const modelPoints = (model?.points || [])
    .filter((point) => point.timestamp && finiteNumber(point.value))
    .map((point) => ({
      timestamp: point.timestamp || "",
      value: point.value as number,
    }));

  if (modelPoints.length >= 2) return modelPoints;

  return (data?.equityCurve || [])
    .filter((point) => point.timestamp && finiteNumber(point.portfolio))
    .map((point) => ({
      timestamp: point.timestamp || "",
      value: point.portfolio as number,
    }));
}

function makePath(points: Array<{ value: number }>, width = 640, height = 170) {
  if (points.length < 2) return "";

  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = width / Math.max(1, points.length - 1);

  return points
    .map((point, index) => {
      const x = index * step;
      const y = height - ((point.value - min) / span) * (height - 28) - 14;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function topModels(rows: ModelComparison[]) {
  return [...rows]
    .filter(
      (model) =>
        finiteNumber(model.stats?.totalReturn) ||
        finiteNumber(model.stats?.sharpe),
    )
    .sort(
      (a, b) =>
        Number(b.stats?.totalReturn ?? -Infinity) -
        Number(a.stats?.totalReturn ?? -Infinity),
    )
    .slice(0, 5);
}

function formatDate(value?: string | null) {
  if (!value) return "Not available";
  const date = new Date(String(value).replace("_", "T"));
  if (Number.isNaN(date.getTime())) return cleanText(value);
  return date.toISOString().slice(0, 10);
}

export default function MleqPage() {
  const [activePipelineLabel, setActivePipelineLabel] =
    useState<PipelineLabel>("Signal generation");
  const { data, error, isLoading } = useSWR<DashboardPayload>(
    "/api/dashboard",
    fetcher,
    {
      refreshInterval: 60000,
    },
  );
  const initialLoading = isLoading && !data;

  const modelRows = data?.modelComparison || [];
  const selectedModel = selectedModelFrom(data);
  const selectedStats = selectedModel?.stats || data?.stats || {};
  const linePoints = useMemo(
    () => chartPoints(selectedModel, data),
    [data, selectedModel],
  );
  const linePath = makePath(linePoints);
  const leaderboard = topModels(modelRows);
  const benchmarkCount = data?.benchmarks?.length || 0;
  const totalRows = sourceRowCount(data);
  const activeStreams = modelRows.length + benchmarkCount;
  const paperStatus = cleanText(data?.latest?.paperStatus || "Not available");
  const modelName = cleanText(
    selectedModel?.name || selectedModel?.id || "Selected model pending",
  );

  const heroStats = [
    { label: "Model families", value: displayCount(modelRows.length) },
    { label: "Active streams", value: displayCount(activeStreams) },
    { label: "Source rows", value: displayCount(totalRows) },
    { label: "Updated", value: formatDate(data?.updatedAt) },
  ];

  const terminalMetrics = [
    {
      label: "Telemetry return",
      value: display(
        fmtPct(
          selectedStats.totalReturn ?? data?.latest?.portfolioReturn,
          true,
        ),
      ),
      tone: pctClass(
        selectedStats.totalReturn ?? data?.latest?.portfolioReturn,
      ),
    },
    {
      label: "Sharpe ratio",
      value: display(fmtNum(selectedStats.sharpe)),
      tone: "text-[#8b93ff]",
    },
    {
      label: "Max drawdown",
      value: display(fmtPct(selectedStats.maxDrawdown, true)),
      tone: pctClass(selectedStats.maxDrawdown),
    },
    {
      label: "Win rate",
      value: display(fmtPct(selectedStats.hitRate)),
      tone: "text-[#00d6b8]",
    },
  ];

  const pipelineRows = [
    {
      label: "Signal generation",
      value: data?.debug?.rowCounts?.signalHistoryRows ?? 0,
      icon: Radar,
    },
    {
      label: "Risk assessment",
      value: data?.debug?.rowCounts?.positionsRows ?? 0,
      icon: ShieldCheck,
    },
    { label: "Benchmark evaluation", value: benchmarkCount, icon: BarChart3 },
    {
      label: "Execution audit",
      value: data?.debug?.rowCounts?.submittedOrdersRows ?? 0,
      icon: CheckCircle2,
    },
  ];
  const activePipeline =
    pipelineRows.find((row) => row.label === activePipelineLabel) ||
    pipelineRows[0];
  const maxPipelineValue = Math.max(
    ...pipelineRows.map((row) => Number(row.value || 0)),
    1,
  );

  return (
    <PageShell active="/mleq" className="bg-white text-[#06130c]">
      {initialLoading ? (
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
            <ApiLoadingPanel
              title="Loading MLEQ telemetry"
              body="Preparing model families, portfolio curves, benchmark context, and execution evidence."
              items={[
                "Model families",
                "Equity telemetry",
                "Execution evidence",
              ]}
            />
          </div>
        </section>
      ) : (
        <>
          <section className="border-b border-slate-200 bg-white">
            <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:py-14">
              <div className="flex min-w-0 flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.22em] text-[#8b93ff]">
                      Deep tech engine
                    </span>
                    <span className="rounded-full border border-[#00d6b8]/20 bg-[#00d6b8]/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-[#00d6b8]">
                      {paperStatus}
                    </span>
                  </div>

                  <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-normal text-[#06130c] md:text-6xl">
                    Machine Learning Equity Quant
                  </h1>
                  <p className="mt-3 font-mono text-sm uppercase tracking-[0.22em] text-[#8b93ff]">
                    MLEQ research system
                  </p>
                  <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600">
                    A source-audited quant research layer for model telemetry,
                    benchmark discipline, and execution review. Every figure on
                    this page is derived from the live dashboard API.
                  </p>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {heroStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-[10px] border border-slate-200 bg-white p-4"
                    >
                      <div className="text-lg font-semibold text-[#06130c]">
                        {isLoading ? "..." : stat.value}
                      </div>
                      <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {[
                    "Adaptive allocation",
                    "Benchmark gating",
                    "Drawdown limits",
                    "Execution audit",
                    "NLP signals",
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-xs text-slate-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <TerminalPanel
                modelName={modelName}
                linePath={linePath}
                isLoading={isLoading}
                metrics={terminalMetrics}
                selectedStats={selectedStats}
                portfolioValue={data?.latest?.portfolioValue}
              />
            </div>
          </section>

          <section className="border-b border-slate-200 bg-white">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
              <SectionIntro
                eyebrow="Live model evidence"
                title="Performance highlights"
                body="Current model metrics are shown in a compact operating view, with rankable rows separated from missing source history."
              />

              <div className="mt-7 grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
                <DarkPanel title="Top models by live return">
                  <div className="space-y-4">
                    {leaderboard.length ? (
                      leaderboard.map((model) => (
                        <ModelBar
                          key={model.id || model.name}
                          model={model}
                          maxReturn={leaderboard[0]?.stats?.totalReturn || 1}
                        />
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">
                        Rankable model rows are not available yet.
                      </p>
                    )}
                  </div>
                </DarkPanel>

                <div className="grid gap-4 sm:grid-cols-2">
                  <MetricBox
                    label="Portfolio value"
                    value={display(fmtDollar(data?.latest?.portfolioValue))}
                  />
                  <MetricBox
                    label="Benchmarks"
                    value={displayCount(benchmarkCount)}
                  />
                  <MetricBox
                    label="Submitted orders"
                    value={displayCount(
                      data?.submittedOrders?.length ??
                        data?.debug?.rowCounts?.submittedOrdersRows ??
                        null,
                    )}
                  />
                  <MetricBox
                    label="Source rows"
                    value={displayCount(totalRows)}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="border-b border-slate-200 bg-slate-50">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
              <SectionIntro
                eyebrow="Research controls"
                title="Investment thesis"
                body="The MLEQ view is organized around model behavior, risk controls, comparable benchmarks, and execution transparency."
              />

              <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Principle
                  icon={BrainCircuit}
                  number="01"
                  title="Adaptive allocation"
                >
                  Model exposure is reviewed against live portfolio state,
                  signal rows, and published account context.
                </Principle>
                <Principle
                  icon={Gauge}
                  number="02"
                  title="Benchmark discipline"
                >
                  Strategy curves are normalized against market benchmarks
                  before comparative claims are surfaced.
                </Principle>
                <Principle icon={LockKeyhole} number="03" title="Risk first">
                  Drawdown, observation count, status, and source gaps stay
                  visible inside the operating view.
                </Principle>
                <Principle
                  icon={LineChart}
                  number="04"
                  title="Execution transparency"
                >
                  Orders, positions, target weights, and decisions remain
                  inspectable after each model cycle.
                </Principle>
              </div>
            </div>
          </section>

          <section className="border-b border-slate-200 bg-white">
            <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1fr]">
              <div>
                <SectionIntro
                  eyebrow="Execution foresight"
                  title="Predictive pipeline workflow"
                  body="Signal generation, risk assessment, benchmark evaluation, and execution audit rows are kept in the same review path."
                />

                <div className="mt-7 space-y-3">
                  {pipelineRows.map((row) => {
                    const Icon = row.icon;
                    const isActive = row.label === activePipeline.label;
                    return (
                      <button
                        type="button"
                        key={row.label}
                        onClick={() =>
                          setActivePipelineLabel(row.label as PipelineLabel)
                        }
                        className={`w-full rounded-[10px] border p-4 text-left transition ${
                          isActive
                            ? "border-[#4f57ff] bg-[#eef2ff]"
                            : "border-slate-200 bg-white hover:border-[#8b93ff] hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-[#8b93ff]">
                            <Icon className="h-4 w-4" />
                          </span>
                          <div>
                            <h3 className="font-semibold text-[#06130c]">
                              {row.label}
                            </h3>
                            <p className="mt-1 text-sm leading-6 text-slate-600">
                              {
                                workflowCopy[
                                  row.label as keyof typeof workflowCopy
                                ]
                              }
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <DarkPanel title="Pipeline monitor">
                <div className="space-y-5">
                  <PipelineStageDetail
                    label={activePipeline.label as PipelineLabel}
                    value={Number(activePipeline.value || 0)}
                    maxValue={maxPipelineValue}
                  />

                  {pipelineRows.map((row) => {
                    const pct = Math.max(
                      6,
                      (Number(row.value || 0) / maxPipelineValue) * 100,
                    );
                    return (
                      <div key={`bar-${row.label}`}>
                        <div className="mb-2 flex justify-between font-mono text-xs text-slate-600">
                          <span>{row.label}</span>
                          <span>{displayCount(Number(row.value || 0))}</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-200">
                          <div
                            className="h-2 rounded-full bg-[#00d6b8]"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 rounded-[10px] border border-slate-200 bg-white p-4 font-mono text-xs leading-6 text-slate-700">
                  {pipelineStageDetails[activePipeline.label as PipelineLabel]
                    .monitorNote}
                </div>
              </DarkPanel>
            </div>
          </section>

          <section className="bg-white">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
              <SectionIntro
                eyebrow="Strategic grounding"
                title="Multi-discipline model review"
                body="The engine combines model telemetry, quantitative diagnostics, reinforcement learning outputs, and execution evidence."
              />

              <div className="mt-7 grid gap-4 md:grid-cols-2">
                <Discipline icon={Database} title="Source-aware fundamentals">
                  Repository metadata, benchmark windows, observation dates, and
                  account logs stay attached to every model view.
                </Discipline>
                <Discipline icon={Sigma} title="Quantitative diagnostics">
                  Return normalization, drawdown checks, hit-rate, and Sharpe
                  metrics keep behavior comparable across models.
                </Discipline>
                <Discipline icon={GitBranch} title="Reinforcement allocation">
                  BR-PPO model families update allocation views from live state,
                  rewards, and execution feedback.
                </Discipline>
                <Discipline icon={Workflow} title="Signal operations">
                  Sentiment and regime-aware systems connect NLP-derived signals
                  with systematic allocation controls.
                </Discipline>
              </div>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-[#3d52da] px-5 py-3 text-sm font-bold text-white hover:bg-[#3144c4]"
                >
                  Open live dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/research"
                  className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-bold text-[#06130c] hover:border-[#00d6b8]"
                >
                  View research terminal
                </Link>
              </div>

              {error && (
                <div className="mt-8 rounded-md border border-[#fb7185]/30 bg-[#fb7185]/10 p-4 text-sm text-[#fecdd3]">
                  Dashboard API unavailable. Live terminal values will populate
                  when the API responds.
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </PageShell>
  );
}

const workflowCopy = {
  "Signal generation":
    "Signal and model rows are read from source logs and normalized into dashboard state.",
  "Risk assessment":
    "Positions and drawdown behavior are reviewed before model output becomes an allocation view.",
  "Benchmark evaluation":
    "Market benchmarks are aligned to the published model window for comparable curves.",
  "Execution audit":
    "Submitted orders, account values, and run timestamps remain inspectable after each cycle.",
};

type PipelineLabel = keyof typeof workflowCopy;

const pipelineStageDetails: Record<
  PipelineLabel,
  { title: string; body: string; source: string; monitorNote: string }
> = {
  "Signal generation": {
    title: "Signal intake and model state",
    body: "The review starts by checking whether model signal history is present, current, and aligned with the selected research stream.",
    source: "Signal history rows",
    monitorNote:
      "Signal observations are treated as the first evidence layer before risk, benchmark, or execution review begins.",
  },
  "Risk assessment": {
    title: "Risk gates before allocation",
    body: "Position rows, drawdown behavior, and account exposure are reviewed before a signal can be treated as deployment-ready.",
    source: "Position and exposure rows",
    monitorNote:
      "Risk controls should stay visible before capital exposure, including stale data, drawdown, and allocation checks.",
  },
  "Benchmark evaluation": {
    title: "Comparable market context",
    body: "Benchmarks are aligned to the strategy window so model behavior can be reviewed beside relevant market reference series.",
    source: "Benchmark registry rows",
    monitorNote:
      "Benchmark context keeps strategy claims comparable and prevents isolated return numbers from being overread.",
  },
  "Execution audit": {
    title: "Order and run accountability",
    body: "Submitted orders and execution records are kept inspectable so the research path can be reconciled with operating activity.",
    source: "Submitted order rows",
    monitorNote:
      "Execution audit rows connect research output to operating evidence after each model cycle.",
  },
};

function PipelineStageDetail({
  label,
  value,
  maxValue,
}: {
  label: PipelineLabel;
  value: number;
  maxValue: number;
}) {
  const details = pipelineStageDetails[label];
  const pct = Math.max(6, (Number(value || 0) / Math.max(maxValue, 1)) * 100);

  return (
    <div className="rounded-[12px] border border-[#cbd5ff] bg-[#f8faff] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#4f57ff]">
            {label}
          </div>
          <h3 className="mt-2 text-base font-semibold text-[#06130c]">
            {details.title}
          </h3>
        </div>
        <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-right">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
            Rows
          </div>
          <div className="text-lg font-semibold text-[#06130c]">
            {displayCount(value)}
          </div>
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{details.body}</p>
      <div className="mt-4">
        <div className="mb-2 flex justify-between font-mono text-xs text-slate-600">
          <span>{details.source}</span>
          <span>{Math.round(pct)}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-200">
          <div
            className="h-2 rounded-full bg-[#4f57ff]"
            style={{ width: `${Math.min(100, pct)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function TerminalPanel({
  modelName,
  linePath,
  isLoading,
  metrics,
  selectedStats,
  portfolioValue,
}: {
  modelName: string;
  linePath: string;
  isLoading: boolean;
  metrics: Array<{ label: string; value: string; tone: string }>;
  selectedStats: Stats;
  portfolioValue?: number | null;
}) {
  return (
    <div className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-[#8b93ff]">
            &gt;_ platform terminal
          </div>
          <h2 className="mt-3 text-xl font-semibold text-[#06130c]">
            {modelName}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Normalized equity and live model telemetry.
          </p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-right">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
            Portfolio value
          </div>
          <div className="mt-1 font-semibold text-[#06130c]">
            {display(fmtDollar(portfolioValue))}
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-[14px] border border-slate-200 bg-white p-4">
        <svg
          viewBox="0 0 640 170"
          className="h-[170px] w-full"
          role="img"
          aria-label="Live normalized equity curve"
        >
          <defs>
            <linearGradient
              id="mleqLineProfessional"
              x1="0"
              x2="1"
              y1="0"
              y2="0"
            >
              <stop offset="0%" stopColor="#6f7cff" />
              <stop offset="100%" stopColor="#00d6b8" />
            </linearGradient>
            <linearGradient
              id="mleqAreaProfessional"
              x1="0"
              x2="0"
              y1="0"
              y2="1"
            >
              <stop offset="0%" stopColor="#6f7cff" stopOpacity="0.26" />
              <stop offset="100%" stopColor="#00d6b8" stopOpacity="0" />
            </linearGradient>
          </defs>
          <line
            x1="0"
            x2="640"
            y1="132"
            y2="132"
            stroke="#e2e8f0"
            strokeDasharray="4 4"
          />
          {linePath ? (
            <>
              <path
                d={`${linePath} L 640 170 L 0 170 Z`}
                fill="url(#mleqAreaProfessional)"
              />
              <path
                d={linePath}
                fill="none"
                stroke="url(#mleqLineProfessional)"
                strokeWidth="2.4"
              />
            </>
          ) : (
            <text x="24" y="92" fill="#94a3b8" fontSize="16">
              Equity curve pending source rows
            </text>
          )}
        </svg>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-[10px] border border-slate-200 bg-white p-4"
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
              {metric.label}
            </div>
            <div className={`mt-2 text-xl font-semibold ${metric.tone}`}>
              {isLoading ? "..." : metric.value}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4 font-mono text-xs text-slate-600">
        <span>Observation status</span>
        <span className="text-slate-700">
          {selectedStats.status || "Not available"}
        </span>
      </div>
    </div>
  );
}

function SectionIntro({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#8b93ff]">
        {eyebrow}
      </p>
      <h2 className="mt-3 max-w-3xl text-3xl font-semibold text-[#06130c] md:text-4xl">
        {title}
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{body}</p>
    </div>
  );
}

function DarkPanel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[14px] border border-slate-200 bg-white p-5">
      <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-[#8b93ff]">
        {title}
      </h3>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] border border-slate-200 bg-white p-5">
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
        {label}
      </div>
      <div className="mt-2 text-xl font-semibold text-[#06130c]">{value}</div>
    </div>
  );
}

function ModelBar({
  model,
  maxReturn,
}: {
  model: ModelComparison;
  maxReturn: number;
}) {
  const value = model.stats?.totalReturn;
  const width =
    finiteNumber(value) && finiteNumber(maxReturn) && maxReturn !== 0
      ? Math.max(
          4,
          Math.min(100, (Math.abs(value) / Math.abs(maxReturn)) * 100),
        )
      : 4;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="truncate text-slate-700">
          {cleanText(model.name || model.id)}
        </span>
        <span className={pctClass(value)}>{display(fmtPct(value, true))}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-200">
        <div
          className="h-2 rounded-full bg-[#00d6b8]"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function Principle({
  icon: Icon,
  number,
  title,
  children,
}: {
  icon: ElementType;
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[14px] border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8b93ff]">
          {number}
        </span>
        <Icon className="h-4 w-4 text-[#00d6b8]" />
      </div>
      <h3 className="mt-5 font-semibold text-[#06130c]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{children}</p>
    </div>
  );
}

function Discipline({
  icon: Icon,
  title,
  children,
}: {
  icon: ElementType;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[14px] border border-slate-200 bg-white p-5">
      <div className="flex gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-[#8b93ff]">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <h3 className="font-semibold text-[#06130c]">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{children}</p>
        </div>
      </div>
    </div>
  );
}
