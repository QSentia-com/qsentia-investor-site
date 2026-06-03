import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Clock3, Cloud, FileCheck2, Mail, ShieldCheck } from 'lucide-react';
import { PageShell, SectionCard } from '@/components/PageChrome';

export const metadata: Metadata = {
  title: 'Shipping Policy | Qsentia',
  description:
    'Qsentia shipping and digital service delivery policy for platform access, onboarding, support, and service availability.',
};

const deliveryItems = [
  {
    title: 'Digital delivery only',
    body: 'Qsentia is a digital software and research platform. We do not ship physical products, printed materials, devices, or hardware as part of standard service access.',
    icon: Cloud,
  },
  {
    title: 'Account access',
    body: 'Access is delivered electronically through the website, authenticated account flows, API endpoints, and approved institutional onboarding channels.',
    icon: ShieldCheck,
  },
  {
    title: 'Implementation timing',
    body: 'Standard site access is available immediately when enabled. Enterprise onboarding, model review, or private data configuration may require additional coordination.',
    icon: Clock3,
  },
];

const sections = [
  [
    'Service delivery method',
    'Qsentia services are delivered digitally. Platform access, documentation, dashboards, research pages, and API surfaces are made available through the website and related electronic channels.',
  ],
  [
    'No physical shipping',
    'Because Qsentia does not sell physical goods through this website, shipping carriers, shipping fees, customs duties, delivery tracking numbers, and physical delivery timelines generally do not apply.',
  ],
  [
    'Access confirmation',
    'When account access or institutional review access is approved, users may receive login instructions, documentation, or support communications electronically. Users are responsible for providing accurate contact information.',
  ],
  [
    'Enterprise onboarding',
    'Some services may involve onboarding calls, security review, technical integration, private repository review, or custom workflow setup. Delivery timelines for those services are governed by the applicable commercial or onboarding agreement.',
  ],
  [
    'Service availability',
    'Digital access may depend on third-party infrastructure, hosting, code repositories, market data providers, and API services. Temporary interruptions or delayed data updates may occur.',
  ],
  [
    'Delivery issues',
    'If you cannot access an approved service, contact Qsentia through the published institutional inquiry channel. Do not send private keys, brokerage credentials, or sensitive financial information by email.',
  ],
] as const;

export default function ShippingPolicyPage() {
  return (
    <PageShell active="/shipping-policy">
      <section className="border-b border-[#e2e7fb] bg-[#f8faff]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#c7d2fe] bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[#3046c8]">
            <FileCheck2 className="h-3.5 w-3.5" />
            Digital service delivery
          </div>
          <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[1.04] tracking-normal text-[#06130c] md:text-7xl">
            Shipping Policy
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-[#46554b] md:text-lg">
            Qsentia provides digital platform access, API documentation, research tools, and related
            service workflows. This policy explains how service delivery works for a software-based offering.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:px-6 md:grid-cols-3">
        {deliveryItems.map((item) => {
          const Icon = item.icon;
          return (
            <SectionCard key={item.title} className="p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#eef2ff] text-[#2b36ff]">
                <Icon className="h-5 w-5" />
              </span>
              <h2 className="mt-5 text-xl font-semibold text-[#06130c]">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[#5a685f]">{item.body}</p>
            </SectionCard>
          );
        })}
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-10 sm:px-6">
        <SectionCard className="divide-y divide-[#e2e7fb]">
          {sections.map(([title, body], index) => (
            <section key={title} className="p-6">
              <h2 className="text-xl font-semibold text-[#06130c]">
                {index + 1}. {title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#5a685f]">{body}</p>
            </section>
          ))}
        </SectionCard>

        <div className="mt-6 rounded-[10px] border border-[#cbd5ff] bg-[#f8faff] p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white text-[#2b36ff]">
                <Mail className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-semibold text-[#06130c]">Need service access support?</h2>
                <p className="mt-1 text-sm leading-6 text-[#5a685f]">
                  Contact Qsentia for account access, onboarding, or digital delivery questions.
                </p>
              </div>
            </div>
            <Link
              href="/contact"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-[#172554] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#2437b5]"
            >
              Contact support
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
