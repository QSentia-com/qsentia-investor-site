"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";
import { ChevronDown, Loader2, Menu, X } from "lucide-react";
import AuthSessionMenu from "@/components/AuthSessionMenu";

const navItems = [
  {
    href: "/strategies",
    label: "Investors",
    children: [
      {
        href: "/strategies",
        label: "Investment strategies",
        description:
          "Objectives, operating status, and published model evidence.",
      },
      {
        href: "/performance",
        label: "Performance center",
        description: "Returns, benchmarks, rolling risk, and methodology.",
      },
      {
        href: "/risk-management",
        label: "Risk management",
        description: "Signal gates, limits, reconciliation, and controls.",
      },
      {
        href: "/data-room",
        label: "Investor data room",
        description: "Qualification and controlled diligence materials.",
      },
      {
        href: "/methodology",
        label: "Methodology",
        description: "The process from inputs through monitored execution.",
      },
      {
        href: "/firm",
        label: "Firm",
        description:
          "Research philosophy, operating model, and verified team profiles.",
      },
      {
        href: "/insights",
        label: "Letters & research",
        description: "Firm-approved commentary and methodology updates.",
      },
    ],
  },
  {
    href: "/platform",
    label: "Platform",
    children: [
      {
        href: "/platform",
        label: "Platform overview",
        description:
          "Telemetry, validation, broker readiness, and audit trails.",
      },
      {
        href: "/marketplace",
        label: "Model marketplace",
        description: "Published model cards and commercial access.",
      },
      {
        href: "/pricing",
        label: "Plans",
        description:
          "Research, marketplace, monitoring, and enterprise packaging.",
      },
      {
        href: "/demo",
        label: "Interactive demo",
        description: "A clearly labeled synthetic product sandbox.",
      },
      {
        href: "/integrations",
        label: "Integrations",
        description: "Current connectivity and planned connector status.",
      },
      {
        href: "/developers",
        label: "Developer center",
        description: "API contracts, keys, schemas, and OpenAPI.",
      },
    ],
  },
  {
    href: "/research",
    label: "Research",
    children: [
      {
        href: "/research",
        label: "Research terminal",
        description: "Live fund tickers, filters, and normalized curves.",
      },
      {
        href: "/mleq",
        label: "MLEQ engine",
        description: "Machine Learning Equity Quant system overview.",
      },
    ],
  },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({
  active,
  theme = "light",
}: {
  active?: string;
  theme?: "light" | "dark";
}) {
  const dark = theme === "dark";
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur ${
        dark
          ? "border-[#18233f] bg-[#050714]/94"
          : "border-[#e2e7fb] bg-white/95"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label="Qsentia home"
        >
          <Image
            src="/logo/qsentia-primary.png"
            alt="Qsentia"
            width={138}
            height={34}
            priority
            className={`h-7 w-auto ${dark ? "brightness-0 invert" : ""}`}
          />
        </Link>

        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Primary navigation"
        >
          {navItems.map((item) => {
            const isActive =
              active === item.href ||
              item.children?.some((child) => child.href === active);

            if (item.children) {
              return (
                <div key={item.href} className="group relative">
                  <Link
                    href={item.href}
                    className={`inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold transition ${
                      isActive
                        ? dark
                          ? "bg-[#10172b] text-[#b7c5ff]"
                          : "bg-[#eef2ff] text-[#3d52da]"
                        : dark
                          ? "text-[#d7dfed] hover:bg-[#10172b]"
                          : "text-[#26352c] hover:bg-[#eef2ff]"
                    }`}
                    aria-haspopup="menu"
                  >
                    {item.label}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Link>
                  <div className="pointer-events-none absolute left-0 top-full z-50 w-[330px] translate-y-2 pt-2 opacity-0 transition group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
                    <div
                      className={`rounded-[10px] border p-2 shadow-[0_18px_50px_rgba(15,31,22,0.14)] ${
                        dark
                          ? "border-[#18233f] bg-[#070b19]"
                          : "border-[#e2e7fb] bg-white"
                      }`}
                      role="menu"
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`block rounded-md px-3 py-3 transition ${
                            active === child.href
                              ? dark
                                ? "bg-[#10172b]"
                                : "bg-[#eef2ff]"
                              : dark
                                ? "hover:bg-[#10172b]"
                                : "hover:bg-[#f8faff]"
                          }`}
                          role="menuitem"
                        >
                          <span
                            className={`block text-sm font-semibold ${dark ? "text-white" : "text-[#06130c]"}`}
                          >
                            {child.label}
                          </span>
                          <span
                            className={`mt-1 block text-xs leading-5 ${dark ? "text-[#8d98b5]" : "text-[#647269]"}`}
                          >
                            {child.description}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? dark
                      ? "bg-[#10172b] text-[#b7c5ff]"
                      : "bg-[#eef2ff] text-[#3d52da]"
                    : dark
                      ? "text-[#d7dfed] hover:bg-[#10172b]"
                      : "text-[#26352c] hover:bg-[#eef2ff]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <AuthSessionMenu theme={theme} />
        </div>
        <button
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
          className={`flex h-10 w-10 items-center justify-center rounded-md border md:hidden ${dark ? "border-[#24304d] text-white" : "border-[#dbe3ff] text-[#172554]"}`}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {menuOpen ? (
        <nav
          className={`border-t px-4 py-4 md:hidden ${dark ? "border-[#18233f] bg-[#050714]" : "border-[#e2e7fb] bg-white"}`}
          aria-label="Mobile navigation"
        >
          <div className="mx-auto grid max-w-7xl gap-1">
            {navItems.map((item) => (
              <div key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block rounded-md px-3 py-2 text-sm font-semibold ${dark ? "text-white hover:bg-[#10172b]" : "text-[#172554] hover:bg-[#eef2ff]"}`}
                >
                  {item.label}
                </Link>
                {item.children ? (
                  <div
                    className={`ml-3 grid gap-1 border-l pl-3 ${dark ? "border-[#24304d]" : "border-[#dbe3ff]"}`}
                  >
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setMenuOpen(false)}
                        className={`rounded-md px-3 py-2 text-sm ${dark ? "text-[#aeb9d1] hover:bg-[#10172b]" : "text-[#5a685f] hover:bg-[#f8faff]"}`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            <div className="mt-3 border-t pt-3">
              <AuthSessionMenu theme={theme} />
            </div>
          </div>
        </nav>
      ) : null}
    </header>
  );
}

export function PageShell({
  active,
  children,
  className = "",
  headerTheme = "light",
}: {
  active?: string;
  children: ReactNode;
  className?: string;
  headerTheme?: "light" | "dark";
}) {
  const hasCustomBackground = className.includes("bg-");
  const hasCustomTextColor = className.includes("text-");

  return (
    <main
      className={`min-h-screen ${hasCustomBackground ? "" : "bg-white"} ${hasCustomTextColor ? "" : "text-[#0a0f0c]"} ${className}`}
    >
      <SiteHeader active={active} theme={headerTheme} />
      {children}
    </main>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center rounded-full border border-[#c7d2fe] bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[#3046c8]">
      {children}
    </div>
  );
}

export function TechnicalBackdrop({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(61,82,218,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(61,82,218,0.07)_1px,transparent_1px)] bg-[size:86px_86px]" />
      <div className="absolute left-[7%] top-[18%] h-16 w-16 rotate-[31deg] rounded-[5px] border border-[#3d52da]/18" />
      <div className="absolute left-[16%] top-[11%] h-9 w-9 rotate-[8deg] rounded-[5px] border border-[#3d52da]/18" />
      <div className="absolute bottom-[21%] left-[5%] h-3 w-3 rounded-full bg-[#3d52da]/12 ring-8 ring-[#3d52da]/5" />
      <div className="absolute right-[9%] top-[17%] h-20 w-20 -rotate-[16deg] rounded-[6px] border border-[#3d52da]/10" />
      <div className="absolute bottom-[16%] right-[17%] h-2.5 w-2.5 rounded-full bg-[#3d52da]/10 ring-6 ring-[#3d52da]/5" />
    </div>
  );
}

export function SectionCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`min-w-0 rounded-[10px] border border-[#e2e7fb] bg-white shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-md border border-dashed border-[#cbd5ff] bg-[#f8faff] p-6 text-center">
      <div className="font-semibold text-[#06130c]">{title}</div>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#5a685f]">
        {body}
      </p>
    </div>
  );
}

export function ApiLoadingPanel({
  title = "Loading live data",
  body = "Preparing source-backed telemetry for this workspace.",
  tone = "light",
  items = ["Model registry", "Portfolio history", "Benchmark data"],
}: {
  title?: string;
  body?: string;
  tone?: "light" | "dark";
  items?: string[];
}) {
  const dark = tone === "dark";

  return (
    <div
      className={`relative overflow-hidden rounded-[12px] border p-6 shadow-sm sm:p-8 ${
        dark
          ? "border-[#18233f] bg-[#080d1c] text-white"
          : "border-[#e2e7fb] bg-white text-[#06130c]"
      }`}
      role="status"
      aria-live="polite"
    >
      <div
        aria-hidden
        className={`absolute inset-0 ${
          dark
            ? "bg-[linear-gradient(to_right,rgba(111,124,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(111,124,255,0.08)_1px,transparent_1px)]"
            : "bg-[linear-gradient(to_right,rgba(61,82,218,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(61,82,218,0.06)_1px,transparent_1px)]"
        } bg-[size:64px_64px]`}
      />
      <div
        aria-hidden
        className={`absolute right-8 top-8 h-14 w-14 rotate-[16deg] rounded-md border ${dark ? "border-[#6f7cff]/16" : "border-[#3d52da]/14"}`}
      />
      <div
        aria-hidden
        className={`absolute bottom-8 left-8 h-2.5 w-2.5 rounded-full ${dark ? "bg-[#00d6b8]/25 ring-8 ring-[#00d6b8]/5" : "bg-[#3d52da]/16 ring-8 ring-[#3d52da]/5"}`}
      />

      <div className="relative z-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md ${
              dark
                ? "border border-[#24304d] bg-[#050714] text-[#00d6b8]"
                : "bg-[#eef2ff] text-[#3d52da]"
            }`}
          >
            <Loader2 className="h-5 w-5 animate-spin" />
          </span>
          <div>
            <div
              className={`text-lg font-semibold ${dark ? "text-white" : "text-[#06130c]"}`}
            >
              {title}
            </div>
            <p
              className={`mt-1 max-w-2xl text-sm leading-6 ${dark ? "text-[#9ba7c2]" : "text-[#5a685f]"}`}
            >
              {body}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {items.slice(0, 3).map((item) => (
            <div
              key={item}
              className={`rounded-md border px-3 py-2 text-xs font-semibold ${
                dark
                  ? "border-[#18233f] bg-[#050714] text-[#cbd5e1]"
                  : "border-[#e2e7fb] bg-[#fbfcff] text-[#46554b]"
              }`}
            >
              {item}
            </div>
          ))}
        </div>

        <div
          className={`mt-6 h-1.5 overflow-hidden rounded-full ${dark ? "bg-[#121a2f]" : "bg-[#eef2ff]"}`}
        >
          <div
            className={`h-full w-1/3 rounded-full [animation:buffer-slide_1.45s_ease-in-out_infinite] ${
              dark ? "bg-[#00d6b8]" : "bg-[#3d52da]"
            }`}
          />
        </div>
      </div>

      <style>{`
        @keyframes buffer-slide {
          0% { transform: translateX(-115%); }
          55% { transform: translateX(190%); }
          100% { transform: translateX(260%); }
        }
      `}</style>
    </div>
  );
}
