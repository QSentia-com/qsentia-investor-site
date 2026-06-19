import type { Metadata } from 'next';
import PolicyDocument, { type PolicySection } from '@/components/PolicyDocument';

export const metadata: Metadata = {
  title: 'Cookie Policy | QSentia',
  description: 'QSentia cookie categories, purposes, duration, and consent controls.',
};

const sections: readonly PolicySection[] = [
  {
    id: 'what-are-cookies',
    title: 'What cookies and browser storage are',
    paragraphs: [
      'Cookies are small values stored by a browser and returned to a website. QSentia may also use local storage or similar browser capabilities. These technologies can maintain authenticated sessions, remember privacy choices, protect services, and support optional measurement.',
    ],
  },
  {
    id: 'categories',
    title: 'Categories used by QSentia',
    paragraphs: ['QSentia separates cookie choices by purpose. Optional categories remain off unless selected.'],
    bullets: [
      'Necessary: authentication, session continuity, security, load balancing, fraud prevention, and consent storage. These cannot be disabled through the consent manager because the requested service may not function without them.',
      'Preferences: optional interface settings and remembered choices that are not required for core operation.',
      'Analytics: aggregated usage measurement when an analytics provider is configured. QSentia does not activate this category through the consent manager until the user allows it.',
      'Marketing: advertising, campaign attribution, or cross-site measurement if introduced. This category is off by default.',
    ],
  },
  {
    id: 'cookie-list',
    title: 'Current cookie and storage inventory',
    paragraphs: [
      'The exact names of authentication cookies may include a Supabase project reference and can vary by environment. Hosting or security providers may also set essential technical cookies when required to protect or route a request.',
    ],
    bullets: [
      "qsentia_cookie_consent - necessary - records a summary of the user's consent selection - up to 12 months.",
      'qsentia_cookie_consent_v1 in local storage - necessary - stores category-level consent and timestamp - until changed, cleared, or superseded by a new consent version.',
      'sb-<project-reference>-auth-token and related Supabase session values - necessary - keeps an authenticated user signed in and refreshes the session - session or provider-configured duration.',
      'Security, routing, or hosting cookies - necessary - mitigate abuse and deliver the service - session or provider-defined duration.',
      'Analytics and marketing cookies - optional - not deployed by QSentia unless a relevant provider is configured and consent is obtained where required.',
    ],
  },
  {
    id: 'controls',
    title: 'How to control cookies',
    paragraphs: [
      'Use Cookie settings in the site footer to accept all, reject non-essential categories, or choose categories separately. The consent record can be replaced at any time. Browser controls can also delete or block cookies, but blocking necessary cookies may prevent authentication or other requested functions.',
    ],
  },
  {
    id: 'third-parties',
    title: 'Third-party services',
    paragraphs: [
      'Authentication, hosting, security, payment, support, or analytics providers may use technologies under their own notices. QSentia should configure those providers to minimize data, respect selected categories, and avoid loading non-essential tools before consent where consent is required.',
    ],
  },
  {
    id: 'updates',
    title: 'Inventory changes and contact',
    paragraphs: [
      'QSentia will update this policy when technologies or providers materially change. Questions or objections can be sent to inquiries@qsentia.com with the subject "Cookie Privacy Request."',
    ],
  },
];

export default function CookiePolicyPage() {
  return (
    <PolicyDocument
      title="Cookie Policy"
      eyebrow="Consent and browser storage"
      summary="The technologies QSentia uses for essential operation, authentication, preferences, measurement, and privacy-choice storage."
      effectiveDate="19 June 2026"
      version="1.0"
      sections={sections}
      notice="QSentia's consent manager defaults optional categories to off. A provider must not be wired as analytics or marketing unless its loading behavior is connected to the saved category choice."
    />
  );
}
