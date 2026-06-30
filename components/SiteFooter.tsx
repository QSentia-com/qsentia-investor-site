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
    href: "https://github.com/FinTechEntrepreneurldz/qsentia-investor-site",
    label: "GitHub",
    icon: GitHubMark,
    external: true,
  },
  {
    href: "https://www.linkedin.com/company/qsentia.con/",
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
  { href: "/docs", label: "Docs", icon: BookOpen },
  { href: "/api/dashboard", label: "Dashboard API", icon: Database },
  { href: "/dashboard", label: "Live dashboard", icon: BarChart3 },
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
    <footer className="relative z-10 border-t border-[#dfe5f2] bg-[#f7f8fb] text-[#080b18]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-14">
        <div className="grid gap-10 border-b border-[#dfe5f2] pb-10 lg:grid-cols-[1.05fr_1.95fr] lg:gap-14">
          <div>
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
            <p className="mt-5 max-w-md text-sm leading-6 text-[#4d5870]">
              Live model telemetry, research workflows, and API surfaces for
              systematic investment diligence, benchmark review, and execution
              monitoring.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              {socialLinks.map((link) => (
                <IconButton key={link.label} link={link} />
              ))}
            </div>

            <div className="mt-7 grid gap-2 sm:max-w-lg sm:grid-cols-3">
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

        <div className="flex flex-col gap-5 pt-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex max-w-3xl gap-3 text-sm leading-6 text-[#4d5870]">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#cfd7eb] bg-white text-[#2b36ff]">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <p>
              Quantitative trading systems involve risk. Historical or
              paper-trading information does not guarantee future results. Data
              shown only reflects returned source logs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-[#4d5870]">
            <span>Copyright 2026 QSentia</span>
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
      className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#d6dded] bg-white text-[#111827] shadow-sm transition hover:border-[#2b36ff] hover:text-[#2b36ff]"
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
      className="group inline-flex min-h-12 items-center justify-between gap-3 rounded-md border border-[#d6dded] bg-white px-3 py-2 text-sm font-semibold text-[#111827] shadow-sm transition hover:border-[#2b36ff] hover:text-[#2b36ff]"
    >
      <span className="inline-flex min-w-0 items-center gap-2">
        <Icon className="h-4 w-4 shrink-0 text-[#2b36ff]" />
        <span className="truncate">{link.label}</span>
      </span>
      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[#8a94aa] transition group-hover:text-[#2b36ff]" />
    </FooterLinkShell>
  );
}

function FooterAnchor({ link }: { link: FooterLink }) {
  return (
    <FooterLinkShell
      link={link}
      className="inline-flex items-center gap-1.5 text-sm leading-6 text-[#4d5870] transition-colors hover:text-[#2b36ff]"
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

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M12 2C6.48 2 2 6.58 2 12.24c0 4.52 2.87 8.35 6.85 9.7.5.1.68-.22.68-.49v-1.72c-2.78.62-3.37-1.38-3.37-1.38-.46-1.19-1.11-1.51-1.11-1.51-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.56 2.35 1.11 2.92.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.35 9.35 0 0 1 12 6.94c.85 0 1.7.12 2.5.34 1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9v2.81c0 .27.18.59.69.49A10.2 10.2 0 0 0 22 12.24C22 6.58 17.52 2 12 2Z" />
    </svg>
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
