import type { Metadata } from 'next';
import Link from 'next/link';
import ScrollSpyOutline from '@/components/ScrollSpyOutline';

export const metadata: Metadata = {
  title: 'Privacy Policy | Qsentia',
  description: 'Qsentia privacy policy and platform data handling disclosures.',
};

const outlineItems = [
  { id: 'overview', label: 'Overview' },
  { id: 'information-we-collect', label: 'Information We Collect' },
  { id: 'paper-trading-and-simulated-data', label: 'Paper Trading And Simulated Data' },
  { id: 'use-of-third-party-services', label: 'Use Of Third-Party Services' },
  { id: 'data-security', label: 'Data Security' },
  { id: 'cookies-and-analytics', label: 'Cookies And Analytics' },
  { id: 'no-financial-advice', label: 'No Financial Advice' },
  { id: 'limitation-of-liability', label: 'Limitation Of Liability' },
  { id: 'changes-to-this-policy', label: 'Changes To This Policy' },
  { id: 'contact', label: 'Contact' },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#050712] text-[#e9ecff]">
      <section className="border-b border-white/10 bg-[#06091c]/70">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <Link href="/" className="text-sm text-indigo-300 transition-colors hover:text-indigo-200">
            Back to Home
          </Link>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">Privacy Policy</h1>
          <p className="mt-3 text-sm text-slate-400">Last Updated: May 2026</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[250px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <ScrollSpyOutline items={outlineItems} />
          </aside>

          <div className="space-y-8 text-sm leading-8 text-slate-200 md:text-base">
          <section id="overview" className="scroll-mt-24">
            <h2 className="text-xl font-semibold text-white">1. Overview</h2>
            <p className="mt-3">
              QSentia is a research and analytics platform that displays simulated and paper-trading investment strategy performance.
              The platform is intended for educational, research, and informational purposes only.
            </p>
            <p className="mt-3">
              QSentia does not manage customer funds, custody assets, execute trades on behalf of users, or provide brokerage services.
            </p>
          </section>

          <section id="information-we-collect" className="scroll-mt-24">
            <h2 className="text-xl font-semibold text-white">2. Information We Collect</h2>
            <p className="mt-3">We may collect limited technical and usage information, including:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Browser type and device information</li>
              <li>IP address and approximate geographic region</li>
              <li>Website usage analytics and interaction data</li>
              <li>Authentication or login-related information if applicable</li>
              <li>Voluntarily submitted contact information</li>
            </ul>
            <p className="mt-3">
              We do not collect or store brokerage account credentials, banking information, or payment card information on the platform.
            </p>
          </section>

          <section id="paper-trading-and-simulated-data" className="scroll-mt-24">
            <h2 className="text-xl font-semibold text-white">3. Paper Trading and Simulated Data</h2>
            <p className="mt-3">
              The strategies and portfolio data displayed on QSentia are based on simulated or paper-trading environments unless
              explicitly stated otherwise. No real-money investment accounts are managed through the platform.
            </p>
            <p className="mt-3">Performance data shown may include:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Simulated portfolio returns</li>
              <li>Backtested strategy results</li>
              <li>Paper trading results</li>
              <li>Hypothetical allocation models</li>
              <li>AI-generated research outputs</li>
            </ul>
            <p className="mt-3">These results do not represent actual client investment performance.</p>
          </section>

          <section id="use-of-third-party-services" className="scroll-mt-24">
            <h2 className="text-xl font-semibold text-white">4. Use of Third-Party Services</h2>
            <p className="mt-3">QSentia may integrate with third-party services including:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Interactive Brokers paper trading environments</li>
              <li>Alpaca paper trading APIs</li>
              <li>GitHub</li>
              <li>Vercel</li>
              <li>Cloud hosting providers</li>
              <li>Financial market data providers</li>
            </ul>
            <p className="mt-3">These services maintain their own privacy policies and terms.</p>
          </section>

          <section id="data-security" className="scroll-mt-24">
            <h2 className="text-xl font-semibold text-white">5. Data Security</h2>
            <p className="mt-3">
              Reasonable efforts are made to secure platform infrastructure and data. However, no internet-based system can
              guarantee absolute security.
            </p>
            <p className="mt-3">Users should not upload sensitive personal, financial, or confidential information to the platform.</p>
          </section>

          <section id="cookies-and-analytics" className="scroll-mt-24">
            <h2 className="text-xl font-semibold text-white">6. Cookies and Analytics</h2>
            <p className="mt-3">
              The platform may use cookies, analytics tools, and similar technologies to improve performance, monitor usage, and
              enhance the user experience.
            </p>
          </section>

          <section id="no-financial-advice" className="scroll-mt-24">
            <h2 className="text-xl font-semibold text-white">7. No Financial Advice</h2>
            <p className="mt-3">Information displayed on QSentia does not constitute:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Investment advice</li>
              <li>Financial planning advice</li>
              <li>Tax advice</li>
              <li>Legal advice</li>
              <li>Trading recommendations</li>
            </ul>
            <p className="mt-3">Users are solely responsible for their own investment decisions.</p>
          </section>

          <section id="limitation-of-liability" className="scroll-mt-24">
            <h2 className="text-xl font-semibold text-white">8. Limitation of Liability</h2>
            <p className="mt-3">QSentia and its operators are not liable for:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Financial losses</li>
              <li>Trading losses</li>
              <li>Data inaccuracies</li>
              <li>Downtime or interruptions</li>
              <li>Reliance on simulated or hypothetical results</li>
            </ul>
            <p className="mt-3">Use of the platform is at the user&apos;s own risk.</p>
          </section>

          <section id="changes-to-this-policy" className="scroll-mt-24">
            <h2 className="text-xl font-semibold text-white">9. Changes to This Policy</h2>
            <p className="mt-3">
              This Privacy Policy may be updated periodically without prior notice. Continued use of the platform constitutes
              acceptance of any updated terms.
            </p>
          </section>

          <section id="contact" className="scroll-mt-24">
            <h2 className="text-xl font-semibold text-white">10. Contact</h2>
            <p className="mt-3">
              For questions regarding this Privacy Policy, contact the platform administrator through the official QSentia website
              or repository contact channels.
            </p>
          </section>
          </div>
        </div>
      </section>
    </main>
  );
}
