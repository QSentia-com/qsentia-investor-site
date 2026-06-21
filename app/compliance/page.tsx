import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Cookie,
  FileCheck2,
  LockKeyhole,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { PageShell, TechnicalBackdrop } from "@/components/PageChrome";

export const metadata: Metadata = {
  title: "Compliance Centre | QSentia",
  description:
    "QSentia privacy, cookie, acceptable-use, and commercial policy centre.",
};

const policies = [
  {
    href: "/privacy-policy",
    title: "Privacy Policy",
    body: "Personal-data notice, purposes, sharing, retention, rights, and grievances.",
    icon: ShieldCheck,
  },
  {
    href: "/cookie-policy",
    title: "Cookie Policy",
    body: "Cookie inventory, optional categories, durations, and consent controls.",
    icon: Cookie,
  },
  {
    href: "/data-protection",
    title: "Data Protection & DPDP",
    body: "Privacy governance, requests, consent, processors, breaches, and readiness.",
    icon: FileCheck2,
  },
  {
    href: "/acceptable-use-policy",
    title: "Acceptable Use",
    body: "Authorized use of models, APIs, data, brokers, automation, and infrastructure.",
    icon: Scale,
  },
  {
    href: "/refund-cancellation-policy",
    title: "Billing & Cancellation",
    body: "Trials, renewals, cancellations, refunds, invoices, and enterprise terms.",
    icon: CheckCircle2,
  },
];

const programme = [
  [
    "Cookie consent",
    "Implemented",
    "Necessary-by-default consent manager with optional categories off until chosen.",
  ],
  [
    "DPDP readiness",
    "Baseline established",
    "Notice, rights, grievance, retention, processor, child-data, and breach controls documented.",
  ],
  [
    "ISO control mapping",
    "Design reference",
    "ISO/IEC 27001 and related standards guide controls; QSentia does not claim certification.",
  ],
  [
    "OAuth and sessions",
    "Implemented",
    "Supabase authentication, protected routes, session visibility, and provider-based sign-in.",
  ],
  [
    "Production legal review",
    "Required",
    "Entity details, vendor contracts, launch jurisdictions, and final operating procedures require counsel review.",
  ],
] as const;

export default function CompliancePage() {
  return (
    <PageShell active="/compliance">
      <section className="relative overflow-hidden border-b border-[#e2e7fb] bg-[#f8faff]">
        <TechnicalBackdrop />
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#3046c8]">
            <ShieldCheck className="h-4 w-4" /> Trust centre
          </div>
          <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.04] text-[#06130c] md:text-7xl">
            Compliance Centre
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-[#46554b] md:text-lg">
            QSentia&apos;s public policy set for privacy, security, consent,
            platform conduct, billing, and digital service delivery.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {policies.map((policy) => {
            const Icon = policy.icon;
            return (
              <Link
                key={policy.href}
                href={policy.href}
                className="group border border-[#dbe3ff] bg-white p-5 transition hover:border-[#3d52da]"
              >
                <span className="flex h-10 w-10 items-center justify-center bg-[#eef2ff] text-[#3d52da]">
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="mt-5 text-xl font-semibold text-[#06130c]">
                  {policy.title}
                </h2>
                <p className="mt-2 min-h-12 text-sm leading-6 text-[#5a685f]">
                  {policy.body}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#3046c8]">
                  Read policy{" "}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-y border-[#e2e7fb] bg-[#f8faff]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
          <div className="max-w-3xl">
            <div className="text-xs font-bold uppercase tracking-wide text-[#647269]">
              Programme status
            </div>
            <h2 className="mt-2 text-3xl font-semibold text-[#06130c]">
              Controls, evidence, and remaining work
            </h2>
          </div>
          <div className="mt-7 overflow-x-auto border border-[#dbe3ff] bg-white">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-[#e2e7fb] bg-[#fbfcff] text-xs uppercase tracking-wide text-[#647269]">
                <tr>
                  <th className="px-4 py-3">Area</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Position</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef2ff]">
                {programme.map(([area, status, position]) => (
                  <tr key={area}>
                    <td className="px-4 py-4 font-semibold text-[#06130c]">
                      {area}
                    </td>
                    <td className="px-4 py-4">
                      <span className="border border-[#c7d2fe] bg-[#eef2ff] px-2 py-1 text-xs font-bold uppercase tracking-wide text-[#3046c8]">
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-4 leading-6 text-[#5a685f]">
                      {position}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-5 max-w-4xl text-sm leading-6 text-[#5a685f]">
            Policy publication and framework alignment do not replace
            implementation evidence, legal advice, regulatory registration, or
            independent certification. QSentia will publish certification scope
            and auditor details only after a successful accredited audit.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
