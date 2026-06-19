import type { Metadata } from 'next';
import PolicyDocument, { type PolicySection } from '@/components/PolicyDocument';

export const metadata: Metadata = {
  title: 'Billing, Cancellation and Refund Policy | QSentia',
  description: 'QSentia billing, trial, cancellation, renewal, and refund terms for digital services.',
};

const sections: readonly PolicySection[] = [
  {
    id: 'digital-service',
    title: 'Digital service',
    paragraphs: ['QSentia provides digital platform, model-access, API, research, onboarding, and support services. Physical shipping is not part of the standard service. Pricing, currency, taxes, billing interval, included usage, and service scope should be displayed or agreed before purchase.'],
  },
  {
    id: 'trials',
    title: 'Trials and promotional access',
    paragraphs: ['A trial or promotional period may have feature, model, usage, or broker restrictions. The customer will be informed whether payment details are required and whether the trial converts automatically. Abuse of trial eligibility may result in termination.'],
  },
  {
    id: 'renewal',
    title: 'Renewal and invoices',
    paragraphs: ['Recurring services renew for the stated interval unless cancelled before the renewal cutoff shown in the account or contract. Customers are responsible for accurate billing information, applicable taxes, and authorized payment methods. Failed payments may suspend paid access after reasonable notice.'],
  },
  {
    id: 'cancellation',
    title: 'Cancellation',
    paragraphs: ['Customers may request cancellation through the customer workspace, support channel, or contractual contact. Unless the applicable order form states otherwise, cancellation stops future renewal and access continues until the end of the paid period. Model, API, broker, and automation access may be disabled when service ends.'],
  },
  {
    id: 'refunds',
    title: 'Refunds',
    paragraphs: ['Fees are generally non-refundable once the relevant digital service period begins, except where required by applicable law, where QSentia has charged in error, or where a written commercial agreement provides otherwise. Approved refunds are returned through the original payment method where practicable.'],
  },
  {
    id: 'enterprise',
    title: 'Enterprise and custom services',
    paragraphs: ['Implementation, research, private model review, integration, and enterprise commitments may have milestone, cancellation, minimum-term, and refund rules in an order form or master agreement. Those agreed terms prevail for the covered service.'],
  },
  {
    id: 'requests',
    title: 'Billing disputes and requests',
    paragraphs: ['Contact inquiries@qsentia.com with the account email, invoice identifier, amount, date, and reason. Do not send complete payment-card data. QSentia will investigate and respond through the verified account channel.'],
  },
];

export default function RefundCancellationPolicyPage() {
  return (
    <PolicyDocument
      title="Billing, Cancellation and Refund Policy"
      eyebrow="Commercial terms"
      summary="How digital trials, subscriptions, renewals, cancellations, invoices, and refund requests are handled."
      effectiveDate="19 June 2026"
      version="1.0"
      sections={sections}
      notice="Final prices, renewal cutoffs, refund rights, and enterprise commitments must match the checkout flow and signed order documents. Consumer-law rights cannot be excluded where they apply."
    />
  );
}
