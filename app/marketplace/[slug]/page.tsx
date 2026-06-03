'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { ArrowLeft, ArrowRight, BarChart3, CheckCircle2, Database, Play, ShieldCheck } from 'lucide-react';
import { ApiLoadingPanel, EmptyState, Eyebrow, PageShell, SectionCard } from '@/components/PageChrome';

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
};

type ModelDetails = {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription?: string;
  category: string;
  performance: {
    sharpeRatio: number | null;
    annualizedReturn: number | null;
    maxDrawdown: number | null;
    winRate: number | null;
    avgHoldingPeriod?: string | null;
    totalSignals?: number | null;
  };
  pricing: string | null;
  tags: string[];
  repo?: string | null;
  logsPath?: string | null;
  features?: string[];
  compatibleBrokers?: string[];
  useCases?: string[];
  latest?: Record<string, unknown>;
};

type DetailResponse = {
  model?: ModelDetails;
};

type DemoResult = {
  error?: string;
  latency?: number | string;
  signal?: Record<string, unknown>;
  action?: string;
  confidence?: number | null;
  positionSize?: number | null;
};

interface ModelDetailPageProps {
  params: Promise<{ slug: string }>;
}

function formatNum(value: number | null | undefined, digits = 2) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'Not available';
  return value.toFixed(digits);
}

function formatPct(value: number | null | undefined, signed = false) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'Not available';
  const prefix = signed && value > 0 ? '+' : '';
  return `${prefix}${(value * 100).toFixed(2)}%`;
}

function categoryLabel(value: string) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function ModelDetailPage({ params }: ModelDetailPageProps) {
  const { slug } = use(params);
  const { data, error, isLoading } = useSWR<DetailResponse>(`/api/models/${slug}`, fetcher);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoResult, setDemoResult] = useState<DemoResult | null>(null);

  const model = data?.model;

  const handlePreview = async () => {
    setDemoLoading(true);
    setDemoResult(null);
    try {
      const response = await fetch(`/api/models/${slug}/demo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      setDemoResult((await response.json()) as DemoResult);
    } catch {
      setDemoResult({ error: 'Failed to run telemetry preview' });
    } finally {
      setDemoLoading(false);
    }
  };

  if (isLoading) {
    return (
      <PageShell active="/marketplace">
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <ApiLoadingPanel
            title="Loading model profile"
            body="Preparing strategy metrics, source details, published features, and access context."
            items={['Strategy metrics', 'Source details', 'Access context']}
          />
        </section>
      </PageShell>
    );
  }

  if (error || !model) {
    return (
      <PageShell active="/marketplace">
        <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <EmptyState title="Model not found" body="The requested model is not available in the current model API payload." />
          <Link href="/marketplace" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#3d52da]">
            <ArrowLeft className="h-4 w-4" />
            Back to marketplace
          </Link>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell active="/marketplace">
      <section className="border-b border-[#e2e7fb] bg-[#f8faff]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
          <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm font-semibold text-[#3d52da] hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Back to marketplace
          </Link>
          <div className="mt-8 max-w-5xl">
            <Eyebrow>{categoryLabel(model.category)}</Eyebrow>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.05] text-[#06130c] md:text-6xl">
              {model.name}
            </h1>
            <p className="mt-6 max-w-4xl text-base leading-7 text-[#46554b] md:text-lg">
              {model.description}
            </p>
            {model.longDescription && (
              <p className="mt-4 max-w-4xl text-sm leading-7 text-[#5a685f]">{model.longDescription}</p>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6">
          <SectionCard className="p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#eef2ff] text-[#3d52da]">
                <BarChart3 className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-semibold text-[#06130c]">Performance metrics</h2>
                <p className="text-sm text-[#5a685f]">Values are sourced from model detail telemetry.</p>
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Metric label="Sharpe ratio" value={formatNum(model.performance.sharpeRatio)} />
              <Metric label="Annualized return" value={formatPct(model.performance.annualizedReturn, true)} />
              <Metric label="Max drawdown" value={formatPct(model.performance.maxDrawdown, true)} />
              <Metric label="Win rate" value={formatPct(model.performance.winRate)} />
              <Metric label="Holding period" value={model.performance.avgHoldingPeriod || 'Not available'} />
              <Metric label="Signal rows" value={model.performance.totalSignals?.toLocaleString('en-US') || 'Not available'} />
            </div>
          </SectionCard>

          <SectionCard className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#06130c]">Telemetry preview</h2>
                <p className="mt-1 text-sm text-[#5a685f]">
                  Calls the rate-limited demo route for the latest decision preview.
                </p>
              </div>
              <button
                type="button"
                onClick={handlePreview}
                disabled={demoLoading}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#172554] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2437b5] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Play className="h-4 w-4" />
                {demoLoading ? 'Running preview' : 'Run preview'}
              </button>
            </div>

            {demoResult && (
              <pre className="mt-5 max-h-[360px] overflow-auto whitespace-pre-wrap break-all rounded-md bg-[#07112a] p-4 text-xs leading-6 text-[#dbe4ff]">
                {JSON.stringify(demoResult, null, 2)}
              </pre>
            )}
          </SectionCard>

          {model.features?.length ? (
            <SectionCard className="p-6">
              <h2 className="text-xl font-semibold text-[#06130c]">Published features</h2>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {model.features.map((feature) => (
                  <div key={feature} className="flex gap-3 rounded-md border border-[#e2e7fb] bg-[#fbfcff] p-3 text-sm text-[#26352c]">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#3d52da]" />
                    {feature}
                  </div>
                ))}
              </div>
            </SectionCard>
          ) : null}
        </div>

        <aside className="space-y-6">
          <SectionCard className="p-6">
            <Database className="h-5 w-5 text-[#3d52da]" />
            <h2 className="mt-4 text-xl font-semibold text-[#06130c]">Source details</h2>
            <dl className="mt-5 divide-y divide-[#e2e7fb] text-sm">
              <InfoRow label="Repository" value={model.repo || 'Not available'} />
              <InfoRow label="Logs path" value={model.logsPath || 'Not available'} />
              <InfoRow label="Pricing" value={model.pricing || 'Pricing not returned by API'} />
            </dl>
          </SectionCard>

          <SectionCard className="p-6">
            <ShieldCheck className="h-5 w-5 text-[#3d52da]" />
            <h2 className="mt-4 text-xl font-semibold text-[#06130c]">Access</h2>
            <p className="mt-3 text-sm leading-6 text-[#5a685f]">
              Licensing terms are not synthesized when no live commercial record is published.
            </p>
            <Link
              href="/contact"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#172554] px-5 py-3 text-sm font-bold text-white hover:bg-[#2437b5]"
            >
              Request access
              <ArrowRight className="h-4 w-4" />
            </Link>
          </SectionCard>

          {model.tags?.length ? (
            <SectionCard className="p-6">
              <h2 className="text-xl font-semibold text-[#06130c]">Tags</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {model.tags.map((tag) => (
                  <span key={tag} className="rounded-md border border-[#e2e7fb] bg-[#fbfcff] px-2 py-1 text-xs text-[#647269]">
                    {tag}
                  </span>
                ))}
              </div>
            </SectionCard>
          ) : null}
        </aside>
      </section>
    </PageShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[#e2e7fb] bg-[#fbfcff] p-4">
      <div className="text-[11px] font-bold uppercase tracking-wide text-[#647269]">{label}</div>
      <div className="mt-1 text-lg font-semibold text-[#06130c]">{value}</div>
    </div>
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
