import type { Metadata } from 'next';
import { PageShell, SectionCard } from '@/components/PageChrome';

export const metadata: Metadata = {
  title: 'Privacy Policy | Qsentia',
  description: 'Qsentia privacy policy and platform data handling disclosures.',
};

const sections = [
  ['Overview', 'Qsentia is a research and analytics platform that displays simulated and paper-trading investment strategy performance for educational, research, and informational purposes.'],
  ['Information we collect', 'We may collect limited technical, usage, authentication, and voluntarily submitted contact information. We do not collect or store brokerage credentials, banking information, or payment card information on the platform.'],
  ['Paper trading and simulated data', 'Strategies and portfolio data may be based on simulated or paper-trading environments unless explicitly stated otherwise. These results do not represent actual client investment performance.'],
  ['Third-party services', 'Qsentia may rely on third-party infrastructure and integrations including paper-trading APIs, code hosting, cloud hosting, and market data providers. Those services maintain their own policies and terms.'],
  ['Data security', 'Reasonable efforts are made to secure infrastructure and data, but no internet-based system can guarantee absolute security. Users should not upload sensitive personal, financial, or confidential information.'],
  ['No financial advice', 'Information displayed on Qsentia does not constitute investment, financial planning, tax, legal, or trading advice. Users are responsible for their own decisions.'],
  ['Changes and contact', 'This policy may be updated periodically. For questions, contact Qsentia through the official website contact channel.'],
] as const;

export default function PrivacyPolicyPage() {
  return (
    <PageShell>
      <LegalHero title="Privacy Policy" subtitle="Last updated: May 2026" />
      <LegalBody sections={sections} />
    </PageShell>
  );
}

function LegalHero({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="border-b border-[#e2e7fb] bg-[#f8faff]">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <h1 className="text-5xl font-semibold tracking-normal text-[#06130c] md:text-6xl">{title}</h1>
        <p className="mt-3 text-sm font-semibold text-[#647269]">{subtitle}</p>
      </div>
    </section>
  );
}

function LegalBody({ sections }: { sections: ReadonlyArray<readonly [string, string]> }) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <SectionCard className="divide-y divide-[#e2e7fb]">
        {sections.map(([title, body], index) => (
          <section key={title} className="p-6">
            <h2 className="text-xl font-semibold text-[#06130c]">{index + 1}. {title}</h2>
            <p className="mt-3 text-sm leading-7 text-[#5a685f]">{body}</p>
          </section>
        ))}
      </SectionCard>
    </section>
  );
}
