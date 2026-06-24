import type { Metadata } from "next";
import { PageShell } from "@/components/PageChrome";

export const metadata: Metadata = {
  title: "Security | QSentia",
  description:
    "QSentia security architecture, data handling, API key lifecycle, access controls, and roadmap toward third-party validation.",
};

// ─── types ────────────────────────────────────────────────────────────────────

type StatusValue = "implemented" | "in-progress" | "planned" | "not-claimed";

interface ControlRow {
  control: string;
  detail: string;
  status: StatusValue;
}

// ─── data ─────────────────────────────────────────────────────────────────────

const transportControls: ControlRow[] = [
  {
    control: "TLS 1.2 / 1.3 in transit",
    detail:
      "All traffic between clients and QSentia is encrypted via HTTPS. Enforced at the Vercel edge — no plain-HTTP fallback.",
    status: "implemented",
  },
  {
    control: "AES-256 encryption at rest",
    detail:
      "All production data persisted in Supabase (PostgreSQL) is encrypted at rest by default using AES-256. This is a platform-level guarantee from Supabase/AWS.",
    status: "implemented",
  },
  {
    control: "Secure cookie flags",
    detail:
      "Session cookies are set with HttpOnly and Secure flags. SameSite policy is enforced to mitigate CSRF exposure.",
    status: "implemented",
  },
];

const authControls: ControlRow[] = [
  {
    control: "Supabase Auth (OAuth + email)",
    detail:
      "Authentication is handled by Supabase Auth. Passwords are never stored in plaintext — Supabase uses bcrypt hashing internally.",
    status: "implemented",
  },
  {
    control: "Protected route middleware",
    detail:
      "Next.js middleware enforces session validation on all authenticated routes. Unauthenticated requests are redirected before page content is served.",
    status: "implemented",
  },
  {
    control: "API key hashing",
    detail:
      "Platform API keys are stored as hashed values. The raw key is shown once at issuance and never retrievable again.",
    status: "implemented",
  },
  {
    control: "API key rotation and revocation",
    detail:
      "Key rotation and instant revocation endpoints are in active development. Admins can currently revoke keys via the back-office panel.",
    status: "in-progress",
  },
  {
    control: "Role-based access control (RBAC)",
    detail:
      "Distinct access tiers (admin, platform user, read-only investor) are in design. Supabase Row Level Security policies are being mapped to these roles.",
    status: "in-progress",
  },
  {
    control: "Row Level Security (RLS) on all tables",
    detail:
      "Supabase RLS is enabled on production tables. Full policy coverage across all data models is being completed.",
    status: "in-progress",
  },
  {
    control: "MFA / 2FA",
    detail:
      "Multi-factor authentication support is on the roadmap. Planned via Supabase Auth MFA (TOTP).",
    status: "planned",
  },
];

const dataControls: ControlRow[] = [
  {
    control: "Data residency",
    detail:
      "QSentia's Supabase project is hosted in the AWS ap-south-1 (Mumbai) region. All user and platform data resides within India.",
    status: "implemented",
  },
  {
    control: "DPDP Act (India) baseline",
    detail:
      "Data handling practices are aligned with India's Digital Personal Data Protection Act 2023. See the DPDP readiness page for detail.",
    status: "implemented",
  },
  {
    control: "Data retention policy",
    detail:
      "User account data is retained for the duration of the active relationship. On account deletion, personal data is purged within 30 days. Model telemetry logs follow a 90-day rolling retention.",
    status: "implemented",
  },
  {
    control: "Third-party data sharing",
    detail:
      "QSentia does not sell or rent user data. Data is shared only with infrastructure providers (Supabase, Vercel) under contractual data processing agreements.",
    status: "implemented",
  },
];

const apiControls: ControlRow[] = [
  {
    control: "Key issuance",
    detail:
      "API keys are admin-issued and scoped by entitlement tier. Each key maps to a specific set of endpoint permissions.",
    status: "implemented",
  },
  {
    control: "Key storage",
    detail:
      "Keys are stored as hashed values only. QSentia staff cannot retrieve a key after issuance.",
    status: "implemented",
  },
  {
    control: "Rate limiting",
    detail:
      "Preview and demo endpoints are rate-limited per client session. Production endpoint rate limits are being formalised.",
    status: "in-progress",
  },
  {
    control: "No client-side key exposure",
    detail:
      "Private tokens are never included in browser-side code. All sensitive API calls are proxied server-side via Next.js API routes.",
    status: "implemented",
  },
  {
    control: "Webhook signing",
    detail: "HMAC-signed webhook payloads are on the developer roadmap.",
    status: "planned",
  },
];

const operationalControls: ControlRow[] = [
  {
    control: "Incident response policy",
    detail:
      "A documented incident response process is in place. Affected users are notified within 72 hours of a confirmed breach, consistent with DPDP obligations.",
    status: "implemented",
  },
  {
    control: "Audit log exports",
    detail:
      "Structured execution and access audit logs are available in the dashboard. Downloadable export as CSV is in active development.",
    status: "in-progress",
  },
  {
    control: "Dependency vulnerability scanning",
    detail:
      "GitHub Dependabot alerts are enabled on the production repository. Critical CVEs are reviewed within 5 business days.",
    status: "implemented",
  },
  {
    control: "CI/CD pipeline security",
    detail:
      "GitHub Actions CI runs on pull requests. Secrets are stored as encrypted GitHub Actions secrets — never hardcoded in source.",
    status: "implemented",
  },
  {
    control: "SOC 2 Type I audit",
    detail:
      "QSentia does not currently hold SOC 2 certification. We are building toward a Type I audit. Target scope: Q4 2026.",
    status: "planned",
  },
  {
    control: "Penetration testing",
    detail:
      "Third-party penetration testing is planned prior to institutional launch.",
    status: "planned",
  },
];

// ─── badge ────────────────────────────────────────────────────────────────────

const statusMeta: Record<
  StatusValue,
  { label: string; bg: string; text: string; dot: string }
> = {
  implemented: {
    label: "Implemented",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  "in-progress": {
    label: "In progress",
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-400",
  },
  planned: {
    label: "Planned",
    bg: "bg-slate-100",
    text: "text-slate-600",
    dot: "bg-slate-400",
  },
  "not-claimed": {
    label: "Not claimed",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-400",
  },
};

function StatusBadge({ status }: { status: StatusValue }) {
  const m = statusMeta[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${m.bg} ${m.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

// ─── section ──────────────────────────────────────────────────────────────────

function ControlSection({
  title,
  description,
  rows,
}: {
  title: string;
  description: string;
  rows: ControlRow[];
}) {
  return (
    <section className="mb-12">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
        {rows.map((row) => (
          <div
            key={row.control}
            className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 px-5 py-4 bg-white hover:bg-slate-50 transition-colors"
          >
            <div>
              <p className="text-sm font-medium text-slate-800">
                {row.control}
              </p>
              <p className="mt-0.5 text-sm text-slate-500 leading-relaxed">
                {row.detail}
              </p>
            </div>
            <div className="flex items-start sm:justify-end">
              <StatusBadge status={row.status} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function SecurityPage() {
  return (
    <PageShell active="/security">
      <main className="min-h-screen bg-slate-50">
        {/* ── hero ── */}
        <div className="border-b border-slate-200 bg-white">
          <div className="max-w-4xl mx-auto px-6 py-16">
            <p className="text-xs font-medium tracking-widest uppercase text-slate-400 mb-3">
              Security
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 leading-tight">
              How QSentia handles your data
            </h1>
            <p className="mt-4 text-base text-slate-500 leading-relaxed max-w-2xl">
              This page documents our current security controls, what is in
              progress, and what we have not yet built. We do not overclaim.
              Every status below reflects the actual state of the platform.
            </p>

            {/* legend */}
            <div className="mt-8 flex flex-wrap gap-4">
              {(
                Object.entries(statusMeta) as [
                  StatusValue,
                  (typeof statusMeta)[StatusValue],
                ][]
              ).map(([key, m]) => (
                <span
                  key={key}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${m.bg} ${m.text}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
                  {m.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── disclosure banner ── */}
        <div className="max-w-4xl mx-auto px-6 pt-10">
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800 leading-relaxed">
            <span className="font-semibold">
              No third-party certification yet.
            </span>{" "}
            QSentia does not currently hold SOC 2, ISO 27001, or any other
            third-party security certification. The controls below are
            self-assessed. Independent audit is on our roadmap — we will update
            this page when that status changes.
          </div>
        </div>

        {/* ── control sections ── */}
        <div className="max-w-4xl mx-auto px-6 pt-10 pb-20">
          <ControlSection
            title="Encryption"
            description="How data is protected in transit and at rest."
            rows={transportControls}
          />
          <ControlSection
            title="Authentication and access"
            description="How users and services are verified and what they can reach."
            rows={authControls}
          />
          <ControlSection
            title="Data handling and residency"
            description="Where data lives, how long it's kept, and who it's shared with."
            rows={dataControls}
          />
          <ControlSection
            title="API key lifecycle"
            description="How platform keys are issued, scoped, stored, and revoked."
            rows={apiControls}
          />
          <ControlSection
            title="Operational security"
            description="Incident response, audit logs, vulnerability management, and certification roadmap."
            rows={operationalControls}
          />

          {/* ── responsible disclosure ── */}
          <section className="border border-slate-200 rounded-xl bg-white px-6 py-6 mb-12">
            <h2 className="text-base font-semibold text-slate-900 mb-2">
              Responsible disclosure
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-4">
              If you discover a security vulnerability in QSentia, please report
              it to us before disclosing publicly. We will acknowledge receipt
              within 2 business days and aim to resolve confirmed issues within
              14 days.
            </p>
            <a
              href="mailto:security@qsentia.com?subject=Security+Vulnerability+Report"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-800 border border-slate-300 rounded-lg px-4 py-2 hover:bg-slate-50 transition-colors"
            >
              admin@qsentia.com
            </a>
          </section>

          {/* ── footer note ── */}
          <p className="text-xs text-slate-400 text-center leading-relaxed">
            Last reviewed: June 2026 · This page is updated when control status
            changes. For compliance documentation, see the{" "}
            <a
              href="/compliance"
              className="underline underline-offset-2 hover:text-slate-600"
            >
              compliance centre
            </a>
            . For data privacy, see the{" "}
            <a
              href="/privacy-policy"
              className="underline underline-offset-2 hover:text-slate-600"
            >
              privacy policy
            </a>
            .
          </p>
        </div>
      </main>
    </PageShell>
  );
}
