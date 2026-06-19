import type { Metadata } from 'next';
import { PageShell, SectionCard } from '@/components/PageChrome';

export const metadata: Metadata = {
  title: 'Disclaimer | Qsentia',
  description: 'Important legal and risk disclaimer for Qsentia users.',
};

const sections = [
  ['Informational use only', 'Qsentia content is provided for educational, research, and informational purposes only. It should not be treated as professional investment, legal, accounting, tax, or financial planning advice.'],
  ['Simulated and paper-trading results', 'Performance information may include backtests, simulations, paper-trading outputs, and hypothetical allocation models. Such results are not actual client returns and are not guarantees of future performance.'],
  ['No offer or solicitation', 'Nothing on the platform constitutes an offer to sell, a solicitation to buy, or a recommendation regarding any security, derivative, strategy, or investment product.'],
  ['Risk warning', 'Trading and investing involve substantial risk, including potential loss of principal. Market conditions may change quickly, and model behavior can degrade under unseen regimes.'],
  ['Automated execution', 'Broker connections, schedulers, APIs, and automated order workflows introduce operational, connectivity, credential, slippage, liquidity, model, and human-oversight risks. Paper validation, capital limits, monitoring, approvals, and an accessible kill switch are essential but cannot eliminate loss.'],
  ['Regulatory status', 'QSentia does not represent that publication of research, model access, software, or telemetry constitutes registration as an investment adviser, broker, portfolio manager, exchange, or other regulated financial intermediary. The applicable operating model must be reviewed for each jurisdiction before live service.'],
  ['Data and availability', 'Qsentia does not warrant uninterrupted availability, data completeness, or error-free operation. Platform outputs may be delayed, unavailable, or inaccurate due to upstream dependencies.'],
  ['Limitation of liability', 'To the maximum extent permitted by law, Qsentia and its operators are not liable for losses or damages arising from reliance on platform content, strategy outputs, service interruptions, or technical failures.'],
  ['User responsibility', 'You are solely responsible for your own decisions, due diligence process, and compliance with applicable laws and regulations in your jurisdiction.'],
] as const;

export default function DisclaimerPage() {
  return (
    <PageShell>
      <LegalHero title="Disclaimer" subtitle="Effective date: May 2026" />
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
