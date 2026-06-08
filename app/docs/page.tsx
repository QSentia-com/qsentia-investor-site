import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, KeyRound, ShieldCheck, Workflow } from 'lucide-react';
import { Eyebrow, PageShell, SectionCard } from '@/components/PageChrome';

export const metadata: Metadata = {
  title: 'Docs | Qsentia API Integration Guide',
  description: 'Professional guide for integrating Qsentia APIs, model endpoints, and implementation workflow.',
};

const quickSteps = [
  'Confirm the base URL and environment.',
  'Validate connectivity with GET /api/dashboard.',
  'Load the model list with GET /api/models.',
  'Fetch model detail with GET /api/models/{slug}.',
  'Call POST /api/models/{slug}/demo only for controlled previews.',
];

const endpointCards = [
  ['GET /api/dashboard', 'Live telemetry, performance metrics, and dashboard state.'],
  ['GET /api/models', 'Marketplace model list sourced from live dashboard mapping.'],
  ['GET /api/models/{slug}', 'Single-model detail for model profile and statistics pages.'],
  ['POST /api/models/{slug}/demo', 'Latest decision preview, rate-limited per client session.'],
] as const;

export default function DocsPage() {
  return (
    <PageShell active="/docs">
      <section className="border-b border-[#e2e7fb] bg-[#f8faff]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
          <Eyebrow>Integration guide</Eyebrow>
          <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[1.04] tracking-normal text-[#06130c] md:text-7xl">
            Qsentia API docs
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-[#46554b] md:text-lg">
            Integrate the current live endpoints, structure a production-safe workflow, and keep
            preview and telemetry routes within operational limits.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_1fr]">
        <SectionCard className="p-6">
          <div className="flex items-center gap-2 text-[#3d52da]">
            <Workflow className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wide">Quickstart flow</span>
          </div>
          <ol className="mt-5 space-y-3 text-sm leading-6 text-[#26352c]">
            {quickSteps.map((step, index) => (
              <li key={step} className="rounded-md border border-[#e2e7fb] bg-[#fbfcff] px-4 py-3">
                <span className="mr-2 font-bold text-[#3d52da]">{index + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </SectionCard>

        <SectionCard className="p-6">
          <div className="flex items-center gap-2 text-[#3d52da]">
            <KeyRound className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wide">Authentication notes</span>
          </div>
          <div className="mt-5 space-y-4 text-sm leading-7 text-[#5a685f]">
            <p>
              These site endpoints are served on the same origin for platform use. If private API
              credentials are enabled, inject keys server-side and forward requests through your backend.
            </p>
            <p>
              Do not expose private tokens in browser code. Store secrets in environment variables and
              rotate them according to your internal security policy.
            </p>
          </div>
        </SectionCard>
      </section>

      <section className="border-y border-[#e2e7fb] bg-[#f8faff]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <h2 className="text-3xl font-semibold text-[#06130c]">Current endpoints</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {endpointCards.map(([route, purpose]) => (
              <SectionCard key={route} className="p-5">
                <h3 className="font-mono text-sm font-semibold text-[#06130c]">{route}</h3>
                <p className="mt-3 text-sm leading-6 text-[#5a685f]">{purpose}</p>
              </SectionCard>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_1fr]">
        <SectionCard className="p-6">
          <h2 className="text-2xl font-semibold text-[#06130c]">Sample requests</h2>
          <div className="mt-5 space-y-4">
            {[
              'curl -X GET https://your-domain.com/api/models',
              'curl -X GET https://your-domain.com/api/models/crypto_sentiment_mlp',
              'curl -X POST https://your-domain.com/api/models/crypto_sentiment_mlp/demo',
            ].map((code) => (
              <pre key={code} className="overflow-x-auto rounded-md bg-[#07112a] p-4 text-xs text-[#dbe4ff]">
                {code}
              </pre>
            ))}
          </div>
        </SectionCard>

        <SectionCard className="p-6">
          <div className="flex items-center gap-2 text-[#3d52da]">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wide">Production checklist</span>
          </div>
          <ul className="mt-5 space-y-3 text-sm leading-6 text-[#26352c]">
            <li className="rounded-md border border-[#e2e7fb] bg-[#fbfcff] px-4 py-3">Apply retry logic and timeout controls for upstream API calls.</li>
            <li className="rounded-md border border-[#e2e7fb] bg-[#fbfcff] px-4 py-3">Cache model list/detail responses where freshness allows.</li>
            <li className="rounded-md border border-[#e2e7fb] bg-[#fbfcff] px-4 py-3">Respect preview route limits and avoid high-frequency polling.</li>
            <li className="rounded-md border border-[#e2e7fb] bg-[#fbfcff] px-4 py-3">Show fallback states when telemetry is delayed or unavailable.</li>
          </ul>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/contact" className="inline-flex items-center justify-center gap-2 rounded-md bg-[#172554] px-5 py-3 text-sm font-bold text-white hover:bg-[#2437b5]">
              Request support
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/marketplace" className="inline-flex items-center justify-center rounded-md border border-[#cbd5ff] px-5 py-3 text-sm font-bold text-[#172554] hover:bg-[#f7f8ff]">
              View models
            </Link>
          </div>
        </SectionCard>
      </section>
    </PageShell>
  );
}
