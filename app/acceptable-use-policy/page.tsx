import type { Metadata } from 'next';
import PolicyDocument, { type PolicySection } from '@/components/PolicyDocument';

export const metadata: Metadata = {
  title: 'Acceptable Use Policy | QSentia',
  description: 'Rules for safe and lawful use of QSentia services, APIs, models, and automation.',
};

const sections: readonly PolicySection[] = [
  {
    id: 'authorized-use',
    title: 'Authorized use',
    paragraphs: ['Use QSentia only for lawful, authorized, and contractually permitted research, diligence, testing, model-access, and customer-workspace purposes. Users are responsible for their accounts, credentials, integrations, and activity performed through them.'],
  },
  {
    id: 'prohibited',
    title: 'Prohibited conduct',
    paragraphs: ['Users must not misuse the platform, APIs, models, data, or infrastructure.'],
    bullets: [
      'Attempt unauthorized access, privilege escalation, credential theft, security bypass, or destructive testing.',
      'Upload malware, harmful code, unlawful content, or data the user is not authorized to process.',
      'Scrape, copy, resell, reverse engineer, or redistribute protected models, telemetry, or content beyond permitted rights.',
      'Interfere with availability, evade limits, automate abusive requests, or conceal the source of harmful activity.',
      'Use model outputs to manipulate markets, violate sanctions, commit fraud, or breach securities, privacy, employment, or consumer-protection law.',
      'Submit passwords, private keys, payment-card data, or broker secrets through ordinary contact or support fields.',
    ],
  },
  {
    id: 'trading',
    title: 'Broker and automated-trading controls',
    paragraphs: [
      'Users must not enable live order execution until broker authorization, risk limits, model entitlement, operational monitoring, and any required approvals are complete. Paper trading should be used for validation. Users remain responsible for broker terms, capital allocation, order review, regulatory obligations, and kill-switch access.',
    ],
  },
  {
    id: 'enforcement',
    title: 'Monitoring and enforcement',
    paragraphs: [
      'QSentia may investigate suspected abuse, rate-limit or suspend access, preserve relevant evidence, remove harmful content, notify affected parties, and cooperate with lawful authorities. Where practicable, QSentia will provide notice and an opportunity to respond, except when doing so would increase risk or violate law.',
    ],
  },
  {
    id: 'reporting',
    title: 'Reporting violations',
    paragraphs: ['Report suspected misuse through the contact page or inquiries@qsentia.com. Include relevant timestamps and identifiers, but do not include unnecessary sensitive data.'],
  },
];

export default function AcceptableUsePolicyPage() {
  return (
    <PolicyDocument
      title="Acceptable Use Policy"
      eyebrow="Platform conduct"
      summary="Rules that protect QSentia users, services, models, APIs, brokers, and market-integrity workflows from misuse."
      effectiveDate="19 June 2026"
      version="1.0"
      sections={sections}
    />
  );
}
