'use client';

import Link from 'next/link';
import useSWR from 'swr';
import { ArrowRight, BarChart3, Clock3, Gauge, Layers3 } from 'lucide-react';
import { ApiLoadingPanel, EmptyState, SectionCard } from '@/components/PageChrome';
import { fmtNum, fmtPct } from '@/lib/metrics';

type Model = {
  id: string; slug: string; name: string; description: string; category?: string; accessStatus?: string;
  performance?: { sharpeRatio?: number | null; annualizedReturn?: number | null; maxDrawdown?: number | null; winRate?: number | null };
};

const fetcher = async (url: string) => {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error('Unable to load strategy registry');
  return response.json();
};

function metric(value: string) { return value === 'Pending' ? 'Not reported' : value; }

export default function StrategyDirectory() {
  const { data, error, isLoading } = useSWR<{ models?: Model[] }>('/api/models', fetcher, { refreshInterval: 60000 });
  if (isLoading && !data) return <ApiLoadingPanel title="Loading strategy registry" items={['Model cards', 'Performance fields', 'Operating status']} />;
  if (error) return <EmptyState title="Strategy registry unavailable" body="The live models endpoint could not be reached. No replacement figures are shown." />;
  const models = data?.models || [];
  if (!models.length) return <EmptyState title="No published strategies" body="Approved models will appear here after publication through the model registry." />;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {models.map((model) => (
        <SectionCard key={model.id} className="flex h-full flex-col p-6">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-bold uppercase tracking-wide text-[#3d52da]">{model.category || 'Systematic strategy'}</span>
            <span className="rounded-md border border-[#dbe3ff] bg-[#f8faff] px-2 py-1 text-xs font-semibold text-[#3046c8]">{model.accessStatus || 'Not reported'}</span>
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-[#06130c]">{model.name}</h2>
          <p className="mt-3 min-h-20 text-sm leading-6 text-[#5a685f]">{model.description}</p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Mini icon={<BarChart3 />} label="Return" value={metric(fmtPct(model.performance?.annualizedReturn, true))} />
            <Mini icon={<Gauge />} label="Sharpe" value={metric(fmtNum(model.performance?.sharpeRatio, 2))} />
            <Mini icon={<Layers3 />} label="Drawdown" value={metric(fmtPct(model.performance?.maxDrawdown, true))} />
            <Mini icon={<Clock3 />} label="Holding" value="Not reported" />
          </div>
          <Link href={`/strategies/${model.slug}`} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#3046c8] hover:underline">
            Review strategy <ArrowRight className="h-4 w-4" />
          </Link>
        </SectionCard>
      ))}
    </div>
  );
}

function Mini({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-md border border-[#e2e7fb] bg-[#f8faff] p-3"><span className="block h-4 w-4 text-[#3d52da] [&>svg]:h-4 [&>svg]:w-4">{icon}</span><div className="mt-3 text-xs uppercase tracking-wide text-[#647269]">{label}</div><div className="mt-1 truncate text-sm font-semibold text-[#06130c]">{value}</div></div>;
}
