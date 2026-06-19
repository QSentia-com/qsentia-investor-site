import type { Metadata } from 'next';
import PolicyDocument, { type PolicySection } from '@/components/PolicyDocument';

export const metadata: Metadata = {
  title: 'Data Protection and DPDP | QSentia',
  description: 'QSentia data-protection governance and DPDP readiness programme.',
};

const sections: readonly PolicySection[] = [
  {
    id: 'governance',
    title: 'Governance and accountability',
    paragraphs: [
      'QSentia maintains a data-protection programme intended to identify processing activities, assign ownership, document purposes, minimize collection, manage suppliers, and respond to individual requests and incidents. The programme should be reviewed as the company, product, and regulatory footprint change.',
    ],
    bullets: [
      'Maintain a record of processing activities and data-flow inventory.',
      'Assign accountable owners for privacy, security, product, HR, support, and vendor processing.',
      'Perform privacy and security reviews before launching high-risk features or integrations.',
      'Keep evidence of notices, consent where used, requests, grievances, incidents, and remediation.',
    ],
  },
  {
    id: 'notice-consent',
    title: 'Notice, consent, and permitted uses',
    paragraphs: [
      'Notices should be clear, accessible, and specific about the personal data, purpose, rights, and contact route. When consent is used, it should be freely given, specific, informed, unambiguous, and capable of withdrawal with comparable ease. Processing that relies on another permitted basis should be documented and limited to that basis.',
    ],
  },
  {
    id: 'rights-process',
    title: 'Data-principal request process',
    paragraphs: [
      'QSentia should acknowledge requests, verify identity proportionately, locate responsive systems, apply lawful exceptions, record the decision, and respond through a secure channel. Requests may concern access to a summary, correction, completion, erasure, consent withdrawal, grievance redressal, or nomination where applicable.',
    ],
  },
  {
    id: 'grievance',
    title: 'Grievance redressal',
    paragraphs: [
      'Privacy grievances may be submitted through the contact form or inquiries@qsentia.com. QSentia should assign an owner, acknowledge the grievance, investigate relevant evidence, communicate the outcome, and provide escalation information required by applicable law.',
    ],
  },
  {
    id: 'children',
    title: 'Children and guardian consent',
    paragraphs: [
      'The service is designed for adults and professional users. Account creation and targeted or behavior-monitoring uses involving children should be restricted. Where applicable law requires verifiable parent or lawful guardian consent, the relevant feature must remain unavailable until that process is implemented.',
    ],
  },
  {
    id: 'processors',
    title: 'Processor and vendor management',
    paragraphs: [
      "Before entrusting personal data to a provider, QSentia should assess purpose, location, security, subprocessors, deletion, incident notification, audit rights, and contractual protections. Access should be limited to the provider's documented role and removed when no longer needed.",
    ],
  },
  {
    id: 'breach',
    title: 'Personal-data breach management',
    paragraphs: [
      'QSentia should maintain a documented workflow to detect, triage, contain, investigate, remediate, and learn from personal-data breaches. The workflow should identify who assesses notification duties, preserves evidence, communicates with affected individuals and authorities, and tracks corrective actions.',
    ],
  },
  {
    id: 'programme-status',
    title: 'Programme status and legal review',
    paragraphs: [
      'These controls are a readiness baseline, not a representation that every statutory obligation has been independently audited. Before production launch, QSentia should validate entity details, significant-data-fiduciary status if designated, applicable rules and commencement dates, retention schedules, grievance timelines, processor contracts, and cross-border restrictions with qualified counsel.',
    ],
  },
];

export default function DataProtectionPage() {
  return (
    <PolicyDocument
      title="Data Protection and DPDP Readiness"
      eyebrow="Privacy governance"
      summary="The operating controls QSentia uses to translate privacy principles into product, vendor, support, security, and customer-workspace practices."
      effectiveDate="19 June 2026"
      version="1.0"
      sections={sections}
      notice="QSentia does not claim regulator approval or independent DPDP certification. This page describes an implementation baseline that must be matched to actual operations and legally reviewed."
      references={[
        { label: 'Digital Personal Data Protection Act, 2023 - India Code', href: 'https://www.indiacode.nic.in/handle/123456789/19695?view_type=browse' },
        { label: 'MeitY data protection framework', href: 'https://www.meity.gov.in/data-protection-framework' },
      ]}
    />
  );
}
