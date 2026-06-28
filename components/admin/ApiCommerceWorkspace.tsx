'use client';

import { useState, type ReactNode } from 'react';
import useSWR from 'swr';
import {
  Activity,
  Building2,
  Check,
  CircleDollarSign,
  Copy,
  CreditCard,
  KeyRound,
  LockKeyhole,
  RefreshCw,
  Save,
  ShieldCheck,
} from 'lucide-react';

type CommerceView = 'summary' | 'customers' | 'apiAccess' | 'billing';
type ModelOption = { id: string; name: string };

type Customer = {
  id: string;
  organization: string;
  primaryContact: string;
  email: string;
  plan: string;
  status: string;
  billingStatus: string;
  billingCycle: string;
  currency: string;
  monthlyRevenue: number;
  seats: number;
  renewalAt: string | null;
  salesOwner: string;
  createdAt: string;
};

type Entitlement = {
  id: string;
  customerId: string;
  modelId: string;
  environment: string;
  scope: string;
  status: string;
  requestLimit: number;
  requestsUsed: number;
  expiresAt: string | null;
};

type ApiKey = {
  id: string;
  customerId: string;
  label: string;
  keyPrefix: string;
  environment: string;
  status: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
};

type AuditEvent = {
  id: string;
  action: string;
  entityType: string;
  detail: string;
  createdAt: string;
};

type CommerceData = {
  updatedAt: string | null;
  customers: Customer[];
  entitlements: Entitlement[];
  apiKeys: ApiKey[];
  auditEvents: AuditEvent[];
  metrics: {
    customers: number;
    activeCustomers: number;
    trialCustomers: number;
    pastDueCustomers: number;
    monthlyRecurringRevenue: number;
    annualRecurringRevenue: number;
    renewalsNext30Days: number;
    activeEntitlements: number;
    activeApiKeys: number;
    requestsUsed: number;
    requestLimit: number;
  };
};

const plans = ['Starter', 'Professional', 'Institutional', 'Enterprise'];
const customerStatuses = ['trial', 'active', 'past_due', 'suspended', 'cancelled'];
const billingStatuses = ['trial', 'current', 'past_due', 'manual_invoice', 'cancelled'];
const billingCycles = ['monthly', 'annual', 'custom'];
const currencies = ['USD', 'INR', 'EUR', 'GBP', 'SGD', 'AED'];
const owners = ['Investor Relations', 'CEO office', 'Operations'];
const environments = ['sandbox', 'paper', 'live'];
const scopes = ['signals', 'read_only', 'paper_execution', 'live_execution'];
const entitlementStatuses = ['pending', 'active', 'suspended', 'expired'];
const keyLabels = ['Primary server', 'Trading worker', 'Research terminal', 'Staging'];

async function fetcher(url: string) {
  const response = await fetch(url, { cache: 'no-store' });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Request failed: ${response.status}`);
  return payload;
}

function label(value: string) {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function shortDate(value: string | null | undefined) {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not set';
  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

function money(value: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function customerName(customers: Customer[], customerId: string) {
  return customers.find((customer) => customer.id === customerId)?.organization || 'Unknown account';
}

function modelName(models: ModelOption[], modelId: string) {
  return models.find((model) => model.id === modelId)?.name || modelId;
}

export default function ApiCommerceWorkspace({
  models,
  view,
}: {
  models: ModelOption[];
  view: CommerceView;
}) {
  const { data, error, isLoading, mutate } = useSWR<CommerceData>('/api/admin/api-commerce', fetcher, {
    shouldRetryOnError: false,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [issuedSecret, setIssuedSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    organization: '', primaryContact: '', email: '', plan: 'Starter', status: 'trial',
    billingStatus: 'trial', billingCycle: 'monthly', currency: 'USD', monthlyRevenue: '0',
    seats: '1', renewalAt: '', salesOwner: 'Investor Relations',
  });
  const [entitlementForm, setEntitlementForm] = useState({
    customerId: '', modelId: '', environment: 'sandbox', scope: 'signals', status: 'pending',
    requestLimit: '10000', expiresAt: '',
  });
  const [keyForm, setKeyForm] = useState({ customerId: '', label: 'Primary server', environment: 'sandbox', expiresAt: '' });

  async function post(action: string, payload: unknown) {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch('/api/admin/api-commerce', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, payload }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Update failed');
      await mutate();
      return result;
    } catch (updateError) {
      setMessage({ tone: 'error', text: updateError instanceof Error ? updateError.message : 'Update failed' });
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function patch(payload: unknown) {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch('/api/admin/api-commerce', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Update failed');
      await mutate();
      setMessage({ tone: 'success', text: 'Access record updated.' });
    } catch (updateError) {
      setMessage({ tone: 'error', text: updateError instanceof Error ? updateError.message : 'Update failed' });
    } finally {
      setSaving(false);
    }
  }

  async function createCustomer() {
    const result = await post('create_customer', customerForm);
    if (!result) return;
    setCustomerForm({
      organization: '', primaryContact: '', email: '', plan: 'Starter', status: 'trial',
      billingStatus: 'trial', billingCycle: 'monthly', currency: 'USD', monthlyRevenue: '0',
      seats: '1', renewalAt: '', salesOwner: 'Investor Relations',
    });
    setMessage({ tone: 'success', text: 'Customer account created.' });
  }

  async function createEntitlement() {
    const customerId = entitlementForm.customerId || data?.customers[0]?.id || '';
    const modelId = entitlementForm.modelId || models[0]?.id || '';
    const result = await post('create_entitlement', { ...entitlementForm, customerId, modelId });
    if (result) setMessage({ tone: 'success', text: 'Model entitlement created.' });
  }

  async function issueKey() {
    const customerId = keyForm.customerId || data?.customers[0]?.id || '';
    const result = await post('issue_api_key', { ...keyForm, customerId });
    if (!result) return;
    setIssuedSecret(result.secret);
    setCopied(false);
    setMessage({ tone: 'success', text: 'API credential issued. Store the secret now; it will not be shown again.' });
  }

  async function copySecret() {
    if (!issuedSecret) return;
    await navigator.clipboard.writeText(issuedSecret);
    setCopied(true);
  }

  if (isLoading && !data) {
    return (
      <Panel title="Loading API commerce" icon={<RefreshCw className="h-4 w-4 animate-spin" />}>
        <div className="grid gap-3 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-24 animate-pulse rounded-md bg-[#f1f4f9]" />)}
        </div>
      </Panel>
    );
  }

  if (error || !data) {
    return <Notice tone="error">{error instanceof Error ? error.message : 'API commerce data could not be loaded.'}</Notice>;
  }

  return (
    <div className="grid gap-6">
      {message && <Notice tone={message.tone}>{message.text}</Notice>}
      {view === 'summary' && <SummaryView data={data} />}
      {view === 'customers' && (
        <CustomersView
          data={data}
          form={customerForm}
          onCreate={createCustomer}
          onForm={setCustomerForm}
          onStatus={(customer, status, billingStatus) => void patch({ type: 'customer', id: customer.id, status, billingStatus })}
          saving={saving}
        />
      )}
      {view === 'apiAccess' && (
        <ApiAccessView
          data={data}
          entitlementForm={entitlementForm}
          issuedSecret={issuedSecret}
          keyForm={keyForm}
          models={models}
          onCopy={copySecret}
          onCreateEntitlement={createEntitlement}
          onEntitlementForm={setEntitlementForm}
          onEntitlementStatus={(entitlement, status) => void patch({ type: 'entitlement', id: entitlement.id, status })}
          onIssueKey={issueKey}
          onKeyForm={setKeyForm}
          onRevoke={(key) => void patch({ type: 'api_key', id: key.id })}
          copied={copied}
          saving={saving}
        />
      )}
      {view === 'billing' && (
        <BillingView
          data={data}
          onStatus={(customer, billingStatus) => void patch({ type: 'customer', id: customer.id, status: customer.status, billingStatus })}
          saving={saving}
        />
      )}
    </div>
  );
}

function SummaryView({ data }: { data: CommerceData }) {
  const quota = data.metrics.requestLimit
    ? Math.round((data.metrics.requestsUsed / data.metrics.requestLimit) * 100)
    : 0;
  return (
    <section className="border-t border-[#dfe5f2] pt-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-[#3d52da]">API business</div>
          <h2 className="mt-1 text-xl font-semibold text-[#0f172a]">Commercial control plane</h2>
        </div>
        <span className="text-xs text-[#647269]">Updated {shortDate(data.updatedAt)}</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric icon={<Building2 className="h-5 w-5" />} label="Active customers" value={String(data.metrics.activeCustomers)} detail={`${data.metrics.trialCustomers} in trial`} />
        <Metric icon={<CircleDollarSign className="h-5 w-5" />} label="Monthly recurring" value={money(data.metrics.monthlyRecurringRevenue)} detail={`${money(data.metrics.annualRecurringRevenue)} ARR`} />
        <Metric icon={<ShieldCheck className="h-5 w-5" />} label="Active entitlements" value={String(data.metrics.activeEntitlements)} detail={`${data.metrics.activeApiKeys} active API keys`} />
        <Metric icon={<Activity className="h-5 w-5" />} label="API quota used" value={`${quota}%`} detail={`${data.metrics.requestsUsed.toLocaleString()} of ${data.metrics.requestLimit.toLocaleString()}`} />
      </div>
      {(data.metrics.pastDueCustomers > 0 || data.metrics.renewalsNext30Days > 0) && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <OperationalFlag label="Past-due accounts" value={data.metrics.pastDueCustomers} tone="red" />
          <OperationalFlag label="Renewals in 30 days" value={data.metrics.renewalsNext30Days} tone="amber" />
        </div>
      )}
    </section>
  );
}

type CustomerForm = {
  organization: string; primaryContact: string; email: string; plan: string; status: string;
  billingStatus: string; billingCycle: string; currency: string; monthlyRevenue: string;
  seats: string; renewalAt: string; salesOwner: string;
};

function CustomersView({ data, form, onCreate, onForm, onStatus, saving }: {
  data: CommerceData;
  form: CustomerForm;
  onCreate: () => void;
  onForm: (form: CustomerForm) => void;
  onStatus: (customer: Customer, status: string, billingStatus: string) => void;
  saving: boolean;
}) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <Metric icon={<Building2 className="h-5 w-5" />} label="Customer accounts" value={String(data.metrics.customers)} detail={`${data.metrics.activeCustomers} active`} />
        <Metric icon={<ShieldCheck className="h-5 w-5" />} label="Trial accounts" value={String(data.metrics.trialCustomers)} detail="Awaiting conversion" />
        <Metric icon={<CreditCard className="h-5 w-5" />} label="Past due" value={String(data.metrics.pastDueCustomers)} detail="Billing action required" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[370px_minmax(0,1fr)]">
        <Panel title="Create customer" icon={<Building2 className="h-4 w-4" />}>
          <div className="grid gap-4">
            <Field label="Organization"><input className="admin-input" maxLength={120} value={form.organization} onChange={(event) => onForm({ ...form, organization: event.target.value })} /></Field>
            <Field label="Primary contact"><input className="admin-input" maxLength={100} value={form.primaryContact} onChange={(event) => onForm({ ...form, primaryContact: event.target.value })} /></Field>
            <Field label="Work email"><input className="admin-input" type="email" maxLength={160} value={form.email} onChange={(event) => onForm({ ...form, email: event.target.value })} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Plan"><Select value={form.plan} options={plans} onChange={(value) => onForm({ ...form, plan: value })} /></Field>
              <Field label="Account status"><Select value={form.status} options={customerStatuses} onChange={(value) => onForm({ ...form, status: value })} /></Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Billing status"><Select value={form.billingStatus} options={billingStatuses} onChange={(value) => onForm({ ...form, billingStatus: value })} /></Field>
              <Field label="Billing cycle"><Select value={form.billingCycle} options={billingCycles} onChange={(value) => onForm({ ...form, billingCycle: value })} /></Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Monthly value"><input className="admin-input" type="number" min="0" step="1" value={form.monthlyRevenue} onChange={(event) => onForm({ ...form, monthlyRevenue: event.target.value })} /></Field>
              <Field label="Currency"><Select value={form.currency} options={currencies} onChange={(value) => onForm({ ...form, currency: value })} /></Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Seats"><input className="admin-input" type="number" min="1" max="1000" value={form.seats} onChange={(event) => onForm({ ...form, seats: event.target.value })} /></Field>
              <Field label="Renewal"><input className="admin-input" type="date" value={form.renewalAt} onChange={(event) => onForm({ ...form, renewalAt: event.target.value })} /></Field>
            </div>
            <Field label="Commercial owner"><Select value={form.salesOwner} options={owners} onChange={(value) => onForm({ ...form, salesOwner: value })} /></Field>
            <button type="button" onClick={onCreate} disabled={saving} className="admin-primary-button justify-center"><Save className="h-4 w-4" />Create account</button>
          </div>
        </Panel>

        <Panel title="Customer portfolio" icon={<Building2 className="h-4 w-4" />}>
          {data.customers.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-[#647269]"><tr><th className="pb-3">Account</th><th className="pb-3">Plan</th><th className="pb-3">Value</th><th className="pb-3">Renewal</th><th className="pb-3">Account</th><th className="pb-3">Billing</th></tr></thead>
                <tbody className="divide-y divide-[#e2e7fb]">
                  {data.customers.map((customer) => (
                    <tr key={customer.id}>
                      <td className="py-3"><div className="font-semibold text-[#0f172a]">{customer.organization}</div><div className="mt-1 text-xs text-[#647269]">{customer.primaryContact} · {customer.email}</div></td>
                      <td className="py-3 text-[#172554]">{customer.plan}<div className="mt-1 text-xs text-[#647269]">{customer.seats} seats</div></td>
                      <td className="py-3 font-semibold text-[#0f172a]">{money(customer.monthlyRevenue, customer.currency)}<div className="mt-1 text-xs font-normal text-[#647269]">per month</div></td>
                      <td className="py-3 text-[#647269]">{shortDate(customer.renewalAt)}</td>
                      <td className="py-3"><Select compact value={customer.status} options={customerStatuses} onChange={(status) => onStatus(customer, status, customer.billingStatus)} /></td>
                      <td className="py-3"><Select compact value={customer.billingStatus} options={billingStatuses} onChange={(billingStatus) => onStatus(customer, customer.status, billingStatus)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <Empty title="No API customers" body="Create an approved customer account before assigning models or issuing credentials." />}
        </Panel>
      </div>
    </>
  );
}

type EntitlementForm = { customerId: string; modelId: string; environment: string; scope: string; status: string; requestLimit: string; expiresAt: string };
type KeyForm = { customerId: string; label: string; environment: string; expiresAt: string };

function ApiAccessView({ data, entitlementForm, issuedSecret, keyForm, models, onCopy, onCreateEntitlement, onEntitlementForm, onEntitlementStatus, onIssueKey, onKeyForm, onRevoke, copied, saving }: {
  data: CommerceData;
  entitlementForm: EntitlementForm;
  issuedSecret: string | null;
  keyForm: KeyForm;
  models: ModelOption[];
  onCopy: () => void;
  onCreateEntitlement: () => void;
  onEntitlementForm: (form: EntitlementForm) => void;
  onEntitlementStatus: (entitlement: Entitlement, status: string) => void;
  onIssueKey: () => void;
  onKeyForm: (form: KeyForm) => void;
  onRevoke: (key: ApiKey) => void;
  copied: boolean;
  saving: boolean;
}) {
  const customerOptions = data.customers.map((customer) => ({ value: customer.id, label: customer.organization }));
  const modelOptions = models.map((model) => ({ value: model.id, label: model.name }));
  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <Metric icon={<ShieldCheck className="h-5 w-5" />} label="Active entitlements" value={String(data.metrics.activeEntitlements)} detail={`${data.entitlements.length} total records`} />
        <Metric icon={<KeyRound className="h-5 w-5" />} label="Active credentials" value={String(data.metrics.activeApiKeys)} detail="Secrets are never re-displayed" />
        <Metric icon={<Activity className="h-5 w-5" />} label="Requests recorded" value={data.metrics.requestsUsed.toLocaleString()} detail={`${data.metrics.requestLimit.toLocaleString()} aggregate quota`} />
      </div>

      {issuedSecret && (
        <section className="rounded-md border border-[#9fc8af] bg-[#f0fdf4] p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0"><div className="text-sm font-bold text-[#166534]">Copy this API key now</div><code className="mt-2 block overflow-x-auto whitespace-nowrap text-sm text-[#14532d]">{issuedSecret}</code></div>
            <button type="button" onClick={onCopy} className="admin-secondary-button shrink-0">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? 'Copied' : 'Copy key'}</button>
          </div>
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Grant model entitlement" icon={<ShieldCheck className="h-4 w-4" />}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Customer"><OptionSelect value={entitlementForm.customerId || customerOptions[0]?.value || ''} options={customerOptions} onChange={(value) => onEntitlementForm({ ...entitlementForm, customerId: value })} /></Field>
            <Field label="Model"><OptionSelect value={entitlementForm.modelId || modelOptions[0]?.value || ''} options={modelOptions} onChange={(value) => onEntitlementForm({ ...entitlementForm, modelId: value })} /></Field>
            <Field label="Environment"><Select value={entitlementForm.environment} options={environments} onChange={(value) => onEntitlementForm({ ...entitlementForm, environment: value })} /></Field>
            <Field label="Scope"><Select value={entitlementForm.scope} options={scopes} onChange={(value) => onEntitlementForm({ ...entitlementForm, scope: value })} /></Field>
            <Field label="Initial status"><Select value={entitlementForm.status} options={entitlementStatuses} onChange={(value) => onEntitlementForm({ ...entitlementForm, status: value })} /></Field>
            <Field label="Monthly request limit"><input className="admin-input" type="number" min="1" value={entitlementForm.requestLimit} onChange={(event) => onEntitlementForm({ ...entitlementForm, requestLimit: event.target.value })} /></Field>
            <Field label="Expiry"><input className="admin-input" type="date" value={entitlementForm.expiresAt} onChange={(event) => onEntitlementForm({ ...entitlementForm, expiresAt: event.target.value })} /></Field>
            <button type="button" onClick={onCreateEntitlement} disabled={saving || !data.customers.length || !models.length} className="admin-primary-button self-end justify-center"><Save className="h-4 w-4" />Grant access</button>
          </div>
        </Panel>

        <Panel title="Issue API credential" icon={<KeyRound className="h-4 w-4" />}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Customer"><OptionSelect value={keyForm.customerId || customerOptions[0]?.value || ''} options={customerOptions} onChange={(value) => onKeyForm({ ...keyForm, customerId: value })} /></Field>
            <Field label="Credential purpose"><Select value={keyForm.label} options={keyLabels} onChange={(value) => onKeyForm({ ...keyForm, label: value })} /></Field>
            <Field label="Environment"><Select value={keyForm.environment} options={environments} onChange={(value) => onKeyForm({ ...keyForm, environment: value })} /></Field>
            <Field label="Expiry"><input className="admin-input" type="date" value={keyForm.expiresAt} onChange={(event) => onKeyForm({ ...keyForm, expiresAt: event.target.value })} /></Field>
            <div className="sm:col-span-2 rounded-md border border-[#dfe5f2] bg-[#f8fafc] p-3 text-xs leading-5 text-[#647269]">Only a SHA-256 hash is retained. The full credential is returned once after issuance.</div>
            <button type="button" onClick={onIssueKey} disabled={saving || !data.customers.length} className="admin-primary-button justify-center sm:col-span-2"><KeyRound className="h-4 w-4" />Issue credential</button>
          </div>
        </Panel>
      </div>

      <Panel title="Model entitlements" icon={<ShieldCheck className="h-4 w-4" />}>
        {data.entitlements.length ? (
          <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="text-xs uppercase tracking-wide text-[#647269]"><tr><th className="pb-3">Customer</th><th className="pb-3">Model</th><th className="pb-3">Environment</th><th className="pb-3">Scope</th><th className="pb-3">Usage</th><th className="pb-3">Expiry</th><th className="pb-3">Status</th></tr></thead><tbody className="divide-y divide-[#e2e7fb]">{data.entitlements.map((entitlement) => (
            <tr key={entitlement.id}><td className="py-3 font-semibold text-[#0f172a]">{customerName(data.customers, entitlement.customerId)}</td><td className="max-w-[260px] py-3 text-[#172554]">{modelName(models, entitlement.modelId)}</td><td className="py-3"><Badge value={entitlement.environment} /></td><td className="py-3 text-[#647269]">{label(entitlement.scope)}</td><td className="py-3 text-[#647269]">{entitlement.requestsUsed.toLocaleString()} / {entitlement.requestLimit.toLocaleString()}</td><td className="py-3 text-[#647269]">{shortDate(entitlement.expiresAt)}</td><td className="py-3"><Select compact value={entitlement.status} options={entitlementStatuses} onChange={(status) => onEntitlementStatus(entitlement, status)} /></td></tr>
          ))}</tbody></table></div>
        ) : <Empty title="No model entitlements" body="Assign an API customer to a model, environment, scope, and request limit." />}
      </Panel>

      <Panel title="API credentials" icon={<LockKeyhole className="h-4 w-4" />}>
        {data.apiKeys.length ? (
          <div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left text-sm"><thead className="text-xs uppercase tracking-wide text-[#647269]"><tr><th className="pb-3">Customer</th><th className="pb-3">Credential</th><th className="pb-3">Environment</th><th className="pb-3">Last used</th><th className="pb-3">Expiry</th><th className="pb-3">Status</th><th className="pb-3">Action</th></tr></thead><tbody className="divide-y divide-[#e2e7fb]">{data.apiKeys.map((key) => (
            <tr key={key.id}><td className="py-3 font-semibold text-[#0f172a]">{customerName(data.customers, key.customerId)}</td><td className="py-3"><div className="text-[#172554]">{key.label}</div><code className="mt-1 block text-xs text-[#647269]">{key.keyPrefix}</code></td><td className="py-3"><Badge value={key.environment} /></td><td className="py-3 text-[#647269]">{shortDate(key.lastUsedAt)}</td><td className="py-3 text-[#647269]">{shortDate(key.expiresAt)}</td><td className="py-3"><Badge value={key.status} /></td><td className="py-3">{key.status === 'active' ? <button type="button" onClick={() => onRevoke(key)} disabled={saving} className="admin-danger-button">Revoke</button> : <span className="text-xs text-[#94a3b8]">No action</span>}</td></tr>
          ))}</tbody></table></div>
        ) : <Empty title="No API credentials" body="Issue a credential only after the customer and model entitlement have been approved." />}
      </Panel>

      <AuditTrail events={data.auditEvents} />
    </>
  );
}

function BillingView({ data, onStatus, saving }: { data: CommerceData; onStatus: (customer: Customer, billingStatus: string) => void; saving: boolean }) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric icon={<CircleDollarSign className="h-5 w-5" />} label="MRR" value={money(data.metrics.monthlyRecurringRevenue)} detail="Active, current accounts" />
        <Metric icon={<Activity className="h-5 w-5" />} label="ARR" value={money(data.metrics.annualRecurringRevenue)} detail="Annualized run rate" />
        <Metric icon={<CreditCard className="h-5 w-5" />} label="Past due" value={String(data.metrics.pastDueCustomers)} detail="Accounts requiring action" />
        <Metric icon={<RefreshCw className="h-5 w-5" />} label="Renewals" value={String(data.metrics.renewalsNext30Days)} detail="Due in the next 30 days" />
      </div>
      <Panel title="Billing portfolio" icon={<CreditCard className="h-4 w-4" />}>
        {data.customers.length ? (
          <div className="overflow-x-auto"><table className="w-full min-w-[860px] text-left text-sm"><thead className="text-xs uppercase tracking-wide text-[#647269]"><tr><th className="pb-3">Customer</th><th className="pb-3">Plan</th><th className="pb-3">Cycle</th><th className="pb-3">Monthly value</th><th className="pb-3">Renewal</th><th className="pb-3">Owner</th><th className="pb-3">Billing status</th></tr></thead><tbody className="divide-y divide-[#e2e7fb]">{data.customers.map((customer) => (
            <tr key={customer.id}><td className="py-3"><div className="font-semibold text-[#0f172a]">{customer.organization}</div><div className="mt-1 text-xs text-[#647269]">{customer.email}</div></td><td className="py-3 text-[#172554]">{customer.plan}</td><td className="py-3 text-[#647269]">{label(customer.billingCycle)}</td><td className="py-3 font-semibold text-[#0f172a]">{money(customer.monthlyRevenue, customer.currency)}</td><td className="py-3 text-[#647269]">{shortDate(customer.renewalAt)}</td><td className="py-3 text-[#647269]">{customer.salesOwner}</td><td className="py-3"><Select compact disabled={saving} value={customer.billingStatus} options={billingStatuses} onChange={(status) => onStatus(customer, status)} /></td></tr>
          ))}</tbody></table></div>
        ) : <Empty title="No billing accounts" body="Customer commercial terms will appear here after an account is created." />}
      </Panel>
    </>
  );
}

function AuditTrail({ events }: { events: AuditEvent[] }) {
  return (
    <Panel title="Access audit trail" icon={<Activity className="h-4 w-4" />}>
      {events.length ? <div className="divide-y divide-[#e2e7fb]">{events.slice(0, 12).map((event) => (
        <div key={event.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"><div><span className="text-sm font-semibold text-[#0f172a]">{label(event.action.replace('.', '_'))}</span><span className="ml-2 text-sm text-[#647269]">{event.detail}</span></div><span className="shrink-0 text-xs text-[#647269]">{shortDate(event.createdAt)}</span></div>
      ))}</div> : <Empty title="No access events" body="Customer, entitlement, and credential changes will be recorded here." />}
    </Panel>
  );
}

function Panel({ children, icon, title }: { children: ReactNode; icon: ReactNode; title: string }) {
  return <section className="rounded-md border border-[#dfe5f2] bg-white p-5 shadow-sm"><div className="mb-5 flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#eef2ff] text-[#3d52da]">{icon}</span><h2 className="text-lg font-semibold text-[#0f172a]">{title}</h2></div>{children}</section>;
}

function Metric({ detail, icon, label: metricLabel, value }: { detail: string; icon: ReactNode; label: string; value: string }) {
  return <div className="rounded-md border border-[#dfe5f2] bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#eef2ff] text-[#3d52da]">{icon}</span><span className="text-2xl font-semibold text-[#0f172a]">{value}</span></div><div className="mt-4 text-xs font-bold uppercase tracking-wide text-[#647269]">{metricLabel}</div><p className="mt-2 text-sm text-[#647269]">{detail}</p></div>;
}

function Field({ children, label: fieldLabel }: { children: ReactNode; label: string }) {
  return <label className="grid gap-2"><span className="text-xs font-bold uppercase tracking-wide text-[#647269]">{fieldLabel}</span>{children}</label>;
}

function Select({ compact = false, disabled = false, onChange, options, value }: { compact?: boolean; disabled?: boolean; onChange: (value: string) => void; options: string[]; value: string }) {
  return <select disabled={disabled} className={compact ? 'admin-compact-select' : 'admin-input'} value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option} value={option}>{label(option)}</option>)}</select>;
}

function OptionSelect({ onChange, options, value }: { onChange: (value: string) => void; options: Array<{ value: string; label: string }>; value: string }) {
  return <select className="admin-input" value={value} onChange={(event) => onChange(event.target.value)} disabled={!options.length}><option value="" disabled>{options.length ? 'Select' : 'No records available'}</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>;
}

function Badge({ value }: { value: string }) {
  const positive = ['active', 'current', 'live'].includes(value);
  const caution = ['pending', 'trial', 'paper', 'sandbox'].includes(value);
  const classes = positive ? 'border-[#a7e8cc] bg-[#ecfdf5] text-[#047857]' : caution ? 'border-[#c7d2fe] bg-[#eef2ff] text-[#3046c8]' : 'border-[#fecdd3] bg-[#fff1f2] text-[#be123c]';
  return <span className={`inline-flex rounded-md border px-2 py-1 text-[11px] font-bold uppercase tracking-wide ${classes}`}>{label(value)}</span>;
}

function Notice({ children, tone }: { children: ReactNode; tone: 'success' | 'error' }) {
  return <div className={`rounded-md border p-3 text-sm ${tone === 'success' ? 'border-[#a7e8cc] bg-[#ecfdf5] text-[#047857]' : 'border-[#fecdd3] bg-[#fff1f2] text-[#be123c]'}`}>{children}</div>;
}

function Empty({ body, title }: { body: string; title: string }) {
  return <div className="rounded-md border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-6 text-center"><div className="font-semibold text-[#0f172a]">{title}</div><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#647269]">{body}</p></div>;
}

function OperationalFlag({ label: flagLabel, tone, value }: { label: string; tone: 'amber' | 'red'; value: number }) {
  const classes = tone === 'red' ? 'border-[#fecdd3] bg-[#fff1f2] text-[#be123c]' : 'border-[#fde68a] bg-[#fffbeb] text-[#a16207]';
  return <div className={`flex items-center justify-between rounded-md border px-4 py-3 ${classes}`}><span className="text-sm font-semibold">{flagLabel}</span><span className="text-lg font-bold">{value}</span></div>;
}
