import type { Metadata } from 'next';
import PolicyDocument, { type PolicySection } from '@/components/PolicyDocument';

export const metadata: Metadata = {
  title: 'Security and ISO Alignment | QSentia',
  description: 'QSentia security controls and ISO-aligned information-security programme.',
};

const sections: readonly PolicySection[] = [
  {
    id: 'status',
    title: 'Security posture and certification status',
    paragraphs: [
      'QSentia uses internationally recognized information-security and privacy-management standards as design references. Unless a current certificate and scope statement are published by QSentia, no statement on this website should be interpreted as a claim that QSentia is ISO certified.',
    ],
  },
  {
    id: 'frameworks',
    title: 'Reference frameworks',
    paragraphs: ["Control design may be mapped to the following standards where relevant to QSentia's scope."],
    bullets: [
      'ISO/IEC 27001:2022 for an information security management system and risk-based controls.',
      'ISO/IEC 27701 for privacy information management and accountability roles.',
      'ISO/IEC 27017 for cloud-service security controls.',
      'ISO/IEC 27018 for protection of personally identifiable information in public cloud processing.',
      'ISO 22301 for business continuity management and service resilience.',
    ],
  },
  {
    id: 'access',
    title: 'Identity and access management',
    paragraphs: [
      'Access should be least-privilege, role-based, reviewed periodically, and removed promptly when no longer required. Administrative access should use stronger authentication, auditable authorization, separate secrets, and controlled production access.',
    ],
  },
  {
    id: 'engineering',
    title: 'Secure engineering and change management',
    paragraphs: [
      'QSentia should apply peer review, dependency management, secret scanning, protected branches, automated tests, environment separation, change records, and rollback planning. Credentials must not be committed to source control or exposed to client code.',
    ],
  },
  {
    id: 'data',
    title: 'Data and cryptographic controls',
    paragraphs: [
      'Data should be classified, minimized, encrypted in transit, protected at rest where appropriate, and retained according to documented schedules. Broker secrets, service-role keys, OAuth secrets, and payment credentials require dedicated secret management and restricted access.',
    ],
  },
  {
    id: 'monitoring',
    title: 'Logging, monitoring, and vulnerability management',
    paragraphs: [
      'Security-relevant events should be logged with integrity controls and reviewed for anomalous access, authentication failures, privilege changes, API abuse, and execution failures. Vulnerabilities should be triaged by severity, remediated within risk-based targets, and validated after correction.',
    ],
  },
  {
    id: 'resilience',
    title: 'Incident response, backups, and continuity',
    paragraphs: [
      'QSentia should maintain incident roles, escalation paths, containment procedures, evidence handling, communication plans, tested backups, restoration checks, and continuity objectives appropriate to the service. Broker execution and automation features require explicit fail-safe and kill-switch design.',
    ],
  },
  {
    id: 'reporting',
    title: 'Reporting security concerns',
    paragraphs: [
      'Report suspected security issues privately to inquiries@qsentia.com with the subject "Security Report." Do not publicly disclose sensitive details or test production systems without written authorization. QSentia should acknowledge, triage, and coordinate remediation through a secure channel.',
    ],
  },
];

export default function SecurityPage() {
  return (
    <PolicyDocument
      title="Security and ISO Alignment"
      eyebrow="Trust and resilience"
      summary="QSentia's security-control baseline for identity, software delivery, cloud services, personal data, model operations, and business continuity."
      effectiveDate="19 June 2026"
      version="1.0"
      sections={sections}
      notice="Framework alignment is not certification. Certification requires a defined scope, implemented management system, evidence, internal audit, management review, and an independent accredited certification audit."
      references={[
        { label: 'ISO/IEC 27001 information security management systems', href: 'https://www.iso.org/standard/27001' },
        { label: 'ISO privacy information management standards', href: 'https://www.iso.org/committee/45144/x/catalogue/' },
      ]}
    />
  );
}
