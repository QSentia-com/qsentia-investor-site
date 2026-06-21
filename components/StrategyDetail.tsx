'use client';

import useSWR from 'swr';
import { Activity, CircleDollarSign, Clock3, Droplets, Gauge, ShieldCheck } from 'lucide-react';
import { ApiLoadingPanel, EmptyState, SectionCard } from '@/components/PageChrome';
import { fmtNum, fmtPct } from '@/lib/metrics';

type Detail = { model?: { name: string; description: string; category?: string; repo?: string; accessStatus?: string; minimumCapital?: number | null; performance?: { sharpeRatio?: number | null; annualizedReturn?: number | null; maxDrawdown?: number | null; winRate?: number | null; avgHoldingPeriod?: string | null; totalSignals?: number | null }; latest?: { paperStatus?: string | null; lastRun?: string | null; decision?: Record<string, unknown> | null } } };
const fetcher = async (url: string) => { const response = await fetch(url, { cache: 'no-store' }); if (!response.ok) throw new Error('Unavailable'); return response.json(); };
const clean = (value: string) => value === 'Pending' ? 'Not reported' : value;
const pct = (value?: number | null) => clean(fmtPct(value, true));
const num = (value?: number | null) => clean(fmtNum(value, 2));
const text = (value: unknown) => value === null || value === undefined || value === '' ? 'Not reported' : String(value);

export default function StrategyDetail({ slug }: { slug: string }) {
  const { data, error, isLoading } = useSWR<Detail>(`/api/models/${slug}`, fetcher, { refreshInterval: 60000 });
  if (isLoading) return <ApiLoadingPanel title="Loading strategy evidence" />;
  if (error || !data?.model) return <EmptyState title="Strategy unavailable" body="The published model card could not be loaded from the live registry." />;
  const model = data.model;
  const decision = model.latest?.decision || {};
  const rows = [
    ['Objective', model.description],
    ['Instruments', text(decision.contract || decision.symbol)],
    ['Holding period', text(model.performance?.avgHoldingPeriod)],
    ['Liquidity framework', 'Not reported'],
    ['Capacity', model.minimumCapital ? `Minimum capital $${model.minimumCapital.toLocaleString('en-US')}` : 'Not reported'],
    ['Drawdown rule', 'Not reported'],
    ['Current operating status', clean(text(model.latest?.paperStatus || model.accessStatus))],
    ['Last source run', text(model.latest?.lastRun)],
  ];
  return <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
    <SectionCard className="p-6"><div className="text-xs font-bold uppercase tracking-wide text-[#3d52da]">{model.category || 'Systematic strategy'}</div><h2 className="mt-3 text-3xl font-semibold text-[#06130c]">{model.name}</h2><p className="mt-4 text-sm leading-7 text-[#5a685f]">{model.description}</p><dl className="mt-7 divide-y divide-[#e2e7fb] border-y border-[#e2e7fb]">{rows.map(([label,value]) => <div key={label} className="grid gap-1 py-4 sm:grid-cols-[180px_1fr]"><dt className="text-sm font-semibold text-[#26352c]">{label}</dt><dd className="text-sm leading-6 text-[#5a685f]">{value}</dd></div>)}</dl></SectionCard>
    <div className="grid content-start gap-5"><SectionCard className="p-6"><div className="text-xs font-bold uppercase tracking-wide text-[#647269]">Live performance fields</div><div className="mt-5 grid grid-cols-2 gap-3"><Metric icon={<Activity />} label="Annualized return" value={pct(model.performance?.annualizedReturn)} /><Metric icon={<Gauge />} label="Sharpe ratio" value={num(model.performance?.sharpeRatio)} /><Metric icon={<ShieldCheck />} label="Max drawdown" value={pct(model.performance?.maxDrawdown)} /><Metric icon={<Droplets />} label="Hit rate" value={pct(model.performance?.winRate)} /></div></SectionCard><SectionCard className="p-6"><div className="flex items-center gap-2 text-[#3d52da]"><CircleDollarSign className="h-4 w-4"/><span className="text-xs font-bold uppercase tracking-wide">Diligence note</span></div><p className="mt-4 text-sm leading-6 text-[#5a685f]">Figures are rendered from current repository-backed telemetry. Unreported commercial and risk fields remain unreported pending manager publication.</p><div className="mt-4 flex items-center gap-2 text-xs text-[#647269]"><Clock3 className="h-4 w-4"/>Historical results do not guarantee future performance.</div></SectionCard></div>
  </div>;
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="rounded-md border border-[#e2e7fb] bg-[#f8faff] p-4"><span className="block text-[#3d52da] [&>svg]:h-4 [&>svg]:w-4">{icon}</span><div className="mt-3 text-xs uppercase tracking-wide text-[#647269]">{label}</div><div className="mt-1 text-lg font-semibold text-[#06130c]">{value}</div></div>; }
