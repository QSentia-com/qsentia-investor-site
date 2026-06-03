import type { Metadata } from 'next';
import { PageShell, SectionCard } from '@/components/PageChrome';

export const metadata: Metadata = {
  title: 'Terms and Conditions | Qsentia',
  description: 'Terms and conditions governing access and use of the Qsentia platform.',
};

const sections = [
  ['Acceptance of terms', 'By accessing or using Qsentia, you agree to be bound by these terms and applicable laws. If you do not agree, discontinue use of the platform.'],
  ['Platform purpose', 'Qsentia is provided for research, educational, and informational purposes. It may present simulated, backtested, and paper-trading strategy information unless explicitly stated otherwise.'],
  ['No brokerage or custody services', 'Qsentia does not hold customer funds, custody assets, execute trades for users, or provide brokerage account services.'],
  ['User responsibilities', 'Use the platform lawfully, do not submit harmful content, do not upload sensitive credentials, and maintain control of account access.'],
  ['Intellectual property', 'Platform content, code, data organization, and branding are protected by applicable intellectual property laws. Unauthorized copying, resale, or redistribution is prohibited unless explicitly permitted.'],
  ['Third-party services', 'Qsentia may rely on third-party infrastructure, code hosting, market data vendors, and paper-trading APIs. Availability and behavior of those services are governed by their own terms.'],
  ['No financial advice', 'Nothing on Qsentia constitutes investment, legal, tax, accounting, or financial advice. You are solely responsible for your investment and risk decisions.'],
  ['Disclaimers and liability', 'The platform is provided as is and as available without warranties of any kind. Qsentia and its operators are not liable for losses arising from reliance on simulated outputs, service interruptions, or data issues.'],
  ['Modifications and contact', 'Terms may be modified at any time. For terms-related inquiries, use the official Qsentia website contact channel.'],
] as const;

export default function TermsAndConditionsPage() {
  return (
    <PageShell>
      <LegalHero title="Terms and Conditions" subtitle="Effective date: May 2026" />
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
