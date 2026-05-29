import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="relative z-10 bg-[#02040a] text-white border-t border-slate-950">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 border-b border-slate-900 pb-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex items-center gap-2 font-mono text-lg font-black tracking-tight text-white">
                <span className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-tr from-indigo-500 to-purple-500 text-xs font-serif italic text-white">Q</span>
                QSentia
              </span>
            </div>
            <p className="max-w-sm text-xs leading-relaxed text-slate-500">
              Systematic asset management and self-improving deep learning architectures. Where high complexity meets complete execution transparency.
            </p>
            <p className="mt-6 font-mono text-[10px] text-slate-600">© 2026 QSentia Core Systems. All rights registered.</p>
          </div>

          <div className="font-mono text-xs">
            <div className="mb-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Product Engine</div>
            <Link href="/marketplace" className="mb-2.5 block text-slate-500 transition-colors hover:text-white">AI Marketplace</Link>
            <Link href="/dashboard" className="mb-2.5 block text-slate-500 transition-colors hover:text-white">Telemetry Board</Link>
            <Link href="/research" className="mb-2.5 block text-slate-500 transition-colors hover:text-white">Metrics Ledger</Link>
            <Link href="/" className="block text-slate-500 transition-colors hover:text-white">Pipeline Workflow</Link>
          </div>

          <div className="font-mono text-xs">
            <div className="mb-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Account And Support</div>
            <Link href="/signin" className="mb-2.5 block text-slate-500 transition-colors hover:text-white">Sign In</Link>
            <Link href="/create-account" className="mb-2.5 block text-slate-500 transition-colors hover:text-white">Create Account</Link>
            <Link href="/contact" className="mb-2.5 block text-slate-500 transition-colors hover:text-white">Contact Desk</Link>
            <Link href="/contact" className="block text-slate-500 transition-colors hover:text-white">Security And Compliance</Link>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 pt-8 text-[10px] text-slate-600 md:flex-row md:items-center">
          <span className="max-w-3xl leading-relaxed">
            Important: Quantitative trading systems involve considerable capital risks. Model execution parameters and historical data do not assure future outcomes. Run query checks.
          </span>
          <div className="flex shrink-0 gap-4 font-mono">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms SLA</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
