import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms and Conditions | Qsentia',
  description: 'Terms and conditions governing access and use of the Qsentia platform.',
};

export default function TermsAndConditionsPage() {
  return (
    <main className="min-h-screen bg-[#050712] text-[#e9ecff]">
      <section className="border-b border-white/10 bg-[#06091c]/70">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <Link href="/" className="text-sm text-indigo-300 transition-colors hover:text-indigo-200">
            Back to Home
          </Link>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">Terms and Conditions</h1>
          <p className="mt-3 text-sm text-slate-400">Effective Date: May 2026</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-10 md:py-14">
        <div className="space-y-8 text-sm leading-8 text-slate-200 md:text-base">
          <section>
            <h2 className="text-xl font-semibold text-white">1. Acceptance of Terms</h2>
            <p className="mt-3">
              By accessing or using QSentia, you agree to be bound by these Terms and Conditions and all applicable laws.
              If you do not agree with any part of these terms, you should discontinue use of the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">2. Platform Purpose</h2>
            <p className="mt-3">
              QSentia is provided for research, educational, and informational purposes. The platform presents simulated,
              backtested, and paper-trading strategy information unless explicitly stated otherwise.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">3. No Brokerage or Custody Services</h2>
            <p className="mt-3">
              QSentia does not hold customer funds, custody assets, execute trades for users, or provide brokerage account services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">4. User Responsibilities</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Use the platform lawfully and responsibly.</li>
              <li>Do not submit malicious, unlawful, or harmful content.</li>
              <li>Do not upload sensitive credentials or confidential data.</li>
              <li>Maintain control of your account credentials and access methods.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">5. Intellectual Property</h2>
            <p className="mt-3">
              Platform content, code, data organization, and branding elements are protected by applicable intellectual property
              laws. Unauthorized copying, resale, or redistribution is prohibited unless explicitly permitted.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">6. Third-Party Services</h2>
            <p className="mt-3">
              QSentia may rely on third-party infrastructure and integrations, including cloud providers, code hosting,
              market data vendors, and paper-trading APIs. Availability and behavior of such services are governed by their
              own terms and privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">7. No Financial Advice</h2>
            <p className="mt-3">
              Nothing on QSentia constitutes investment, legal, tax, accounting, or financial advice. You are solely responsible
              for your investment and risk decisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">8. Disclaimers and Limitation of Liability</h2>
            <p className="mt-3">
              The platform is provided on an "as is" and "as available" basis without warranties of any kind. QSentia and its
              operators are not liable for direct or indirect losses, including trading losses, business interruption, data issues,
              or reliance on hypothetical and simulated outputs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">9. Modifications</h2>
            <p className="mt-3">
              We may modify these terms at any time. Continued use of QSentia after updates constitutes acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">10. Contact</h2>
            <p className="mt-3">
              For terms-related inquiries, use official QSentia website or repository contact channels.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
