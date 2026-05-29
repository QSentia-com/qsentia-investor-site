import type { Metadata } from 'next';
import Link from 'next/link';
import QSentiaMotionBackground from '@/components/QSentiaMotionBackground';
import { ArrowRight, BookOpenText, KeyRound, ShieldCheck, Workflow } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Docs | Qsentia API Integration Guide',
  description: 'Professional guide for integrating Qsentia APIs, model endpoints, and implementation workflow.',
};

const quickSteps = [
  'Confirm your base URL and environment setup.',
  'Validate dashboard connectivity with a health-style fetch to /api/dashboard.',
  'Load models from /api/models and bind user selection to model slug.',
  'Fetch model details via /api/models/{slug} before rendering detail screens.',
  'Call /api/models/{slug}/demo only for controlled previews due rate limits.',
];

const endpointCards = [
  {
    route: 'GET /api/dashboard',
    purpose: 'Live telemetry, performance metrics, and dashboard state.',
    cache: 'dynamic telemetry response; designed for periodic refresh polling.',
  },
  {
    route: 'GET /api/models',
    purpose: 'Marketplace model list sourced from live dashboard mapping.',
    cache: 'public with revalidation headers (s-maxage and stale-while-revalidate).',
  },
  {
    route: 'GET /api/models/{slug}',
    purpose: 'Single-model details for model profile and statistics pages.',
    cache: 'public with revalidation headers (s-maxage and stale-while-revalidate).',
  },
  {
    route: 'POST /api/models/{slug}/demo',
    purpose: 'Live signal preview from latest decision telemetry for a selected model.',
    cache: 'non-cache preview path with request limiting (5 calls per hour per IP).',
  },
];

export default function DocsPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050712] text-[#e9ecff] selection:bg-indigo-500/30 selection:text-white">
      <QSentiaMotionBackground />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8%] top-[-12%] h-[420px] w-[420px] rounded-full bg-indigo-600/12 blur-[130px]" />
        <div className="absolute bottom-[-14%] right-[-8%] h-[460px] w-[460px] rounded-full bg-cyan-500/10 blur-[140px]" />
      </div>

      <header className="relative z-20 border-b border-white/8 bg-[#06091c]/65 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3 text-white transition-colors hover:text-indigo-300">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-sm font-semibold">
              Q
            </div>
            <div>
              <div className="text-xl font-semibold tracking-tight">Qsentia</div>
              <div className="text-[10px] font-mono uppercase tracking-[0.26em] text-indigo-300">API Docs</div>
            </div>
          </Link>

          <div className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <Link href="/marketplace" className="transition-colors hover:text-white">Marketplace</Link>
            <Link href="/dashboard" className="transition-colors hover:text-white">Dashboard</Link>
            <Link href="/contact" className="transition-colors hover:text-white">Contact</Link>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-16 pb-10 md:pt-24">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/25 bg-indigo-500/12 px-4 py-2 text-[11px] font-mono uppercase tracking-[0.24em] text-indigo-200">
          <BookOpenText className="h-4 w-4" />
          Integration Guide
        </div>

        <h1 className="mt-6 max-w-5xl text-4xl font-medium tracking-[-0.04em] text-white md:text-6xl">
          Qsentia API Integration Docs
        </h1>

        <p className="mt-5 max-w-4xl text-sm leading-8 text-slate-300 md:text-base">
          This guide is designed for professional onboarding after receiving API access context. It explains how to integrate
          current live endpoints, structure a production-safe workflow, and avoid misuse of preview and telemetry data paths.
        </p>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-6 md:py-10">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl border border-white/10 bg-[#0a0f2c]/65 p-7 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-indigo-300">
              <Workflow className="h-4 w-4" />
              <span className="text-xs font-mono uppercase tracking-[0.2em]">Quickstart flow</span>
            </div>
            <ol className="mt-5 space-y-3 text-sm leading-7 text-slate-200">
              {quickSteps.map((step, index) => (
                <li key={step} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <span className="mr-2 text-indigo-300">{index + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0a0f2c]/50 p-7 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-indigo-300">
              <KeyRound className="h-4 w-4" />
              <span className="text-xs font-mono uppercase tracking-[0.2em]">Authentication notes</span>
            </div>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-300">
              <p>
                These site endpoints are currently served on the same origin for platform use. If your deployment enables
                private API credentials, inject your key server-side and forward requests through your backend proxy.
              </p>
              <p>
                Do not expose private tokens in browser code. Keep API keys in environment variables and rotate them
                according to your internal security policy.
              </p>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 font-mono text-xs text-slate-300">
                <p>Example secure pattern</p>
                <p className="mt-2">1. Client - your backend - Qsentia API</p>
                <p>2. Store secrets only on your backend runtime</p>
                <p>3. Validate route-level permissions before forwarding requests</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-6 md:py-10">
        <div className="rounded-3xl border border-white/10 bg-[#0a0f2c]/55 p-7 backdrop-blur-xl">
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-slate-400">Current endpoints</div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {endpointCards.map((endpoint) => (
              <article key={endpoint.route} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h2 className="text-base font-semibold text-white">{endpoint.route}</h2>
                <p className="mt-2 text-sm leading-7 text-slate-300">{endpoint.purpose}</p>
                <p className="mt-3 text-xs leading-6 text-slate-400">{endpoint.cache}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-6 md:py-10">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-[#0a0f2c]/60 p-7 backdrop-blur-xl">
            <h2 className="text-2xl font-semibold tracking-tight text-white">Sample requests</h2>
            <div className="mt-4 space-y-4">
              <pre className="overflow-x-auto rounded-2xl border border-white/10 bg-[#06091c] p-4 text-xs text-slate-200">
{`curl -X GET https://your-domain.com/api/models`}
              </pre>
              <pre className="overflow-x-auto rounded-2xl border border-white/10 bg-[#06091c] p-4 text-xs text-slate-200">
{`curl -X GET https://your-domain.com/api/models/qsentia_brppo_macro_rotation_alpaca`}
              </pre>
              <pre className="overflow-x-auto rounded-2xl border border-white/10 bg-[#06091c] p-4 text-xs text-slate-200">
{`curl -X POST https://your-domain.com/api/models/qsentia_brppo_macro_rotation_alpaca/demo`}
              </pre>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0a0f2c]/50 p-7 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-indigo-300">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-xs font-mono uppercase tracking-[0.2em]">Production checklist</span>
            </div>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-200">
              <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">Apply retry logic and timeout controls for upstream API calls.</li>
              <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">Cache model list/detail responses where freshness allows.</li>
              <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">Respect preview route limits and avoid high-frequency polling on demo endpoint.</li>
              <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">Log request IDs and timestamps for operational incident traceability.</li>
              <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">Show fallback states in UI when telemetry is delayed or unavailable.</li>
            </ul>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/contact" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-5 py-3 text-sm font-semibold text-white transition-transform hover:translate-y-[-1px]">
                Request Integration Support
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/marketplace" className="inline-flex items-center justify-center rounded-xl border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/10">
                View Live Models
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
