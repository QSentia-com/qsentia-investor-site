"use client";

import type { ComponentType, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";
import {
  Activity,
  ArrowRight,
  Bot,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Code2,
  CreditCard,
  Database,
  Download,
  FileText,
  KeyRound,
  LifeBuoy,
  Link2,
  LogOut,
  PlugZap,
  ReceiptText,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import CustomerControlCenter from "@/components/CustomerControlCenter";
import { SectionCard } from "@/components/PageChrome";
import { fmtNum, fmtPct } from "@/lib/metrics";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

type CustomerUser = {
  name: string;
  email: string;
  organization: string;
};

type Model = {
  id: string;
  slug: string;
  name: string;
  category: string;
  accessStatus?: string;
  performance?: {
    sharpeRatio?: number | null;
    annualizedReturn?: number | null;
    maxDrawdown?: number | null;
    winRate?: number | null;
  };
};

type ModelsResponse = {
  models?: Model[];
};

type BillingResponse = {
  account: {
    id: string | null;
    billingStatus: string;
    billingEmail: string;
    billingEntity: string | null;
    taxStatus: string | null;
  };
  subscription: {
    plan: string | null;
    status: string;
    interval: string | null;
    currency: string;
    monthlyAmount: number | null;
    trialEndsAt: string | null;
    nextInvoiceAt: string | null;
    activeSeats: number;
    includedModels: number;
    modelIds: string[];
  };
  paymentMethod: {
    status: string | null;
    brand: string | null;
    last4: string | null;
    autopay: boolean;
  };
  usage: Array<{ label: string; used: number; limit: number }>;
  invoices: Array<{
    id: string;
    period: string;
    issuedAt: string;
    dueAt: string;
    amount: number;
    status: string;
  }>;
  checklist: Array<{ label: string; status: string }>;
};

type WorkspaceResponse = {
  account: {
    workspaceId: string | null;
    stage: string;
    environment: string;
    onboardingOwner: string | null;
  };
  billingAddress: {
    company: string | null;
    contact: string;
    line1: string | null;
    line2: string | null;
    city: string | null;
    region: string | null;
    postalCode: string | null;
    country: string | null;
  };
  broker: {
    status: string;
    provider: string | null;
    accountMode: string | null;
    credentialsVault: string | null;
  };
  apiAccess: {
    keyStatus: string;
    keyScope: string | null;
    webhookStatus: string;
    environment: string;
    lastRotation: string | null;
  };
  automation: {
    status: string;
    scheduler: string | null;
    workerRuntime: string | null;
    cronExpression: string | null;
    cadence: string | null;
    timezone: string | null;
    nextRunAt: string | null;
    approvalPolicy: string | null;
  };
  risk: {
    capitalLimit: string | null;
    maxDailyLoss: string | null;
    orderType: string | null;
    approvalMode: string | null;
  };
  readiness: Array<{ label: string; status: string; owner: string }>;
  activity: Array<{ title: string; body: string; timestamp: string }>;
};

type SectionId =
  | "overview"
  | "billing"
  | "models"
  | "api"
  | "broker"
  | "deployment"
  | "support";

type NavItem = {
  id: SectionId;
  label: string;
  detail: string;
  icon: ComponentType<{ className?: string }>;
};

type DashboardContext = {
  billing?: BillingResponse;
  billingAmount: string;
  billingEntity: string;
  billingStatus: string;
  environment: string;
  licensedModels: Model[];
  loading: boolean;
  paymentMethod: string;
  planName: string;
  renewalDate: string | null;
  sessionUser: CustomerUser;
  workspace?: WorkspaceResponse;
  workspaceId: string;
};

const navItems: NavItem[] = [
  { id: "overview", label: "Overview", detail: "Account health", icon: Activity },
  { id: "billing", label: "Billing", detail: "Plan, invoices, address", icon: CreditCard },
  { id: "models", label: "Model access", detail: "Entitlements", icon: Database },
  { id: "api", label: "API & usage", detail: "Keys, limits, calls", icon: KeyRound },
  { id: "broker", label: "Broker setup", detail: "Authorization", icon: PlugZap },
  { id: "deployment", label: "Deployment", detail: "Scheduler and controls", icon: Bot },
  { id: "support", label: "Support", detail: "Requests and audit", icon: LifeBuoy },
];

const fetcher = async (url: string) => {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
};

function label(value?: string | null) {
  if (!value) return "Not configured";
  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function cleanMetric(value: string) {
  return value === "Pending" ? "Not reported" : value;
}

function dateLabel(value?: string | null) {
  if (!value) return "Not scheduled";
  const datePart = String(value).replace("_", "T").split("T")[0];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return "Not scheduled";
  return datePart;
}

function currency(amount: number | null | undefined, currencyCode = "USD") {
  if (typeof amount !== "number" || !Number.isFinite(amount)) return "Not configured";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: amount % 1 ? 2 : 0,
  }).format(amount);
}

export default function CustomerDashboard({ user }: { user: CustomerUser }) {
  const [activeSection, setActiveSection] = useState<SectionId>("overview");
  const [sessionUser, setSessionUser] = useState<CustomerUser>(user);
  const { data: modelData, isLoading: loadingModels } = useSWR<ModelsResponse>(
    "/api/models",
    fetcher,
    { refreshInterval: 60000 },
  );
  const { data: billing, isLoading: loadingBilling } =
    useSWR<BillingResponse>("/api/customer/billing", fetcher, {
      refreshInterval: 60000,
    });
  const { data: workspace, isLoading: loadingWorkspace } =
    useSWR<WorkspaceResponse>("/api/customer/workspace", fetcher, {
      refreshInterval: 60000,
    });

  const loading = loadingModels || loadingBilling || loadingWorkspace;
  const licensedModelIds = useMemo(
    () => new Set(billing?.subscription.modelIds || []),
    [billing?.subscription.modelIds],
  );
  const licensedModels = (modelData?.models || []).filter((model) =>
    licensedModelIds.has(model.id),
  );
  const billingStatus = billing?.account.billingStatus || "Not configured";
  const planName = billing?.subscription.plan || "Not configured";
  const renewalDate =
    billing?.subscription.trialEndsAt || billing?.subscription.nextInvoiceAt || null;
  const billingAmount = currency(
    billing?.subscription.monthlyAmount ?? null,
    billing?.subscription.currency || "USD",
  );
  const paymentMethod =
    billing?.paymentMethod.brand && billing.paymentMethod.last4
      ? `${billing.paymentMethod.brand} ${billing.paymentMethod.last4}`
      : "Not added";
  const workspaceId = workspace?.account.workspaceId || "Not configured";
  const environment = workspace?.account.environment || "Not configured";
  const billingEntity =
    workspace?.billingAddress.company ||
    billing?.account.billingEntity ||
    sessionUser.organization ||
    "Not configured";

  useEffect(() => {
    let active = true;
    const supabaseClient = getSupabaseBrowserClient();
    if (!supabaseClient) return;
    const authClient = supabaseClient;

    async function updateProfile() {
      const {
        data: { user: authUser },
      } = await authClient.auth.getUser();

      if (!active || !authUser) return;

      const metadata = authUser.user_metadata || {};
      const name =
        typeof metadata.full_name === "string" && metadata.full_name.trim()
          ? metadata.full_name.trim()
          : typeof metadata.name === "string" && metadata.name.trim()
            ? metadata.name.trim()
            : authUser.email?.split("@")[0] || user.name;
      const organization =
        typeof metadata.organization === "string" && metadata.organization.trim()
          ? metadata.organization.trim()
          : user.organization;

      setSessionUser({
        name,
        email: authUser.email || user.email,
        organization,
      });
    }

    updateProfile();
    const {
      data: { subscription },
    } = authClient.auth.onAuthStateChange(() => {
      updateProfile();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [user]);

  async function logout() {
    const supabase = getSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    window.localStorage.removeItem("qsentia_user_session");
    window.location.href = "/signin";
  }

  const context: DashboardContext = {
    billing,
    billingAmount,
    billingEntity,
    billingStatus,
    environment,
    licensedModels,
    loading,
    paymentMethod,
    planName,
    renewalDate,
    sessionUser,
    workspace,
    workspaceId,
  };
  const activeNav = navItems.find((item) => item.id === activeSection) || navItems[0];

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#0f172a]">
      <div className="mx-auto grid max-w-[1540px] lg:grid-cols-[292px_minmax(0,1fr)]">
        <aside className="border-b border-[#dfe6f3] bg-white/95 text-[#0f172a] shadow-[1px_0_0_rgba(15,23,42,0.04)] backdrop-blur lg:sticky lg:top-16 lg:max-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-4rem)] lg:overflow-y-auto lg:border-b-0 lg:border-r">
          <div className="flex h-full flex-col px-4 py-5">
            <div className="rounded-[14px] border border-[#dfe6f3] bg-[#f8faff] p-4">
              <div className="flex items-center gap-3">
                <Link href="/" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-[#cbd5ff] bg-white" aria-label="QSentia home">
                  <Image src="/logo/qsentia-primary.png" alt="QSentia" width={26} height={26} className="h-7 w-7 object-contain" />
                </Link>
                <div>
                  <div className="text-sm font-semibold text-[#0f172a]">QSentia</div>
                  <div className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#3d52da]">
                    Settings
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-[#5a685f]">
                Manage model entitlements, API usage, billing, broker readiness,
                and deployment controls from one account workspace.
              </p>
            </div>

            <div className="mt-6 px-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#647269]">
              Workspace
            </div>
            <nav className="mt-2 grid gap-1" aria-label="Settings navigation">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = item.id === activeSection;

                return (
                  <button
                    key={item.id}
                    type="button"
                    suppressHydrationWarning
                    onClick={() => setActiveSection(item.id)}
                    className={`group flex items-start gap-3 rounded-[10px] border px-3 py-3 text-left text-sm transition ${
                      active
                        ? "border-[#cbd5ff] bg-[#eef2ff] text-[#172554] shadow-sm"
                        : "border-transparent text-[#334155] hover:border-[#dfe6f3] hover:bg-[#f8faff]"
                    }`}
                  >
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                      active ? "bg-white text-[#3d52da]" : "bg-[#f1f5ff] text-[#64748b] group-hover:text-[#3d52da]"
                    }`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-semibold">{item.label}</span>
                      <span className={`mt-0.5 block truncate text-xs ${active ? "text-[#46554b]" : "text-[#647269]"}`}>
                        {item.detail}
                      </span>
                    </span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-6 rounded-[14px] border border-[#dfe6f3] bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#172554] text-sm font-semibold text-white">
                  {sessionUser.name.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-[#0f172a]">
                    {sessionUser.name}
                  </div>
                  <div className="mt-1 truncate text-xs text-[#647269]">
                    {sessionUser.email}
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-md border border-[#e2e7fb] bg-[#f8faff] px-3 py-2">
                  <div className="font-bold uppercase tracking-wide text-[#647269]">Plan</div>
                  <div className="mt-1 truncate font-semibold text-[#172554]">{planName}</div>
                </div>
                <div className="rounded-md border border-[#e2e7fb] bg-[#f8faff] px-3 py-2">
                  <div className="font-bold uppercase tracking-wide text-[#647269]">Models</div>
                  <div className="mt-1 font-semibold text-[#172554]">{licensedModels.length}</div>
                </div>
              </div>
              <button
                type="button"
                suppressHydrationWarning
                onClick={logout}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-[#cfd7e6] bg-white px-3 py-2 text-sm font-semibold text-[#172554] transition hover:border-[#3d52da] hover:bg-[#f8faff]"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>

            <Link
              href="/contact"
              className="mt-auto hidden items-center justify-between rounded-[10px] border border-[#dfe6f3] bg-white px-3 py-3 text-sm font-semibold text-[#172554] transition hover:border-[#3d52da] hover:bg-[#f8faff] lg:flex"
            >
              Contact support
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </aside>

        <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 overflow-hidden rounded-[16px] border border-[#dbe3ff] bg-white shadow-sm">
            <div className="border-b border-[#e2e7fb] bg-[linear-gradient(135deg,#ffffff_0%,#f4f7ff_55%,#eef2ff_100%)] p-5 md:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#3d52da]">
                    Account settings
                  </div>
                  <h1 className="mt-2 text-3xl font-semibold tracking-[-0.01em] text-[#06130c]">
                    {sectionTitle(activeSection)}
                  </h1>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5a685f]">
                    {sectionDescription(activeSection)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusPill value={environment} />
                  <StatusPill value={loading ? "Refreshing" : "Current"} />
                </div>
              </div>
            </div>
            <div className="grid gap-px bg-[#e2e7fb] sm:grid-cols-3">
              <WorkspaceStat label="Workspace" value={workspaceId} />
              <WorkspaceStat label="Billing" value={label(billingStatus)} />
              <WorkspaceStat label="Active section" value={activeNav.detail} />
            </div>
          </div>

          {activeSection === "overview" ? <OverviewSection ctx={context} /> : null}
          {activeSection === "billing" ? <BillingSection ctx={context} /> : null}
          {activeSection === "models" ? <ModelsSection ctx={context} /> : null}
          {activeSection === "api" ? <ApiSection ctx={context} /> : null}
          {activeSection === "broker" ? <BrokerSection ctx={context} /> : null}
          {activeSection === "deployment" ? <DeploymentSection ctx={context} /> : null}
          {activeSection === "support" ? <SupportSection ctx={context} /> : null}
        </main>
      </div>
    </div>
  );
}

function sectionTitle(section: SectionId) {
  const titles: Record<SectionId, string> = {
    overview: "Customer control center",
    billing: "Billing and subscription",
    models: "Licensed model access",
    api: "API usage and limits",
    broker: "Broker authorization",
    deployment: "Deployment controls",
    support: "Support and audit trail",
  };
  return titles[section];
}

function sectionDescription(section: SectionId) {
  const descriptions: Record<SectionId, string> = {
    overview: "Review account health, go-live readiness, and core customer configuration.",
    billing: "Manage subscription terms, billing address, payment status, invoices, and renewals.",
    models: "See which QSentia models are licensed to this customer workspace.",
    api: "Track API key status, scopes, monthly call quotas, usage, webhooks, and developer actions.",
    broker: "Review broker provider state, account mode, credentials handling, and approval gates.",
    deployment: "Configure scheduler, execution mode, kill switch, risk limits, and audit export.",
    support: "Open billing, access, and technical requests, and review customer activity.",
  };
  return descriptions[section];
}

function WorkspaceStat({ label: labelText, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 bg-white px-5 py-3">
      <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#647269]">{labelText}</div>
      <div className="mt-1 truncate text-sm font-semibold text-[#0f172a]">{value}</div>
    </div>
  );
}

function OverviewSection({ ctx }: { ctx: DashboardContext }) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryTile
          icon={<ReceiptText className="h-5 w-5" />}
          label="Subscription"
          value={label(ctx.billingStatus)}
          helper={ctx.planName}
        />
        <SummaryTile
          icon={<Database className="h-5 w-5" />}
          label="Model entitlements"
          value={String(ctx.billing?.subscription.includedModels ?? 0)}
          helper={`${ctx.licensedModels.length} linked from model registry`}
        />
        <SummaryTile
          icon={<KeyRound className="h-5 w-5" />}
          label="API access"
          value={ctx.workspace?.apiAccess.keyStatus || "Not issued"}
          helper={ctx.workspace?.apiAccess.keyScope || "No approved scope"}
        />
        <SummaryTile
          icon={<PlugZap className="h-5 w-5" />}
          label="Broker"
          value={ctx.workspace?.broker.status || "Not configured"}
          helper={ctx.workspace?.broker.provider || "No provider connected"}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Panel eyebrow="Readiness" title="Go-live checklist">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {(ctx.workspace?.readiness || []).length ? (
              ctx.workspace?.readiness.map((item) => (
                <ReadinessItem
                  key={`${item.label}-${item.owner}`}
                  label={item.label}
                  owner={item.owner}
                  status={item.status}
                />
              ))
            ) : (
              <InlineEmpty
                compact
                title="No readiness state"
                body="Workspace readiness appears after a customer account is linked."
              />
            )}
          </div>
        </Panel>

        <SectionCard className="p-5 md:p-6">
          <div className="text-xs font-bold uppercase tracking-wide text-[#647269]">
            Account identity
          </div>
          <div className="mt-4 grid gap-3">
            <InfoRow icon={<UserRound className="h-4 w-4" />} label="User" value={ctx.sessionUser.name} />
            <InfoRow icon={<Building2 className="h-4 w-4" />} label="Entity" value={ctx.billingEntity} />
            <InfoRow icon={<ShieldCheck className="h-4 w-4" />} label="Workspace" value={ctx.workspaceId} />
            <InfoRow icon={<Activity className="h-4 w-4" />} label="Stage" value={label(ctx.workspace?.account.stage)} />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function BillingSection({ ctx }: { ctx: DashboardContext }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <Panel eyebrow="Billing" title="Subscription and invoices" action={<StatusPill value={ctx.billingStatus} />}>
        <div className="grid gap-4 md:grid-cols-3">
          <FactCard icon={<CircleDollarSign className="h-4 w-4" />} label="Plan" value={ctx.planName} detail={`${ctx.billingAmount} / ${ctx.billing?.subscription.interval || "Not configured"}`} />
          <FactCard icon={<CalendarDays className="h-4 w-4" />} label={ctx.billing?.subscription.status === "trial" ? "Trial end" : "Next renewal"} value={dateLabel(ctx.renewalDate)} detail={label(ctx.billing?.subscription.status)} />
          <FactCard icon={<CreditCard className="h-4 w-4" />} label="Payment method" value={ctx.paymentMethod} detail={ctx.billing?.paymentMethod.status || "Payment method not added"} />
        </div>

        <div className="mt-6">
          <TableHeader title="Invoices" />
          {(ctx.billing?.invoices || []).length ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-[#e2e7fb] text-xs uppercase tracking-wide text-[#647269]">
                  <tr>
                    <th className="pb-3">Invoice</th>
                    <th className="pb-3">Period</th>
                    <th className="pb-3">Issued</th>
                    <th className="pb-3">Due</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">File</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef2ff]">
                  {(ctx.billing?.invoices || []).map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="py-3 font-semibold text-[#06130c]">{invoice.id}</td>
                      <td className="py-3 text-[#5a685f]">{invoice.period}</td>
                      <td className="py-3 text-[#5a685f]">{dateLabel(invoice.issuedAt)}</td>
                      <td className="py-3 text-[#5a685f]">{dateLabel(invoice.dueAt)}</td>
                      <td className="py-3 font-semibold text-[#06130c]">{currency(invoice.amount, ctx.billing?.subscription.currency)}</td>
                      <td className="py-3"><StatusPill value={invoice.status} /></td>
                      <td className="py-3 text-xs font-semibold text-[#647269]">PDF pending</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <InlineEmpty title="No invoices" body="Invoices will appear after billing is connected to the customer account." />
          )}
        </div>
      </Panel>

      <SectionCard className="p-5 md:p-6">
        <div className="text-xs font-bold uppercase tracking-wide text-[#647269]">
          Billing address
        </div>
        <div className="mt-4 rounded-[10px] border border-[#e2e7fb] bg-[#f8faff] p-4">
          <div className="font-semibold text-[#06130c]">{ctx.billingEntity}</div>
          <div className="mt-3 space-y-1 text-sm leading-6 text-[#5a685f]">
            <div>{ctx.workspace?.billingAddress.contact || ctx.sessionUser.name}</div>
            <div>{ctx.workspace?.billingAddress.line1 || "Address not configured"}</div>
            {ctx.workspace?.billingAddress.line2 ? <div>{ctx.workspace.billingAddress.line2}</div> : null}
            <div>{[ctx.workspace?.billingAddress.city, ctx.workspace?.billingAddress.region, ctx.workspace?.billingAddress.postalCode].filter(Boolean).join(", ") || "City not configured"}</div>
            <div>{ctx.workspace?.billingAddress.country || "Country not configured"}</div>
          </div>
        </div>
        <div className="mt-4 grid gap-3">
          <InfoRow icon={<KeyRound className="h-4 w-4" />} label="Billing email" value={ctx.billing?.account.billingEmail || ctx.sessionUser.email} />
          <InfoRow icon={<FileText className="h-4 w-4" />} label="Tax status" value={ctx.billing?.account.taxStatus || "Not configured"} />
        </div>
        <Link href="/contact" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#172554] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2437b5]">
          Request billing update
          <ArrowRight className="h-4 w-4" />
        </Link>
      </SectionCard>
    </div>
  );
}

function ModelsSection({ ctx }: { ctx: DashboardContext }) {
  return (
    <Panel
      eyebrow="Model access"
      title="Licensed model entitlements"
      action={<Link href="/marketplace" className="text-sm font-semibold text-[#3046c8] hover:underline">Model marketplace</Link>}
    >
      {ctx.licensedModels.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-[#e2e7fb] text-xs uppercase tracking-wide text-[#647269]">
              <tr>
                <th className="pb-3">Model</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Sharpe</th>
                <th className="pb-3">Annual return</th>
                <th className="pb-3">Drawdown</th>
                <th className="pb-3">Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef2ff]">
              {ctx.licensedModels.map((model) => (
                <tr key={model.id}>
                  <td className="max-w-[320px] py-3">
                    <div className="font-semibold text-[#06130c]">{model.name}</div>
                    <div className="mt-1 text-xs text-[#647269]">{model.slug}</div>
                  </td>
                  <td className="py-3 text-[#5a685f]">{model.category}</td>
                  <td className="py-3 text-[#172554]">{cleanMetric(fmtNum(model.performance?.sharpeRatio, 2))}</td>
                  <td className="py-3 text-[#047857]">{cleanMetric(fmtPct(model.performance?.annualizedReturn, true))}</td>
                  <td className="py-3 text-[#be123c]">{cleanMetric(fmtPct(model.performance?.maxDrawdown, true))}</td>
                  <td className="py-3"><StatusPill value={model.accessStatus || "Review"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <InlineEmpty title="No licensed models" body="Approved model entitlements from the admin portal will appear here." />
      )}
    </Panel>
  );
}

function ApiSection({ ctx }: { ctx: DashboardContext }) {
  const totalUsed = (ctx.billing?.usage || []).reduce((sum, item) => sum + item.used, 0);
  const totalLimit = (ctx.billing?.usage || []).reduce((sum, item) => sum + item.limit, 0);
  const remaining = totalLimit ? Math.max(totalLimit - totalUsed, 0) : null;

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <Panel eyebrow="API access" title="Keys, scopes, webhooks, and usage" action={<StatusPill value={ctx.workspace?.apiAccess.keyStatus || "Not issued"} />}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <FactCard icon={<KeyRound className="h-4 w-4" />} label="Key status" value={ctx.workspace?.apiAccess.keyStatus || "Not issued"} detail={`Last rotation: ${dateLabel(ctx.workspace?.apiAccess.lastRotation)}`} />
          <FactCard icon={<ShieldCheck className="h-4 w-4" />} label="Scope" value={ctx.workspace?.apiAccess.keyScope || "Not configured"} detail="Granted by QSentia admin" />
          <FactCard icon={<Database className="h-4 w-4" />} label="Monthly calls" value={totalLimit ? totalLimit.toLocaleString() : "Not configured"} detail={remaining === null ? "No limit assigned" : `${remaining.toLocaleString()} remaining`} />
          <FactCard icon={<Link2 className="h-4 w-4" />} label="Webhook" value={ctx.workspace?.apiAccess.webhookStatus || "Not configured"} detail="Delivery endpoint" />
        </div>

        <div className="mt-6">
          <TableHeader title="Usage this billing period" />
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {(ctx.billing?.usage || []).length ? (
              ctx.billing?.usage.map((item) => (
                <UsageMeter key={item.label} label={item.label} used={item.used} limit={item.limit} />
              ))
            ) : (
              <InlineEmpty compact title="No API usage" body="Usage appears after an active credential sends requests." />
            )}
          </div>
        </div>
      </Panel>

      <SectionCard className="p-5 md:p-6">
        <div className="text-xs font-bold uppercase tracking-wide text-[#647269]">Developer actions</div>
        <div className="mt-4 grid gap-3">
          <QuickAction href="/docs" icon={<FileText />} label="Read API docs" />
          <QuickAction href="/developers" icon={<Code2 />} label="Developer center" />
          <QuickAction href="/api/customer/audit-export" icon={<Download />} label="Download audit CSV" external />
        </div>
        <div className="mt-6 rounded-md border border-[#e2e7fb] bg-[#f8faff] p-4">
          <div className="text-sm font-semibold text-[#06130c]">API requirements</div>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-[#5a685f]">
            <li>Active model entitlement</li>
            <li>Issued server-side API credential</li>
            <li>Approved environment scope</li>
            <li>Usage limit assigned by QSentia</li>
          </ul>
        </div>
      </SectionCard>
    </div>
  );
}

function BrokerSection({ ctx }: { ctx: DashboardContext }) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Panel eyebrow="Broker setup" title="Broker authorization" action={<StatusPill value={ctx.workspace?.broker.status || "Not configured"} />}>
        <div className="grid gap-3">
          <ControlRow label="Provider" value={ctx.workspace?.broker.provider || "Not configured"} />
          <ControlRow label="Account mode" value={label(ctx.workspace?.broker.accountMode)} />
          <ControlRow label="Credentials vault" value={ctx.workspace?.broker.credentialsVault || "Not configured"} />
          <ControlRow label="Approval mode" value={label(ctx.workspace?.risk.approvalMode)} />
        </div>
        <Link href="/contact" className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#172554] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2437b5]">
          Request broker onboarding
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Panel>

      <Panel eyebrow="Risk gates" title="Pre-trade limits">
        <div className="grid gap-3">
          <ControlRow label="Capital limit" value={ctx.workspace?.risk.capitalLimit || "Not configured"} />
          <ControlRow label="Max daily loss" value={ctx.workspace?.risk.maxDailyLoss || "Not configured"} />
          <ControlRow label="Order type" value={ctx.workspace?.risk.orderType || "Not configured"} />
          <ControlRow label="Approval mode" value={label(ctx.workspace?.risk.approvalMode)} />
        </div>
      </Panel>
    </div>
  );
}

function DeploymentSection({ ctx }: { ctx: DashboardContext }) {
  return (
    <div className="grid gap-6">
      <Panel eyebrow="Execution scheduler" title="Automation and CRON" action={<StatusPill value={ctx.workspace?.automation.status || "Not configured"} />}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <FactCard icon={<Clock3 className="h-4 w-4" />} label="Cadence" value={label(ctx.workspace?.automation.cadence)} detail={ctx.workspace?.automation.timezone || "No timezone"} />
          <FactCard icon={<Bot className="h-4 w-4" />} label="Worker" value={ctx.workspace?.automation.workerRuntime || "Not configured"} detail={ctx.workspace?.automation.scheduler || "No scheduler"} />
          <FactCard icon={<FileText className="h-4 w-4" />} label="CRON" value={ctx.workspace?.automation.cronExpression || "Not configured"} detail="Stored from customer controls" />
          <FactCard icon={<CalendarDays className="h-4 w-4" />} label="Next run" value={dateLabel(ctx.workspace?.automation.nextRunAt)} detail={label(ctx.workspace?.automation.approvalPolicy)} />
        </div>
      </Panel>
      <CustomerControlCenter />
    </div>
  );
}

function SupportSection({ ctx }: { ctx: DashboardContext }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <Panel eyebrow="Support" title="Requests and service desk">
        <div className="grid gap-4 md:grid-cols-3">
          <SupportCard title="Billing request" body="Update billing address, entity name, tax details, renewal, or cancellation questions." />
          <SupportCard title="Access request" body="Request a model entitlement, API scope, credential review, or broker onboarding." />
          <SupportCard title="Technical support" body="Report API errors, webhook issues, scheduler problems, or audit export questions." />
        </div>
      </Panel>

      <SectionCard className="p-5 md:p-6">
        <div className="text-xs font-bold uppercase tracking-wide text-[#647269]">Activity</div>
        <div className="mt-4 grid gap-4">
          {(ctx.workspace?.activity || []).length ? (
            ctx.workspace?.activity.slice(0, 5).map((item) => (
              <ActivityItem key={`${item.title}-${item.timestamp}`} title={item.title} body={item.body} timestamp={item.timestamp} />
            ))
          ) : (
            <InlineEmpty compact title="No activity yet" body="Customer, entitlement, and credential events will appear here." />
          )}
          <ActivityItem title="Authenticated session" body={`${ctx.sessionUser.email} is signed in.`} timestamp={null} />
        </div>
      </SectionCard>
    </div>
  );
}

function Panel({
  action,
  children,
  eyebrow,
  title,
}: {
  action?: ReactNode;
  children: ReactNode;
  eyebrow: string;
  title: string;
}) {
  return (
    <SectionCard className="overflow-hidden rounded-[16px] border-[#dbe3ff] shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="px-5 pt-5 md:px-6 md:pt-6">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#3d52da]">{eyebrow}</div>
          <h2 className="mt-2 text-xl font-semibold text-[#06130c]">{title}</h2>
        </div>
        {action ? <div className="shrink-0 px-5 pt-5 md:px-6 md:pt-6">{action}</div> : null}
      </div>
      <div className="px-5 pb-5 md:px-6 md:pb-6">
        {children}
      </div>
    </SectionCard>
  );
}

function SummaryTile({
  helper,
  icon,
  label: labelText,
  value,
}: {
  helper: string;
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[14px] border border-[#dbe3ff] bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#eef2ff] text-[#3d52da]">{icon}</span>
        <span className="mt-1 h-2 w-2 rounded-full bg-[#3d52da]/35" />
      </div>
      <div className="mt-4 text-xs font-bold uppercase tracking-[0.15em] text-[#647269]">{labelText}</div>
      <div className="mt-2 truncate text-xl font-semibold text-[#06130c]">{value}</div>
      <p className="mt-1 truncate text-sm text-[#5a685f]">{helper}</p>
    </div>
  );
}

function FactCard({
  detail,
  icon,
  label: labelText,
  value,
}: {
  detail: string;
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[12px] border border-[#e2e7fb] bg-[#fbfcff] p-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#647269]">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-[#3d52da] shadow-sm">{icon}</span>
        {labelText}
      </div>
      <div className="mt-3 truncate text-lg font-semibold text-[#06130c]">{value}</div>
      <p className="mt-1 truncate text-sm text-[#5a685f]">{detail}</p>
    </div>
  );
}

function InfoRow({
  icon,
  label: labelText,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[10px] border border-[#e2e7fb] bg-white px-3 py-2.5">
      <span className="inline-flex items-center gap-2 text-sm text-[#5a685f]">
        <span className="text-[#3d52da]">{icon}</span>
        {labelText}
      </span>
      <span className="max-w-[190px] truncate text-right text-sm font-semibold text-[#06130c]">{value}</span>
    </div>
  );
}

function ControlRow({ label: labelText, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[10px] border border-[#e2e7fb] bg-[#fbfcff] px-3 py-2.5">
      <span className="text-sm text-[#5a685f]">{labelText}</span>
      <span className="max-w-[240px] truncate rounded-md border border-[#dbe3ff] bg-white px-2 py-1 text-xs font-bold uppercase tracking-wide text-[#3046c8]">{value}</span>
    </div>
  );
}

function ReadinessItem({
  label: labelText,
  owner,
  status,
}: {
  label: string;
  owner: string;
  status: string;
}) {
  return (
    <div className="rounded-[10px] border border-[#e2e7fb] bg-white px-3 py-2.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-[#06130c]">{labelText}</span>
        <StatusPill value={status} />
      </div>
      <div className="mt-1 text-xs uppercase tracking-wide text-[#647269]">{owner}</div>
    </div>
  );
}

function StatusPill({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  const tone =
    normalized.includes("active") ||
    normalized.includes("approved") ||
    normalized.includes("complete") ||
    normalized.includes("current")
      ? "border-[#bbf7d0] bg-[#f0fdf4] text-[#047857]"
      : normalized.includes("trial") ||
          normalized.includes("open") ||
          normalized.includes("paper") ||
          normalized.includes("refreshing")
        ? "border-[#c7d2fe] bg-[#eef2ff] text-[#3046c8]"
        : normalized.includes("required") ||
            normalized.includes("pending") ||
            normalized.includes("not") ||
            normalized.includes("past due")
          ? "border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]"
          : "border-[#e2e7fb] bg-[#f8faff] text-[#46554b]";

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${tone}`}>
      {label(value)}
    </span>
  );
}

function UsageMeter({
  label: labelText,
  limit,
  used,
}: {
  label: string;
  limit: number;
  used: number;
}) {
  const safeLimit = Math.max(limit, 1);
  const percent = Math.min(Math.max((used / safeLimit) * 100, 0), 100);

  return (
    <div className="rounded-[12px] border border-[#e2e7fb] bg-[#f8faff] p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-[#06130c]">{labelText}</span>
        <span className="text-xs font-bold uppercase tracking-wide text-[#647269]">
          {used.toLocaleString()} / {limit.toLocaleString()}
        </span>
      </div>
      <div className="mt-4 h-2 rounded-full bg-[#e2e7fb]">
        <div className="h-full rounded-full bg-[#3d52da]" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function QuickAction({
  external,
  href,
  icon,
  label: labelText,
}: {
  external?: boolean;
  href: string;
  icon: ReactNode;
  label: string;
}) {
  const className =
    "inline-flex items-center justify-between gap-3 rounded-[10px] border border-[#dbe3ff] bg-white px-3 py-3 text-sm font-semibold text-[#172554] transition hover:border-[#3d52da] hover:bg-[#f8faff] [&>svg]:h-4 [&>svg]:w-4";

  if (external) {
    return (
      <a href={href} className={className}>
        <span className="inline-flex items-center gap-2">
          {icon}
          {labelText}
        </span>
        <ArrowRight className="h-4 w-4" />
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      <span className="inline-flex items-center gap-2">
        {icon}
        {labelText}
      </span>
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

function SupportCard({ body, title }: { body: string; title: string }) {
  return (
    <div className="rounded-[12px] border border-[#e2e7fb] bg-[#f8faff] p-4">
      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-[#3d52da] shadow-sm">
        <LifeBuoy className="h-4 w-4" />
      </span>
      <h3 className="mt-4 font-semibold text-[#06130c]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#5a685f]">{body}</p>
      <Link href="/contact" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#3046c8] hover:underline">
        Open request
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function ActivityItem({
  body,
  timestamp,
  title,
}: {
  body: string;
  timestamp: string | null;
  title: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#eef2ff] text-[#3d52da]">
        <CheckCircle2 className="h-4 w-4" />
      </span>
      <div>
        <div className="font-semibold text-[#06130c]">{title}</div>
        <p className="mt-1 text-sm leading-6 text-[#5a685f]">{body}</p>
        <div className="mt-1 text-xs uppercase tracking-wide text-[#647269]">
          {timestamp ? dateLabel(timestamp) : "Current session"}
        </div>
      </div>
    </div>
  );
}

function TableHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[#e2e7fb] pb-3">
      <h3 className="font-semibold text-[#06130c]">{title}</h3>
    </div>
  );
}

function InlineEmpty({
  body,
  compact,
  title,
}: {
  body: string;
  compact?: boolean;
  title: string;
}) {
  return (
    <div
      className={
        compact
          ? "rounded-md border border-dashed border-[#cbd5ff] bg-[#f8faff] p-4 text-center"
          : "mt-5 rounded-md border border-dashed border-[#cbd5ff] bg-[#f8faff] p-6 text-center"
      }
    >
      <div className="text-sm font-semibold text-[#06130c]">{title}</div>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#5a685f]">{body}</p>
    </div>
  );
}
