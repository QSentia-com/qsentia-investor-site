import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Building2, FileText, Mail, ShieldCheck } from 'lucide-react';
import { ContactLeadForm } from '@/components/LeadCaptureForms';
import { Eyebrow, PageShell, SectionCard } from '@/components/PageChrome';

export const metadata: Metadata = {
  title: 'Contact Us | Qsentia',
  description: 'Institutional contact page for Qsentia research, platform access, due diligence, and partnership inquiries.',
};

const inquiryTracks = [
  {
    title: 'Institutional access',
    text: 'Allocator introductions, platform walkthroughs, diligence review, and general institutional outreach.',
    icon: Building2,
  },
  {
    title: 'Model licensing',
    text: 'Commercial review for specific strategies, source repositories, telemetry coverage, and deployment workflow.',
    icon: FileText,
  },
  {
    title: 'Security and compliance',
    text: 'Do not send API keys, broker credentials, passwords, or private tokens by email. Use the inbox to arrange a secure path.',
    icon: ShieldCheck,
  },
];

const prepItems = [
  'Organization name and professional email',
  'Area of interest: dashboard, marketplace, research, or integration',
  'Models or workflows you want to review',
  'Target evaluation or deployment timeline',
  'Relevant compliance or operational constraints',
];

export default function ContactPage() {
  return (
    <PageShell active="/contact">
      <section className="border-b border-[#e2e7fb] bg-[#f8faff]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
          <Eyebrow>Institutional contact</Eyebrow>
          <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[1.04] tracking-normal text-[#06130c] md:text-7xl">
            Contact Qsentia
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-[#46554b] md:text-lg">
            Use the published inbox for institutional access, model licensing, diligence coordination,
            and research-related outreach. Only currently published channels are listed here.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <SectionCard className="p-6 md:p-8">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#eef2ff] text-[#3d52da]">
              <Mail className="h-5 w-5" />
            </span>
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-[#647269]">Primary channel</div>
              <h2 className="text-xl font-semibold text-[#06130c]">Institutional inquiries inbox</h2>
            </div>
          </div>

          <div className="mt-6 rounded-[10px] border border-[#e2e7fb] bg-[#f8faff] p-5">
            <div className="text-xs font-bold uppercase tracking-wide text-[#647269]">Email</div>
            <a
              href="mailto:inquiries@qsentia.com?subject=QSentia%20Institutional%20Inquiry"
              className="mt-2 block text-2xl font-semibold text-[#06130c] underline-offset-4 hover:underline"
            >
              inquiries@qsentia.com
            </a>
            <p className="mt-3 text-sm leading-6 text-[#5a685f]">
              If your request involves diligence, secure materials, or commercial review, initiate
              from your institutional email address.
            </p>
          </div>

          <ContactLeadForm />

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href="mailto:inquiries@qsentia.com?subject=QSentia%20Institutional%20Inquiry"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#172554] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2437b5]"
            >
              Start email inquiry
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              href="/marketplace"
              className="inline-flex items-center justify-center rounded-md border border-[#cbd5ff] bg-white px-5 py-3 text-sm font-bold text-[#172554] transition hover:bg-[#f7f8ff]"
            >
              Review models first
            </Link>
          </div>
        </SectionCard>

        <SectionCard className="p-6 md:p-8">
          <div className="text-xs font-bold uppercase tracking-wide text-[#647269]">Before you contact us</div>
          <h2 className="mt-2 text-2xl font-semibold text-[#06130c]">Include operational context</h2>
          <p className="mt-3 text-sm leading-6 text-[#5a685f]">
            Clear initial context speeds up routing and keeps the conversation relevant to your review process.
          </p>
          <ul className="mt-6 space-y-3">
            {prepItems.map((item) => (
              <li key={item} className="rounded-md border border-[#e2e7fb] bg-[#fbfcff] px-4 py-3 text-sm text-[#26352c]">
                {item}
              </li>
            ))}
          </ul>
        </SectionCard>
      </section>

      <section className="border-y border-[#e2e7fb] bg-[#f8faff]">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:px-6 md:grid-cols-3">
          {inquiryTracks.map((track) => {
            const Icon = track.icon;
            return (
              <SectionCard key={track.title} className="p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#eef2ff] text-[#3d52da]">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-xl font-semibold text-[#06130c]">{track.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#5a685f]">{track.text}</p>
              </SectionCard>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}
