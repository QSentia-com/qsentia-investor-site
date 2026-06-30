import type { Metadata } from 'next';
import PolicyDocument, { type PolicySection } from '@/components/PolicyDocument';

export const metadata: Metadata = {
  title: 'GDPR and US Privacy Readiness | QSentia',
  description: 'QSentia data-protection governance for GDPR, US privacy, security, and data-rights workflows.',
};

const sections: readonly PolicySection[] = [
  {
    id: 'governance',
    title: 'Governance and accountability',
    paragraphs: [
      'QSentia maintains a data-protection programme intended to identify processing activities, assign ownership, document purposes, minimize collection, manage suppliers, and respond to privacy requests and incidents. The programme should be reviewed as the company, product, customer base, and regulatory footprint change.',
    ],
    bullets: [
      'Maintain a record of processing activities and data-flow inventory.',
      'Assign accountable owners for privacy, security, product, HR, support, and vendor processing.',
      'Perform privacy and security reviews before launching high-risk features, analytics, broker integrations, or API workflows.',
      'Keep evidence of notices, consent where used, privacy requests, complaints, incidents, and remediation.',
    ],
  },
  {
    id: 'notice-consent',
    title: 'Notice, lawful basis, and permitted uses',
    paragraphs: [
      'Privacy notices should be clear, accessible, and specific about the personal data collected, purpose, categories of recipients, rights, and contact route. Where GDPR applies, QSentia should document the lawful basis for each processing activity. When consent is used, it should be specific, informed, unambiguous, and capable of withdrawal through a comparable route.',
    ],
  },
  {
    id: 'rights-process',
    title: 'Privacy rights request process',
    paragraphs: [
      'QSentia should acknowledge privacy rights requests, verify identity proportionately, locate responsive systems, apply lawful exceptions, record the decision, and respond through a secure channel. Depending on the applicable jurisdiction, requests may concern access, correction, deletion, portability, objection, restriction, opt-out of sale or sharing, opt-out of certain profiling or targeted advertising, or withdrawal of consent.',
    ],
  },
  {
    id: 'complaints',
    title: 'Complaints and regulator escalation',
    paragraphs: [
      'Privacy complaints may be submitted through the contact form or inquiries@qsentia.com. QSentia should assign an owner, investigate relevant evidence, communicate the outcome, and provide regulator or appeal information where applicable law requires it.',
    ],
  },
  {
    id: 'children',
    title: 'Children and sensitive data',
    paragraphs: [
      'The service is designed for adults and professional users. QSentia should not intentionally collect children’s data through authenticated products, investor workflows, or customer dashboards. Sensitive personal information should be collected only when necessary, disclosed in the relevant notice, protected with stronger controls, and limited to the documented purpose.',
    ],
  },
  {
    id: 'processors',
    title: 'Processors, service providers, and vendors',
    paragraphs: [
      "Before entrusting personal data to a provider, QSentia should assess purpose, location, security, subprocessors, deletion, incident notification, audit rights, and contractual protections. GDPR data-processing terms, US service-provider restrictions, confidentiality duties, and security commitments should be matched to the provider's role.",
    ],
  },
  {
    id: 'transfers',
    title: 'International transfers and data residency',
    paragraphs: [
      'QSentia should document where production systems, support tools, authentication providers, code repositories, analytics tools, and payment providers process personal data. For EU/EEA data, transfer mechanisms such as appropriate contractual safeguards should be reviewed. For US customers, state privacy notices and contractual commitments should reflect the actual hosting and vendor footprint.',
    ],
  },
  {
    id: 'breach',
    title: 'Personal-data breach management',
    paragraphs: [
      'QSentia should maintain a documented workflow to detect, triage, contain, investigate, remediate, and learn from personal-data breaches. The workflow should identify who assesses notification duties under GDPR, US state breach laws, customer contracts, and applicable sector rules; preserves evidence; communicates with affected individuals and authorities; and tracks corrective actions.',
    ],
  },
  {
    id: 'programme-status',
    title: 'Programme status and legal review',
    paragraphs: [
      'These controls are a readiness baseline, not a representation that every statutory obligation has been independently audited. Before production launch, QSentia should validate entity details, controller or processor roles, state-law thresholds, financial-sector obligations, retention schedules, request-response timelines, processor contracts, cookie/analytics use, and cross-border transfer restrictions with qualified counsel.',
    ],
  },
];

export default function DataProtectionPage() {
  return (
    <PolicyDocument
      title="GDPR and US Privacy Readiness"
      eyebrow="Privacy governance"
      summary="The operating controls QSentia uses to translate GDPR, US privacy, security, vendor, support, and customer-workspace obligations into practical workflows."
      effectiveDate="30 June 2026"
      version="1.1"
      sections={sections}
      notice="QSentia does not claim regulator approval, GDPR certification, SOC 2 certification, or full US state-law compliance by publication of this page. This page describes an implementation baseline that must be matched to actual operations and legally reviewed."
      references={[
        { label: 'European Commission - legal framework of EU data protection', href: 'https://commission.europa.eu/law/law-topic/data-protection/legal-framework-eu-data-protection_en' },
        { label: 'Federal Trade Commission - privacy and security business guidance', href: 'https://www.ftc.gov/business-guidance/privacy-security' },
        { label: 'California Attorney General - CCPA', href: 'https://oag.ca.gov/privacy/ccpa' },
        { label: 'California Privacy Protection Agency - regulations', href: 'https://cppa.ca.gov/regulations/' },
      ]}
    />
  );
}
