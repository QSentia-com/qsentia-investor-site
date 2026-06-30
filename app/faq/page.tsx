import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CreditCard,
  Database,
  KeyRound,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { PageShell, SectionCard, TechnicalBackdrop } from "@/components/PageChrome";

export const metadata: Metadata = {
  title: "FAQ | QSentia",
  description:
    "Frequently asked questions about QSentia investors, platform access, APIs, billing, security, and careers.",
};

const faqGroups = [
  {
    title: "Investors",
    icon: Scale,
    items: [
      {
        question: "What does QSentia help investors evaluate?",
        answer:
          "QSentia helps investors review machine-learning strategy evidence, normalized performance, benchmark context, drawdown controls, and execution-readiness signals before making capital or diligence decisions.",
      },
      {
        question: "Is the performance data live or manually entered?",
        answer:
          "Research and performance surfaces are designed around source-backed telemetry from the platform APIs and configured model records. When source rows are unavailable, the interface should show missing or unavailable states rather than replacing them with unsupported numbers.",
      },
      {
        question: "Can investors request diligence materials?",
        answer:
          "Yes. Investor materials are handled through controlled request workflows such as the data room and investor qualification forms. QSentia can route tear sheets, methodology notes, and strategy information after the appropriate review.",
      },
    ],
  },
  {
    title: "Platform and API access",
    icon: Database,
    items: [
      {
        question: "What does the platform provide?",
        answer:
          "The platform is built for model telemetry, research validation, paper or live monitoring readiness, API access controls, broker-readiness review, audit trails, and customer account operations.",
      },
      {
        question: "How are model APIs issued?",
        answer:
          "API access is tied to approved customer accounts, model entitlements, scoped keys, and usage controls. Production credentials should be issued only after commercial approval, security review, and broker or deployment-readiness checks where relevant.",
      },
      {
        question: "Can QSentia connect models to brokerage accounts?",
        answer:
          "Broker execution requires a controlled onboarding flow, customer authorization, risk limits, scheduler controls, kill-switch handling, and audit logging. QSentia treats broker connectivity as a higher-risk operational workflow rather than a simple website toggle.",
      },
    ],
  },
  {
    title: "Accounts and billing",
    icon: CreditCard,
    items: [
      {
        question: "Do users need an account?",
        answer:
          "Public pages are available without signing in. Customer dashboards, billing, API credentials, broker setup, deployment controls, and admin operations require authenticated access.",
      },
      {
        question: "How are plans and trials handled?",
        answer:
          "Plans, trials, discount codes, model access, and billing records are managed through the back-office and customer settings workflows. Enterprise terms may be handled separately through written agreements.",
      },
      {
        question: "Where can a customer manage settings?",
        answer:
          "After signing in, customers can use Settings to review billing, model access, API credentials, broker setup, deployment controls, and support workflows.",
      },
    ],
  },
  {
    title: "Security and privacy",
    icon: ShieldCheck,
    items: [
      {
        question: "How should users handle broker credentials or API secrets?",
        answer:
          "Users should never place broker credentials, API secrets, private keys, passwords, or payment-card numbers in ordinary forms, support messages, or application materials. Sensitive integrations should use approved secure flows only.",
      },
      {
        question: "What privacy framework does QSentia reference?",
        answer:
          "QSentia's public policy pages now reference GDPR and US privacy readiness, including state privacy rights, vendor controls, breach workflows, and FTC-style privacy and security safeguards.",
      },
      {
        question: "Does QSentia claim SOC 2 or GDPR certification?",
        answer:
          "No. Public policy pages describe operating baselines and readiness work. Certification, audit scope, and legal compliance claims should be published only after appropriate validation.",
      },
    ],
  },
  {
    title: "Careers",
    icon: BriefcaseBusiness,
    items: [
      {
        question: "Where are open roles listed?",
        answer:
          "Open roles appear on the Careers page after the QSentia team publishes them from the admin career board. If no roles are open, the page will show a clear no-open-roles state.",
      },
      {
        question: "What does a career application require?",
        answer:
          "The careers workflow requires a selected role, full name, email, LinkedIn profile, applicant consent to review the submitted profile, and a CV or resume upload.",
      },
      {
        question: "Can candidates apply without sending secrets?",
        answer:
          "Yes. Candidates should share only professional information needed for recruitment evaluation. They should not include passwords, private keys, API keys, broker credentials, or confidential employer information.",
      },
    ],
  },
];

const quickLinks = [
  { href: "/careers", label: "Careers", icon: BriefcaseBusiness },
  { href: "/data-room", label: "Investor data room", icon: ShieldCheck },
  { href: "/developers", label: "Developer center", icon: KeyRound },
];

export default function FAQPage() {
  return (
    <PageShell active="/faq">
      <section className="relative overflow-hidden border-b border-[#e2e7fb] bg-[#f8faff]">
        <TechnicalBackdrop />
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
          <div className="text-xs font-bold uppercase tracking-wide text-[#3046c8]">
            Help center
          </div>
          <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.04] tracking-normal text-[#06130c] md:text-7xl">
            Frequently asked questions
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-[#46554b] md:text-lg">
            Practical answers for investors, platform customers, developers, candidates, and
            internal teams reviewing QSentia access, telemetry, security, and workflows.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex min-h-12 items-center justify-between gap-3 rounded-md border border-[#cbd5ff] bg-white px-4 py-3 text-sm font-semibold text-[#172554] shadow-sm transition hover:border-[#3d52da]"
                >
                  <span className="inline-flex items-center gap-2">
                    <Icon className="h-4 w-4 text-[#3d52da]" />
                    {link.label}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="self-start lg:sticky lg:top-24">
            <div className="border-l-2 border-[#cbd5ff] pl-4">
              <div className="text-xs font-bold uppercase tracking-wide text-[#647269]">
                Categories
              </div>
              <nav className="mt-4 grid gap-2" aria-label="FAQ categories">
                {faqGroups.map((group) => (
                  <a
                    key={group.title}
                    href={`#${slugify(group.title)}`}
                    className="text-sm leading-6 text-[#46554b] transition hover:text-[#2b36ff]"
                  >
                    {group.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <div className="grid gap-8">
            {faqGroups.map((group) => {
              const Icon = group.icon;
              return (
                <SectionCard key={group.title} className="p-6 md:p-8">
                  <section id={slugify(group.title)} className="scroll-mt-24">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#eef2ff] text-[#3d52da]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <h2 className="text-2xl font-semibold text-[#06130c]">
                        {group.title}
                      </h2>
                    </div>
                    <div className="mt-6 divide-y divide-[#e2e7fb] border-y border-[#e2e7fb]">
                      {group.items.map((item) => (
                        <details key={item.question} className="group py-5">
                          <summary className="cursor-pointer list-none text-base font-semibold text-[#06130c] marker:hidden">
                            <span className="flex items-start justify-between gap-4">
                              {item.question}
                              <span className="mt-1 text-[#3d52da] transition group-open:rotate-90">
                                <ArrowRight className="h-4 w-4" />
                              </span>
                            </span>
                          </summary>
                          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#5a685f]">
                            {item.answer}
                          </p>
                        </details>
                      ))}
                    </div>
                  </section>
                </SectionCard>
              );
            })}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
