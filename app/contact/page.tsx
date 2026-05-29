import type { Metadata } from 'next';
import Link from 'next/link';
import QSentiaMotionBackground from '@/components/QSentiaMotionBackground';
import {
  ArrowRight,
  Building2,
  FileText,
  Mail,
  ShieldCheck,
  Waypoints,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us | Qsentia',
  description: 'Institutional contact page for Qsentia research, platform access, due diligence, and partnership inquiries.',
};

const inquiryTracks = [
  {
    title: 'Institutional Access',
    text: 'Use this channel for allocator introductions, research access, platform walkthroughs, and general institutional outreach.',
    icon: Building2,
  },
  {
    title: 'Model Licensing',
    text: 'Reach out when evaluating deployment, model coverage, telemetry review, or commercial access to specific strategies.',
    icon: Waypoints,
  },
  {
    title: 'Due Diligence Materials',
    text: 'For diligence requests, data-room coordination, or governance questions, start from your institutional or company email address.',
    icon: FileText,
  },
  {
    title: 'Security And Compliance',
    text: 'Do not send credentials, API keys, or broker secrets by email. Use the contact channel to arrange the appropriate secure follow-up path.',
    icon: ShieldCheck,
  },
];

const prepItems = [
  'Your firm, team, or organization name',
  'Primary area of interest: marketplace, dashboard, research, or partnership',
  'Any model, strategy, or workflow you want to discuss',
  'Target deployment or evaluation timeline',
  'Relevant compliance, operational, or integration constraints',
];

const resourceLinks = [
  {
    href: '/marketplace',
    label: 'Model marketplace',
    text: 'Review currently published strategies and live performance context before reaching out.',
  },
  {
    href: '/dashboard',
    label: 'Research terminal',
    text: 'Inspect the live dashboard environment and telemetry-backed operating view.',
  },
  {
    href: '/research',
    label: 'Research overview',
    text: 'Use the research page for positioning, philosophy, and broader platform framing.',
  },
];

export default function ContactPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060814] text-[#eceefb] selection:bg-[#4f46e5]/40 selection:text-white">
      <QSentiaMotionBackground />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[8%] left-[-8%] h-[460px] w-[460px] rounded-full bg-[#4f46e5]/10 blur-[130px]" />
        <div className="absolute top-[22%] right-[-10%] h-[420px] w-[420px] rounded-full bg-[#7c3aed]/10 blur-[130px]" />
        <div className="absolute bottom-[8%] left-[20%] h-[520px] w-[520px] rounded-full bg-[#00d9ff]/5 blur-[150px]" />
      </div>

      <header className="relative z-20 border-b border-white/5 bg-[#080b20]/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3 text-white transition-colors hover:text-indigo-300">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-sm font-semibold">
              Q
            </div>
            <div>
              <div className="text-xl font-semibold tracking-tight">Qsentia</div>
              <div className="text-[10px] font-mono uppercase tracking-[0.28em] text-indigo-300">Contact Desk</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <Link href="/" className="transition-colors hover:text-white">Home</Link>
            <Link href="/marketplace" className="transition-colors hover:text-white">Marketplace</Link>
            <Link href="/dashboard" className="transition-colors hover:text-white">Dashboard</Link>
            <Link href="/research" className="transition-colors hover:text-white">Research</Link>
          </nav>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-2 text-[11px] font-mono uppercase tracking-[0.28em] text-indigo-200">
            <Mail className="h-4 w-4 text-indigo-300" />
            Institutional Contact
          </div>

          <h1 className="max-w-5xl text-5xl font-medium leading-[1.02] tracking-[-0.05em] text-white md:text-7xl">
            Contact Qsentia
          </h1>

          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 md:text-lg">
            This page is the primary published contact point for institutional access, model licensing,
            diligence coordination, and research-related outreach. Only currently published channels are listed here.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl border border-white/8 bg-[#0a0d24]/70 p-8 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-3 text-indigo-300">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-mono uppercase tracking-[0.24em] text-slate-500">Primary channel</div>
                <div className="text-xl font-semibold text-white">Institutional inquiries inbox</div>
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/8 p-5">
              <div className="text-[11px] font-mono uppercase tracking-[0.24em] text-indigo-200">Email</div>
              <a
                href="mailto:inquiries@qsentia.com?subject=QSentia%20Institutional%20Inquiry"
                className="mt-2 block text-2xl font-semibold tracking-tight text-white transition-colors hover:text-indigo-300"
              >
                inquiries@qsentia.com
              </a>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                Use the published inbox for all first-contact communication. If your request involves diligence,
                secure materials, or commercial review, initiate from your institutional email address.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row">
              <a
                href="mailto:inquiries@qsentia.com?subject=QSentia%20Institutional%20Inquiry"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 px-6 py-4 text-sm font-semibold text-white shadow-[0_0_30px_rgba(79,70,229,0.28)] transition-all hover:translate-y-[-1px] hover:shadow-[0_0_40px_rgba(79,70,229,0.38)]"
              >
                Start Email Inquiry
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href="/marketplace"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-semibold text-slate-200 transition-colors hover:border-indigo-400/30 hover:text-white"
              >
                Review Platform First
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-[#0a0d24]/55 p-8 backdrop-blur-xl">
            <div className="text-xs font-mono uppercase tracking-[0.24em] text-slate-500">Before you contact us</div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">Include the operational context</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Clear initial context speeds up routing and keeps the conversation relevant to your team, use case,
              and review process.
            </p>

            <ul className="mt-6 space-y-3">
              {prepItems.map((item) => (
                <li key={item} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  <span className="mt-1 h-2 w-2 rounded-full bg-indigo-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-6 md:py-10">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {inquiryTracks.map((track) => {
            const Icon = track.icon;
            return (
              <div key={track.title} className="rounded-3xl border border-white/8 bg-[#0a0d24]/55 p-6 backdrop-blur-xl transition-colors hover:border-indigo-400/20">
                <div className="mb-4 inline-flex rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-3 text-indigo-300">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold tracking-tight text-white">{track.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{track.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl border border-white/8 bg-[#0a0d24]/65 p-8 backdrop-blur-xl">
            <div className="text-xs font-mono uppercase tracking-[0.24em] text-slate-500">Published information</div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">Professional contact notes</h2>
            <div className="mt-6 space-y-4 text-sm leading-7 text-slate-300">
              <p>
                Qsentia currently publishes its institutional inquiries email as the primary website contact route.
                A public office address or public phone channel is not listed on this site.
              </p>
              <p>
                Do not transmit passwords, broker credentials, API keys, or confidential access tokens by email.
                Initial outreach should be used to establish the correct secure workflow.
              </p>
              <p>
                If you are requesting diligence or internal review materials, reference the scope of review in your first message
                so the inquiry can be routed correctly.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-[#0a0d24]/55 p-8 backdrop-blur-xl">
            <div className="text-xs font-mono uppercase tracking-[0.24em] text-slate-500">Relevant resources</div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">Review these before outreach</h2>
            <div className="mt-6 space-y-4">
              {resourceLinks.map((resource) => (
                <Link
                  key={resource.href}
                  href={resource.href}
                  className="block rounded-2xl border border-white/8 bg-white/5 p-5 transition-colors hover:border-indigo-400/25 hover:bg-white/7"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-base font-semibold text-white">{resource.label}</div>
                      <p className="mt-2 text-sm leading-7 text-slate-300">{resource.text}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 shrink-0 text-indigo-300" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
