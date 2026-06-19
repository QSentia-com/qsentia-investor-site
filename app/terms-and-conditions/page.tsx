import type { Metadata } from 'next';
import PolicyDocument, { type PolicySection } from '@/components/PolicyDocument';

export const metadata: Metadata = {
  title: 'Terms and Conditions | QSentia',
  description: 'Terms governing QSentia accounts, models, APIs, subscriptions, research, and customer workspaces.',
};

const sections: readonly PolicySection[] = [
  {
    id: 'acceptance',
    title: 'Acceptance and eligibility',
    paragraphs: ['By accessing or using QSentia, you agree to these terms and the policies incorporated by reference. You must have legal capacity to accept them and authority to bind an organization when acting on its behalf. If you do not agree, do not use the service.'],
  },
  {
    id: 'service',
    title: 'Service scope',
    paragraphs: ['QSentia provides digital research, telemetry, model-access, API, customer-workspace, billing, onboarding, and related software services. Features may include simulated, backtested, paper-trading, or live-integration workflows. Availability, entitlement, and limits depend on the selected plan and written agreement.'],
  },
  {
    id: 'accounts',
    title: 'Accounts and authentication',
    paragraphs: ['Provide accurate account information, protect authentication methods, use approved identity providers, and promptly report unauthorized access. Accounts are personal or organization-specific and may not be shared beyond authorized users. QSentia may require verification, stronger authentication, or role approval.'],
  },
  {
    id: 'models-api',
    title: 'Models, data, and APIs',
    paragraphs: ['Model access is licensed, not sold. Entitlements may restrict models, environments, users, calls, data, exports, or execution rights. API keys are confidential and must be stored server-side. Users must not infer, reconstruct, extract, or redistribute protected model logic or data beyond granted rights.'],
  },
  {
    id: 'brokers',
    title: 'Broker connections and automation',
    paragraphs: ["A broker connection remains subject to the broker's terms, permissions, account status, and applicable law. Users are responsible for capital, order review, risk limits, credentials, approvals, monitoring, and kill-switch access. QSentia may require paper validation before enabling live execution and may pause automation when safety, billing, entitlement, or technical checks fail."],
  },
  {
    id: 'fees',
    title: 'Fees, renewals, taxes, and cancellation',
    paragraphs: ['Fees, currency, billing interval, included usage, taxes, trial conversion, and renewal terms are shown at purchase or in an order form. Customers authorize agreed charges and must maintain accurate billing information. Cancellation and refund handling follow the Billing, Cancellation and Refund Policy and any controlling signed agreement.'],
  },
  {
    id: 'conduct',
    title: 'Acceptable use',
    paragraphs: ['Users must comply with the Acceptable Use Policy, applicable laws, market rules, sanctions, privacy obligations, and third-party terms. QSentia may investigate, rate-limit, suspend, or terminate activity that creates security, legal, operational, or market-integrity risk.'],
  },
  {
    id: 'ip',
    title: 'Intellectual property and feedback',
    paragraphs: ['QSentia and its licensors retain rights in the platform, models, code, branding, documentation, data organization, and derivative improvements. Customers retain rights in their own lawful data. Feedback may be used to improve QSentia without restriction or payment, provided QSentia does not identify the contributor without permission.'],
  },
  {
    id: 'privacy',
    title: 'Privacy and confidentiality',
    paragraphs: ['Personal data is handled under the Privacy Policy and applicable agreements. Each party must protect confidential information using reasonable safeguards and use it only for the permitted relationship. Do not place broker secrets, service-role keys, payment-card data, or other restricted information in ordinary forms or support messages.'],
  },
  {
    id: 'third-party',
    title: 'Third-party services',
    paragraphs: ['Authentication, hosting, code repositories, market data, brokers, payments, communications, and other providers may be required for some features. QSentia does not control their independent services and is not responsible for their acts, terms, outages, data, or decisions except to the extent required by law or an express agreement.'],
  },
  {
    id: 'disclaimers',
    title: 'Investment risk and service disclaimers',
    paragraphs: ['QSentia is not a promise of performance. Model outputs, research, simulations, backtests, paper trades, and automation may be wrong, delayed, incomplete, or unsuitable. Nothing constitutes personalized investment, legal, tax, accounting, or regulatory advice. The service is provided "as is" and "as available" to the maximum extent permitted by law.'],
  },
  {
    id: 'liability',
    title: 'Liability and indemnity',
    paragraphs: ['To the maximum extent permitted by law, QSentia is not liable for indirect, incidental, special, consequential, exemplary, or trading losses, loss of data, profits, opportunity, or goodwill arising from use of the service. Any applicable liability cap and indemnity obligations should be stated in the relevant order form or commercial agreement. Rights that cannot lawfully be excluded remain unaffected.'],
  },
  {
    id: 'termination',
    title: 'Suspension and termination',
    paragraphs: ['Users may stop using the service and cancel eligible subscriptions. QSentia may suspend or terminate access for non-payment, security risk, unlawful use, material breach, sanctions, provider restrictions, or risk to systems or third parties. Provisions intended to survive, including payment, confidentiality, intellectual property, disclaimers, and dispute terms, continue after termination.'],
  },
  {
    id: 'law-changes',
    title: 'Applicable terms, disputes, and changes',
    paragraphs: ['The governing law, venue, notices, and dispute process should be identified in the applicable order form, corporate terms, or mandatory law. QSentia may update these terms for legal, security, or service changes. Material changes will be communicated appropriately and will not retroactively remove mandatory rights.'],
  },
];

export default function TermsAndConditionsPage() {
  return (
    <PolicyDocument
      title="Terms and Conditions"
      eyebrow="Platform agreement"
      summary="Terms for QSentia accounts, research, model licensing, APIs, subscriptions, broker connections, and automated execution workflows."
      effectiveDate="19 June 2026"
      version="2.0"
      sections={sections}
      notice="These website terms must be aligned with QSentia's final legal entity, checkout flow, order forms, pricing, broker operating model, and launch jurisdictions before production use."
    />
  );
}
