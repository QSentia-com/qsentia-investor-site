'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { ArrowRight, BarChart3, Database, Filter, Search, ShieldCheck } from 'lucide-react';
import { ApiLoadingPanel, EmptyState, Eyebrow, PageShell, SectionCard } from '@/components/PageChrome';

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
};

type Model = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  performance: {
    sharpeRatio: number | null;
    annualizedReturn: number | null;
    maxDrawdown: number | null;
    winRate: number | null;
  };
  pricing: string | null;
  tags: string[];
  repo?: string | null;
  logsPath?: string | null;
};

type ModelsResponse = {
  models?: Model[];
};

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

export default function MarketplacePage() {
  const { data, error, isLoading } = useSWR<ModelsResponse>('/api/models', fetcher);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const models = useMemo(() => data?.models || [], [data?.models]);
  const categories = useMemo(() => ['all', ...Array.from(new Set(models.map((model) => model.category))).sort()], [models]);

  const filteredModels = models.filter((model) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      model.name.toLowerCase().includes(query) ||
      model.description.toLowerCase().includes(query) ||
      model.tags.some((tag) => tag.toLowerCase().includes(query));

    const matchesCategory = selectedCategory === 'all' || model.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <PageShell active="/marketplace">
      <section className="border-b border-[#e2e7fb] bg-[#f8faff]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
          <Eyebrow>Model registry</Eyebrow>
          <h1 className="mt-6 max-w-5xl text-5xl font-semibold leading-[1.04] tracking-normal text-[#06130c] md:text-7xl">
            Trading model products, sourced from live telemetry
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-[#46554b] md:text-lg">
            Browse registered strategies with source-backed metrics. Missing performance values remain
            unavailable until repository logs publish the required observations.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <SectionCard className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#647269]" />
              <input
                type="text"
                placeholder="Filter by model, strategy, tag, or repository..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-md border border-[#cbd5ff] bg-white py-3 pl-12 pr-4 text-sm text-[#06130c] outline-none focus:border-[#3d52da]"
              />
            </div>

            <div className="flex min-w-0 items-center gap-2 overflow-x-auto">
              <Filter className="h-4 w-4 shrink-0 text-[#3d52da]" />
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`shrink-0 rounded-md border px-3 py-2 text-xs font-bold transition ${
                    selectedCategory === category
                      ? 'border-[#3d52da] bg-[#eef2ff] text-[#3d52da]'
                      : 'border-[#e2e7fb] bg-white text-[#46554b] hover:bg-[#f7f8ff]'
                  }`}
                >
                  {category === 'all' ? 'All models' : categoryLabel(category)}
                </button>
              ))}
            </div>
          </div>
        </SectionCard>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        {isLoading && (
          <ApiLoadingPanel
            title="Loading model marketplace"
            body="Preparing registered strategies, source metrics, categories, and model access details."
            items={['Registered models', 'Source metrics', 'Access details']}
          />
        )}

        {error && (
          <EmptyState
            title="Model registry unavailable"
            body="The model list API did not respond successfully. Reload the page or check the API connection."
          />
        )}

        {!isLoading && !error && filteredModels.length === 0 && (
          <EmptyState
            title="No matching models"
            body="Try a broader search or choose a different category."
          />
        )}

        {!isLoading && !error && filteredModels.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredModels.map((model) => (
              <Link key={model.id} href={`/marketplace/${model.slug}`} className="group">
                <SectionCard className="flex h-full flex-col p-6 transition group-hover:border-[#3d52da]">
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-md border border-[#c7d2fe] bg-[#eef2ff] px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-[#3d52da]">
                      {categoryLabel(model.category)}
                    </span>
                    <ArrowRight className="h-4 w-4 text-[#3d52da] transition group-hover:translate-x-1" />
                  </div>

                  <h2 className="mt-5 text-xl font-semibold text-[#06130c]">{model.name}</h2>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#5a685f]">{model.description}</p>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <Metric label="Sharpe" value={formatNum(model.performance.sharpeRatio)} />
                    <Metric label="Annualized" value={formatPct(model.performance.annualizedReturn, true)} />
                    <Metric label="Drawdown" value={formatPct(model.performance.maxDrawdown, true)} />
                    <Metric label="Win rate" value={formatPct(model.performance.winRate)} />
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {model.tags.slice(0, 5).map((tag) => (
                      <span key={tag} className="rounded-md border border-[#e2e7fb] bg-[#fbfcff] px-2 py-1 text-xs text-[#647269]">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto border-t border-[#e2e7fb] pt-5">
                    <div className="text-xs font-bold uppercase tracking-wide text-[#647269]">Access</div>
                    <div className="mt-1 text-sm font-semibold text-[#06130c]">
                      {model.pricing || 'Pricing not returned by API'}
                    </div>
                  </div>
                </SectionCard>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="border-y border-[#e2e7fb] bg-[#f8faff]">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:px-6 md:grid-cols-3">
          <InfoCard icon={<Database className="h-5 w-5" />} title="Registry-backed">
            Names, categories, repositories, and log paths are sourced through the live model API.
          </InfoCard>
          <InfoCard icon={<BarChart3 className="h-5 w-5" />} title="No synthetic metrics">
            Performance values remain unavailable until the model has enough source observations.
          </InfoCard>
          <InfoCard icon={<ShieldCheck className="h-5 w-5" />} title="Audit context">
            Detail pages preserve source, status, and latest telemetry fields for review.
          </InfoCard>
        </div>
      </section>
    </PageShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[#e2e7fb] bg-[#fbfcff] p-3">
      <div className="text-[11px] font-bold uppercase tracking-wide text-[#647269]">{label}</div>
      <div className="mt-1 text-sm font-semibold text-[#06130c]">{value}</div>
    </div>
  );
}

function InfoCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <SectionCard className="p-6">
      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#eef2ff] text-[#3d52da]">{icon}</span>
      <h2 className="mt-5 text-xl font-semibold text-[#06130c]">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-[#5a685f]">{children}</p>
    </SectionCard>
  );
}
