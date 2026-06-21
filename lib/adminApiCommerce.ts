import { createHash, randomBytes } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export type CustomerStatus = 'trial' | 'active' | 'past_due' | 'suspended' | 'cancelled';
export type BillingStatus = 'trial' | 'current' | 'past_due' | 'manual_invoice' | 'cancelled';
export type BillingCycle = 'monthly' | 'annual' | 'custom';
export type ApiEnvironment = 'sandbox' | 'paper' | 'live';
export type EntitlementScope = 'signals' | 'read_only' | 'paper_execution' | 'live_execution';
export type EntitlementStatus = 'pending' | 'active' | 'suspended' | 'expired';
export type ApiKeyStatus = 'active' | 'revoked' | 'expired';

export type ApiCustomer = {
  id: string;
  organization: string;
  primaryContact: string;
  email: string;
  plan: string;
  status: CustomerStatus;
  billingStatus: BillingStatus;
  billingCycle: BillingCycle;
  currency: string;
  monthlyRevenue: number;
  seats: number;
  renewalAt: string | null;
  salesOwner: string;
  createdAt: string;
  updatedAt: string;
};

export type ModelEntitlement = {
  id: string;
  customerId: string;
  modelId: string;
  environment: ApiEnvironment;
  scope: EntitlementScope;
  status: EntitlementStatus;
  requestLimit: number;
  requestsUsed: number;
  startsAt: string;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type StoredApiKey = {
  id: string;
  customerId: string;
  label: string;
  keyPrefix: string;
  keyHash: string;
  environment: ApiEnvironment;
  status: ApiKeyStatus;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApiKeySummary = Omit<StoredApiKey, 'keyHash'>;

function apiKeySummary(key: StoredApiKey): ApiKeySummary {
  return {
    id: key.id,
    customerId: key.customerId,
    label: key.label,
    keyPrefix: key.keyPrefix,
    environment: key.environment,
    status: key.status,
    lastUsedAt: key.lastUsedAt,
    expiresAt: key.expiresAt,
    createdAt: key.createdAt,
    updatedAt: key.updatedAt,
  };
}

export type CommerceAuditEvent = {
  id: string;
  action: string;
  entityType: 'customer' | 'entitlement' | 'api_key';
  entityId: string;
  detail: string;
  createdAt: string;
};

type CommerceStore = {
  version: 1;
  updatedAt: string | null;
  customers: ApiCustomer[];
  entitlements: ModelEntitlement[];
  apiKeys: StoredApiKey[];
  auditEvents: CommerceAuditEvent[];
};

export type CommerceOverview = Omit<CommerceStore, 'apiKeys'> & {
  apiKeys: ApiKeySummary[];
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

const STORE_DIR = path.join(process.cwd(), '.qsentia-cache');
const STORE_PATH = path.join(STORE_DIR, 'admin-api-commerce.json');
const CUSTOMER_STATUSES = new Set<CustomerStatus>(['trial', 'active', 'past_due', 'suspended', 'cancelled']);
const BILLING_STATUSES = new Set<BillingStatus>(['trial', 'current', 'past_due', 'manual_invoice', 'cancelled']);
const BILLING_CYCLES = new Set<BillingCycle>(['monthly', 'annual', 'custom']);
const ENVIRONMENTS = new Set<ApiEnvironment>(['sandbox', 'paper', 'live']);
const ENTITLEMENT_SCOPES = new Set<EntitlementScope>(['signals', 'read_only', 'paper_execution', 'live_execution']);
const ENTITLEMENT_STATUSES = new Set<EntitlementStatus>(['pending', 'active', 'suspended', 'expired']);
const CURRENCIES = new Set(['USD', 'INR', 'EUR', 'GBP', 'SGD', 'AED']);
const PLANS = new Set(['Starter', 'Professional', 'Institutional', 'Enterprise']);
const SALES_OWNERS = new Set(['Investor Relations', 'CEO office', 'Operations']);
const KEY_LABELS = new Set(['Primary server', 'Trading worker', 'Research terminal', 'Staging']);

function blankStore(): CommerceStore {
  return { version: 1, updatedAt: null, customers: [], entitlements: [], apiKeys: [], auditEvents: [] };
}

function text(value: unknown, fallback = '', maxLength = 180) {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, maxLength) : fallback;
}

function allowed<T extends string>(value: unknown, values: Set<T>, fallback: T): T {
  return typeof value === 'string' && values.has(value as T) ? (value as T) : fallback;
}

function positiveInteger(value: unknown, fallback = 1) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? Math.floor(numeric) : fallback;
}

function nonNegativeNumber(value: unknown) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : 0;
}

function optionalDate(value: unknown) {
  if (typeof value !== 'string' || !value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function id(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${randomBytes(4).toString('hex')}`;
}

function audit(action: string, entityType: CommerceAuditEvent['entityType'], entityId: string, detail: string): CommerceAuditEvent {
  return { id: id('evt'), action, entityType, entityId, detail, createdAt: new Date().toISOString() };
}

function hasSupabaseAdminConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

async function supabaseAdminClient() {
  if (!hasSupabaseAdminConfig()) return null;
  const { supabaseAdmin } = await import('../backend/lib/supabase');
  return supabaseAdmin;
}

async function readLocalStore(): Promise<CommerceStore> {
  try {
    const parsed = JSON.parse(await readFile(STORE_PATH, 'utf8')) as Partial<CommerceStore>;
    return {
      version: 1,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : null,
      customers: Array.isArray(parsed.customers) ? parsed.customers : [],
      entitlements: Array.isArray(parsed.entitlements) ? parsed.entitlements : [],
      apiKeys: Array.isArray(parsed.apiKeys) ? parsed.apiKeys : [],
      auditEvents: Array.isArray(parsed.auditEvents) ? parsed.auditEvents : [],
    };
  } catch {
    return blankStore();
  }
}

async function writeLocalStore(store: CommerceStore) {
  const next = { ...store, updatedAt: new Date().toISOString() };
  await mkdir(STORE_DIR, { recursive: true });
  await writeFile(STORE_PATH, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  return next;
}

function customerFromRow(row: Record<string, unknown>): ApiCustomer {
  return {
    id: String(row.id),
    organization: String(row.organization),
    primaryContact: String(row.primary_contact),
    email: String(row.email),
    plan: String(row.plan),
    status: row.status as CustomerStatus,
    billingStatus: row.billing_status as BillingStatus,
    billingCycle: row.billing_cycle as BillingCycle,
    currency: String(row.currency),
    monthlyRevenue: Number(row.monthly_revenue || 0),
    seats: Number(row.seats || 1),
    renewalAt: typeof row.renewal_at === 'string' ? row.renewal_at : null,
    salesOwner: String(row.sales_owner),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function entitlementFromRow(row: Record<string, unknown>): ModelEntitlement {
  return {
    id: String(row.id),
    customerId: String(row.customer_id),
    modelId: String(row.model_id),
    environment: row.environment as ApiEnvironment,
    scope: row.scope as EntitlementScope,
    status: row.status as EntitlementStatus,
    requestLimit: Number(row.request_limit || 0),
    requestsUsed: Number(row.requests_used || 0),
    startsAt: String(row.starts_at),
    expiresAt: typeof row.expires_at === 'string' ? row.expires_at : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function apiKeyFromRow(row: Record<string, unknown>): StoredApiKey {
  return {
    id: String(row.id),
    customerId: String(row.customer_id),
    label: String(row.label),
    keyPrefix: String(row.key_prefix),
    keyHash: String(row.key_hash),
    environment: row.environment as ApiEnvironment,
    status: row.status as ApiKeyStatus,
    lastUsedAt: typeof row.last_used_at === 'string' ? row.last_used_at : null,
    expiresAt: typeof row.expires_at === 'string' ? row.expires_at : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function auditFromRow(row: Record<string, unknown>): CommerceAuditEvent {
  return {
    id: String(row.id),
    action: String(row.action),
    entityType: row.entity_type as CommerceAuditEvent['entityType'],
    entityId: String(row.entity_id),
    detail: String(row.detail),
    createdAt: String(row.created_at),
  };
}

async function readSupabaseStore(): Promise<CommerceStore> {
  const client = await supabaseAdminClient();
  if (!client) return blankStore();
  const [customers, entitlements, apiKeys, auditEvents] = await Promise.all([
    client.from('api_customers').select('*').order('created_at', { ascending: false }),
    client.from('model_entitlements').select('*').order('created_at', { ascending: false }),
    client.from('api_credentials').select('*').order('created_at', { ascending: false }),
    client.from('commerce_audit_events').select('*').order('created_at', { ascending: false }).limit(100),
  ]);
  const error = customers.error || entitlements.error || apiKeys.error || auditEvents.error;
  if (error) throw error;
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    customers: (customers.data || []).map((row) => customerFromRow(row)),
    entitlements: (entitlements.data || []).map((row) => entitlementFromRow(row)),
    apiKeys: (apiKeys.data || []).map((row) => apiKeyFromRow(row)),
    auditEvents: (auditEvents.data || []).map((row) => auditFromRow(row)),
  };
}

async function readStore() {
  return hasSupabaseAdminConfig() ? readSupabaseStore() : readLocalStore();
}

function overview(store: CommerceStore): CommerceOverview {
  const now = Date.now();
  const thirtyDays = now + 30 * 24 * 60 * 60 * 1000;
  const monthlyRecurringRevenue = store.customers
    .filter((customer) => customer.status === 'active' && customer.billingStatus === 'current')
    .reduce((sum, customer) => sum + customer.monthlyRevenue, 0);
  const requestLimit = store.entitlements.reduce((sum, entitlement) => sum + entitlement.requestLimit, 0);
  const requestsUsed = store.entitlements.reduce((sum, entitlement) => sum + entitlement.requestsUsed, 0);
  return {
    ...store,
    apiKeys: store.apiKeys.map(apiKeySummary),
    metrics: {
      customers: store.customers.length,
      activeCustomers: store.customers.filter((customer) => customer.status === 'active').length,
      trialCustomers: store.customers.filter((customer) => customer.status === 'trial').length,
      pastDueCustomers: store.customers.filter((customer) => customer.billingStatus === 'past_due').length,
      monthlyRecurringRevenue,
      annualRecurringRevenue: monthlyRecurringRevenue * 12,
      renewalsNext30Days: store.customers.filter((customer) => {
        const renewal = customer.renewalAt ? new Date(customer.renewalAt).getTime() : 0;
        return renewal >= now && renewal <= thirtyDays;
      }).length,
      activeEntitlements: store.entitlements.filter((entitlement) => entitlement.status === 'active').length,
      activeApiKeys: store.apiKeys.filter((key) => key.status === 'active').length,
      requestsUsed,
      requestLimit,
    },
  };
}

export async function readCommerceOverview() {
  return overview(await readStore());
}

export async function createApiCustomer(input: unknown) {
  const raw = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  const organization = text(raw.organization);
  const email = text(raw.email).toLowerCase();
  if (!organization || !email || !email.includes('@')) throw new Error('Organization and valid email are required');
  const now = new Date().toISOString();
  const customer: ApiCustomer = {
    id: id('cust'),
    organization,
    primaryContact: text(raw.primaryContact, 'Not assigned'),
    email,
    plan: allowed(raw.plan, PLANS, 'Starter'),
    status: allowed(raw.status, CUSTOMER_STATUSES, 'trial'),
    billingStatus: allowed(raw.billingStatus, BILLING_STATUSES, 'trial'),
    billingCycle: allowed(raw.billingCycle, BILLING_CYCLES, 'monthly'),
    currency: allowed(typeof raw.currency === 'string' ? raw.currency.toUpperCase() : '', CURRENCIES, 'USD'),
    monthlyRevenue: nonNegativeNumber(raw.monthlyRevenue),
    seats: positiveInteger(raw.seats),
    renewalAt: optionalDate(raw.renewalAt),
    salesOwner: allowed(raw.salesOwner, SALES_OWNERS, 'Investor Relations'),
    createdAt: now,
    updatedAt: now,
  };
  const event = audit('customer.created', 'customer', customer.id, `${customer.organization} account created`);
  const client = await supabaseAdminClient();
  if (client) {
    const { error } = await client.from('api_customers').insert({
      id: customer.id, organization: customer.organization, primary_contact: customer.primaryContact,
      email: customer.email, plan: customer.plan, status: customer.status, billing_status: customer.billingStatus,
      billing_cycle: customer.billingCycle, currency: customer.currency, monthly_revenue: customer.monthlyRevenue,
      seats: customer.seats, renewal_at: customer.renewalAt, sales_owner: customer.salesOwner,
      created_at: customer.createdAt, updated_at: customer.updatedAt,
    });
    if (error) throw error;
    await client.from('commerce_audit_events').insert({ id: event.id, action: event.action, entity_type: event.entityType, entity_id: event.entityId, detail: event.detail, created_at: event.createdAt });
  } else {
    const store = await readLocalStore();
    store.customers.unshift(customer);
    store.auditEvents.unshift(event);
    await writeLocalStore(store);
  }
  return customer;
}

export async function createModelEntitlement(input: unknown) {
  const raw = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  const customerId = text(raw.customerId);
  const modelId = text(raw.modelId);
  if (!customerId || !modelId) throw new Error('Customer and model are required');
  const store = await readStore();
  if (!store.customers.some((customer) => customer.id === customerId)) throw new Error('Customer was not found');
  const now = new Date().toISOString();
  const entitlement: ModelEntitlement = {
    id: id('ent'), customerId, modelId,
    environment: allowed(raw.environment, ENVIRONMENTS, 'sandbox'),
    scope: allowed(raw.scope, ENTITLEMENT_SCOPES, 'signals'),
    status: allowed(raw.status, ENTITLEMENT_STATUSES, 'pending'),
    requestLimit: positiveInteger(raw.requestLimit, 10000), requestsUsed: 0,
    startsAt: now, expiresAt: optionalDate(raw.expiresAt), createdAt: now, updatedAt: now,
  };
  const event = audit('entitlement.created', 'entitlement', entitlement.id, `${modelId} assigned to ${customerId}`);
  const client = await supabaseAdminClient();
  if (client) {
    const { error } = await client.from('model_entitlements').insert({
      id: entitlement.id, customer_id: entitlement.customerId, model_id: entitlement.modelId,
      environment: entitlement.environment, scope: entitlement.scope, status: entitlement.status,
      request_limit: entitlement.requestLimit, requests_used: 0, starts_at: entitlement.startsAt,
      expires_at: entitlement.expiresAt, created_at: entitlement.createdAt, updated_at: entitlement.updatedAt,
    });
    if (error) throw error;
    await client.from('commerce_audit_events').insert({ id: event.id, action: event.action, entity_type: event.entityType, entity_id: event.entityId, detail: event.detail, created_at: event.createdAt });
  } else {
    store.entitlements.unshift(entitlement);
    store.auditEvents.unshift(event);
    await writeLocalStore(store);
  }
  return entitlement;
}

export async function issueApiCredential(input: unknown) {
  const raw = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  const customerId = text(raw.customerId);
  const store = await readStore();
  if (!store.customers.some((customer) => customer.id === customerId)) throw new Error('Customer was not found');
  const environment = allowed(raw.environment, ENVIRONMENTS, 'sandbox');
  const token = randomBytes(24).toString('base64url');
  const secret = `qs_${environment}_${token}`;
  const now = new Date().toISOString();
  const key: StoredApiKey = {
    id: id('key'), customerId,
    label: allowed(raw.label, KEY_LABELS, 'Primary server'),
    keyPrefix: `${secret.slice(0, 18)}...`,
    keyHash: createHash('sha256').update(secret).digest('hex'),
    environment, status: 'active', lastUsedAt: null,
    expiresAt: optionalDate(raw.expiresAt), createdAt: now, updatedAt: now,
  };
  const event = audit('api_key.issued', 'api_key', key.id, `${key.label} issued for ${customerId}`);
  const client = await supabaseAdminClient();
  if (client) {
    const { error } = await client.from('api_credentials').insert({
      id: key.id, customer_id: key.customerId, label: key.label, key_prefix: key.keyPrefix,
      key_hash: key.keyHash, environment: key.environment, status: key.status,
      last_used_at: null, expires_at: key.expiresAt, created_at: key.createdAt, updated_at: key.updatedAt,
    });
    if (error) throw error;
    await client.from('commerce_audit_events').insert({ id: event.id, action: event.action, entity_type: event.entityType, entity_id: event.entityId, detail: event.detail, created_at: event.createdAt });
  } else {
    store.apiKeys.unshift(key);
    store.auditEvents.unshift(event);
    await writeLocalStore(store);
  }
  return { credential: apiKeySummary(key), secret };
}

export async function updateCommerceRecord(input: unknown) {
  const raw = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  const type = text(raw.type);
  const recordId = text(raw.id);
  if (!recordId) throw new Error('Record id is required');
  const now = new Date().toISOString();
  const client = await supabaseAdminClient();

  if (type === 'customer') {
    const status = allowed(raw.status, CUSTOMER_STATUSES, 'trial');
    const billingStatus = allowed(raw.billingStatus, BILLING_STATUSES, 'trial');
    if (client) {
      const { error } = await client.from('api_customers').update({ status, billing_status: billingStatus, updated_at: now }).eq('id', recordId);
      if (error) throw error;
    } else {
      const store = await readLocalStore();
      const customer = store.customers.find((item) => item.id === recordId);
      if (!customer) throw new Error('Customer was not found');
      customer.status = status;
      customer.billingStatus = billingStatus;
      customer.updatedAt = now;
      store.auditEvents.unshift(audit('customer.status_changed', 'customer', recordId, `${status} / ${billingStatus}`));
      await writeLocalStore(store);
    }
    return;
  }

  if (type === 'entitlement') {
    const status = allowed(raw.status, ENTITLEMENT_STATUSES, 'pending');
    if (client) {
      const { error } = await client.from('model_entitlements').update({ status, updated_at: now }).eq('id', recordId);
      if (error) throw error;
    } else {
      const store = await readLocalStore();
      const entitlement = store.entitlements.find((item) => item.id === recordId);
      if (!entitlement) throw new Error('Entitlement was not found');
      entitlement.status = status;
      entitlement.updatedAt = now;
      store.auditEvents.unshift(audit('entitlement.status_changed', 'entitlement', recordId, status));
      await writeLocalStore(store);
    }
    return;
  }

  if (type === 'api_key') {
    if (client) {
      const { error } = await client.from('api_credentials').update({ status: 'revoked', updated_at: now }).eq('id', recordId);
      if (error) throw error;
    } else {
      const store = await readLocalStore();
      const key = store.apiKeys.find((item) => item.id === recordId);
      if (!key) throw new Error('API key was not found');
      key.status = 'revoked';
      key.updatedAt = now;
      store.auditEvents.unshift(audit('api_key.revoked', 'api_key', recordId, key.keyPrefix));
      await writeLocalStore(store);
    }
    return;
  }

  throw new Error('Unsupported commerce record type');
}
