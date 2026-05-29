import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Disclaimer | Qsentia',
  description: 'Important legal and risk disclaimer for Qsentia users.',
};

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-[#050712] text-[#e9ecff]">
      <section className="border-b border-white/10 bg-[#06091c]/70">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <Link href="/" className="text-sm text-indigo-300 transition-colors hover:text-indigo-200">
            Back to Home
          </Link>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">Disclaimer</h1>
          <p className="mt-3 text-sm text-slate-400">Effective Date: May 2026</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-10 md:py-14">
        <div className="space-y-8 text-sm leading-8 text-slate-200 md:text-base">
          <section>
            <h2 className="text-xl font-semibold text-white">Informational Use Only</h2>
            <p className="mt-3">
              QSentia content is provided for educational, research, and informational purposes only. It should not be treated as
              professional investment, legal, accounting, tax, or financial planning advice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">Simulated and Paper-Trading Results</h2>
            <p className="mt-3">
              Performance information shown on QSentia may include backtests, simulations, paper-trading outputs, and hypothetical
              allocation models. Such results are not actual client returns and are not guarantees of future performance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">No Offer or Solicitation</h2>
            <p className="mt-3">
              Nothing on the platform constitutes an offer to sell, a solicitation to buy, or a recommendation regarding any security,
              derivative, strategy, or investment product.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">Risk Warning</h2>
            <p className="mt-3">
              Trading and investing involve substantial risk, including potential loss of principal. Market conditions may change quickly,
              and model behavior can degrade under unseen regimes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">Data and Availability</h2>
            <p className="mt-3">
              QSentia does not warrant uninterrupted availability, data completeness, or error-free operation. Platform outputs may be
              delayed, unavailable, or inaccurate due to upstream data dependencies and infrastructure constraints.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">Limitation of Liability</h2>
            <p className="mt-3">
              To the maximum extent permitted by law, QSentia and its operators are not liable for losses or damages arising from
              reliance on platform content, strategy outputs, service interruptions, or technical failures.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">User Responsibility</h2>
            <p className="mt-3">
              You are solely responsible for your own decisions, due diligence process, and compliance with applicable laws and
              regulations in your jurisdiction.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
