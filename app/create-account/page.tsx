import type { Metadata } from 'next';
import Link from 'next/link';
import QSentiaMotionBackground from '@/components/QSentiaMotionBackground';
import { ArrowRight, Building2, FileCheck2, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Create Account | Qsentia',
  description: 'Create a Qsentia account for platform access and institutional onboarding.',
};

const onboardingSteps = [
  'Submit your professional identity and organization details',
  'Provide intended use case and platform area of interest',
  'Complete verification and receive access confirmation',
];

export default function CreateAccountPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050712] text-[#e9ecff] selection:bg-cyan-500/30 selection:text-white">
      <QSentiaMotionBackground />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[5%] right-[-10%] h-[460px] w-[460px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute bottom-[-15%] left-[-8%] h-[420px] w-[420px] rounded-full bg-indigo-600/12 blur-[120px]" />
      </div>

      <header className="relative z-20 border-b border-white/8 bg-[#06091c]/65 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3 text-white transition-colors hover:text-cyan-300">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-sm font-semibold">
              Q
            </div>
            <div>
              <div className="text-xl font-semibold tracking-tight">Qsentia</div>
              <div className="text-[10px] font-mono uppercase tracking-[0.26em] text-cyan-300">Account Creation</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <Link href="/marketplace" className="transition-colors hover:text-white">Marketplace</Link>
            <Link href="/dashboard" className="transition-colors hover:text-white">Dashboard</Link>
            <Link href="/signin" className="transition-colors hover:text-white">Sign In</Link>
          </nav>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-[1.04fr_0.96fr] md:py-24">
        <div className="rounded-3xl border border-white/10 bg-[#0a0f2c]/65 p-8 backdrop-blur-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-4 py-2 text-[11px] font-mono uppercase tracking-[0.24em] text-cyan-200">
            <FileCheck2 className="h-4 w-4" />
            New Account Request
          </div>

          <h1 className="mt-6 text-4xl font-medium tracking-[-0.04em] text-white md:text-5xl">
            Create your Qsentia account
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 md:text-base">
            Register for platform access, live dashboards, and model workflows. Use your professional details to align your account with your organization.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-cyan-400/40 hover:bg-white/10"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.9-5.4 3.9-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.6 3.7 14.5 3 12 3 7 3 3 7 3 12s4 9 9 9c5.2 0 8.6-3.6 8.6-8.7 0-.6-.1-1.1-.2-1.5H12z" />
                <path fill="#34A853" d="M3 12c0 1.8.7 3.5 1.9 4.8l3-2.3c-.8-.7-1.2-1.7-1.2-2.8s.4-2.1 1.2-2.8l-3-2.3C3.7 8.5 3 10.2 3 12z" />
                <path fill="#FBBC05" d="M12 21c2.4 0 4.5-.8 6-2.3l-2.9-2.2c-.8.5-1.8.8-3.1.8-2.4 0-4.5-1.6-5.2-3.8l-3 2.3C5.3 18.9 8.3 21 12 21z" />
                <path fill="#4285F4" d="M18 18.7c1.7-1.6 2.6-3.9 2.6-6.7 0-.6-.1-1.1-.2-1.5H12v3.9h5.4c-.2 1-.8 2.1-1.8 2.9l2.4 1.4z" />
              </svg>
              Continue with Google
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-cyan-400/40 hover:bg-white/10"
            >
              <svg className="h-5 w-5 fill-white" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 .5C5.6.5.5 5.6.5 12c0 5.1 3.3 9.4 7.8 10.9.6.1.8-.3.8-.6v-2.2c-3.2.7-3.9-1.3-3.9-1.3-.5-1.3-1.3-1.7-1.3-1.7-1.1-.8.1-.8.1-.8 1.2.1 1.9 1.3 1.9 1.3 1.1 1.9 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.5-.3-5.2-1.2-5.2-5.5 0-1.2.4-2.2 1.1-3-.1-.3-.5-1.4.1-2.9 0 0 1-.3 3.1 1.1.9-.2 1.8-.3 2.7-.3s1.8.1 2.7.3c2.1-1.4 3.1-1.1 3.1-1.1.6 1.5.2 2.6.1 2.9.7.8 1.1 1.8 1.1 3 0 4.3-2.7 5.2-5.2 5.5.4.3.8 1 .8 2v2.9c0 .3.2.7.8.6 4.5-1.5 7.8-5.8 7.8-10.9C23.5 5.6 18.4.5 12 .5z" />
              </svg>
              Continue with GitHub
            </button>
          </div>

          <div className="mt-6 grid gap-4">
            <label className="text-xs font-mono uppercase tracking-[0.18em] text-slate-400" htmlFor="fullName">
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="Your full name"
              className="rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition-colors focus:border-cyan-400/60"
            />

            <label className="mt-2 text-xs font-mono uppercase tracking-[0.18em] text-slate-400" htmlFor="workEmail">
              Work email
            </label>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                id="workEmail"
                type="email"
                placeholder="name@institution.com"
                className="rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition-colors focus:border-cyan-400/60"
              />
              <button
                type="button"
                className="rounded-xl border border-cyan-500/30 bg-cyan-500/12 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200 transition-colors hover:border-cyan-400/40 hover:bg-cyan-500/20"
              >
                Get OTP
              </button>
            </div>

            <label className="mt-2 text-xs font-mono uppercase tracking-[0.18em] text-slate-400" htmlFor="country">
              Country
            </label>
            <select
              id="country"
              className="rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-cyan-400/60"
              defaultValue=""
            >
              <option value="" disabled className="bg-[#0a0f2c] text-slate-400">Select country</option>
              <option value="india" className="bg-[#0a0f2c] text-white">India</option>
              <option value="united-states" className="bg-[#0a0f2c] text-white">United States</option>
              <option value="united-kingdom" className="bg-[#0a0f2c] text-white">United Kingdom</option>
              <option value="singapore" className="bg-[#0a0f2c] text-white">Singapore</option>
              <option value="uae" className="bg-[#0a0f2c] text-white">UAE</option>
              <option value="other" className="bg-[#0a0f2c] text-white">Other</option>
            </select>

            <label className="mt-2 text-xs font-mono uppercase tracking-[0.18em] text-slate-400" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Create password"
              className="rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition-colors focus:border-cyan-400/60"
            />

            <label className="mt-2 text-xs font-mono uppercase tracking-[0.18em] text-slate-400" htmlFor="confirmPassword">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm password"
              className="rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition-colors focus:border-cyan-400/60"
            />

            <button
              type="button"
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_0_28px_rgba(6,182,212,0.28)] transition-transform hover:translate-y-[-1px]"
            >
              Create Account
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-6 text-sm text-slate-400">
            Already registered?{' '}
            <Link href="/signin" className="font-medium text-cyan-300 transition-colors hover:text-cyan-200">
              Sign in here
            </Link>
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#0a0f2c]/50 p-8 backdrop-blur-xl">
          <div className="text-xs font-mono uppercase tracking-[0.24em] text-slate-500">Onboarding flow</div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">Professional verification track</h2>
          <ul className="mt-6 space-y-3">
            {onboardingSteps.map((step) => (
              <li key={step} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-7 text-slate-200">
                {step}
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-cyan-300">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-sm font-semibold">Security policy</span>
              </div>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Never send passwords, API keys, broker credentials, or private tokens through unsecured channels.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-cyan-300">
                <Building2 className="h-4 w-4" />
                <span className="text-sm font-semibold">Institutional context</span>
              </div>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Include your organization profile and scope of interest for faster routing and setup.
              </p>
            </div>
          </div>

          <Link
            href="/contact"
            className="mt-6 inline-flex items-center gap-2 text-sm text-slate-300 transition-colors hover:text-white"
          >
            Need onboarding help? Contact the team
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
