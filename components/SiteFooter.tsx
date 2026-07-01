import type { ComponentType, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Database,
  Mail,
  ShieldCheck,
} from "lucide-react";
import CookieSettingsButton from "@/components/CookieSettingsButton";

type FooterLink = {
  href: string;
  label: string;
  external?: boolean;
};

type IconLink = FooterLink & {
  icon: ComponentType<{ className?: string }>;
};

const socialLinks: IconLink[] = [
  {
    href: "https://www.linkedin.com/company/qsentia.com/",
    label: "LinkedIn",
    icon: LinkedInMark,
    external: true,
  },
  {
    href: "mailto:inquiries@qsentia.com?subject=QSentia%20Institutional%20Inquiry",
    label: "Email",
    icon: Mail,
  },
];

const resourceLinks: IconLink[] = [
  { href: "/developers", label: "Developer center", icon: BookOpen },
  { href: "/research", label: "Research terminal", icon: BarChart3 },
  { href: "/data-room", label: "Investor data room", icon: Database },
];

const footerColumns: Array<{ title: string; links: FooterLink[] }> = [
  {
    title: "Investors",
    links: [
      { href: "/strategies", label: "Investment strategies" },
      { href: "/performance", label: "Performance center" },
      { href: "/risk-management", label: "Risk management" },
      { href: "/data-room", label: "Investor data room" },
      { href: "/methodology", label: "Methodology" },
      { href: "/insights", label: "Letters & research" },
    ],
  },
  {
    title: "Platform",
    links: [
      { href: "/platform", label: "Platform overview" },
      { href: "/marketplace", label: "Model marketplace" },
      { href: "/pricing", label: "Plans" },
      { href: "/demo", label: "Interactive demo" },
      { href: "/integrations", label: "Integrations" },
      { href: "/developers", label: "Developer center" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/", label: "About QSentia" },
      { href: "/firm", label: "Firm" },
      { href: "/team", label: "Team" },
      { href: "/problem-solution", label: "Problem & solution" },
      { href: "/careers", label: "Careers" },
      { href: "/faq", label: "FAQ" },
      { href: "/compliance", label: "Compliance centre" },
      { href: "/contact", label: "Contact us" },
      { href: "/signin", label: "Sign in" },
      { href: "/create-account", label: "Create account" },
    ],
  },
  {
    title: "Disclosures",
    links: [
      { href: "/disclaimer", label: "Risk disclaimer" },
      { href: "/security", label: "Security" },
      { href: "/privacy-policy", label: "Privacy policy" },
      { href: "/cookie-policy", label: "Cookie policy" },
      { href: "/data-protection", label: "GDPR & US privacy" },
      { href: "/acceptable-use-policy", label: "Acceptable use" },
      { href: "/terms-and-conditions", label: "Terms & conditions" },
      { href: "/refund-cancellation-policy", label: "Billing & cancellation" },
      { href: "/shipping-policy", label: "Shipping policy" },
    ],
  },
];

const legalLinks = [
  { href: "/privacy-policy", label: "Privacy" },
  { href: "/security", label: "Security" },
  { href: "/terms-and-conditions", label: "Terms" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/compliance", label: "Compliance" },
];

export default function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-[#dfe5f2] bg-white text-[#080b18]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-12">
        <div className="mb-10 grid gap-4 rounded-[10px] border border-[#dfe5f2] bg-[#f8faff] p-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#3046c8]">
              Institutional access
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal text-[#06130c]">
              Review strategy evidence, risk controls, and operating readiness.
            </h2>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/data-room"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#172554] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#2437b5]"
            >
              Investor materials
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#cbd5ff] bg-white px-4 py-2 text-sm font-bold text-[#172554] transition hover:border-[#3046c8]"
            >
              Contact
            </Link>
          </div>
        </div>

        <div className="grid gap-10 border-b border-[#dfe5f2] pb-10 lg:grid-cols-[0.95fr_2.05fr] lg:gap-16">
          <div className="max-w-xl">
            <Link
              href="/"
              className="inline-flex items-center"
              aria-label="QSentia home"
            >
              <Image
                src="/logo/qsentia-primary.png"
                alt="QSentia"
                width={148}
                height={36}
                className="h-8 w-auto"
              />
            </Link>
            <p className="mt-5 text-sm leading-6 text-[#4d5870]">
              Source-backed model telemetry, investor diligence workflows, and
              API surfaces for systematic strategy review, benchmark context,
              risk controls, and execution monitoring.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              {socialLinks.map((link) => (
                <IconButton key={link.label} link={link} />
              ))}
            </div>

            <div className="mt-7 grid gap-2">
              {resourceLinks.map((link) => (
                <ResourceLink key={link.label} link={link} />
              ))}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
            {footerColumns.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <h2 className="text-sm font-bold text-[#080b18]">
                  {column.title}
                </h2>
                <ul className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <li key={`${column.title}-${link.href}-${link.label}`}>
                      <FooterAnchor link={link} />
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="grid gap-5 pt-7 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex max-w-3xl gap-3 text-sm leading-6 text-[#4d5870]">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#cfd7eb] bg-[#f8faff] text-[#3046c8]">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <p>
              Quantitative trading systems involve risk. Historical or
              paper-trading information does not guarantee future results. Data
              shown only reflects returned source logs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-[#4d5870] lg:justify-end">
            <span className="text-[#06130c]">Copyright 2026 QSentia</span>
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-[#2b36ff]"
              >
                {link.label}
              </Link>
            ))}
            <CookieSettingsButton className="transition-colors hover:text-[#2b36ff]" />
          </div>
        </div>
      </div>
    </footer>
  );
}

function IconButton({ link }: { link: IconLink }) {
  const Icon = link.icon;

  return (
    <FooterLinkShell
      link={link}
      className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#d6dded] bg-white text-[#111827] transition hover:border-[#3046c8] hover:bg-[#f8faff] hover:text-[#3046c8]"
      ariaLabel={link.label}
    >
      <Icon className="h-4 w-4" />
    </FooterLinkShell>
  );
}

function ResourceLink({ link }: { link: IconLink }) {
  const Icon = link.icon;

  return (
    <FooterLinkShell
      link={link}
      className="group inline-flex min-h-11 items-center justify-between gap-3 rounded-md border border-[#d6dded] bg-white px-3.5 py-2 text-sm font-semibold text-[#111827] transition hover:border-[#3046c8] hover:bg-[#f8faff] hover:text-[#3046c8]"
    >
      <span className="inline-flex min-w-0 items-center gap-2">
        <Icon className="h-4 w-4 shrink-0 text-[#3046c8]" />
        <span>{link.label}</span>
      </span>
      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[#8a94aa] transition group-hover:text-[#3046c8]" />
    </FooterLinkShell>
  );
}

function FooterAnchor({ link }: { link: FooterLink }) {
  return (
    <FooterLinkShell
      link={link}
      className="inline-flex items-center gap-1.5 text-sm leading-6 text-[#4d5870] transition-colors hover:text-[#3046c8]"
    >
      {link.label}
      {link.external && <ArrowUpRight className="h-3.5 w-3.5" />}
    </FooterLinkShell>
  );
}

function FooterLinkShell({
  ariaLabel,
  children,
  className,
  link,
}: {
  ariaLabel?: string;
  children: ReactNode;
  className: string;
  link: FooterLink;
}) {
  const isApiRoute = link.href.startsWith("/api/");
  const isMailRoute = link.href.startsWith("mailto:");

  if (link.external || isApiRoute || isMailRoute) {
    return (
      <a
        href={link.href}
        aria-label={ariaLabel}
        className={className}
        target={link.external ? "_blank" : undefined}
        rel={link.external ? "noreferrer" : undefined}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={link.href} aria-label={ariaLabel} className={className}>
      {children}
    </Link>
  );
}

function LinkedInMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M5.34 8.86H2.67v12.08h2.67V8.86ZM4 3.06a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm17.33 11.15c0-3.24-1.73-5.35-4.54-5.35-1.53 0-2.6.73-3.17 1.7h-.05v-1.7h-2.67v12.08h2.67v-6.5c0-1.73.88-3.02 2.47-3.02 1.55 0 2.62 1.09 2.62 3.08v6.44h2.67v-6.73ZM9.29 8.86H6.62v12.08h2.67V8.86Z" />
    </svg>
  );
}
