'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { Area, AreaChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ApiLoadingPanel, EmptyState, SectionCard } from '@/components/PageChrome';
import { fmtNum, fmtPct } from '@/lib/metrics';

type Point = { timestamp?: string; portfolio?: number | null; drawdown?: number | null; return?: number | null };
type Benchmark = { name?: string; ticker?: string; points?: Array<{ timestamp?: string; value?: number | null }> };
type Payload = { selectedModelConfig?: { name?: string }; equityCurve?: Point[]; benchmarks?: Benchmark[]; stats?: { totalReturn?: number | null; sharpe?: number | null; maxDrawdown?: number | null }; updatedAt?: string };
const fetcher = async (url: string) => { const response = await fetch(url, { cache: 'no-store' }); if (!response.ok) throw new Error('Unavailable'); return response.json(); };
const safePct = (value?: number | null) => { const x = fmtPct(value, true); return x === 'Pending' ? 'Not reported' : x; };
const safeNum = (value?: number | null) => { const x = fmtNum(value, 2); return x === 'Pending' ? 'Not reported' : x; };

export default function PerformanceCenter() {
  const [basis, setBasis] = useState<'net' | 'gross'>('net');
  const { data, error, isLoading } = useSWR<Payload>('/api/dashboard', fetcher, { refreshInterval: 60000 });
  const analysis = useMemo(() => calculate(data), [data]);
  if (isLoading) return <ApiLoadingPanel title="Loading performance evidence" items={['Equity observations', 'Benchmark series', 'Return statistics']} />;
  if (error || !data) return <EmptyState title="Performance data unavailable" body="The dashboard API did not return a usable payload." />;
  if (!analysis.points.length) return <EmptyState title="No performance observations" body="Performance will appear after portfolio observations are published by the source model." />;

  return <div className="grid gap-6">
    <div className="flex flex-col gap-4 border-b border-[#e2e7fb] pb-5 sm:flex-row sm:items-end sm:justify-between"><div><div className="text-xs font-bold uppercase tracking-wide text-[#3d52da]">Selected strategy</div><h2 className="mt-2 text-2xl font-semibold text-[#06130c]">{data.selectedModelConfig?.name || 'Live model'}</h2></div><div className="inline-flex w-fit rounded-md border border-[#cbd5ff] bg-white p-1" aria-label="Return basis"><button onClick={() => setBasis('net')} className={`rounded px-4 py-2 text-sm font-semibold ${basis === 'net' ? 'bg-[#172554] text-white' : 'text-[#5a685f]'}`}>Net</button><button onClick={() => setBasis('gross')} className={`rounded px-4 py-2 text-sm font-semibold ${basis === 'gross' ? 'bg-[#172554] text-white' : 'text-[#5a685f]'}`}>Gross</button></div></div>
    {basis === 'gross' ? <EmptyState title="Gross return series not reported" body="The source currently publishes one normalized portfolio series. QSentia does not relabel net observations as gross performance." /> : <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6"><Stat label="Since inception" value={safePct(data.stats?.totalReturn)} /><Stat label="Sharpe" value={safeNum(data.stats?.sharpe)} /><Stat label="Max drawdown" value={safePct(data.stats?.maxDrawdown)} /><Stat label="Best month" value={safePct(analysis.bestMonth)} /><Stat label="Worst month" value={safePct(analysis.worstMonth)} /><Stat label="Observations" value={String(analysis.points.length)} /></div>
      <SectionCard className="min-w-0 p-5 sm:p-6"><div className="flex items-center justify-between gap-4"><h3 className="text-lg font-semibold text-[#06130c]">Normalized performance and benchmark</h3><span className="text-xs text-[#647269]">Base 100</span></div><div className="mt-5 h-[360px] min-w-0"><ResponsiveContainer width="100%" height="100%" minWidth={0}><LineChart data={analysis.chart}><CartesianGrid stroke="#e7ebf7" strokeDasharray="4 4"/><XAxis dataKey="date" tick={{fontSize:11,fill:'#647269'}} minTickGap={30}/><YAxis domain={['auto','auto']} tick={{fontSize:11,fill:'#647269'}} width={48}/><Tooltip/><Legend/><Line type="monotone" dataKey="strategy" name="Strategy" stroke="#3d52da" strokeWidth={2.5} dot={false}/>{analysis.benchmarkKey ? <Line type="monotone" dataKey="benchmark" name={analysis.benchmarkKey} stroke="#111827" strokeWidth={1.8} strokeDasharray="5 4" dot={false}/> : null}</LineChart></ResponsiveContainer></div></SectionCard>
      <div className="grid min-w-0 gap-6 lg:grid-cols-2"><SectionCard className="min-w-0 p-5 sm:p-6"><h3 className="text-lg font-semibold text-[#06130c]">Rolling risk view</h3><div className="mt-5 h-[260px] min-w-0"><ResponsiveContainer width="100%" height="100%" minWidth={0}><AreaChart data={analysis.rolling}><CartesianGrid stroke="#e7ebf7" strokeDasharray="4 4"/><XAxis dataKey="date" tick={{fontSize:11,fill:'#647269'}} minTickGap={24}/><YAxis tick={{fontSize:11,fill:'#647269'}} width={48}/><Tooltip/><Legend/><Area type="monotone" dataKey="rollingSharpe" name="Rolling Sharpe" stroke="#3d52da" fill="#dfe4ff"/><Line type="monotone" dataKey="drawdownPct" name="Drawdown %" stroke="#be123c" dot={false}/></AreaChart></ResponsiveContainer></div></SectionCard><MonthlyTable rows={analysis.months}/></div>
    </>}
    <p className="text-xs leading-5 text-[#647269]">Returns are calculated from source portfolio observations and shown before any independent verification. Benchmark comparison is informational; fee treatment is not reported by the source. Historical and paper results do not guarantee future performance.</p>
  </div>;
}

function calculate(data?: Payload) {
  const points = (data?.equityCurve || []).filter((p): p is Point & { timestamp: string; portfolio: number } => Boolean(p.timestamp) && Number.isFinite(p.portfolio));
  const benchmark = data?.benchmarks?.find((b) => b.points?.length);
  const benchmarkMap = new Map((benchmark?.points || []).map((p) => [p.timestamp, p.value]));
  const chart = points.map((p) => ({ date: p.timestamp, strategy: p.portfolio, benchmark: benchmarkMap.get(p.timestamp) ?? null }));
  const groups = new Map<string, { first: number; last: number }>();
  points.forEach((p) => { const key = p.timestamp.slice(0,7); const row = groups.get(key); groups.set(key, row ? { first: row.first, last: p.portfolio } : { first: p.portfolio, last: p.portfolio }); });
  const months = Array.from(groups).map(([month,row]) => ({ month, value: row.first ? row.last / row.first - 1 : null }));
  const monthValues = months.map((m) => m.value).filter((v): v is number => typeof v === 'number');
  const returns = points.map((p) => Number(p.return)).filter(Number.isFinite);
  const rolling = points.map((p,index) => { const window = returns.slice(Math.max(0,index-19), index+1); const mean = window.reduce((a,b)=>a+b,0) / Math.max(window.length,1); const variance = window.reduce((a,b)=>a+(b-mean)**2,0) / Math.max(window.length-1,1); return { date:p.timestamp, rollingSharpe: variance > 0 ? mean / Math.sqrt(variance) * Math.sqrt(252) : null, drawdownPct: typeof p.drawdown === 'number' ? p.drawdown * 100 : null }; });
  return { points, chart, months, rolling, benchmarkKey: benchmark ? `${benchmark.name || benchmark.ticker}` : null, bestMonth: monthValues.length ? Math.max(...monthValues) : null, worstMonth: monthValues.length ? Math.min(...monthValues) : null };
}

function Stat({ label, value }: { label: string; value: string }) { return <div className="rounded-md border border-[#e2e7fb] bg-white p-4"><div className="text-xs font-bold uppercase tracking-wide text-[#647269]">{label}</div><div className="mt-2 text-xl font-semibold text-[#06130c]">{value}</div></div>; }
function MonthlyTable({ rows }: { rows: Array<{ month: string; value: number | null }> }) { return <SectionCard className="overflow-hidden"><div className="border-b border-[#e2e7fb] px-5 py-4"><h3 className="text-lg font-semibold text-[#06130c]">Monthly returns</h3></div><div className="max-h-[280px] overflow-auto"><table className="w-full text-left text-sm"><thead className="sticky top-0 bg-[#f8faff] text-xs uppercase tracking-wide text-[#647269]"><tr><th className="px-5 py-3">Month</th><th className="px-5 py-3 text-right">Return</th></tr></thead><tbody className="divide-y divide-[#e2e7fb]">{rows.map((row)=><tr key={row.month}><td className="px-5 py-3 font-semibold text-[#26352c]">{row.month}</td><td className={`px-5 py-3 text-right font-semibold ${(row.value || 0) < 0 ? 'text-[#be123c]' : 'text-[#047857]'}`}>{safePct(row.value)}</td></tr>)}</tbody></table></div></SectionCard>; }
