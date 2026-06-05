import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export type ModelAccessStatus = 'draft' | 'active' | 'private' | 'waitlist' | 'retired';
export type BillingInterval = 'monthly' | 'annual' | 'one_time' | 'custom';
export type ModelVisibility = 'public' | 'hidden';

export type AdminModelSetting = {
  pricing?: string | null;
  billingInterval?: BillingInterval;
  currency?: string;
  setupFee?: string | null;
  minimumCapital?: string | null;
  accessStatus?: ModelAccessStatus;
  visibility?: ModelVisibility;
  featured?: boolean;
  soldUnits?: number;
  trialCount?: number;
  salesOwner?: string | null;
  onboardingNotes?: string | null;
  updatedAt?: string;
};

export type AdminModelSettingsFile = {
  version: 1;
  updatedAt: string | null;
  models: Record<string, AdminModelSetting>;
};

export const DEFAULT_ADMIN_MODEL_SETTING: Required<
  Omit<AdminModelSetting, 'updatedAt'>
> = {
  pricing: 'Contact sales',
  billingInterval: 'monthly',
  currency: 'USD',
  setupFee: null,
  minimumCapital: null,
  accessStatus: 'draft',
  visibility: 'public',
  featured: false,
  soldUnits: 0,
  trialCount: 0,
  salesOwner: 'Investor Relations',
  onboardingNotes: null,
};

const SETTINGS_DIR = path.join(process.cwd(), '.qsentia-cache');
const SETTINGS_PATH = path.join(SETTINGS_DIR, 'admin-model-settings.json');

const ACCESS_STATUSES = new Set<ModelAccessStatus>([
  'draft',
  'active',
  'private',
  'waitlist',
  'retired',
]);

const BILLING_INTERVALS = new Set<BillingInterval>([
  'monthly',
  'annual',
  'one_time',
  'custom',
]);

const VISIBILITIES = new Set<ModelVisibility>(['public', 'hidden']);
const CURRENCIES = new Set(['USD', 'INR', 'EUR', 'GBP', 'SGD', 'AED']);
const PRICING_LABELS = new Set(['Contact sales', 'Custom quote', 'Trial access', 'Enterprise plan']);
const SALES_OWNERS = new Set(['Investor Relations', 'Research', 'Engineering', 'CEO office', 'Operations']);

function blankSettings(): AdminModelSettingsFile {
  return {
    version: 1,
    updatedAt: null,
    models: {},
  };
}

function nullableText(value: unknown, maxLength = 240): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

function enumValue<T extends string>(value: unknown, allowed: Set<T>, fallback: T): T {
  return typeof value === 'string' && allowed.has(value as T) ? (value as T) : fallback;
}

function allowedText(value: unknown, allowed: Set<string>): string | null {
  return typeof value === 'string' && allowed.has(value) ? value : null;
}

function moneyText(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) return null;
  return String(numeric);
}

function nonNegativeInteger(value: unknown): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) return 0;
  return Math.floor(numeric);
}

export function sanitizeAdminModelSetting(input: unknown): AdminModelSetting {
  const raw = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};

  return {
    pricing: allowedText(raw.pricing, PRICING_LABELS),
    billingInterval: enumValue(raw.billingInterval, BILLING_INTERVALS, 'monthly'),
    currency:
      typeof raw.currency === 'string' && CURRENCIES.has(raw.currency.toUpperCase())
        ? raw.currency.toUpperCase()
        : 'USD',
    setupFee: moneyText(raw.setupFee),
    minimumCapital: moneyText(raw.minimumCapital),
    accessStatus: enumValue(raw.accessStatus, ACCESS_STATUSES, 'draft'),
    visibility: enumValue(raw.visibility, VISIBILITIES, 'public'),
    featured: Boolean(raw.featured),
    soldUnits: nonNegativeInteger(raw.soldUnits),
    trialCount: nonNegativeInteger(raw.trialCount),
    salesOwner: allowedText(raw.salesOwner, SALES_OWNERS),
    onboardingNotes: nullableText(raw.onboardingNotes, 700),
  };
}

export function mergeAdminModelSetting(
  setting: AdminModelSetting | undefined
): Required<Omit<AdminModelSetting, 'updatedAt'>> & { updatedAt?: string } {
  return {
    ...DEFAULT_ADMIN_MODEL_SETTING,
    ...(setting || {}),
  };
}

function normalizeSettingsFile(payload: unknown): AdminModelSettingsFile {
  if (!payload || typeof payload !== 'object') return blankSettings();
  const raw = payload as Partial<AdminModelSettingsFile>;
  const models = raw.models && typeof raw.models === 'object' ? raw.models : {};

  return {
    version: 1,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : null,
    models: Object.fromEntries(
      Object.entries(models).map(([modelId, setting]) => {
        const sanitized = sanitizeAdminModelSetting(setting);
        const rawSetting = setting && typeof setting === 'object' ? (setting as AdminModelSetting) : {};
        return [
          modelId,
          {
            ...sanitized,
            updatedAt: typeof rawSetting.updatedAt === 'string' ? rawSetting.updatedAt : undefined,
          },
        ];
      })
    ),
  };
}

export async function readAdminModelSettings(): Promise<AdminModelSettingsFile> {
  try {
    const contents = await readFile(SETTINGS_PATH, 'utf8');
    return normalizeSettingsFile(JSON.parse(contents));
  } catch {
    return blankSettings();
  }
}

export async function writeAdminModelSettings(
  settings: AdminModelSettingsFile
): Promise<AdminModelSettingsFile> {
  const normalized = normalizeSettingsFile(settings);
  await mkdir(SETTINGS_DIR, { recursive: true });
  await writeFile(SETTINGS_PATH, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8');
  return normalized;
}
