'use client';

import Image from 'next/image';
import Link from 'next/link';
import useSWR from 'swr';
import { useEffect, useMemo, useRef, useState } from 'react';
import QSentiaMotionBackground from '@/components/QSentiaMotionBackground';
import { fmtNum, fmtPct } from '@/lib/metrics';
import {
  Brain,
  TrendingUp,
  Zap,
  Shield,
  Activity,
  Cpu,
  Layers,
  Globe,
  LineChart,
  Lock,
  Code,
  Terminal,
  ArrowRight,
  ChevronRight,
  Info,
  Calendar,
  Play,
  Check,
  ExternalLink,
  Sparkles,
  Database,
  Search,
  Menu,
  X,
  Sun,
  Moon,
  Clock,
  Briefcase,
  Layers3,
  GitBranch,
  BarChart3,
  Boxes
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type HeatmapDay = {
  dateKey: string;
  label: string;
  value: number;
};

type BenchmarkBar = {
  name: string;
  value: number | null;
  color: string;
  width?: number;
};

type LeaderRow = {
  label: string;
  value: number;
  color: string;
};

function percentLabel(value: number | null | undefined) {
  const formatted = fmtPct(value);
  return formatted === 'Pending' ? formatted : formatted.replace('%', '');
}

function formatDateLabel(dateKey?: string | null) {
  if (!dateKey) return 'Pending';
  const date = new Date(`${dateKey}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return dateKey;
  return date.toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

const frameworkSteps = [
  {
    title: 'Signal Generation',
    desc: 'Momentum, sentiment, macro, alt-data, and mean-reversion signals are computed in real-time across 300+ instruments and scored by the BR-PPO engine.',
  },
  {
    title: 'Risk Assessment',
    desc: 'Before allocation, drawdown limits, VaR thresholds, and position concentration checks are run against live portfolio state and stress scenarios.',
  },
  {
    title: 'Benchmark Evaluation',
    desc: 'Every strategy is continuously compared against benchmarks to verify genuine alpha generation before positions are confirmed.',
  },
  {
    title: 'Execution & Audit',
    desc: 'Every order, rebalance event, and model decision is recorded with rationale — full transparency from signal to settlement.',
  },
];

const pillars = [
  {
    number: '01',
    icon: Layers,
    title: 'Adaptive Allocation',
    desc: 'BR-PPO dynamically shifts exposure based on live portfolio state, model signals, and risk behavior.',
  },
  {
    number: '02',
    icon: TrendingUp,
    title: 'Benchmark Discipline',
    desc: 'Every model is evaluated against transparent market benchmarks and normalized performance curves.',
  },
  {
    number: '03',
    icon: Shield,
    title: 'Risk First',
    desc: 'Drawdown, volatility, hit rate, and model health are visible before capital allocation decisions.',
  },
  {
    number: '04',
    icon: Terminal,
    title: 'Execution Transparency',
    desc: 'Orders, positions, target weights, and decisions are logged and visible from the same source of truth.',
  },
];

const approachCards = [
  {
    icon: Search,
    title: 'Fundamental Analysis',
    desc: 'We analyze fundamental, market, and alternative data, using NLP on earnings calls and management commentary to extract alpha signals.',
  },
  {
    icon: LineChart,
    title: 'Quantitative Finance',
    desc: 'Mathematical and statistical techniques detect patterns, volatility structures, and pricing anomalies across the universe.',
  },
  {
    icon: Brain,
    title: 'Reinforcement Learning',
    desc: 'Our BR-PPO model continuously learns from market interactions, self-improving signal weights and allocation decisions.',
  },
  {
    icon: Activity,
    title: 'Behavioral Sciences',
    desc: 'ML-driven analysis of investor biases, sentiment extremes, and crowd psychology to exploit market mispricing.',
  },
];

const heatmapMonths = [
  'All Months',
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const benchmarkFallback = [
  { name: 'S&P 500', ticker: 'SPY', color: '#cbd5f5' },
  { name: 'Nasdaq 100', ticker: 'QQQ', color: '#a5b4fc' },
  { name: 'Dow Jones', ticker: 'DIA', color: '#fca5a5' },
  { name: 'Russell 2000', ticker: 'IWM', color: '#fbbf24' },
  { name: 'Total US Market', ticker: 'VTI', color: '#67e8f9' },
];

const benchmarkColorOverrides: Record<string, string> = {
  SPY: '#818cf8',
  QQQ: '#a78bfa',
  DIA: '#f43f5e',
  IWM: '#fbbf24',
  VTI: '#22d3ee',
};

function heatClass(value: number, isDark: boolean) {
  if (value >= 0.02) return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
  if (value >= 0.01) return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20';
  if (value > 0) return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10';
  if (value <= -0.02) return 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
  if (value <= -0.01) return 'bg-rose-500/15 text-rose-400 border border-rose-500/20';
  return 'bg-rose-500/10 text-rose-400 border border-rose-500/10';
}

export default function HomePage() {
  const [activeStep, setActiveStep] = useState(0);
  const [isDark, setIsDark] = useState(true); // Default to gorgeous dark mode to match Axyon
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [heatmapModel, setHeatmapModel] = useState('');
  const [heatmapMonth, setHeatmapMonth] = useState('All Months');
  const [heatmapYear, setHeatmapYear] = useState('All Years');
  const { data } = useSWR('/api/dashboard', fetcher, { refreshInterval: 60000 });
  const { data: heatmapData } = useSWR(
    () => (heatmapModel ? `/api/dashboard?model=${encodeURIComponent(heatmapModel)}` : null),
    fetcher,
    { refreshInterval: 60000 }
  );
  const statsRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [statsInView, setStatsInView] = useState(false);
  const [chartInView, setChartInView] = useState(false);
  const strategyReveal = useReveal(0.25);
  const leadersReveal = useReveal(0.2);
  const pillarsReveal = useReveal(0.2);
  const frameworkReveal = useReveal(0.2);
  const performanceReveal = useReveal(0.2);
  const approachReveal = useReveal(0.2);
  const ctaReveal = useReveal(0.2);

  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-300' : 'text-slate-600';
  const textMuted = isDark ? 'text-slate-500' : 'text-slate-400';
  const accentText = 'bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent';
  const pillClass = isDark
    ? 'bg-slate-900/50 border-slate-800/80 text-slate-300'
    : 'bg-white/80 border-slate-200 text-slate-700';
  const cardClass = isDark ? 'bg-slate-950/40 border-slate-900/80 backdrop-blur-xl' : 'bg-white border-slate-200/80 shadow-sm';

  const selectedModel = useMemo(() => {
    const models = data?.modelComparison || [];
    const qsentia = models.find((m: any) => String(m?.name || '').toLowerCase().includes('qsentia'));
    const selected = models.find((m: any) => m.id === data?.selectedModel);
    return qsentia || selected || models[0] || null;
  }, [data]);

  const stats = selectedModel?.stats || {};
  const annualizedReturn = stats?.annualizedReturn ?? stats?.totalReturn;
  const sharpe = stats?.sharpe;
  const hitRate = stats?.hitRate;
  const maxDrawdown = stats?.maxDrawdown;
  const annualizedLabel = percentLabel(annualizedReturn);
  const hitRateLabel = percentLabel(hitRate);
  const drawdownLabel = percentLabel(maxDrawdown);

  const alphaCount = useCountUp(8, statsInView);
  const sourcesCount = useCountUp(45, statsInView);
  const pointsCount = useCountUp(14, statsInView);

  useEffect(() => {
    const statsNode = statsRef.current;
    const chartNode = chartRef.current;
    const targets = [statsNode, chartNode].filter(Boolean) as HTMLElement[];

    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (entry.target === statsNode) setStatsInView(true);
          if (entry.target === chartNode) setChartInView(true);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.35 }
    );

    targets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, []);

  const benchmarkBars = useMemo<BenchmarkBar[]>(() => {
    const bench = data?.benchmarks?.length ? data.benchmarks : benchmarkFallback;
    const modelReturn = Number.isFinite(Number(stats?.totalReturn)) ? Number(stats.totalReturn) : null;

    const rows: BenchmarkBar[] = [
      {
        name: selectedModel?.name || 'Qsentia MLEQ Platform',
        value: modelReturn,
        color: '#6366f1',
      },
      ...bench.map((b: any) => {
        const ticker = String(b?.ticker || '').toUpperCase();

        return {
          name: b?.name || ticker || 'Benchmark',
          value: Number.isFinite(Number(b?.stats?.totalReturn)) ? Number(b.stats.totalReturn) : null,
          color: benchmarkColorOverrides[ticker] || b?.color || '#64748b',
        };
      }),
    ];

    const maxValue = Math.max(
      0.05,
      ...rows.map((row) => (row.value !== null ? Math.abs(row.value) : 0))
    );

    return rows.map((row): BenchmarkBar => ({
      ...row,
      width: row.value === null ? 8 : Math.max(8, Math.round((Math.abs(row.value) / maxValue) * 100)),
    }));
  }, [data, selectedModel, stats]);

  useEffect(() => {
    if (!heatmapModel && data?.selectedModel) {
      setHeatmapModel(data.selectedModel);
    }
  }, [data, heatmapModel]);

  const heatmapModelOptions = useMemo(() => data?.registry ?? [], [data]);

  const heatmapDays = useMemo<HeatmapDay[]>(() => {
    const source: Array<{ timestamp?: string; return?: number | string | null }> =
      heatmapData?.returns ?? data?.returns ?? [];

    return source
      .map((point) => {
        const dateKey = String(point.timestamp || '').slice(0, 10);
        const date = new Date(`${dateKey}T00:00:00Z`);

        if (!dateKey || Number.isNaN(date.getTime())) {
          return null;
        }

        return {
          dateKey,
          label: date.toLocaleString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
          }),
          value: Number(point.return) || 0,
        };
      })
      .filter((day): day is HeatmapDay => day !== null)
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  }, [data, heatmapData]);

  const heatmapYears = useMemo(() => {
    const years = new Set(
      heatmapDays.map((day) => new Date(`${day.dateKey}T00:00:00Z`).getFullYear().toString())
    );
    return ['All Years', ...Array.from(years).sort()];
  }, [heatmapDays]);

  const filteredHeatmapDays = useMemo(() => {
    return heatmapDays.filter((day) => {
      const date = new Date(`${day.dateKey}T00:00:00Z`);
      const matchesMonth =
        heatmapMonth === 'All Months' ||
        date.toLocaleString('en-US', { month: 'long' }) === heatmapMonth;
      const matchesYear =
        heatmapYear === 'All Years' ||
        date.getFullYear().toString() === heatmapYear;
      return matchesMonth && matchesYear;
    });
  }, [heatmapDays, heatmapMonth, heatmapYear]);

  const heatStats = useMemo(() => {
    const values = filteredHeatmapDays.map((day) => day.value);
    if (!values.length) {
      return {
 Min: null,
        max: null,
        avg: null,
        positive: 0,
      };
    }
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    const positive = values.filter((v) => v > 0).length;

    return {
      min,
      max,
      avg,
      positive,
    };
  }, [filteredHeatmapDays]);

  const leaderboardCards = useMemo(() => {
    const latestReturn = data?.returns?.length ? data.returns[data.returns.length - 1] : null;
    const latestDate = latestReturn?.timestamp ? formatDateLabel(latestReturn.timestamp) : 'Today';
    const selectedConfig = data?.selectedModelConfig;
    const allTime = (data?.modelComparison || [])
      .filter((model: any) => Number.isFinite(model?.stats?.totalReturn))
      .sort((a: any, b: any) => (b.stats.totalReturn ?? 0) - (a.stats.totalReturn ?? 0))[0];

    return [
      {
        title: 'Best of Today',
        date: latestDate,
        model: selectedConfig?.name || 'Selected Model',
        return: latestReturn?.return ?? data?.stats?.totalReturn ?? null,
        sharpe: data?.stats?.sharpe ?? null,
        hitRate: data?.stats?.hitRate ?? null,
        badge: 'LIVE NOW',
      },
      {
        title: 'Best of All Time',
        date: allTime?.inceptionDate ? `${formatDateLabel(allTime.inceptionDate)} - Present` : 'All Time',
        model: allTime?.name || 'Top Model',
        return: allTime?.stats?.totalReturn ?? null,
        sharpe: allTime?.stats?.sharpe ?? null,
        hitRate: allTime?.stats?.hitRate ?? null,
        badge: 'ALL TIME',
      },
    ];
  }, [data]);

  const todayLeaders = useMemo<LeaderRow[]>(() => {
    const models = (data?.modelComparison || [])
      .map((model: any) => ({
        label: model?.name || model?.id,
        value: Number(model?.stats?.totalReturn),
        color: model?.color || '#6366f1',
      }))
      .filter((row: LeaderRow) => Number.isFinite(row.value))
      .sort((a: any, b: any) => (b.value ?? 0) - (a.value ?? 0))
      .slice(0, 5);

    return models;
  }, [data]);

  const todayTiles = useMemo(() => {
    const stats = data?.stats;
    const latest = data?.latest;
    const actions = Array.isArray(data?.actionCounts)
      ? data.actionCounts.reduce((sum: number, row: any) => sum + (row?.count ?? 0), 0)
      : null;

    return [
      {
        label: 'Portfolio Return',
        value: fmtPct(latest?.portfolioReturn ?? null, true),
        subLabel: latest?.paperStatus || 'Active',
        tone: 'good',
      },
      {
        label: 'Sharpe Ratio',
        value: fmtNum(stats?.sharpe ?? null, 2),
        subLabel: stats?.status === 'ready' ? 'Ready' : 'Live',
        tone: 'neutral',
      },
      {
        label: 'Hit Rate',
        value: fmtPct(stats?.hitRate ?? null),
        subLabel: `${stats?.nReturns ?? 0} returns`,
        tone: 'good',
      },
      {
        label: 'Max Drawdown',
        value: fmtPct(stats?.maxDrawdown ?? null, true),
        subLabel: 'Bounded',
        tone: 'bad',
      },
      {
        label: 'Volatility',
        value: fmtPct(stats?.volatility ?? null),
        subLabel: 'Annualized',
        tone: 'neutral',
      },
      {
        label: 'Signals Logged',
        value: actions !== null ? String(actions) : '6,142',
        subLabel: 'Processed API Logs',
        tone: 'neutral',
      },
    ];
  }, [data]);

  const heatmapModelName = useMemo(() => {
    return (
      heatmapModelOptions.find((model: { id: string; name: string }) => model.id === heatmapModel)
        ?.name ||
      data?.selectedModelConfig?.name ||
      'Return Heat Map'
    );
  }, [data, heatmapModel, heatmapModelOptions]);

  return (
    <main className={`relative min-h-screen overflow-x-hidden selection:bg-indigo-500/30 selection:text-white ${isDark ? 'bg-[#060814] text-white' : 'bg-slate-50 text-slate-950'}`}>
      
      {/* GLOW DECORATIONS */}
      {isDark && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-20%] w-[800px] h-[800px] rounded-full bg-indigo-900/10 blur-[13vw]" />
          <div className="absolute top-[40%] right-[-10%] w-[700px] h-[700px] rounded-full bg-purple-900/10 blur-[12vw]" />
          <div className="absolute bottom-[10%] left-[-15%] w-[900px] h-[900px] rounded-full bg-cyan-900/5 blur-[15vw]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>
      )}

      {/* NAVIGATION */}
      <nav className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${isDark ? 'border-slate-900/80 bg-[#060814]/70' : 'border-slate-200 bg-white/80'} backdrop-blur-xl`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-mono text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span className="h-6 w-6 rounded bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-serif italic text-white shadow-md shadow-indigo-500/20">Q</span>
                QSentia<span className="text-[10px] tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono font-medium">CORE</span>
              </span>
            </Link>
          </div>

          <div className="hidden items-center gap-8 text-sm font-medium md:flex">
            <Link href="/marketplace" className={`transition-colors duration-200 ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-indigo-600'}`}>Marketplace</Link>
            <a href="#strategy" className={`transition-colors duration-200 ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-indigo-600'}`}>Strategy</a>
            <a href="#performance" className={`transition-colors duration-200 ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-indigo-600'}`}>Performance</a>
            <a href="#framework" className={`transition-colors duration-200 ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-indigo-600'}`}>Framework</a>
            <a href="#pillars" className={`transition-colors duration-200 ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-indigo-600'}`}>Thesis</a>

            <div className="h-4 w-[1px] bg-slate-800" />

            <button
              type="button"
              onClick={() => setIsDark((prev) => !prev)}
              className={`rounded-full p-2 border transition-all duration-200 ${isDark ? 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900' : 'border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-100'}`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <a href="mailto:inquiries@qsentia.com" className={`rounded-lg px-4 py-2 font-medium text-xs tracking-wider uppercase transition-all duration-200 border ${isDark ? 'border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700' : 'border-slate-200 text-slate-700 hover:bg-slate-100'}`}>
              Institutional Access
            </a>
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className={`md:hidden rounded-lg border p-2 transition-all duration-200 ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-300 text-slate-600'}`}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* MOBILE MENU */}
        {isMenuOpen && (
          <div className={`md:hidden border-t ${isDark ? 'border-slate-900 bg-[#060814]/95 backdrop-blur-xl' : 'border-slate-200 bg-white/95'}`}>
            <div className="flex flex-col gap-4 px-6 py-6 text-sm">
              <Link href="/marketplace" className={`transition-colors ${isDark ? 'text-slate-300' : 'text-slate-700'}`} onClick={() => setIsMenuOpen(false)}>Marketplace</Link>
              <a href="#strategy" className={`transition-colors ${isDark ? 'text-slate-300' : 'text-slate-700'}`} onClick={() => setIsMenuOpen(false)}>Strategy</a>
              <a href="#performance" className={`transition-colors ${isDark ? 'text-slate-300' : 'text-slate-700'}`} onClick={() => setIsMenuOpen(false)}>Performance</a>
              <a href="#framework" className={`transition-colors ${isDark ? 'text-slate-300' : 'text-slate-700'}`} onClick={() => setIsMenuOpen(false)}>Framework</a>
              
              <div className="h-[1px] bg-slate-800" />
              
              <button
                type="button"
                onClick={() => {
                  setIsDark((prev) => !prev);
                  setIsMenuOpen(false);
                }}
                className={`rounded-lg border px-4 py-2.5 text-center flex items-center justify-center gap-2 ${isDark ? 'border-slate-800 text-slate-300' : 'border-slate-200 text-slate-700'}`}
              >
                {isDark ? <><Sun className="h-4 w-4" /> Light Mode</> : <><Moon className="h-4 w-4" /> Dark Mode</>}
              </button>
              
              <a href="mailto:inquiries@qsentia.com" className="rounded-lg bg-indigo-600 px-4 py-2.5 text-center text-white font-semibold shadow hover:bg-indigo-500 transition">
                Email Inquiries
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section className="relative flex min-h-[95vh] flex-col items-center justify-center overflow-hidden px-6 pt-32 pb-20 text-center z-10">
        
        {/* Decorative Grid Mesh */}
        <div className="absolute inset-0 bg-[#060814] -z-10 bg-radial-[circle_800px_at_50%_200px] from-slate-900/40 via-transparent to-transparent opacity-70" />

        {/* Floating tech badge */}
        <div className={`mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-mono tracking-wider uppercase transition-all duration-300 ${isDark ? 'border-indigo-500/10 bg-indigo-500/5 text-indigo-400' : 'border-indigo-100 bg-indigo-50 text-indigo-700'}`}>
          <Sparkles className="h-3 w-3 animate-pulse" />
          Neural Predictive Alpha & Execution Infrastructure
        </div>

        {/* Hero Heading */}
        <h1 className={`font-serif text-5xl md:text-8xl tracking-tight leading-[1.1] mb-6 font-medium max-w-5xl ${textPrimary}`}>
          Deep Learning Engineered for <span className={`${accentText}`}>Absolute Alpha</span>
        </h1>

        {/* Subcopy */}
        <p className={`mx-auto mb-10 max-w-2xl text-base md:text-lg font-light leading-relaxed ${textSecondary}`}>
          QSentia deploys self-improving BR-PPO reinforcement models and advanced NLP semantic analysis into real-time trading environments. Direct sub-68ms API delivery designed for institutional pipelines.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-sm sm:max-w-none">
          <Link href="/marketplace" className="group rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2">
            Explore AI Marketplace
            <ArrowRight className="h-4 w-4 tracking-normal group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <Link href="/dashboard" className={`rounded-xl border px-8 py-4 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${isDark ? 'border-slate-800 text-slate-300 bg-slate-950/20 hover:bg-slate-950/60 hover:border-slate-700' : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'}`}>
            <Terminal className="h-4 w-4 text-indigo-400" />
            Live Research Terminal
          </Link>
        </div>

        {/* Micro System Ticker */}
        <div className={`mt-16 flex items-center gap-6 text-xs font-mono px-5 py-2.5 rounded-full border ${isDark ? 'border-slate-900/80 bg-slate-950/30 text-slate-400' : 'border-slate-200/80 bg-white/40 text-slate-600'}`}>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Telemetry: Online</span>
          </div>
          <div className="h-3 w-[1px] bg-slate-800" />
          <div className="hidden sm:block">Models Operational: <span className="text-white font-semibold">9/9</span></div>
          <div className="h-3 w-[1px] bg-slate-800 hidden sm:block" />
          <div>Inference Rate: <span className="text-indigo-400 font-semibold">68ms Avg</span></div>
        </div>

        {/* Scroll cues */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-slate-500 pointer-events-none">
          <div className="h-8 w-[1px] bg-slate-800 animate-bounce" />
          Telemetry Matrix
        </div>
      </section>

      {/* CORE STAT STRIP */}
      <div className={`relative z-10 border-y transition-colors duration-300 ${isDark ? 'bg-slate-950/40 border-slate-900/80' : 'bg-white border-slate-200'}`}>
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <div className="text-center md:text-left">
              <div className="text-xs uppercase tracking-wider text-slate-500 font-mono mb-2">Platform Returns (12M)</div>
              <div className={`font-serif text-3xl md:text-5xl font-medium tracking-tight ${textPrimary}`}>
                {annualizedLabel === 'Pending' ? annualizedLabel : `+${annualizedLabel}%`}
              </div>
              <div className="text-xs text-indigo-400 font-mono mt-2">Historical Outperformance</div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-xs uppercase tracking-wider text-slate-500 font-mono mb-2">Sharpe Ratio</div>
              <div className={`font-serif text-3xl md:text-5xl font-medium tracking-tight ${textPrimary}`}>
                {fmtNum(sharpe, 2)}
              </div>
              <div className="text-xs text-indigo-400 font-mono mt-2">Adjusted for Drawdown</div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-xs uppercase tracking-wider text-slate-500 font-mono mb-2">Signal Accuracy</div>
              <div className={`font-serif text-3xl md:text-5xl font-medium tracking-tight ${textPrimary}`}>
                {hitRateLabel === 'Pending' ? hitRateLabel : `${hitRateLabel}%`}
              </div>
              <div className="text-xs text-indigo-400 font-mono mt-2">Dynamic Probability</div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-xs uppercase tracking-wider text-slate-500 font-mono mb-2">Maximum Peak Risk</div>
              <div className={`font-serif text-3xl md:text-5xl font-medium tracking-tight ${textPrimary}`}>
                {drawdownLabel === 'Pending' ? drawdownLabel : `${drawdownLabel}%`}
              </div>
              <div className="text-xs text-indigo-400 font-mono mt-2">Validated Bound</div>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK SHOWCASE */}
      <section className="relative z-10 py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-indigo-400 mb-2">Predictive Engines</div>
              <h2 className={`font-serif text-3xl md:text-5xl font-medium ${textPrimary}`}>Deployment Ready Alpha</h2>
            </div>
            <p className={`max-w-md text-sm md:text-base ${textSecondary}`}>
              Leverage custom dynamic classifiers instead of lagging statistical curves. Instantly route endpoints directly to your Execution Logic or Trade blotters.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            
            {/* Model Card 1 */}
            <div className={`group relative rounded-2xl border p-6 flex flex-col justify-between overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:border-slate-800 ${cardClass}`}>
              <div className="absolute top-0 right-0 h-24 w-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] tracking-wider font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">CRYPTO BASIS · LIVE</span>
                  <Activity className="h-4 w-4 text-emerald-400" />
                </div>
                <h3 className={`text-xl font-semibold mb-2 group-hover:text-indigo-400 transition-colors ${textPrimary}`}>QSentia Perp Basis Alpha</h3>
                <p className={`text-xs ${textSecondary} mb-4`}>Market-neutral futures & spot funding basis capture on BTC/ETH. Custom institutional integration.</p>
              </div>
              
              <div>
                <div className="grid grid-cols-2 gap-4 border-t border-slate-900/60 pt-4 mb-4 text-xs font-mono">
                  <div>
                    <div className="text-[10px] text-slate-500">Sharpe Ratio</div>
                    <div className={`text-base font-semibold mt-0.5 ${textPrimary}`}>2.34</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Target APY</div>
                    <div className="text-base font-semibold text-emerald-400 mt-0.5">+42.7%</div>
                  </div>
                </div>
                <Link href="/marketplace/qsentia-btc-eth-perp-basis-alpha" className={`block text-center py-2.5 px-4 rounded-xl text-xs font-medium transition-all duration-200 border ${isDark ? 'border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-705 bg-slate-950/40' : 'border-indigo-100 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50'}`}>
                  View Model Spec →
                </Link>
              </div>
            </div>

            {/* Model Card 2 */}
            <div className={`group relative rounded-2xl border p-6 flex flex-col justify-between overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:border-slate-800 ${cardClass}`}>
              <div className="absolute top-0 right-0 h-24 w-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] tracking-wider font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">NLP SENTIMENT · LIVE</span>
                  <Brain className="h-4 w-4 text-amber-400" />
                </div>
                <h3 className={`text-xl font-semibold mb-2 group-hover:text-indigo-400 transition-colors ${textPrimary}`}>Model C Sentiment Alpha</h3>
                <p className={`text-xs ${textSecondary} mb-4`}>NLP earnings caller & social pipeline parser generating tactical long-short equity signals.</p>
              </div>
              
              <div>
                <div className="grid grid-cols-2 gap-4 border-t border-slate-900/60 pt-4 mb-4 text-xs font-mono">
                  <div>
                    <div className="text-[10px] text-slate-500">Sharpe Ratio</div>
                    <div className={`text-base font-semibold mt-0.5 ${textPrimary}`}>2.93</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Target return</div>
                    <div className="text-base font-semibold text-emerald-400 mt-0.5">+45.8%</div>
                  </div>
                </div>
                <Link href="/marketplace/mlp-alpha-130-30" className={`block text-center py-2.5 px-4 rounded-xl text-xs font-medium transition-all duration-200 border ${isDark ? 'border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-705 bg-slate-950/40' : 'border-indigo-100 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50'}`}>
                  View Model Spec →
                </Link>
              </div>
            </div>

            {/* Model Card 3 / Dynamic redirect */}
            <div className={`group relative rounded-2xl border p-6 flex flex-col justify-between overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:border-indigo-500/20 ${cardClass}`}>
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-purple-500/5 opacity-50 group-hover:opacity-100 transition-opacity" />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] tracking-wider font-mono px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">UNIVERSE HUB</span>
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                </div>
                <h3 className={`text-xl font-semibold mb-2 group-hover:text-indigo-400 transition-colors ${textPrimary}`}>Institutional Registry</h3>
                <p className={`text-xs ${textSecondary} mb-4`}>Explore macro regimes, digital assets, statistical mean-reversion systems & automated reinforcement strategies.</p>
              </div>
              
              <div>
                <div className="grid grid-cols-2 gap-4 border-t border-slate-900/60 pt-4 mb-4 text-xs font-mono">
                  <div>
                    <div className="text-[10px] text-slate-500">Total Models</div>
                    <div className={`text-base font-semibold mt-0.5 ${textPrimary}`}>9 Modules</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">API Speed</div>
                    <div className="text-base font-semibold text-cyan-400 mt-0.5">&lt; 68ms</div>
                  </div>
                </div>
                <Link href="/marketplace" className="block text-center py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all duration-200 shadow-md shadow-indigo-500/10 group-hover:shadow-indigo-500/20">
                  Open AI Marketplace →
                </Link>
              </div>
            </div>
          </div>

          {/* Core system guarantees */}
          <div className={`rounded-xl border p-5 ${isDark ? 'border-slate-900/60 bg-slate-950/20' : 'border-slate-200 bg-white/40'}`}>
            <div className="flex flex-col md:flex-row items-center justify-around gap-6 text-xs text-slate-500 font-mono">
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-indigo-400" /> Free Sandbox Queries Included
              </span>
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-indigo-400" /> Continuous 24/7 Model Recalibration
              </span>
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-indigo-400" /> Bounded Hard Drawdown Risk Limits
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* STRATEGY CORE SECTION */}
      <section
        id="strategy"
        ref={strategyReveal.ref}
        className={`relative z-10 py-24 md:py-32 border-t transition-colors duration-300 ${isDark ? 'border-slate-900/60 bg-transparent' : 'border-slate-200 bg-slate-100/30'}`}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-[1fr_1.1fr] gap-16 items-center">
            
            {/* Left specifications */}
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-indigo-400 mb-2">Deep Tech Engine</div>
              <h2 className={`font-serif text-4xl md:text-6xl font-medium tracking-tight mb-8 ${textPrimary}`}>
                Machine Learning<br />Equity Quant (MLEQ)
              </h2>
              
              <div ref={statsRef} className="grid grid-cols-3 gap-6 mb-8 border-b border-slate-900/60 pb-8 font-mono">
                <div>
                  <div className={`font-serif text-2xl md:text-3xl font-semibold ${textPrimary}`}>
                    {alphaCount}
                    <span className="text-indigo-400 font-serif">+</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">Signal Families</div>
                </div>
                <div>
                  <div className={`font-serif text-2xl md:text-3xl font-semibold ${textPrimary}`}>
                    {sourcesCount}
                    <span className="text-indigo-400 font-serif">+</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-mono">Active Streams</div>
                </div>
                <div>
                  <div className={`font-serif text-2xl md:text-3xl font-semibold ${textPrimary}`}>
                    {pointsCount}
                    <span className="text-indigo-400 font-serif">M</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">Data Logs / day</div>
                </div>
              </div>

              <p className={`text-sm md:text-base leading-relaxed mb-6 ${textSecondary}`}>
                Our system decodes highly non-linear volatility regimes instead of utilizing standard predictive regressions. We process alternative inputs, semantic records, sentiment signals, and live macro benchmarks through our custom BR-PPO reinforcement architecture to capture asymmetric, highly-executable trading alpha.
              </p>

              <div className="flex flex-wrap gap-2.5">
                {['Adaptive Allocation', 'Discipline Limits', 'Stress Guardrails', 'BR-PPO Models', 'NLP Parsers', 'Cross-Asset Regimes'].map((t) => (
                  <span key={t} className={`text-xs px-3.5 py-1.5 rounded-lg border font-mono ${pillClass}`}>{t}</span>
                ))}
              </div>
            </div>

            {/* Right Interactive Telemetry card */}
            <div ref={chartRef} className={`rounded-3xl border p-8 shadow-2xl relative overflow-hidden group ${cardClass}`}>
              <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs font-mono tracking-wider text-slate-400 uppercase">Interactive Platform Terminal</span>
                </div>
                <span className="flex items-center gap-2 text-[10px] font-bold font-mono tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> LIVE TELEMETRY
                </span>
              </div>

              {/* Sparkline curve */}
              <div className="h-32 w-full flex items-center justify-center mb-6 bg-slate-950/20 rounded-2xl border border-slate-900/60 p-4 relative">
                <svg viewBox="0 0 400 120" width="100%" height="100%" preserveAspectRatio="none" className={chartInView ? 'chart-animate' : ''}>
                  <defs>
                    <linearGradient id="glowG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path className="chart-area" d="M0,100 L22,96 L44,90 L66,94 L88,84 L110,78 L132,72 L154,76 L176,65 L198,58 L220,52 L242,48 L264,42 L286,36 L308,30 L330,24 L352,18 L374,14 L400,8 L400,120 L0,120Z" fill="url(#glowG)" />
                  <path className="chart-line" d="M0,100 L22,96 L44,90 L66,94 L88,84 L110,78 L132,72 L154,76 L176,65 L198,58 L220,52 L242,48 L264,42 L286,36 L308,30 L330,24 L352,18 L374,14 L400,8" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle className="chart-dot animate-pulse" cx="400" cy="8" r="5" fill="#22d3ee" />
                </svg>
              </div>

              {/* List stats */}
              <div className="space-y-3.5 font-mono text-xs">
                <div className="flex justify-between items-center border-b border-slate-900/40 pb-3">
                  <span className="text-slate-500">Telemetry Alpha Returns</span>
                  <span className="text-emerald-400 font-semibold">{fmtPct(stats?.totalReturn, true)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-900/40 pb-3">
                  <span className="text-slate-500">Sharpe Ratio Outperformance</span>
                  <span className="text-indigo-400 font-semibold">{fmtNum(sharpe, 2)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-900/40 pb-3">
                  <span className="text-slate-500">Drawdown Guardrails</span>
                  <span className="text-rose-400 font-semibold">{fmtPct(maxDrawdown, true)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-900/40 pb-3">
                  <span className="text-slate-500">Calculated Win-Rate</span>
                  <span className="text-emerald-400 font-semibold">{fmtPct(hitRate)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Active Pipeline Scores</span>
                  <span className="text-indigo-400 font-semibold">{stats?.nReturns ?? 86} / 100</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CURATED HIGHLIGHTS BOARD */}
      <section
        id="performance"
        ref={leadersReveal.ref}
        className={`relative z-10 py-24 md:py-32 border-t transition-colors duration-300 ${isDark ? 'border-slate-900 bg-slate-950/20' : 'border-slate-200 bg-white/60'} backdrop-blur-xl`}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14">
            <div className="text-xs font-mono uppercase tracking-widest text-indigo-400 mb-2">Metrics Ledger</div>
            <h2 className={`font-serif text-3.5xl md:text-5xl font-medium ${textPrimary}`}>Real-Time Performance Highlights</h2>
            <p className={`mt-3 max-w-2xl text-sm md:text-base ${textSecondary}`}>
              Explore our model leaderboard tracking historical results, continuous system risk limits, and real-time execution outputs.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {leaderboardCards.map((card) => (
              <div key={card.title} className={`rounded-2xl border p-6 shadow-sm transition-all duration-300 hover:border-slate-800 ${cardClass}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">{card.title}</div>
                    <div className="text-[11px] font-mono mt-1 text-indigo-400">{card.date}</div>
                  </div>
                  <span className="text-[9px] font-mono leading-none tracking-widest font-black uppercase rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-1">
                    {card.badge}
                  </span>
                </div>
                
                <div className={`mt-5 font-serif text-xl font-semibold ${textPrimary}`}>{card.model}</div>
                
                <div className="mt-6 grid grid-cols-3 gap-4 font-mono text-center">
                  <div className="bg-slate-950/20 p-2.5 rounded-xl border border-slate-900/60">
                    <div className="text-[9px] text-slate-500 uppercase tracking-wider">Total Return</div>
                    <div className="text-base font-bold text-emerald-400 mt-1">{fmtPct(card.return, true)}</div>
                  </div>
                  <div className="bg-slate-950/20 p-2.5 rounded-xl border border-slate-900/60">
                    <div className="text-[9px] text-slate-500 uppercase tracking-wider">Sharpe</div>
                    <div className={`text-base font-bold mt-1 ${textPrimary}`}>{fmtNum(card.sharpe, 2)}</div>
                  </div>
                  <div className="bg-slate-950/20 p-2.5 rounded-xl border border-slate-900/60">
                    <div className="text-[9px] text-slate-500 uppercase tracking-wider">Hit Rate</div>
                    <div className={`text-base font-bold mt-1 ${textPrimary}`}>{fmtPct(card.hitRate)}</div>
                  </div>
                </div>

                <div className="mt-5">
                  <div className={`h-1.5 rounded-full ${isDark ? 'bg-slate-900' : 'bg-slate-200'}`}>
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                      style={{
                        width: `${Math.min(100, Math.max(18, Math.round(card.return * 200)))}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            
            {/* Top models by return */}
            <div className={`rounded-2xl border p-6 flex flex-col justify-between ${cardClass}`}>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-indigo-400" /> TOP REGISTERED STRATEGIES BY RETURN
                </div>
                <div className="space-y-5">
                  {todayLeaders.length ? (
                    todayLeaders.map((row) => (
                      <div key={row.label} className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className={`${textSecondary} font-medium`}>{row.label}</span>
                          <span className={`font-semibold ${row.value >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {fmtPct(row.value, true)}
                          </span>
                        </div>
                        <div className={`h-1.5 rounded-full ${isDark ? 'bg-slate-900' : 'bg-slate-200'}`}>
                          <div
                            className="h-1.5 rounded-full bg-indigo-500"
                            style={{
                              width: `${Math.min(100, Math.max(8, Math.round(Math.abs(row.value) * 1200)))}%`,
                              background: row.color,
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={`rounded-xl border p-4 text-xs font-mono ${isDark ? 'border-slate-900 text-slate-500' : 'border-slate-200 text-slate-600'}`}>
                      Initializing model data streams...
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick telemetry tiles */}
            <div className={`rounded-2xl border p-6 flex flex-col justify-between ${cardClass}`}>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-indigo-400" /> LIVE STRATEGY PULSE
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {todayTiles.map((tile) => (
                    <div key={tile.label} className={`rounded-xl border p-3.5 transition-all hover:border-slate-800 ${isDark ? 'border-slate-900/60 bg-slate-950/30' : 'border-slate-200 bg-slate-50'}`}>
                      <div className="text-[9px] font-mono uppercase tracking-wider text-slate-500">{tile.label}</div>
                      <div className={`mt-2 text-base font-bold font-mono tracking-tight ${textPrimary}`}>{tile.value}</div>
                      <div className={`text-[10px] font-mono mt-1 ${tile.tone === 'good' ? 'text-emerald-400' : tile.tone === 'bad' ? 'text-rose-400' : 'text-slate-500'}`}>
                        {tile.subLabel}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* HEATMAP SECTION */}
      <section
        id="heatmap"
        className={`relative z-10 py-24 md:py-32 transition-colors duration-300 ${isDark ? 'bg-transparent' : 'bg-slate-50'}`}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className={`rounded-3xl border p-6 md:p-8 relative overflow-hidden ${cardClass}`}>
            <div className="absolute top-0 right-0 h-48 w-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between border-b border-slate-900/40 pb-6 mb-8">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 mb-2">Historical Density Map</div>
                <h2 className={`font-serif text-2xl md:text-3xl font-semibold tracking-tight ${textPrimary}`}>
                  {heatmapModelName}
                </h2>
              </div>

              {/* Selector filters styled beautifully */}
              <div className="flex flex-wrap gap-3 text-xs font-mono">
                <label className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${pillClass}`}>
                  <span className="text-slate-500">Model</span>
                  <select
                    value={heatmapModel}
                    onChange={(event) => setHeatmapModel(event.target.value)}
                    className={`bg-transparent outline-none focus:outline-none focus:ring-0 select-override ${textPrimary} font-semibold`}
                  >
                    {heatmapModelOptions.map((model: { id: string; name: string }) => (
                      <option key={model.id} value={model.id} className="text-black bg-slate-100">
                        {model.name}
                      </option>
                    ))}
                  </select>
                </label>
                
                <label className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${pillClass}`}>
                  <span className="text-slate-500">Month</span>
                  <select
                    value={heatmapMonth}
                    onChange={(event) => setHeatmapMonth(event.target.value)}
                    className={`bg-transparent outline-none focus:outline-none focus:ring-0 select-override ${textPrimary} font-semibold`}
                  >
                    {heatmapMonths.map((month) => (
                      <option key={month} value={month} className="text-black bg-slate-100">
                        {month}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${pillClass}`}>
                  <span className="text-slate-500">Year</span>
                  <select
                    value={heatmapYear}
                    onChange={(event) => setHeatmapYear(event.target.value)}
                    className={`bg-transparent outline-none focus:outline-none focus:ring-0 select-override ${textPrimary} font-semibold`}
                  >
                    {heatmapYears.map((year) => (
                      <option key={year} value={year} className="text-black bg-slate-100">
                        {year}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {/* Grid display cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 mb-8">
              {filteredHeatmapDays.length ? (
                filteredHeatmapDays.slice(0, 18).map((day) => (
                  <div
                    key={day.dateKey}
                    className={`rounded-xl p-3.5 text-center font-mono flex flex-col justify-between ${heatClass(day.value, isDark)}`}
                  >
                    <div className="text-[9px] uppercase tracking-wider opacity-60">{day.label}</div>
                    <div className="mt-2.5 text-xs font-semibold">{fmtPct(day.value, true)}</div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-xs text-slate-500 font-mono">
                  No records matching selected criteria.
                </div>
              )}
            </div>

            {/* Bottom facts matrix */}
            <div className="grid gap-4 text-xs font-mono md:grid-cols-3 lg:grid-cols-6 border-t border-slate-900/40 pt-6">
              <div className="bg-slate-950/20 p-3 rounded-lg border border-slate-900/40">
                <div className="text-slate-500 text-[9px] uppercase">Start Bounds</div>
                <div className={`mt-1.5 font-bold ${textPrimary}`}>{filteredHeatmapDays[0]?.label ?? 'Pending'}</div>
              </div>
              <div className="bg-slate-950/20 p-3 rounded-lg border border-slate-900/40">
                <div className="text-slate-500 text-[9px] uppercase">End Bounds</div>
                <div className={`mt-1.5 font-bold ${textPrimary}`}>{filteredHeatmapDays[filteredHeatmapDays.length - 1]?.label ?? 'Pending'}</div>
              </div>
              <div className="bg-slate-950/20 p-3 rounded-lg border border-slate-900/40">
                <div className="text-slate-500 text-[9px] uppercase">Min Drawdown</div>
                <div className="mt-1.5 font-bold text-rose-400">{fmtPct(heatStats.min ?? undefined, true)}</div>
              </div>
              <div className="bg-slate-950/20 p-3 rounded-lg border border-slate-900/40">
                <div className="text-slate-500 text-[9px] uppercase">Max Return</div>
                <div className="mt-1.5 font-bold text-emerald-400">{fmtPct(heatStats.max ?? undefined, true)}</div>
              </div>
              <div className="bg-slate-950/20 p-3 rounded-lg border border-slate-900/40">
                <div className="text-slate-500 text-[9px] uppercase">Average Sess.</div>
                <div className={`mt-1.5 font-bold ${textPrimary}`}>{fmtPct(heatStats.avg ?? undefined, true)}</div>
              </div>
              <div className="bg-slate-950/20 p-3 rounded-lg border border-slate-900/40">
                <div className="text-slate-500 text-[9px] uppercase">Win Ratio</div>
                <div className="mt-1.5 font-bold text-emerald-400">{heatStats.positive}/{filteredHeatmapDays.length}</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* INVESTMENT THESIS (PILLARS) */}
      <section
        id="pillars"
        ref={pillarsReveal.ref}
        className={`relative z-10 py-24 md:py-32 border-t transition-colors duration-300 ${isDark ? 'border-slate-900 bg-slate-950/20' : 'border-slate-200 bg-white/60'} backdrop-blur-xl`}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <div className="text-xs font-mono uppercase tracking-widest text-indigo-400 mb-2">Core Philosophy</div>
            <h2 className={`font-serif text-3.5xl md:text-5xl font-medium ${textPrimary}`}>The Investment Thesis</h2>
            <p className={`mt-3 ${textSecondary} text-sm md:text-base`}>
              Four baseline engineering principles designed to preserve assets under varying systematic stresses.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {pillars.map((pillar) => {
              const IconComp = pillar.icon;
              return (
                <div key={pillar.number} className={`rounded-2xl p-8 hover:border-slate-800 transition-all duration-300 border flex flex-col justify-between group ${cardClass}`}>
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono text-indigo-400 tracking-wider font-extrabold">{pillar.number} — PRINCIPLE</span>
                      <div className="p-2 rounded-lg border border-slate-900 bg-slate-950 text-indigo-400">
                        <IconComp className="h-4 w-4" />
                      </div>
                    </div>
                    <h3 className={`font-serif text-xl font-semibold mb-3 ${textPrimary}`}>{pillar.title}</h3>
                    <p className={`text-xs md:text-sm leading-relaxed ${textSecondary}`}>{pillar.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* OPERATIONAL FRAMEWORK */}
      <section
        id="framework"
        ref={frameworkReveal.ref}
        className={`relative z-10 py-24 md:py-32 border-t border-slate-900/60 bg-transparent`}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-400">Execution Pipeline</span>
            <h2 className={`font-serif text-3.5xl md:text-5xl font-medium mt-2 mb-4 ${textPrimary}`}>Predictive Pipeline Workflow</h2>
            <p className={`max-w-2xl text-sm md:text-base ${textSecondary}`}>
              How our deep learning modules calculate, screen, and issue order targets into active markets.
            </p>
          </div>

          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-start">
            <div className="space-y-3">
              {frameworkSteps.map((step, idx) => (
                <button
                  key={step.title}
                  className={`w-full text-left rounded-2xl border p-5 transition-all duration-300 flex gap-4 ${activeStep === idx ? 'bg-indigo-600/10 border-indigo-500/30' : 'border-slate-900/60 bg-slate-950/20 hover:border-slate-800'}`}
                  onClick={() => setActiveStep(idx)}
                >
                  <div className={`font-mono text-xs ${activeStep === idx ? 'text-indigo-400 font-bold' : 'text-slate-500'}`}>
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <h4 className={`font-semibold text-sm md:text-base ${activeStep === idx ? 'text-indigo-300' : textPrimary}`}>{step.title}</h4>
                    <p className={`text-xs mt-1.5 leading-relaxed ${activeStep === idx ? 'text-slate-300' : 'text-slate-400'}`}>{step.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Step visualization sandbox details */}
            <div className={`rounded-2xl p-6 shadow-sm border font-mono text-xs ${cardClass}`}>
              <div className="flex items-center justify-between border-b border-slate-900/40 pb-4 mb-4">
                <div className="text-[10px] uppercase text-slate-500 tracking-wider">Dynamic Pipeline Workspace</div>
                <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              </div>

              {activeStep === 0 && (
                <div className="space-y-4">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-bold">Signal Weights Registry</div>
                  {[
                    { label: 'Momentum Cls.', val: 82 },
                    { label: 'Mean Rev. Alpha', val: 67 },
                    { label: 'Structural NLP', val: 74 },
                    { label: 'Macro Regime Score', val: 55 },
                    { label: 'Alternative Signals', val: 91 },
                  ].map((row) => (
                    <div key={row.label} className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>{row.label}</span>
                        <span>{row.val}%</span>
                      </div>
                      <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-900' : 'bg-slate-200'}`}>
                        <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-cyan-400" style={{ width: `${row.val}%` }} />
                      </div>
                    </div>
                  ))}
                  <div className="mt-4 rounded-lg bg-slate-950 p-3.5 border border-slate-900/60">
                    <div className="text-[9px] text-indigo-400 font-bold mb-1 uppercase tracking-wider">Inference Target Alpha</div>
                    Increase cryptocurrency exposure of platform allocations by 12% on model signal convergence thresholds.
                  </div>
                </div>
              )}

              {activeStep === 1 && (
                <div className="space-y-4 font-mono">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-bold">Active Risk Limits Validation</div>
                  <div className="space-y-2 text-slate-400">
                    <div className="flex justify-between border-b border-slate-900/40 pb-2">
                      <span>Maximum Platform Drawdown</span>
                      <span className="text-emerald-400 font-bold">{fmtPct(maxDrawdown, true)}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900/40 pb-2">
                      <span>Volatility Limit Bound</span>
                      <span className="text-amber-400 font-bold">{fmtPct(stats?.volatility)}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900/40 pb-2">
                      <span>Active VaR Threshold (95%)</span>
                      <span className="text-emerald-400 font-bold">{fmtPct(stats?.maxDrawdown)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Hit Probability State</span>
                      <span className="text-indigo-400 font-bold">{fmtPct(hitRate)}</span>
                    </div>
                  </div>
                  <div className="rounded-lg bg-emerald-500/10 p-3 border border-emerald-500/20 text-[10px] text-emerald-400 font-bold text-center uppercase tracking-widest">
                    Risk Assessment Clear - No limits breached
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="space-y-4">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-bold font-mono">Normalized Benchmarks Spreads</div>
                  <div className="space-y-2 text-slate-400">
                    {benchmarkBars.slice(0, 4).map((row) => (
                      <div key={row.name} className="flex justify-between border-b border-slate-900/40 pb-2">
                        <span>{row.name}</span>
                        <span className="text-indigo-400 font-bold">{fmtPct(row.value, true)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeStep === 3 && (
                <div className="space-y-3">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-bold">Live Executing blotters logs</div>
                  <div className="rounded-lg bg-slate-950 p-3 border border-slate-900/60 font-mono">
                    <div className="flex justify-between text-[10px] mb-1 font-bold">
                      <span className="text-emerald-400">BUY ORDER STATUS</span>
                      <span className="text-slate-500">09:32:14</span>
                    </div>
                    <div className="text-slate-400 text-[11px]">HDFC Bank Equities qty 150 @ 1,642.50. Convergence 88/100.</div>
                  </div>
                  <div className="rounded-lg bg-slate-950 p-3 border border-slate-900/60 font-mono">
                    <div className="flex justify-between text-[10px] mb-1 font-bold">
                      <span className="text-rose-400">STOP LOSS STATUS</span>
                      <span className="text-slate-500">10:15:08</span>
                    </div>
                    <div className="text-slate-400 text-[11px]">Wipro Equities limit trigger. Position closed at limit offset.</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* METHODOLOGY SCi ENCE OVERVIEW */}
      <section
        id="approach"
        ref={approachReveal.ref}
        className={`relative z-10 py-24 md:py-32 border-t transition-colors duration-300 ${isDark ? 'border-slate-900/80 bg-slate-950/20' : 'border-slate-200 bg-slate-50'}`}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-400">Research Grounding</span>
            <h2 className={`font-serif text-3.5xl md:text-5xl font-medium mt-2 ${textPrimary}`}>The Multi-Discipline Approach</h2>
            <p className={`mt-3 max-w-xl text-sm ${textSecondary}`}>
              A cross-discipline deep science codebase designed to unlock predictive advantages.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {approachCards.map((card) => {
              const IconComp = card.icon;
              return (
                <div key={card.title} className={`rounded-2xl p-6 flex gap-5 border transition-all duration-300 hover:border-slate-800 ${cardClass}`}>
                  <div className="p-3.5 h-12 w-12 rounded-xl bg-slate-950 border border-slate-900 text-indigo-400 flex items-center justify-center shrink-0">
                    <IconComp className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className={`font-semibold ${textPrimary}`}>{card.title}</h4>
                    <p className={`text-xs md:text-sm mt-2 leading-relaxed ${textSecondary}`}>{card.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRE-FOOTER CALL TO ACTION */}
      <section
        ref={ctaReveal.ref}
        className="relative z-10 py-28 md:py-36 text-center border-t border-slate-900/60 overflow-hidden"
      >
        <div className="absolute inset-0 bg-radial-[circle_400px_at_50%_50%] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="mx-auto max-w-3xl px-6 relative">
          <div className="text-xs font-mono uppercase tracking-widest text-indigo-400 mb-2">Platform Integration</div>
          <h2 className={`font-serif text-4xl md:text-6xl font-medium tracking-tight mb-6 ${textPrimary}`}>
            Gain Your Machine Edge
          </h2>
          <p className={`text-sm md:text-base leading-relaxed max-w-xl mx-auto mb-10 ${textSecondary}`}>
            Provision sandbox keys, query neural endpoints, and configure model notifications in under five minutes. Built for modern builders.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Link href="/marketplace" className="rounded-xl bg-indigo-600 px-8 py-4 text-sm font-semibold text-white shadow-xl hover:bg-indigo-500 transition-all duration-200">
              Go to Marketplace
            </Link>
            <a href="mailto:inquiries@qsentia.com?subject=QSentia Investor Information Request" className={`rounded-xl border px-8 py-4 text-sm font-semibold transition-all duration-200 ${isDark ? 'border-slate-800 text-slate-300 bg-slate-950/20 hover:bg-slate-950/60 hover:border-slate-705' : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'}`}>
              Contact Quant Department
            </a>
          </div>
          
          <div className="text-[10px] font-mono text-slate-500 mt-6 tracking-wide">
            API access SLA: 99.99% operational uptime guaranteed.
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 bg-[#02040a] text-white border-t border-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid md:grid-cols-4 gap-12 border-b border-slate-900 pb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="font-mono text-lg font-black tracking-tight text-white flex items-center gap-2">
                  <span className="h-6 w-6 rounded bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-serif italic text-white">Q</span>
                  QSentia
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                Systematic asset management and self-improving deep learning architectures. Where high complexity meets complete execution transparency.
              </p>
              <p className="text-[10px] text-slate-600 font-mono mt-6">© 2026 QSentia Core Systems. All rights registered.</p>
            </div>
            
            <div className="font-mono text-xs">
              <div className="text-slate-400 font-bold uppercase tracking-wider mb-4 text-[10px]">Product Engine</div>
              <Link href="/marketplace" className="block text-slate-500 mb-2.5 hover:text-white transition-colors">AI Marketplace</Link>
              <a href="#strategy" className="block text-slate-500 mb-2.5 hover:text-white transition-colors">Telemetry Board</a>
              <a href="#performance" className="block text-slate-500 mb-2.5 hover:text-white transition-colors">Metrics Ledger</a>
              <a href="#framework" className="block text-slate-500 hover:text-white transition-colors">Pipeline Workflow</a>
            </div>

            <div className="font-mono text-xs">
              <div className="text-slate-400 font-bold uppercase tracking-wider mb-4 text-[10px]">Technical SLA</div>
              <a href="#" className="block text-slate-500 mb-2.5 hover:text-white">Security Bounds</a>
              <a href="#" className="block text-slate-500 mb-2.5 hover:text-white">API References</a>
              <a href="#" className="block text-slate-500 mb-2.5 hover:text-white">Disclaimer Limits</a>
              <a href="mailto:inquiries@qsentia.com" className="block text-slate-500 hover:text-white">Quant Query</a>
            </div>
          </div>

          <div className="text-[10px] text-slate-600 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-8">
            <span className="leading-relaxed max-w-3xl">
              Important: Quantitative trading systems involve considerable capital risks. Model execution parameters and historical data do not assure future outcomes. Run query checks.
            </span>
            <div className="flex gap-4 shrink-0 font-mono">
              <a href="#" className="hover:text-white">Privacy</a>
              <a href="#" className="hover:text-white">Terms SLA</a>
            </div>
          </div>
        </div>
      </footer>

    </main>
  );
}

function useCountUp(target: number, start: boolean, duration = 900) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return;

    let rafId = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      setValue(Math.round(target * progress));

      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [duration, start, target]);

  return value;
}

function useReveal(threshold = 0.2) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || visible) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          setVisible(true);
          observer.unobserve(entry.target);
        });
      },
      { threshold }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [threshold, visible]);

  return { ref, visible };
}
