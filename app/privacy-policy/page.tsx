import type { Metadata } from 'next';
import PolicyDocument, { type PolicySection } from '@/components/PolicyDocument';

export const metadata: Metadata = {
  title: 'Privacy Policy | QSentia',
  description: 'How QSentia collects, uses, retains, protects, and discloses personal data.',
};

const sections: readonly PolicySection[] = [
  {
    id: 'scope',
    title: 'Scope and role',
    paragraphs: [
      'This policy applies to QSentia websites, authenticated dashboards, customer workspaces, APIs, support interactions, recruitment workflows, and related digital services. It explains how QSentia handles digital personal data when acting as the entity that determines the purpose and means of processing.',
      'Separate contracts, data-processing terms, or institutional onboarding documents may supplement this policy. Where a contractual term provides stronger protection, that term will apply to the relevant relationship.',
    ],
  },
  {
    id: 'data-collected',
    title: 'Personal data we collect',
    paragraphs: ['We collect data that is reasonably necessary to provide, secure, improve, and administer the platform.'],
    bullets: [
      'Account and identity data, including name, email address, organization, authentication provider, account identifiers, and session information.',
      'Commercial and billing data, including plan, invoice, billing contact, tax-status, and payment-status information. Payment card details should be processed by an approved payment provider rather than stored by QSentia.',
      'Technical data, including IP address, browser and device information, request logs, security events, cookie choices, API usage, and approximate location derived from network data.',
      'Customer configuration data, including model entitlements, broker-connection status, automation settings, risk controls, support tickets, and audit events.',
      'Information submitted through contact, recruitment, lead, grievance, and support workflows.',
    ],
  },
  {
    id: 'purposes',
    title: 'Purposes and lawful processing',
    paragraphs: [
      'QSentia processes personal data for specified purposes communicated at or before collection. Depending on the context and applicable law, processing may be based on consent, performance of a contract, compliance with law, security and fraud prevention, or another permitted legitimate use.',
    ],
    bullets: [
      'Create and administer accounts, sessions, permissions, and customer workspaces.',
      'Deliver research, model-access, API, billing, support, recruitment, and onboarding services.',
      'Protect users and systems, investigate abuse, maintain audit trails, and respond to incidents.',
      'Communicate service notices and respond to requests, grievances, and contractual obligations.',
      'Improve reliability and usability using aggregated or consented analytics where enabled.',
    ],
  },
  {
    id: 'cookies',
    title: 'Cookies and similar technologies',
    paragraphs: [
      'Necessary cookies and browser storage support authentication, security, fraud prevention, consent records, and essential site operation. Optional preference, analytics, or marketing categories remain disabled unless the user selects them through the consent manager.',
      'Users can change optional choices at any time through the Cookie settings control in the footer. Additional details, including category and retention information, are available in the Cookie Policy.',
    ],
  },
  {
    id: 'sharing',
    title: 'Processors, service providers, and disclosure',
    paragraphs: [
      'QSentia may engage vetted service providers for authentication, cloud hosting, code hosting, communications, payment processing, monitoring, market data, and support. Providers should receive only the information reasonably required for their role and should be bound by appropriate confidentiality, security, and data-protection obligations.',
      "Personal data may also be disclosed when required by law, to protect legal rights or platform security, in connection with a corporate transaction subject to safeguards, or with the individual's direction or consent.",
    ],
  },
  {
    id: 'retention',
    title: 'Retention and deletion',
    paragraphs: [
      'QSentia retains personal data only for as long as reasonably necessary for the stated purpose, contractual obligations, security, dispute resolution, legal compliance, and documented retention schedules. When the purpose ends and no lawful retention need remains, data should be deleted, anonymized, or placed beyond active use.',
    ],
    bullets: [
      "Consent records may be retained to demonstrate the user's choices.",
      'Security and audit logs may be retained for incident investigation and compliance.',
      'Billing, tax, and contractual records may be retained for legally required periods.',
      'Backups are deleted or overwritten through controlled lifecycle processes.',
    ],
  },
  {
    id: 'rights',
    title: 'Your choices and privacy rights',
    paragraphs: [
      'Subject to applicable law and verification, individuals may request information about processing, access to personal data, correction of inaccurate data, deletion where retention is no longer required, portability, restriction or objection where available, withdrawal of consent, and opt-out choices required by applicable US state privacy laws.',
      'Withdrawing consent does not affect processing already completed before withdrawal and may prevent QSentia from providing features that depend on that data. Requests may be submitted through the official contact channel and will be handled after proportionate identity verification.',
    ],
  },
  {
    id: 'children',
    title: 'Children and sensitive personal data',
    paragraphs: [
      'QSentia is intended for adults and professional users. The platform is not directed to children. QSentia does not knowingly collect children’s personal data through its authenticated products. If such data is identified, QSentia will take reasonable steps to restrict processing and delete it unless a lawful basis requires otherwise.',
    ],
  },
  {
    id: 'security',
    title: 'Security and personal-data breach response',
    paragraphs: [
      'QSentia applies administrative, technical, and organizational safeguards proportionate to the nature and risk of processing. Measures may include access control, encryption in transit, credential separation, secure development, logging, supplier review, backups, vulnerability management, and incident response.',
      'If a personal-data breach occurs, QSentia will assess impact, contain and remediate the event, preserve appropriate records, and provide notifications to affected individuals and authorities when required by applicable law.',
    ],
  },
  {
    id: 'transfers',
    title: 'International processing and transfers',
    paragraphs: [
      'Cloud, authentication, code-hosting, market-data, and support providers may process data in more than one country. QSentia will use contractual, technical, and organizational safeguards and will respect transfer restrictions that apply to the relevant data and jurisdiction.',
    ],
  },
  {
    id: 'contact',
    title: 'Privacy requests, complaints, and contact',
    paragraphs: [
      'Submit privacy requests or complaints to inquiries@qsentia.com with the subject "Privacy Request," or use the contact form. Include enough information to identify the relevant account and request, but do not send passwords, private keys, full payment-card numbers, or broker credentials.',
      "If a complaint is not resolved through QSentia's process, an individual may have the right to approach a competent data-protection authority, state attorney general, privacy regulator, or other regulator under applicable law.",
    ],
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    paragraphs: [
      'QSentia may update this policy when services, laws, suppliers, or processing activities change. Material changes will be communicated through an appropriate channel, and renewed consent will be requested when required.',
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <PolicyDocument
      title="Privacy Policy"
      eyebrow="Data protection notice"
      summary="How QSentia handles personal data across accounts, customer workspaces, billing, support, recruitment, APIs, and security operations."
      effectiveDate="19 June 2026"
      version="2.1"
      sections={sections}
      notice="This policy is designed as an operational privacy baseline, including principles reflected in GDPR, US state privacy laws, FTC privacy and security guidance, and applicable customer contracts. It should be reviewed by qualified counsel against QSentia's final corporate structure, data flows, vendors, and launch jurisdictions."
      references={[
        { label: 'European Commission - legal framework of EU data protection', href: 'https://commission.europa.eu/law/law-topic/data-protection/legal-framework-eu-data-protection_en' },
        { label: 'Federal Trade Commission - privacy and security business guidance', href: 'https://www.ftc.gov/business-guidance/privacy-security' },
        { label: 'California Attorney General - CCPA', href: 'https://oag.ca.gov/privacy/ccpa' },
      ]}
    />
  );
}
