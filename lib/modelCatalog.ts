import {
  type AdminModelSetting,
  type BillingInterval,
  type ModelAccessStatus,
  type ModelVisibility,
  mergeAdminModelSetting,
  readAdminModelSettings,
} from '@/lib/adminModelSettings';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

type ModelStats = {
  sharpe?: number | null;
  totalReturn?: number | null;
  annualizedReturn?: number | null;
  maxDrawdown?: number | null;
  hitRate?: number | null;
  nReturns?: number | null;
};

type ModelComparisonEntry = {
  id: string;
  name?: string;
  description?: string;
  repo?: string;
  logsPath?: string;
  color?: string;
  stats?: ModelStats;
};

type DashboardLatest = {
  decision?: Record<string, unknown> | null;
  paperStatus?: string | null;
  paperReplayStatus?: string | null;
  portfolioValue?: number | null;
  portfolioValueTimestamp?: string | null;
  latestSignalGrossWeight?: number | null;
  lastRun?: string | null;
};

type DashboardPayload = {
  modelComparison?: ModelComparisonEntry[];
  selectedModel?: string;
  latest?: DashboardLatest;
  actionCounts?: Array<{ action?: string; count?: number }>;
  debug?: {
    rowCounts?: {
      dailyPortfolioRows?: number;
      decisionsRows?: number;
    };
  };
};

type Category =
  | 'crypto'
  | 'macro'
  | 'sentiment'
  | 'equity'
  | 'multi-strategy'
  | 'reinforcement-learning';

export type MarketplaceModel = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: Category;
  performance: {
    sharpeRatio: number | null;
    annualizedReturn: number | null;
    maxDrawdown: number | null;
    winRate: number | null;
  };
  pricing: string | null;
  billingInterval?: BillingInterval;
  currency?: string;
  setupFee?: string | null;
  minimumCapital?: string | null;
  accessStatus?: ModelAccessStatus;
  visibility?: ModelVisibility;
  featured?: boolean;
  salesOwner?: string | null;
  onboardingNotes?: string | null;
  commercialUpdatedAt?: string;
  tags: string[];
  repo: string | null;
  logsPath: string | null;
};

const DASHBOARD_LAST_GOOD_CACHE_PATH = path.join(
  process.cwd(),
  '.qsentia-cache',
  'dashboard-last-good.json'
);
const ACTIVE_MARKETPLACE_MODEL_IDS = new Set([
  'crypto_sentiment_mlp',
  'qsentia_eth_micro_futures_sentiment_alpha',
  'model_c_etf',
  'model_c_paper_trading',
  'base_model_br_ppo',
  'br_ppo_crypto_v15',
  'brppo_fixed_income_regime',
]);

export type ModelDetails = MarketplaceModel & {
  longDescription: string;
  performance: MarketplaceModel['performance'] & {
    avgHoldingPeriod: string | null;
    totalSignals: number | null;
  };
  pricing: string | null;
  features: string[];
  compatibleBrokers?: string[];
  useCases?: string[];
  latest: DashboardLatest;
};

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function numberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function inferCategory(model: { id?: string; name?: string; description?: string }): Category {
  const haystack = `${model.id || ''} ${model.name || ''} ${model.description || ''}`.toLowerCase();

  if (haystack.includes('macro')) return 'macro';
  if (haystack.includes('sentiment') || haystack.includes('nlp')) return 'sentiment';
  if (haystack.includes('crypto') || haystack.includes('btc') || haystack.includes('eth')) return 'crypto';
  if (haystack.includes('ppo') || haystack.includes('reinforcement') || haystack.includes('rl')) {
    return 'reinforcement-learning';
  }
  if (haystack.includes('moe') || haystack.includes('multi')) return 'multi-strategy';
  return 'equity';
}

function buildTags(entry: ModelComparisonEntry, category: Category) {
  const tags = new Set<string>();
  tags.add('live-data');
  tags.add(category);

  if (entry.repo) {
    const repoName = entry.repo.split('/')[1];
    if (repoName) tags.add(repoName.toLowerCase().replace(/_/g, '-'));
  }

  if (entry.id) {
    for (const token of entry.id.split('_')) {
      if (token.length > 2) tags.add(token.toLowerCase());
    }
  }

  return Array.from(tags).slice(0, 6);
}

function mapModel(entry: ModelComparisonEntry): MarketplaceModel {
  const category = inferCategory(entry);
  const slugSource = entry.id || entry.name || 'model';

  return {
    id: entry.id,
    slug: toSlug(slugSource),
    name: entry.name || entry.id,
    description:
      entry.description ||
      `Live telemetry-backed model with performance sourced from ${entry.repo || 'QSentia dashboard'}.`,
    category,
    performance: {
      sharpeRatio: numberOrNull(entry.stats?.sharpe),
      annualizedReturn: numberOrNull(entry.stats?.annualizedReturn ?? entry.stats?.totalReturn),
      maxDrawdown: numberOrNull(entry.stats?.maxDrawdown),
      winRate: numberOrNull(entry.stats?.hitRate),
    },
    pricing: null,
    tags: buildTags(entry, category),
    repo: entry.repo || null,
    logsPath: entry.logsPath || null,
  };
}

function applyAdminSetting(
  model: MarketplaceModel,
  setting: AdminModelSetting | undefined
): MarketplaceModel {
  const admin = mergeAdminModelSetting(setting);

  return {
    ...model,
    pricing: admin.pricing,
    billingInterval: admin.billingInterval,
    currency: admin.currency,
    setupFee: admin.setupFee,
    minimumCapital: admin.minimumCapital,
    accessStatus: admin.accessStatus,
    visibility: admin.visibility,
    featured: admin.featured,
    salesOwner: admin.salesOwner,
    onboardingNotes: admin.onboardingNotes,
    commercialUpdatedAt: admin.updatedAt,
  };
}

async function fetchDashboard(
  origin: string,
  modelId?: string,
  summaryOnly = false
): Promise<DashboardPayload | null> {
  try {
    const params = new URLSearchParams();
    if (modelId) params.set('model', modelId);
    if (summaryOnly) params.set('summary', '1');
    const endpoint = `${origin}/api/dashboard${params.toString() ? `?${params.toString()}` : ''}`;

    const response = await fetch(endpoint, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) return null;
    return (await response.json()) as DashboardPayload;
  } catch {
    return null;
  }
}

async function readCachedDashboardPayload(): Promise<DashboardPayload | null> {
  try {
    const text = await readFile(DASHBOARD_LAST_GOOD_CACHE_PATH, 'utf8');
    const parsed = JSON.parse(text) as { payload?: unknown } | DashboardPayload;
    const payload =
      parsed && typeof parsed === 'object' && 'payload' in parsed
        ? parsed.payload
        : parsed;

    if (
      payload &&
      typeof payload === 'object' &&
      Array.isArray((payload as DashboardPayload).modelComparison)
    ) {
      return payload as DashboardPayload;
    }
  } catch {
    return null;
  }

  return null;
}

function originFromRequest(request: Request) {
  return new URL(request.url).origin;
}

export async function getLiveMarketplaceModels(
  request: Request,
  options: { includeHidden?: boolean; preferCachedDashboard?: boolean; summaryOnly?: boolean } = {}
): Promise<MarketplaceModel[]> {
  const cachedDashboard = options.preferCachedDashboard ? await readCachedDashboardPayload() : null;
  const dashboard =
    cachedDashboard || (await fetchDashboard(originFromRequest(request), undefined, options.summaryOnly));

  if (!dashboard?.modelComparison?.length) {
    return [];
  }

  const settings = await readAdminModelSettings();
  const models = dashboard.modelComparison
    .filter((entry) => ACTIVE_MARKETPLACE_MODEL_IDS.has(entry.id))
    .map((entry) => applyAdminSetting(mapModel(entry), settings.models[entry.id]));

  const visibleModels = options.includeHidden
    ? models
    : models.filter((model) => model.visibility !== 'hidden');

  return visibleModels.sort((a, b) => Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name));
}

function signalCount(payload: DashboardPayload): number | null {
  if (!Array.isArray(payload.actionCounts) || !payload.actionCounts.length) {
    return numberOrNull(payload.debug?.rowCounts?.decisionsRows ?? null);
  }

  const total = payload.actionCounts.reduce((sum, row) => sum + Number(row?.count || 0), 0);
  return Number.isFinite(total) && total >= 0 ? total : null;
}

export async function getLiveModelDetails(request: Request, slug: string): Promise<ModelDetails | null> {
  const models = await getLiveMarketplaceModels(request);
  const summary = models.find((model) => model.slug === slug);

  if (!summary) return null;

  const detailPayload = await fetchDashboard(originFromRequest(request), summary.id);
  const detailEntry = detailPayload?.modelComparison?.find((model) => model.id === summary.id);
  const stats = detailEntry?.stats || {};

  const features = [
    summary.repo ? `Repository: ${summary.repo}` : null,
    summary.logsPath ? `Logs path: ${summary.logsPath}` : null,
    detailPayload?.latest?.paperStatus ? `Paper status: ${detailPayload.latest.paperStatus}` : null,
    detailPayload?.latest?.paperReplayStatus
      ? `Replay status: ${detailPayload.latest.paperReplayStatus}`
      : null,
    detailPayload?.debug?.rowCounts?.dailyPortfolioRows
      ? `Portfolio observations: ${detailPayload.debug.rowCounts.dailyPortfolioRows}`
      : null,
  ].filter((value): value is string => Boolean(value));

  const latestValue = numberOrNull(detailPayload?.latest?.portfolioValue);
  const latestSignalWeight = numberOrNull(detailPayload?.latest?.latestSignalGrossWeight);

  return {
    ...summary,
    longDescription: [
      'This model card is generated from live QSentia dashboard telemetry and repository-backed logs.',
      summary.repo ? `Source repository: ${summary.repo}.` : null,
      latestValue !== null ? `Latest account value: ${latestValue.toFixed(2)}.` : null,
      detailPayload?.latest?.portfolioValueTimestamp
        ? `As of: ${detailPayload.latest.portfolioValueTimestamp}.`
        : null,
      latestSignalWeight !== null
        ? `Latest signal gross weight: ${latestSignalWeight.toFixed(4)}.`
        : null,
    ]
      .filter((line): line is string => Boolean(line))
      .join(' '),
    performance: {
      sharpeRatio: numberOrNull(stats.sharpe),
      annualizedReturn: numberOrNull(stats.annualizedReturn ?? stats.totalReturn),
      maxDrawdown: numberOrNull(stats.maxDrawdown),
      winRate: numberOrNull(stats.hitRate),
      avgHoldingPeriod: null,
      totalSignals: signalCount(detailPayload || {}),
    },
    pricing: summary.pricing,
    features,
    latest: detailPayload?.latest || {},
  };
}

export function actionFromDecision(decision: Record<string, unknown> | null | undefined) {
  const rawAction =
    decision?.action || decision?.signal || decision?.decision || decision?.label || decision?.state;

  if (!rawAction) return null;

  return String(rawAction).toUpperCase();
}

export function confidenceFromDecision(decision: Record<string, unknown> | null | undefined) {
  return (
    numberOrNull(decision?.confidence) ||
    numberOrNull(decision?.probability) ||
    numberOrNull(decision?.score) ||
    null
  );
}

export function positionSizeFromDecision(
  decision: Record<string, unknown> | null | undefined,
  payload: DashboardPayload | null
) {
  return (
    numberOrNull(decision?.positionSize) ||
    numberOrNull(decision?.allocation_weight) ||
    numberOrNull(decision?.target_weight) ||
    numberOrNull(payload?.latest?.latestSignalGrossWeight) ||
    null
  );
}

export async function getLiveSignalPreview(request: Request, modelId: string) {
  const payload = await fetchDashboard(originFromRequest(request), modelId);
  return payload;
}
