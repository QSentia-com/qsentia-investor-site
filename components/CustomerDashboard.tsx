'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import {
  ArrowRight,
  Bot,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Database,
  Download,
  FileText,
  KeyRound,
  Link2,
  LogOut,
  PlugZap,
  ReceiptText,
  ShieldCheck,
} from 'lucide-react';
import { SectionCard } from '@/components/PageChrome';
import { fmtNum, fmtPct } from '@/lib/metrics';
import { getSupabaseBrowserClient } from '@/lib/supabaseClient';

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
  pricing?: string | null;
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
    id: string;
    billingStatus: string;
    billingEmail: string;
    billingEntity: string;
    taxStatus: string;
  };
  subscription: {
    plan: string;
    status: string;
    interval: string;
    currency: string;
    monthlyAmount: number;
    trialEndsAt: string | null;
    nextInvoiceAt: string | null;
    activeSeats: number;
    includedModels: number;
  };
  paymentMethod: {
    status: string;
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
    workspaceId: string;
    stage: string;
    environment: string;
    onboardingOwner: string;
  };
  billingAddress: {
    company: string;
    contact: string;
    line1: string;
    line2: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };
  broker: {
    status: string;
    provider: string;
    accountMode: string;
    credentialsVault: string;
  };
  apiAccess: {
    keyStatus: string;
    keyScope: string;
    webhookStatus: string;
    environment: string;
    lastRotation: string | null;
  };
  automation: {
    status: string;
    scheduler: string;
    workerRuntime: string;
    cronExpression: string;
    cadence: string;
    timezone: string;
    nextRunAt: string | null;
    approvalPolicy: string;
  };
  risk: {
    capitalLimit: string;
    maxDailyLoss: string;
    orderType: string;
    approvalMode: string;
  };
  readiness: Array<{ label: string; status: string; owner: string }>;
  activity: Array<{ title: string; body: string; timestamp: string }>;
};

const fetcher = async (url: string) => {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
};

function cleanMetric(value: string) {
  return value === 'Pending' ? 'Not available' : value;
}

function shortDate(value?: string | null) {
  if (!value) return 'Not scheduled';
  const date = new Date(String(value).replace('_', 'T'));
  if (Number.isNaN(date.getTime())) return 'Not scheduled';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function currency(amount: number | null | undefined, currencyCode = 'USD') {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) return 'Not configured';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: amount % 1 ? 2 : 0,
  }).format(amount);
}

export default function CustomerDashboard({ user }: { user: CustomerUser }) {
  const [sessionUser, setSessionUser] = useState<CustomerUser>(user);
  const { data: modelData, isLoading: loadingModels } = useSWR<ModelsResponse>(
    '/api/models',
    fetcher,
    { refreshInterval: 60000 }
  );
  const { data: billing, isLoading: loadingBilling } = useSWR<BillingResponse>(
    '/api/customer/billing',
    fetcher,
    { refreshInterval: 60000 }
  );
  const { data: workspace, isLoading: loadingWorkspace } = useSWR<WorkspaceResponse>(
    '/api/customer/workspace',
    fetcher,
    { refreshInterval: 60000 }
  );

  const models = modelData?.models || [];
  const includedModels = billing?.subscription.includedModels ?? 0;
  const licensedModels = models.slice(0, Math.max(includedModels, 4));
  const isLoading = loadingModels || loadingBilling || loadingWorkspace;
  const billingStatus = billing?.account.billingStatus || 'Not configured';
  const billingAmount = currency(
    billing?.subscription.monthlyAmount ?? null,
    billing?.subscription.currency || 'USD'
  );

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
        typeof metadata.full_name === 'string'
          ? metadata.full_name
          : typeof metadata.name === 'string'
            ? metadata.name
            : authUser.email?.split('@')[0] || user.name;
      const organization =
        typeof metadata.organization === 'string' && metadata.organization.trim()
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
    window.localStorage.removeItem('qsentia_user_session');
    window.location.href = '/signin';
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-[12px] border border-[#dbe3ff] bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-[#3d52da]">Customer workspace</div>
            <h1 className="mt-2 text-3xl font-semibold text-[#06130c] md:text-4xl">
              Model trading setup for {sessionUser.name}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5a685f]">
              Manage commercial access, broker authorization, API credentials, scheduler readiness, and risk approval before automated trading is enabled.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-[#cbd5ff] px-4 py-2 text-sm font-semibold text-[#172554] transition hover:border-[#3d52da]"
            >
              <KeyRound className="h-4 w-4" />
              Security
            </button>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#172554] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2437b5]"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          icon={<ReceiptText className="h-5 w-5" />}
          label="Subscription"
          value={billingStatus}
          helper={billing?.subscription.plan || 'No active plan'}
        />
        <MetricTile
          icon={<Database className="h-5 w-5" />}
          label="Model access"
          value={`${includedModels} seats`}
          helper={`${models.length || 0} models available`}
        />
        <MetricTile
          icon={<PlugZap className="h-5 w-5" />}
          label="Broker status"
          value={workspace?.broker.status || 'Not connected'}
          helper={workspace?.broker.provider || 'Broker pending'}
        />
        <MetricTile
          icon={<Bot className="h-5 w-5" />}
          label="Automation"
          value={workspace?.automation.status || 'Draft'}
          helper={isLoading ? 'Refreshing setup' : workspace?.automation.scheduler || 'Scheduler pending'}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="grid gap-6 self-start">
          <SectionCard className="p-5 md:p-6">
            <div className="text-xs font-bold uppercase tracking-wide text-[#647269]">Billing address</div>
            <div className="mt-4 rounded-md border border-[#e2e7fb] bg-[#f8faff] p-4">
              <div className="font-semibold text-[#06130c]">
                {workspace?.billingAddress.company || billing?.account.billingEntity || user.organization}
              </div>
              <div className="mt-3 space-y-1 text-sm leading-6 text-[#5a685f]">
                <div>{workspace?.billingAddress.contact || sessionUser.name}</div>
                <div>{workspace?.billingAddress.line1 || 'Address not configured'}</div>
                {workspace?.billingAddress.line2 ? <div>{workspace.billingAddress.line2}</div> : null}
                <div>
                  {[workspace?.billingAddress.city, workspace?.billingAddress.region, workspace?.billingAddress.postalCode]
                    .filter(Boolean)
                    .join(', ') || 'City not configured'}
                </div>
                <div>{workspace?.billingAddress.country || 'Country not configured'}</div>
              </div>
            </div>
            <div className="mt-4 grid gap-3">
              <ProfileRow icon={<KeyRound className="h-4 w-4" />} label="Billing email" value={billing?.account.billingEmail || sessionUser.email} />
              <ProfileRow icon={<FileText className="h-4 w-4" />} label="Tax status" value={billing?.account.taxStatus || 'Not configured'} />
            </div>
            <button
              type="button"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#172554] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2437b5]"
            >
              Edit billing address
              <ArrowRight className="h-4 w-4" />
            </button>
          </SectionCard>

          <SectionCard className="p-5 md:p-6">
            <div className="text-xs font-bold uppercase tracking-wide text-[#647269]">Account</div>
            <div className="mt-5 grid gap-3">
              <ProfileRow icon={<Building2 className="h-4 w-4" />} label="Workspace" value={workspace?.account.workspaceId || 'Pending'} />
              <ProfileRow icon={<ShieldCheck className="h-4 w-4" />} label="Stage" value={workspace?.account.stage || 'Setup'} />
              <ProfileRow icon={<Database className="h-4 w-4" />} label="Environment" value={workspace?.account.environment || 'Paper'} />
            </div>
          </SectionCard>
        </aside>

        <main className="grid gap-6">
          <SectionCard className="p-5 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-[#647269]">Billing & plan</div>
                <h2 className="mt-2 text-2xl font-semibold text-[#06130c]">Commercial access</h2>
              </div>
              <StatusPill value={billingStatus} />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <BillingSummary
                icon={<CircleDollarSign className="h-4 w-4" />}
                label="Plan"
                value={billing?.subscription.plan || 'Not configured'}
                detail={`${billingAmount} / ${billing?.subscription.interval || 'month'}`}
              />
              <BillingSummary
                icon={<CalendarDays className="h-4 w-4" />}
                label="Trial window"
                value={shortDate(billing?.subscription.trialEndsAt)}
                detail="Conversion before live execution"
              />
              <BillingSummary
                icon={<CreditCard className="h-4 w-4" />}
                label="Payment method"
                value={billing?.paymentMethod.brand && billing?.paymentMethod.last4 ? `${billing.paymentMethod.brand} ${billing.paymentMethod.last4}` : 'Not added'}
                detail={billing?.paymentMethod.status || 'Required'}
              />
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-[#e2e7fb] text-xs uppercase tracking-wide text-[#647269]">
                  <tr>
                    <th className="pb-3">Invoice</th>
                    <th className="pb-3">Period</th>
                    <th className="pb-3">Issued</th>
                    <th className="pb-3">Due</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef2ff]">
                  {(billing?.invoices || []).map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="py-3 font-semibold text-[#06130c]">{invoice.id}</td>
                      <td className="py-3 text-[#5a685f]">{invoice.period}</td>
                      <td className="py-3 text-[#5a685f]">{shortDate(invoice.issuedAt)}</td>
                      <td className="py-3 text-[#5a685f]">{shortDate(invoice.dueAt)}</td>
                      <td className="py-3 font-semibold text-[#06130c]">{currency(invoice.amount, billing?.subscription.currency)}</td>
                      <td className="py-3"><StatusPill value={invoice.status} /></td>
                      <td className="py-3">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 rounded-md border border-[#cbd5ff] px-2.5 py-1.5 text-xs font-semibold text-[#172554] transition hover:border-[#3d52da]"
                        >
                          <Download className="h-3.5 w-3.5" />
                          PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          <div className="grid gap-6 xl:grid-cols-2">
            <SectionCard className="p-5 md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-[#647269]">Broker connection</div>
                  <h2 className="mt-2 text-2xl font-semibold text-[#06130c]">Trading account</h2>
                </div>
                <StatusPill value={workspace?.broker.status || 'Not connected'} />
              </div>
              <div className="mt-5 grid gap-3">
                <ControlRow label="Provider" value={workspace?.broker.provider || 'Pending'} tone="neutral" />
                <ControlRow label="Account mode" value={workspace?.broker.accountMode || 'Paper first'} tone="blue" />
                <ControlRow label="Credentials vault" value={workspace?.broker.credentialsVault || 'Required'} tone="amber" />
                <ControlRow label="Risk approval" value={workspace?.risk.approvalMode || 'Manual'} tone="green" />
              </div>
              <button
                type="button"
                className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#172554] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2437b5]"
              >
                Start broker authorization
                <ArrowRight className="h-4 w-4" />
              </button>
            </SectionCard>

            <SectionCard className="p-5 md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-[#647269]">API access</div>
                  <h2 className="mt-2 text-2xl font-semibold text-[#06130c]">Credentials & webhooks</h2>
                </div>
                <StatusPill value={workspace?.apiAccess.keyStatus || 'Not issued'} />
              </div>
              <div className="mt-5 grid gap-3">
                <ControlRow label="API key" value={workspace?.apiAccess.keyStatus || 'Not issued'} tone="amber" />
                <ControlRow label="Scope" value={workspace?.apiAccess.keyScope || 'Read only'} tone="blue" />
                <ControlRow label="Webhook" value={workspace?.apiAccess.webhookStatus || 'Not configured'} tone="neutral" />
                <ControlRow label="Environment" value={workspace?.apiAccess.environment || 'Sandbox'} tone="green" />
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-md bg-[#172554] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2437b5]"
                >
                  Generate API key
                  <KeyRound className="h-4 w-4" />
                </button>
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-2 rounded-md border border-[#cbd5ff] px-4 py-2 text-sm font-semibold text-[#172554] transition hover:border-[#3d52da]"
                >
                  Docs
                  <Link2 className="h-4 w-4" />
                </Link>
              </div>
            </SectionCard>
          </div>

          <SectionCard className="p-5 md:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-[#647269]">Scheduler / CRON</div>
                <h2 className="mt-2 text-2xl font-semibold text-[#06130c]">Automated model execution</h2>
              </div>
              <StatusPill value={workspace?.automation.status || 'Draft'} />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <BillingSummary
                icon={<Clock3 className="h-4 w-4" />}
                label="Cadence"
                value={workspace?.automation.cadence || 'Not set'}
                detail={workspace?.automation.timezone || 'Timezone pending'}
              />
              <BillingSummary
                icon={<Bot className="h-4 w-4" />}
                label="Worker"
                value={workspace?.automation.workerRuntime || 'Not selected'}
                detail={workspace?.automation.scheduler || 'Scheduler pending'}
              />
              <BillingSummary
                icon={<FileText className="h-4 w-4" />}
                label="CRON"
                value={workspace?.automation.cronExpression || 'Not set'}
                detail="Market-day execution window"
              />
              <BillingSummary
                icon={<CalendarDays className="h-4 w-4" />}
                label="Next run"
                value={shortDate(workspace?.automation.nextRunAt)}
                detail={workspace?.automation.approvalPolicy || 'Approval pending'}
              />
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-4">
              <WorkflowStep icon={<Database className="h-4 w-4" />} title="1. Model signal" body="Pull latest approved model output through QSentia API." />
              <WorkflowStep icon={<ShieldCheck className="h-4 w-4" />} title="2. Risk check" body="Apply account limits, max loss, order type, and exposure rules." />
              <WorkflowStep icon={<PlugZap className="h-4 w-4" />} title="3. Broker order" body="Send approved paper or live orders through the broker connector." />
              <WorkflowStep icon={<CheckCircle2 className="h-4 w-4" />} title="4. Audit log" body="Store execution result, webhook status, and operator approval trail." />
            </div>
          </SectionCard>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <SectionCard className="p-5 md:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-[#647269]">Model access</div>
                  <h2 className="mt-2 text-2xl font-semibold text-[#06130c]">Licensed models</h2>
                </div>
                <Link href="/marketplace" className="text-sm font-semibold text-[#3d52da] hover:underline">
                  Marketplace
                </Link>
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="border-b border-[#e2e7fb] text-xs uppercase tracking-wide text-[#647269]">
                    <tr>
                      <th className="pb-3">Model</th>
                      <th className="pb-3">Category</th>
                      <th className="pb-3">Sharpe</th>
                      <th className="pb-3">Return</th>
                      <th className="pb-3">Drawdown</th>
                      <th className="pb-3">Access</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef2ff]">
                    {licensedModels.map((model) => (
                      <tr key={model.id}>
                        <td className="py-3 font-semibold text-[#06130c]">{model.name}</td>
                        <td className="py-3 text-[#5a685f]">{model.category}</td>
                        <td className="py-3 text-[#172554]">{cleanMetric(fmtNum(model.performance?.sharpeRatio, 2))}</td>
                        <td className="py-3 text-[#047857]">{cleanMetric(fmtPct(model.performance?.annualizedReturn, true))}</td>
                        <td className="py-3 text-[#be123c]">{cleanMetric(fmtPct(model.performance?.maxDrawdown, true))}</td>
                        <td className="py-3">
                          <span className="rounded-md border border-[#dbe3ff] bg-[#f8faff] px-2 py-1 text-xs font-semibold text-[#3046c8]">
                            {model.accessStatus || 'Review'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            <div className="grid gap-6">
              <SectionCard className="p-5 md:p-6">
                <div className="text-xs font-bold uppercase tracking-wide text-[#647269]">Go-live checklist</div>
                <div className="mt-5 grid gap-3">
                  {(workspace?.readiness || []).map((item) => (
                    <div key={item.label} className="rounded-md border border-[#e2e7fb] px-3 py-2.5">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-[#06130c]">{item.label}</span>
                        <StatusPill value={item.status} />
                      </div>
                      <div className="mt-1 text-xs uppercase tracking-wide text-[#647269]">{item.owner}</div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard className="p-5 md:p-6">
                <div className="text-xs font-bold uppercase tracking-wide text-[#647269]">Usage & limits</div>
                <div className="mt-5 grid gap-4">
                  {(billing?.usage || []).map((item) => (
                    <UsageMeter key={item.label} label={item.label} used={item.used} limit={item.limit} />
                  ))}
                </div>
              </SectionCard>
            </div>
          </div>

          <SectionCard className="p-5 md:p-6">
            <div className="text-xs font-bold uppercase tracking-wide text-[#647269]">Recent activity</div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {(workspace?.activity || []).map((item) => (
                <ActivityItem key={item.title} icon={<CheckCircle2 className="h-4 w-4" />} title={item.title} body={`${item.body} ${shortDate(item.timestamp)}.`} />
              ))}
              <ActivityItem
                icon={<KeyRound className="h-4 w-4" />}
                title="Authenticated session"
                body={`${sessionUser.email} is signed in to this QSentia workspace.`}
              />
            </div>
          </SectionCard>
        </main>
      </div>
    </div>
  );
}

function MetricTile({ icon, label, value, helper }: { icon: ReactNode; label: string; value: string; helper: string }) {
  return (
    <div className="rounded-[10px] border border-[#dbe3ff] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#eef2ff] text-[#3d52da]">
          {icon}
        </span>
        <span className="text-right text-2xl font-semibold text-[#06130c]">{value}</span>
      </div>
      <div className="mt-4 text-xs font-bold uppercase tracking-wide text-[#647269]">{label}</div>
      <p className="mt-2 truncate text-sm text-[#5a685f]">{helper}</p>
    </div>
  );
}

function WorkflowStep({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-md border border-[#e2e7fb] bg-[#f8faff] p-4">
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-[#3d52da]">{icon}</span>
      <div className="mt-4 font-semibold text-[#06130c]">{title}</div>
      <p className="mt-2 text-sm leading-6 text-[#5a685f]">{body}</p>
    </div>
  );
}

function ControlRow({ label, value, tone }: { label: string; value: string; tone: 'blue' | 'amber' | 'green' | 'neutral' }) {
  const classes = {
    blue: 'border-[#c7d2fe] bg-[#eef2ff] text-[#3046c8]',
    amber: 'border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]',
    green: 'border-[#bbf7d0] bg-[#f0fdf4] text-[#047857]',
    neutral: 'border-[#e2e7fb] bg-[#f8faff] text-[#46554b]',
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-[#e2e7fb] px-3 py-2.5">
      <span className="text-sm text-[#5a685f]">{label}</span>
      <span className={`rounded-md border px-2 py-1 text-xs font-bold uppercase tracking-wide ${classes[tone]}`}>
        {value}
      </span>
    </div>
  );
}

function ActivityItem({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#eef2ff] text-[#3d52da]">
        {icon}
      </span>
      <div>
        <div className="font-semibold text-[#06130c]">{title}</div>
        <p className="mt-1 text-sm leading-6 text-[#5a685f]">{body}</p>
      </div>
    </div>
  );
}

function BillingSummary({
  icon,
  label,
  value,
  detail,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-md border border-[#e2e7fb] bg-[#f8faff] p-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#647269]">
        <span className="text-[#3d52da]">{icon}</span>
        {label}
      </div>
      <div className="mt-3 truncate text-lg font-semibold text-[#06130c]">{value}</div>
      <p className="mt-1 truncate text-sm text-[#5a685f]">{detail}</p>
    </div>
  );
}

function ProfileRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-[#e2e7fb] px-3 py-2.5">
      <span className="inline-flex items-center gap-2 text-sm text-[#5a685f]">
        <span className="text-[#3d52da]">{icon}</span>
        {label}
      </span>
      <span className="max-w-[180px] truncate text-right text-sm font-semibold text-[#06130c]">{value}</span>
    </div>
  );
}

function StatusPill({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  const tone =
    normalized.includes('active') || normalized.includes('approved') || normalized.includes('complete')
      ? 'border-[#bbf7d0] bg-[#f0fdf4] text-[#047857]'
      : normalized.includes('trial') || normalized.includes('open') || normalized.includes('draft') || normalized.includes('paper')
        ? 'border-[#c7d2fe] bg-[#eef2ff] text-[#3046c8]'
        : normalized.includes('required') || normalized.includes('pending') || normalized.includes('not')
          ? 'border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]'
          : 'border-[#e2e7fb] bg-[#f8faff] text-[#46554b]';

  return (
    <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-bold uppercase tracking-wide ${tone}`}>
      {value}
    </span>
  );
}

function UsageMeter({ label, used, limit }: { label: string; used: number; limit: number }) {
  const safeLimit = Math.max(limit, 1);
  const percent = Math.min(Math.max((used / safeLimit) * 100, 0), 100);

  return (
    <div className="rounded-md border border-[#e2e7fb] bg-[#f8faff] p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-[#06130c]">{label}</span>
        <span className="text-xs font-bold uppercase tracking-wide text-[#647269]">
          {used} / {limit}
        </span>
      </div>
      <div className="mt-4 h-2 rounded-full bg-[#e2e7fb]">
        <div className="h-full rounded-full bg-[#3d52da]" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
