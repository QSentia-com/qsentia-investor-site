import { NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { computeStats, normalizeTo100, pctChange } from '@/lib/metrics';
import Papa from 'papaparse';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const REGISTRY_OWNER = process.env.NEXT_PUBLIC_QSENTIA_REPO_OWNER || 'FinTechEntrepreneurldz';
const REGISTRY_REPO = process.env.NEXT_PUBLIC_QSENTIA_REPO_NAME || 'Base_Model_BR_PPO';
const REGISTRY_BRANCH = process.env.NEXT_PUBLIC_QSENTIA_BRANCH || 'main';
const GITHUB_READ_TOKEN_CANDIDATES = [
  ['GITHUB_READ_TOKEN', process.env.GITHUB_READ_TOKEN],
  ['QSENTIA_GITHUB_READ_TOKEN', process.env.QSENTIA_GITHUB_READ_TOKEN],
  ['QSENTIA_GITHUB_TOKEN', process.env.QSENTIA_GITHUB_TOKEN],
  ['GITHUB_TOKEN', process.env.GITHUB_TOKEN],
  ['GH_TOKEN', process.env.GH_TOKEN],
  ['VERCEL_GITHUB_TOKEN', process.env.VERCEL_GITHUB_TOKEN],
  ['NEXT_PUBLIC_GITHUB_READ_TOKEN', process.env.NEXT_PUBLIC_GITHUB_READ_TOKEN],
] as const;
const ACTIVE_GITHUB_READ_TOKEN = GITHUB_READ_TOKEN_CANDIDATES.map(([name, value]) => ({
  name,
  value: normalizeGitHubToken(value),
})).find((candidate) => candidate.value);
const GITHUB_READ_TOKEN = ACTIVE_GITHUB_READ_TOKEN?.value || '';
const GITHUB_READ_TOKEN_ENV_NAME = ACTIVE_GITHUB_READ_TOKEN?.name || null;
const CRYPTO_SENTIMENT_MLP_MODEL_ID = 'crypto_sentiment_mlp';
const BTC_ETF_SENTIMENT_ALPHA_MODEL_ID = 'qsentia_btc_etf_sentiment_alpha';
const ETH_MICRO_FUTURES_SENTIMENT_ALPHA_MODEL_ID =
  'qsentia_eth_micro_futures_sentiment_alpha';
const MODEL_C_SENTIMENT_ALPHA_MODEL_ID = 'qsentia_model_c_sentiment_alpha';
const RL_ALPHA_ALLOCATOR_MODEL_ID = 'qsentia_rl_alpha_allocator';
const MODEL_C_ORIGINAL_MODEL_ID = 'model_c';
const MODEL_C_MLP_REGIME_MOE_MODEL_ID = 'model_c_mlp_regime_moe';
const MODEL_A_ORIGINAL_MODEL_ID = 'model_a';
const BR_PPO_CRYPTO_V15_MODEL_ID = 'br_ppo_crypto_v15';
const BTC_ETH_PERP_BASIS_ALIAS_MODEL_ID = 'qsentia_btc_eth_perp_basis_alpha';
const DEFAULT_MODEL_ID = process.env.NEXT_PUBLIC_QSENTIA_DEFAULT_MODEL_ID || CRYPTO_SENTIMENT_MLP_MODEL_ID;
const RETIRED_MODEL_IDS = new Set([
  'qsentia_btc_eth_perp_basis_alpha',
  'qsentia_btc_spot_sentiment_alpha',
  'qsentia_brppo_macro_rotation_alpaca',
  'real_crypto_carry_ibkr',
  'real-crypto-carry-ibkr',
]);
const ACCOUNT_BASELINE_MODEL_IDS = new Set([
  MODEL_C_SENTIMENT_ALPHA_MODEL_ID,
  BTC_ETF_SENTIMENT_ALPHA_MODEL_ID,
  ETH_MICRO_FUTURES_SENTIMENT_ALPHA_MODEL_ID,
  RL_ALPHA_ALLOCATOR_MODEL_ID,
  'delta_neutral_crypto_funding',
]);
const DEFAULT_ACCOUNT_STARTING_CAPITAL = Number(
  process.env.QSENTIA_ACCOUNT_STARTING_CAPITAL ||
    process.env.NEXT_PUBLIC_QSENTIA_ACCOUNT_STARTING_CAPITAL ||
    1000000
);
const UPSTREAM_API_BASE_URL = (
  process.env.QSENTIA_UPSTREAM_API_BASE_URL || 'https://www.qsentia.com'
).replace(/\/+$/, '');
const UPSTREAM_DASHBOARD_BASE_URLS = Array.from(
  new Set([UPSTREAM_API_BASE_URL, 'https://www.qsentia.com', 'https://qsentia.com'])
);
const DASHBOARD_CACHE_DIR = path.join(process.cwd(), '.qsentia-cache');
const DASHBOARD_LAST_GOOD_CACHE_PATH = path.join(DASHBOARD_CACHE_DIR, 'dashboard-last-good.json');
let lastUsableUpstreamDashboardPayload: Record<string, unknown> | null = null;
let lastUsableUpstreamDashboardAt: string | null = null;
let lastUpstreamDashboardFetchReport: Record<string, unknown> | null = null;

const BENCHMARKS = [
  { name: 'S&P 500', ticker: 'SPY', color: '#111111' },
  { name: 'Nasdaq 100', ticker: 'QQQ', color: '#7c3aed' },
  { name: 'Dow Jones', ticker: 'DIA', color: '#737373' },
  { name: 'Russell 2000', ticker: 'IWM', color: '#b45309' },
  { name: 'Total US Market', ticker: 'VTI', color: '#0f766e' },
];

const REQUIRED_MODELS: ModelConfig[] = [
  {
    id: CRYPTO_SENTIMENT_MLP_MODEL_ID,
    name: 'Crypto Sentiment MLP/PPO - IBKR',
    description:
      'Live BTC sentiment ensemble using CryptoBERT-scored news, MLP/PPO stackers, and IBKR CME Micro Bitcoin futures paper execution. Current portfolio value is sourced from IBKR NetLiquidation.',
    repo: 'FinTechEntrepreneurldz/crypto_sentiment_MLP',
    logs_path: 'logs',
    branch: 'main',
    enabled: true,
    color: '#f59e0b',
  },
  {
    id: BTC_ETF_SENTIMENT_ALPHA_MODEL_ID,
    name: 'QSentia BTC ETF Sentiment Alpha - Alpaca',
    description:
      'BTC sentiment ensemble using the same CryptoBERT, MLP, PPO, and live news stack as the futures model, routed through Alpaca-listed BITU/SBIT ETF exposure. Current portfolio value is sourced from Alpaca portfolio_value/net_liquidation logs.',
    repo: 'FinTechEntrepreneurldz/qsentia-btc-etf-sentiment-alpha',
    logs_path: 'logs',
    branch: 'main',
    enabled: true,
    color: '#14b8a6',
    starting_capital: 1000000,
  },
  {
    id: ETH_MICRO_FUTURES_SENTIMENT_ALPHA_MODEL_ID,
    name: 'QSentia ETH Micro Futures Sentiment Alpha - IBKR',
    description:
      'ETH-specific CryptoBERT, MLP, and PPO sentiment ensemble trained on Ethereum news/social text and routed through IBKR CME Micro Ether futures (MET) paper execution. Current portfolio value is sourced from IBKR NetLiquidation logs.',
    repo: 'FinTechEntrepreneurldz/qsentia-eth-micro-futures-sentiment-alpha',
    logs_path: 'logs',
    branch: 'main',
    enabled: true,
    color: '#8b5cf6',
    starting_capital: DEFAULT_ACCOUNT_STARTING_CAPITAL,
  },
  {
    id: MODEL_C_SENTIMENT_ALPHA_MODEL_ID,
    name: 'QSentia Model C Sentiment Alpha',
    description:
      'Sector-neutral Model C equity MLP with live FinBERT news sentiment overlay and Alpaca paper execution.',
    repo: 'FinTechEntrepreneurldz/qsentia-model-c-sentiment-alpha',
    logs_path: 'logs',
    branch: 'main',
    enabled: true,
    color: '#6366f1',
  },
  {
    id: RL_ALPHA_ALLOCATOR_MODEL_ID,
    name: 'QSentia RL Alpha Allocator',
    description:
      'Offline RL meta-allocator that assigns capital across QSentia alpha sleeves and writes IBKR paper allocation tickets from account NetLiquidation.',
    repo: 'FinTechEntrepreneurldz/qsentia-rl-alpha-allocator',
    logs_path: 'logs',
    branch: 'main',
    enabled: true,
    color: '#0ea5e9',
    starting_capital: 1034017,
  },
  {
    id: MODEL_C_ORIGINAL_MODEL_ID,
    name: 'MLP Alpha 130/30 - Original Model C',
    description: 'Original Model C paper-trading model.',
    repo: 'FinTechEntrepreneurldz/Model_C_Paper_Trading',
    logs_path: 'logs',
    branch: 'main',
    enabled: true,
    color: '#a855f7',
  },
  {
    id: MODEL_C_MLP_REGIME_MOE_MODEL_ID,
    name: 'Model C - MLP Regime MoE',
    description:
      'Regime-aware mixture-of-experts MLP model similar to Model C. Uses Alpaca paper trading and canonical QSentia logs.',
    repo: 'FinTechEntrepreneurldz/model_c_etf',
    logs_path: 'logs',
    branch: 'main',
    enabled: true,
    color: '#2563eb',
  },
  {
    id: MODEL_A_ORIGINAL_MODEL_ID,
    name: 'BR-PPO V10 Original Base',
    description: 'Original BR-PPO allocation agent from Base_Model_BR_PPO. Canonical Model A paper-trading logs.',
    repo: 'FinTechEntrepreneurldz/Base_Model_BR_PPO',
    logs_path: 'logs/model_a',
    branch: 'main',
    enabled: true,
    color: '#00d4aa',
  },
  {
    id: BR_PPO_CRYPTO_V15_MODEL_ID,
    name: 'BR-PPO Crypto V15',
    description:
      'BR-PPO crypto model V15. Ensemble model using crypto, FreqAI, LLM, Ichimoku, and BIL allocation components.',
    repo: 'FinTechEntrepreneurldz/br_ppo_crypto_v15',
    logs_path: 'logs',
    branch: 'main',
    enabled: true,
    color: '#f97316',
  },
];
type CsvRow = Record<string, string>;

type ModelConfig = {
  id: string;
  name: string;
  description?: string;
  repo: string;
  logs_path: string;
  branch: string;
  enabled: boolean;
  color: string;
  starting_capital?: number;
};

type PortfolioPoint = {
  timestamp: string;
  value: number;
  raw: CsvRow;
};

type AccountHealthStatus = Record<string, unknown> | null;

type DailyPoint = {
  timestamp: string;
  value: number;
  raw?: CsvRow;
};

const ACCOUNT_VALUE_KEYS = [
  'net_liquidation',
  'net_liquidation_value',
  'netliquidation',
  'netLiquidation',
  'NetLiquidation',
  'nlv',
  'NLV',
  'portfolio_value',
  'equity',
  'account_value',
  'total_equity',
];

function normalizeGitHubToken(raw: string | undefined) {
  return String(raw || '')
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .replace(/^[A-Z0-9_]+\s*=\s*/i, '')
    .replace(/^bearer\s+/i, '')
    .replace(/^token\s+/i, '')
    .trim();
}

function rawUrl(repoFullName: string, branch: string, path: string) {
  const cleanPath = path.replace(/^\/+/, '');
  return `https://raw.githubusercontent.com/${repoFullName}/${branch}/${cleanPath}`;
}

function githubContentsUrl(repoFullName: string, branch: string, path: string) {
  const cleanPath = path
    .replace(/^\/+/, '')
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');
  return `https://api.github.com/repos/${repoFullName}/contents/${cleanPath}?ref=${encodeURIComponent(branch)}`;
}

function decodeGitHubContentJson(text: string) {
  try {
    const parsed = JSON.parse(text) as { content?: string; encoding?: string };
    if (parsed.encoding === 'base64' && typeof parsed.content === 'string') {
      return Buffer.from(parsed.content.replace(/\s/g, ''), 'base64').toString('utf8');
    }
  } catch {
    return '';
  }
  return '';
}

async function fetchTextFromRaw(repoFullName: string, branch: string, path: string) {
  if (GITHUB_READ_TOKEN) {
    const authorizationValues = [`Bearer ${GITHUB_READ_TOKEN}`, `token ${GITHUB_READ_TOKEN}`];
    const acceptValues = ['application/vnd.github.raw', 'application/vnd.github+json'];

    for (const authorization of authorizationValues) {
      for (const accept of acceptValues) {
        try {
          const response = await fetch(githubContentsUrl(repoFullName, branch, path), {
            cache: 'no-store',
            headers: {
              Accept: accept,
              Authorization: authorization,
              'Cache-Control': 'no-cache',
              'User-Agent': 'qsentia-investor-site',
              'X-GitHub-Api-Version': '2022-11-28',
            },
          });

          if (response.ok) {
            const text = await response.text();
            const decoded = decodeGitHubContentJson(text);
            return decoded || text;
          }
        } catch {
          // Try the next authenticated GitHub Contents variant.
        }
      }
    }

    for (const authorization of authorizationValues) {
      try {
        const response = await fetch(rawUrl(repoFullName, branch, path), {
          cache: 'no-store',
          headers: {
            Authorization: authorization,
            'Cache-Control': 'no-cache',
            'User-Agent': 'qsentia-investor-site',
          },
        });

        if (response.ok) {
          return response.text();
        }
      } catch {
        // Fall back to unauthenticated raw GitHub below for public repositories.
      }
    }
  }

  try {
    const response = await fetch(rawUrl(repoFullName, branch, path), {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    });

    if (!response.ok) return '';
    return response.text();
  } catch {
    return '';
  }
}

async function fetchCsvFromModel(model: ModelConfig, relativePath: string): Promise<CsvRow[]> {
  try {
    const fullPath = `${model.logs_path.replace(/\/+$/, '')}/${relativePath.replace(/^\/+/, '')}`;
    const text = await fetchTextFromRaw(model.repo, model.branch || 'main', fullPath);

    if (!text.trim()) return [];

    const parsed = Papa.parse<CsvRow>(text, {
      header: true,
      skipEmptyLines: true,
    });

    return parsed.data || [];
  } catch {
    return [];
  }
}

async function fetchCsvFromRepo(model: ModelConfig, path: string): Promise<CsvRow[]> {
  try {
    const text = await fetchTextFromRaw(model.repo, model.branch || 'main', path);

    if (!text.trim()) return [];

    const parsed = Papa.parse<CsvRow>(text, {
      header: true,
      skipEmptyLines: true,
    });

    return parsed.data || [];
  } catch {
    return [];
  }
}

async function fetchJsonFromModel<T>(model: ModelConfig, relativePath: string): Promise<T | null> {
  try {
    const fullPath = `${model.logs_path.replace(/\/+$/, '')}/${relativePath.replace(/^\/+/, '')}`;
    const text = await fetchTextFromRaw(model.repo, model.branch || 'main', fullPath);

    if (!text.trim()) return null;

    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

async function fetchJsonFromRepo<T>(model: ModelConfig, path: string): Promise<T | null> {
  try {
    const text = await fetchTextFromRaw(model.repo, model.branch || 'main', path);

    if (!text.trim()) return null;

    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

async function fetchModelsRegistry(): Promise<ModelConfig[]> {
  const text = await fetchTextFromRaw(
    `${REGISTRY_OWNER}/${REGISTRY_REPO}`,
    REGISTRY_BRANCH,
    'models.yaml'
  );

  const parsed = parseSimpleModelsYaml(text);
  const fallback = [
    {
      id: 'model_a',
      name: 'BR-PPO V10 (original)',
      description: 'Fallback model from Base_Model_BR_PPO.',
      repo: 'FinTechEntrepreneurldz/Base_Model_BR_PPO',
      logs_path: 'logs/model_a',
      branch: 'main',
      enabled: true,
      color: '#00d4aa',
    },
  ];
  const registry = parsed.length ? parsed : fallback;

  return mergeRequiredModels(registry).filter(
    (m) => m.enabled !== false && !RETIRED_MODEL_IDS.has(m.id)
  );
}

function mergeRequiredModels(models: ModelConfig[]) {
  const byId = new Map<string, ModelConfig>();

  for (const model of REQUIRED_MODELS) {
    byId.set(model.id, model);
  }

  for (const model of models) {
    const requiredModel = byId.get(model.id);
    byId.set(model.id, requiredModel ? { ...model, ...requiredModel } : model);
  }

  return Array.from(byId.values());
}

function parseSimpleModelsYaml(text: string): ModelConfig[] {
  const lines = text.split('\n');
  const models: ModelConfig[] = [];
  let current: Partial<ModelConfig> | null = null;

  function cleanValue(value: string) {
    return value
      .trim()
      .replace(/^['"]/, '')
      .replace(/['"]$/, '');
  }

  function commitCurrent() {
    if (!current?.id) return;

    models.push({
      id: current.id,
      name: current.name || current.id,
      description: current.description || '',
      repo: current.repo || `${REGISTRY_OWNER}/${REGISTRY_REPO}`,
      logs_path: current.logs_path || `logs/${current.id}`,
      branch: current.branch || 'main',
      enabled: current.enabled !== false,
      color: current.color || '#4b3fd1',
      starting_capital: current.starting_capital,
    });
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#') || line === 'models:') continue;

    if (line.startsWith('- ')) {
      commitCurrent();
      current = {};

      const rest = line.slice(2).trim();

      if (rest.includes(':')) {
        const [key, ...valueParts] = rest.split(':');
        const keyName = key.trim() as keyof ModelConfig;
        const value = cleanValue(valueParts.join(':'));
        setYamlValue(current, keyName, value);
      }

      continue;
    }

    if (current && line.includes(':')) {
      const [key, ...valueParts] = line.split(':');
      const keyName = key.trim() as keyof ModelConfig;
      const value = cleanValue(valueParts.join(':'));
      setYamlValue(current, keyName, value);
    }
  }

  commitCurrent();

  return models;
}

function setYamlValue(target: Partial<ModelConfig>, key: keyof ModelConfig, value: string) {
  if (key === 'enabled') {
    target.enabled = value.toLowerCase() !== 'false';
    return;
  }

  if (key === 'starting_capital') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      target.starting_capital = parsed;
    }
    return;
  }

  if (
    key === 'id' ||
    key === 'name' ||
    key === 'description' ||
    key === 'repo' ||
    key === 'logs_path' ||
    key === 'branch' ||
    key === 'color'
  ) {
    target[key] = value as never;
  }
}

function num(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function startingCapitalForModel(model: ModelConfig): number | null {
  if (typeof model.starting_capital === 'number' && Number.isFinite(model.starting_capital)) {
    return model.starting_capital;
  }

  if (!ACCOUNT_BASELINE_MODEL_IDS.has(model.id)) return null;
  return Number.isFinite(DEFAULT_ACCOUNT_STARTING_CAPITAL)
    ? DEFAULT_ACCOUNT_STARTING_CAPITAL
    : null;
}

function performanceValues(values: number[], baseline: number | null) {
  if (!values.length || baseline === null) return values;
  return values[0] === baseline ? values : [baseline, ...values];
}

function latest<T>(arr: T[]): T | null {
  return arr.length ? arr[arr.length - 1] : null;
}

function timestampToDateKey(timestamp: string | undefined) {
  if (!timestamp) return '';

  const clean = String(timestamp).trim();

  if (/^\d{4}-\d{2}-\d{2}/.test(clean)) {
    return clean.slice(0, 10);
  }

  const normalized = clean.replace('_', 'T');
  const date = new Date(normalized);

  if (!Number.isNaN(date.getTime())) {
    return date.toISOString().slice(0, 10);
  }

  return '';
}

function previousDateKey(dateKey: string | undefined) {
  if (!dateKey) return '';

  const date = new Date(`${dateKey}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return '';

  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

function timestampSortValue(timestamp: string | undefined) {
  if (!timestamp) return 0;

  const clean = String(timestamp).trim().replace('_', 'T');
  const date = new Date(clean);

  if (!Number.isNaN(date.getTime())) {
    return date.getTime();
  }

  const dateKey = timestampToDateKey(timestamp);
  const fallback = new Date(`${dateKey}T00:00:00Z`);

  return Number.isNaN(fallback.getTime()) ? 0 : fallback.getTime();
}

function accountValue(row: CsvRow): number | null {
  const status = String(row.account_status || row.status || '').toLowerCase();
  if (status.includes('dry_run') || status.includes('dry-run')) return null;

  const portfolioValue = num(row.portfolio_value);
  const netLiquidation =
    num(row.net_liquidation) ??
    num(row.net_liquidation_value) ??
    num(row.netliquidation) ??
    num(row.netLiquidation) ??
    num(row.NetLiquidation) ??
    num(row.nlv) ??
    num(row.NLV);
  if (netLiquidation !== null && netLiquidation <= 0 && portfolioValue !== null && portfolioValue > 0) {
    return portfolioValue;
  }

  for (const key of ACCOUNT_VALUE_KEYS) {
    const value = num(row[key]);
    if (value !== null) return value;
  }
  return null;
}

function normalizePortfolioRows(rows: CsvRow[]): PortfolioPoint[] {
  return rows
    .map((row) => {
      const value = accountValue(row);

      return {
        timestamp: row.timestamp_utc || row.timestamp || row.date || '',
        value,
        raw: row,
      };
    })
    .filter((row) => row.timestamp && row.value !== null) as PortfolioPoint[];
}

function accountValueObservations(groups: CsvRow[][]): PortfolioPoint[] {
  return groups.flatMap((rows) => normalizePortfolioRows(rows));
}

function objectToCsvRow(raw: Record<string, unknown>): CsvRow {
  return Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [key, value === null || value === undefined ? '' : String(value)])
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function healthStatusObservation(healthStatus: AccountHealthStatus): PortfolioPoint[] {
  if (!healthStatus) return [];

  const nestedAccount = isRecord(healthStatus.ibkr_account)
    ? healthStatus.ibkr_account
    : isRecord(healthStatus.account)
      ? healthStatus.account
      : null;
  const raw = objectToCsvRow({
    ...healthStatus,
    ...(nestedAccount || {}),
    account_status:
      nestedAccount?.account_status ||
      healthStatus.account_status ||
      healthStatus.overall_status ||
      'connected',
    source:
      nestedAccount?.source ||
      healthStatus.source ||
      (nestedAccount ? 'health_status_ibkr_account' : 'health_status_net_liquidation'),
  });
  const value = accountValue(raw);
  const timestamp = String(
    healthStatus.updated_at_utc ||
      healthStatus.timestamp_utc ||
      healthStatus.timestamp ||
      healthStatus.date ||
      ''
  );

  if (!timestamp || value === null) return [];

  return [
    {
      timestamp,
      value,
      raw,
    },
  ];
}

function submittedOrderCount(rows: CsvRow[]) {
  return rows.filter((row) => String(row.submitted).toLowerCase() === 'true').length;
}

function hasLivePositionRows(rows: CsvRow[]) {
  return rows.some((row) => {
    const qty = num(row.qty) ?? 0;
    const marketValue = num(row.market_value) ?? 0;
    return Math.abs(qty) > 0 || Math.abs(marketValue) > 0;
  });
}

function inferPaperStatus(positionsRows: CsvRow[], submittedOrdersRows: CsvRow[]) {
  const submitted = submittedOrderCount(submittedOrdersRows);
  const hasPositions = hasLivePositionRows(positionsRows);

  if (submitted > 0 || hasPositions) {
    return {
      isLivePaperActive: true,
      paperStatus: 'Live Paper Active',
      submittedOrderCount: submitted,
      hasLivePositions: hasPositions,
    };
  }

  return {
    isLivePaperActive: false,
    paperStatus: 'Pending',
    submittedOrderCount: submitted,
    hasLivePositions: hasPositions,
  };
}

function toDailyPortfolio(points: PortfolioPoint[]): DailyPoint[] {
  const byDate = new Map<string, DailyPoint & { sortValue: number }>();

  for (const point of points) {
    const dateKey = timestampToDateKey(point.timestamp);
    if (!dateKey) continue;

    const sortValue = timestampSortValue(point.timestamp);
    const existing = byDate.get(dateKey);

    if (!existing || sortValue >= existing.sortValue) {
      byDate.set(dateKey, {
        timestamp: dateKey,
        value: point.value,
        raw: point.raw,
        sortValue,
      });
    }
  }

  return Array.from(byDate.values())
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    .map(({ timestamp, value, raw }) => ({ timestamp, value, raw }));
}

function calculateDrawdown(values: number[]) {
  let peak = values[0] || 0;

  return values.map((value) => {
    peak = Math.max(peak, value);
    return peak ? value / peak - 1 : 0;
  });
}

function actionCounts(rows: CsvRow[]) {
  const counts: Record<string, number> = {};

  for (const row of rows) {
    const action = row.action || row.signal || row.decision || 'unknown';
    counts[action] = (counts[action] || 0) + 1;
  }

  return Object.entries(counts).map(([action, count]) => ({
    action,
    count,
  }));
}

async function fetchYahooBenchmark(ticker: string, startDate?: string) {
  try {
    const start = startDate ? new Date(`${startDate}T00:00:00Z`) : new Date('2024-01-01T00:00:00Z');
    const end = new Date();

    if (Number.isNaN(start.getTime())) return [];

    const period1 = Math.floor(start.getTime() / 1000);
    const period2 = Math.floor(end.getTime() / 1000);

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period1=${period1}&period2=${period2}&interval=1d&events=history`;

    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) return [];

    const json = await response.json();
    const result = json?.chart?.result?.[0];

    const timestamps: number[] = result?.timestamp || [];
    const closes: Array<number | null> = result?.indicators?.quote?.[0]?.close || [];

    const clean = timestamps
      .map((ts, i) => ({
        timestamp: new Date(ts * 1000).toISOString().slice(0, 10),
        close: closes[i],
      }))
      .filter((row) => row.close !== null && Number.isFinite(row.close));

    if (clean.length < 2) return [];

    const first = clean[0].close as number;

    return clean.map((row) => ({
      timestamp: row.timestamp,
      value: ((row.close as number) / first) * 100,
      close: row.close as number,
    }));
  } catch {
    return [];
  }
}

async function fetchBenchmarks(startDate?: string) {
  const results = await Promise.all(
    BENCHMARKS.map(async (benchmark) => {
      const points = await fetchYahooBenchmark(benchmark.ticker, startDate);
      const values = points.map((point) => point.value);

      return {
        ...benchmark,
        points,
        stats: computeStats(values),
        rowCount: points.length,
      };
    })
  );

  return results;
}

async function benchmarkStartDateFromFirstModel(registry: ModelConfig[]) {
  const firstModel =
    registry.find((model) => model.id === 'model_a') ||
    registry.find((model) => model.name.toLowerCase().includes('br-ppo v10')) ||
    registry[0];

  if (!firstModel) return undefined;

  const rows = await fetchCsvFromModel(firstModel, 'portfolio/portfolio.csv');
  const daily = toDailyPortfolio(normalizePortfolioRows(rows));

  return daily.length ? daily[0].timestamp : undefined;
}

function shouldUseUpstreamDashboard(request: Request) {
  if (process.env.QSENTIA_DISABLE_UPSTREAM_API_PROXY === '1') return false;
  if (process.env.QSENTIA_ENABLE_UPSTREAM_API_PROXY === '1') return true;

  const hostname = new URL(request.url).hostname.toLowerCase();
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

async function fetchUpstreamDashboard(request: Request) {
  const attempts: Array<Record<string, unknown>> = [];

  try {
    const localUrl = new URL(request.url);

    for (const baseUrl of UPSTREAM_DASHBOARD_BASE_URLS) {
      for (let attempt = 1; attempt <= 2; attempt += 1) {
        const upstreamUrl = new URL('/api/dashboard', baseUrl);
        upstreamUrl.search = localUrl.search;
        upstreamUrl.searchParams.set('_qsentiaLocalFetch', `${Date.now()}-${attempt}`);
        const startedAt = Date.now();

        try {
          const response = await fetch(upstreamUrl, {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache',
              'User-Agent': 'qsentia-investor-site-local',
            },
          });

          const baseAttempt = {
            attempt,
            durationMs: Date.now() - startedAt,
            ok: response.ok,
            source: upstreamUrl.origin,
            status: response.status,
          };

          if (!response.ok) {
            attempts.push(baseAttempt);
            continue;
          }

          const payload = await response.json();
          const diagnostics = dashboardPayloadDiagnostics(payload);
          const usable = hasUsableDashboardPayload(payload);
          attempts.push({
            ...baseAttempt,
            ...diagnostics,
            usable,
          });

          if (!usable) continue;

          const cachedAt = new Date().toISOString();
          await cacheUsableUpstreamDashboardPayload(payload as Record<string, unknown>, cachedAt);

          lastUpstreamDashboardFetchReport = {
            checkedAt: cachedAt,
            status: 'live',
            attempts,
          };

          return upstreamDashboardResponse(lastUsableUpstreamDashboardPayload, {
            dataSource: {
              mode: 'upstream-live',
              cachedAt,
              diagnostics,
              upstreamApi: upstreamUrl.origin,
            },
          });
        } catch (error) {
          attempts.push({
            attempt,
            durationMs: Date.now() - startedAt,
            error: errorMessage(error),
            source: upstreamUrl.origin,
          });
        }
      }
    }
  } catch (error) {
    attempts.push({
      error: errorMessage(error),
      source: 'upstream-dashboard',
    });
  }

  lastUpstreamDashboardFetchReport = {
    checkedAt: new Date().toISOString(),
    status: 'unusable',
    attempts,
  };

  return cachedUpstreamDashboardResponse(lastUpstreamDashboardFetchReport);
}

function upstreamDashboardResponse(
  payload: Record<string, unknown> | null,
  debugPatch: Record<string, unknown> = {}
) {
  if (!payload) return null;

  return NextResponse.json(withDashboardDebug(payload, debugPatch), {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}

async function cachedUpstreamDashboardResponse(fetchReport?: Record<string, unknown> | null) {
  const cached = await readCachedUpstreamDashboardPayload();

  if (!cached) return null;

  return upstreamDashboardResponse(cached.payload, {
    dataSource: {
      mode: 'upstream-last-good-cache',
      upstreamCache: {
        cachedAt: cached.cachedAt,
        status: 'last-good',
      },
      upstreamFetch: fetchReport || lastUpstreamDashboardFetchReport,
    },
  });
}

function withDashboardDebug(
  payload: Record<string, unknown>,
  debugPatch: Record<string, unknown>
) {
  const debug =
    typeof payload.debug === 'object' && payload.debug !== null
      ? (payload.debug as Record<string, unknown>)
      : {};

  return {
    ...payload,
    debug: {
      ...debug,
      ...debugPatch,
    },
  };
}

async function cacheUsableUpstreamDashboardPayload(
  payload: Record<string, unknown>,
  cachedAt: string
) {
  lastUsableUpstreamDashboardPayload = payload;
  lastUsableUpstreamDashboardAt = cachedAt;

  try {
    await mkdir(DASHBOARD_CACHE_DIR, { recursive: true });
    await writeFile(
      DASHBOARD_LAST_GOOD_CACHE_PATH,
      JSON.stringify({ cachedAt, payload }, null, 2),
      'utf8'
    );
  } catch {
    // The in-memory cache still keeps the current request path working.
  }
}

async function readCachedUpstreamDashboardPayload(): Promise<{
  cachedAt: string | null;
  payload: Record<string, unknown>;
} | null> {
  if (lastUsableUpstreamDashboardPayload) {
    return {
      cachedAt: lastUsableUpstreamDashboardAt,
      payload: lastUsableUpstreamDashboardPayload,
    };
  }

  try {
    const text = await readFile(DASHBOARD_LAST_GOOD_CACHE_PATH, 'utf8');
    const parsed = JSON.parse(text) as { cachedAt?: unknown; payload?: unknown };
    const payload = parsed && typeof parsed === 'object' && 'payload' in parsed ? parsed.payload : parsed;

    if (!hasUsableDashboardPayload(payload)) return null;

    lastUsableUpstreamDashboardPayload = payload as Record<string, unknown>;
    lastUsableUpstreamDashboardAt =
      typeof parsed.cachedAt === 'string' ? parsed.cachedAt : null;

    return {
      cachedAt: lastUsableUpstreamDashboardAt,
      payload: lastUsableUpstreamDashboardPayload,
    };
  } catch {
    return null;
  }
}

function hasUsableDashboardPayload(payload: unknown) {
  const diagnostics = dashboardPayloadDiagnostics(payload);

  return Boolean(
    diagnostics.hasExpectedRegistry &&
      (diagnostics.hasModelCurves || diagnostics.hasModelStats || diagnostics.hasSelectedCurve)
  );
}

function dashboardPayloadDiagnostics(payload: unknown) {
  const dashboard = payload as {
    modelComparison?: Array<{
      points?: unknown[];
      stats?: {
        totalReturn?: unknown;
        sharpe?: unknown;
      };
    }>;
    equityCurve?: unknown[];
    benchmarks?: Array<{
      points?: unknown[];
    }>;
  };
  const modelRows = Array.isArray(dashboard?.modelComparison) ? dashboard.modelComparison : [];
  const benchmarkRows = Array.isArray(dashboard?.benchmarks) ? dashboard.benchmarks : [];
  const hasExpectedRegistry = modelRows.length >= REQUIRED_MODELS.length;
  const hasModelCurves = modelRows.some((model) => Array.isArray(model.points) && model.points.length >= 2);
  const hasModelStats = modelRows.some(
    (model) =>
      typeof model.stats?.totalReturn === 'number' ||
      typeof model.stats?.sharpe === 'number'
  );
  const hasSelectedCurve = Array.isArray(dashboard?.equityCurve) && dashboard.equityCurve.length >= 2;
  const modelCurvePoints = modelRows.reduce(
    (sum, model) => sum + (Array.isArray(model.points) ? model.points.length : 0),
    0
  );
  const benchmarkCurvePoints = benchmarkRows.reduce(
    (sum, benchmark) => sum + (Array.isArray(benchmark.points) ? benchmark.points.length : 0),
    0
  );

  return {
    benchmarkCurvePoints,
    benchmarkRows: benchmarkRows.length,
    hasExpectedRegistry,
    hasModelCurves,
    hasModelStats,
    hasSelectedCurve,
    modelCurvePoints,
    modelRows: modelRows.length,
    requiredModels: REQUIRED_MODELS.length,
    selectedCurvePoints: Array.isArray(dashboard?.equityCurve) ? dashboard.equityCurve.length : 0,
  };
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown error';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const summaryOnly = searchParams.get('summary') === '1';

  if (shouldUseUpstreamDashboard(request)) {
    const upstreamDashboard = await fetchUpstreamDashboard(request);
    if (upstreamDashboard) return upstreamDashboard;
  }

  const registry = await fetchModelsRegistry();

  const requestedModel = searchParams.get('model');
  const selectedModelConfig =
    registry.find((m) => m.id === requestedModel) ||
    registry.find((m) => m.id === DEFAULT_MODEL_ID) ||
    registry[0];

  const selectedModel = selectedModelConfig.id;

  if (summaryOnly) {
    const summaryStats = {
      totalReturn: null,
      annualizedReturn: null,
      sharpe: null,
      sortino: null,
      calmar: null,
      maxDrawdown: null,
      volatility: null,
      hitRate: null,
      nObservations: 0,
      nReturns: 0,
      status: 'insufficient',
    };

    return NextResponse.json(
      {
        repo: {
          owner: REGISTRY_OWNER,
          repo: REGISTRY_REPO,
          branch: REGISTRY_BRANCH,
          rawBase: `https://raw.githubusercontent.com/${REGISTRY_OWNER}/${REGISTRY_REPO}/${REGISTRY_BRANCH}`,
        },
        selectedModel,
        selectedModelConfig,
        registry,
        latest: {
          paperStatus: null,
        },
        stats: summaryStats,
        benchmarks: BENCHMARKS.map((benchmark) => ({
          ...benchmark,
          rowCount: null,
        })),
        modelComparison: registry.map((model) => ({
          id: model.id,
          name: model.name,
          description: model.description,
          repo: model.repo,
          logsPath: model.logs_path,
          color: model.color,
          stats: { ...summaryStats },
          latestValue: model.starting_capital ?? null,
          rowCount: null,
          dailyRowCount: null,
          inceptionDate: null,
        })),
        debug: {
          summaryOnly: true,
          dataSource: {
            githubTokenPresent: Boolean(GITHUB_READ_TOKEN),
            lastGoodCachePath: '.qsentia-cache/dashboard-last-good.json',
            mode: 'local-github-fallback',
            upstreamFetch: lastUpstreamDashboardFetchReport,
            upstreamProxyEnabled: shouldUseUpstreamDashboard(request),
          },
          registryCount: registry.length,
          benchmarkCount: BENCHMARKS.length,
        },
        updatedAt: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
        },
      }
    );
  }

  const [
    portfolioRows,
    latestIbkrAccountRows,
    latestDecisionRows,
    decisionsRows,
    targetWeightsRows,
    targetWeightHistoryRows,
    positionsRows,
    plannedOrdersRows,
    plannedAllocationsRows,
    submittedOrdersPrimaryRows,
    submittedOrdersFallbackRows,
    ordersHistoryRows,
    signalHistoryRows,
    healthStatus,
    executionRealism,
    readinessChecksRows,
    benchmarkStartDate,
  ] = await Promise.all([
    fetchCsvFromModel(selectedModelConfig, 'portfolio/portfolio.csv'),
    fetchCsvFromModel(selectedModelConfig, 'portfolio/latest_ibkr_account.csv'),
    fetchCsvFromModel(selectedModelConfig, 'decisions/latest_decision.csv'),
    fetchCsvFromModel(selectedModelConfig, 'decisions/decisions.csv'),
    fetchCsvFromModel(selectedModelConfig, 'target_weights/latest_target_weights.csv'),
    fetchCsvFromModel(selectedModelConfig, 'target_weights/target_weights.csv'),
    fetchCsvFromModel(selectedModelConfig, 'positions/latest_positions.csv'),
    fetchCsvFromModel(selectedModelConfig, 'orders/latest_planned_orders.csv'),
    fetchCsvFromModel(selectedModelConfig, 'orders/latest_planned_allocations.csv'),
    fetchCsvFromModel(selectedModelConfig, 'orders/latest_submitted_orders.csv'),
    fetchCsvFromModel(selectedModelConfig, 'orders/latest_orders.csv'),
    fetchCsvFromModel(selectedModelConfig, 'orders/submitted_orders.csv'),
    fetchCsvFromModel(selectedModelConfig, 'health/signal_history.csv'),
    fetchJsonFromModel<Record<string, unknown>>(
      selectedModelConfig,
      'health/health_status.json'
    ),
    fetchJsonFromRepo<Record<string, unknown>>(
      selectedModelConfig,
      'execution_realism_gate_results/execution_realism_summary.json'
    ),
    fetchCsvFromRepo(
      selectedModelConfig,
      'execution_realism_gate_results/readiness_checks.csv'
    ),
    benchmarkStartDateFromFirstModel(registry),
  ]);

  const submittedOrdersRows = submittedOrdersPrimaryRows.length
    ? submittedOrdersPrimaryRows
    : submittedOrdersFallbackRows;
  const displayedPlannedOrdersRows = plannedOrdersRows.length ? plannedOrdersRows : plannedAllocationsRows;
  const paperStatus = inferPaperStatus(positionsRows, submittedOrdersRows);
  const healthPaperStatus =
    typeof healthStatus?.paper_status === 'string'
      ? healthStatus.paper_status
      : typeof healthStatus?.paperStatus === 'string'
        ? healthStatus.paperStatus
        : null;
  const latestPaperStatus = paperStatus.isLivePaperActive
    ? paperStatus.paperStatus
    : healthPaperStatus || paperStatus.paperStatus;
  const latestRealismStatus =
    typeof executionRealism?.paper_replay_status === 'string'
      ? executionRealism.paper_replay_status
      : null;
  const latestRunTimestamp =
    healthStatus?.updated_at_utc ||
    healthStatus?.timestamp_utc ||
    latest(latestDecisionRows)?.timestamp_utc ||
    latest(decisionsRows)?.timestamp_utc ||
    latest(latestIbkrAccountRows)?.timestamp_utc ||
    latest(portfolioRows)?.timestamp_utc ||
    null;
  const portfolio = [
    ...accountValueObservations([
      portfolioRows,
      latestIbkrAccountRows,
      latestDecisionRows,
      decisionsRows,
      signalHistoryRows,
    ]),
    ...healthStatusObservation(healthStatus),
  ];
  const dailyPortfolio = toDailyPortfolio(portfolio);
  const values = dailyPortfolio.map((p) => p.value);
  const accountBaseline = startingCapitalForModel(selectedModelConfig);
  const latestPortfolioValue = values.length ? values[values.length - 1] : accountBaseline;
  const firstPortfolioValue = accountBaseline ?? (values.length ? values[0] : null);
  const selectedPerformanceValues = performanceValues(values, accountBaseline);
  const normalizedValues = normalizeTo100(values);
  const returns = pctChange(values);
  const drawdowns = calculateDrawdown(values);
  const stats = computeStats(selectedPerformanceValues);

  const equityCurve = dailyPortfolio.map((p, i) => ({
    timestamp: p.timestamp,
    portfolio: normalizedValues[i],
    portfolioValue: p.value,
    drawdown: drawdowns[i],
    return: i === 0 ? 0 : returns[i - 1] ?? 0,
  }));

  const benchmarks = await fetchBenchmarks(benchmarkStartDate);

  const modelComparison = [];

  for (const model of registry) {
    const [
      rows,
      latestAccountRows,
      latestDecisionRowsForModel,
      decisionsRowsForModel,
      signalHistoryRowsForModel,
      modelHealthStatus,
    ] = await Promise.all([
      fetchCsvFromModel(model, 'portfolio/portfolio.csv'),
      fetchCsvFromModel(model, 'portfolio/latest_ibkr_account.csv'),
      fetchCsvFromModel(model, 'decisions/latest_decision.csv'),
      fetchCsvFromModel(model, 'decisions/decisions.csv'),
      fetchCsvFromModel(model, 'health/signal_history.csv'),
      fetchJsonFromModel<Record<string, unknown>>(
        model,
        'health/health_status.json'
      ),
    ]);
    const daily = toDailyPortfolio([
      ...accountValueObservations([
        rows,
        latestAccountRows,
        latestDecisionRowsForModel,
        decisionsRowsForModel,
        signalHistoryRowsForModel,
      ]),
      ...healthStatusObservation(modelHealthStatus),
    ]);
    const modelValues = daily.map((p) => p.value);
    const modelBaseline = startingCapitalForModel(model);
    const modelPerformanceValues = performanceValues(modelValues, modelBaseline);
    const curve = normalizeTo100(modelPerformanceValues);

    const modelInceptionDate = daily.length ? daily[0].timestamp : undefined;
    const modelBenchmarks = await fetchBenchmarks(modelInceptionDate);

    modelComparison.push({
      id: model.id,
      name: model.name,
      description: model.description,
      repo: model.repo,
      logsPath: model.logs_path,
      color: model.color,
      points: modelPerformanceValues.map((value, i) => ({
        timestamp:
          modelBaseline !== null && modelValues[0] !== modelBaseline
            ? i === 0
              ? previousDateKey(modelInceptionDate)
              : daily[i - 1]?.timestamp
            : daily[i]?.timestamp,
        value: curve[i],
      })),
      stats: computeStats(modelPerformanceValues),
      latestValue: modelValues.length ? modelValues[modelValues.length - 1] : modelBaseline,
      startingCapital: modelBaseline,
      rowCount:
        rows.length +
        latestAccountRows.length +
        latestDecisionRowsForModel.length +
        decisionsRowsForModel.length +
        signalHistoryRowsForModel.length,
      dailyRowCount: daily.length,
      inceptionDate: modelInceptionDate || null,
      benchmarks: modelBenchmarks,
    });
  }

  return NextResponse.json({
    repo: {
      owner: REGISTRY_OWNER,
      repo: REGISTRY_REPO,
      branch: REGISTRY_BRANCH,
      rawBase: `https://raw.githubusercontent.com/${REGISTRY_OWNER}/${REGISTRY_REPO}/${REGISTRY_BRANCH}`,
    },
    selectedModel,
    selectedModelConfig,
    registry,
    latest: {
        decision: latest(latestDecisionRows),
      
        // SOURCE OF TRUTH: latest broker account observation from portfolio logs or health status.
        // For new account-backed models, fall back to configured starting capital until first log lands.
        portfolioValue: latestPortfolioValue,
        portfolioValueTimestamp: dailyPortfolio.length ? dailyPortfolio[dailyPortfolio.length - 1].timestamp : null,
        portfolioValueSource: dailyPortfolio.length
          ? dailyPortfolio[dailyPortfolio.length - 1].raw?.source || 'broker_account_value'
          : accountBaseline !== null
            ? 'starting_capital_baseline'
            : null,
        firstPortfolioValue,
        startingCapital: accountBaseline,
        portfolioPnl:
          latestPortfolioValue !== null && firstPortfolioValue !== null
            ? latestPortfolioValue - firstPortfolioValue
            : null,
        portfolioReturn:
          latestPortfolioValue !== null && firstPortfolioValue !== null && firstPortfolioValue !== 0
            ? latestPortfolioValue / firstPortfolioValue - 1
            : null,
      
        // Do NOT derive P&L from positions market_value.
        pnlSource:
          accountBaseline !== null
            ? 'broker_account_value_minus_starting_capital'
            : 'portfolio_csv_net_liquidation',
        isLivePaperActive: paperStatus.isLivePaperActive,
        paperStatus: latestPaperStatus,
        submittedOrderCount: paperStatus.submittedOrderCount,
        hasLivePositions: paperStatus.hasLivePositions,
        lastRun: latestRunTimestamp,
        paperReplayStatus: latestRealismStatus,
        latestSignalDate: executionRealism?.latest_signal_date || null,
        latestSignalGrossWeight: executionRealism?.latest_signal_gross_weight ?? null,
        lastActiveSignalDate: executionRealism?.last_active_signal_date || null,
        realismWarningCount: executionRealism?.warning_count ?? null,
        realismHardFail: executionRealism?.hard_fail ?? null,
          },
    stats,
    equityCurve,
    benchmarks,
    returns: returns.map((r, i) => ({
      timestamp: dailyPortfolio[i + 1]?.timestamp,
      return: r,
    })),
    drawdowns: equityCurve.map((p) => ({
      timestamp: p.timestamp,
      drawdown: p.drawdown,
    })),
    modelComparison,
    decisions: decisionsRows,
    actionCounts: actionCounts(decisionsRows),
    targetWeights: targetWeightsRows,
    targetWeightHistory: targetWeightHistoryRows,
    positions: positionsRows,
    plannedOrders: displayedPlannedOrdersRows,
    submittedOrders: submittedOrdersRows,
    ordersHistory: ordersHistoryRows,
    signalHistory: signalHistoryRows,
    healthStatus,
    executionRealism,
    readinessChecks: readinessChecksRows,
    debug: {
      requestedModel,
      selectedModel,
      privateGitHubTokenConfigured: Boolean(GITHUB_READ_TOKEN),
      privateGitHubTokenEnvName: GITHUB_READ_TOKEN_ENV_NAME,
      benchmarkStartDate,
      dataSource: {
        benchmarkCurvePoints: benchmarks.reduce(
          (sum, benchmark) => sum + (Array.isArray(benchmark.points) ? benchmark.points.length : 0),
          0
        ),
        githubTokenPresent: Boolean(GITHUB_READ_TOKEN),
        lastGoodCachePath: '.qsentia-cache/dashboard-last-good.json',
        mode: 'local-github-fallback',
        modelCurvePoints: modelComparison.reduce(
          (sum, model) => sum + (Array.isArray(model.points) ? model.points.length : 0),
          0
        ),
        upstreamFetch: lastUpstreamDashboardFetchReport,
        upstreamProxyEnabled: shouldUseUpstreamDashboard(request),
      },
      registryCount: registry.length,
      registry: registry.map((m) => ({
        id: m.id,
        name: m.name,
        repo: m.repo,
        logs_path: m.logs_path,
        branch: m.branch,
        enabled: m.enabled,
        startingCapital: m.starting_capital ?? null,
        paperStatus
      })),
      selectedModelConfig,
        rowCounts: {
          portfolioRows: portfolioRows.length,
          latestIbkrAccountRows: latestIbkrAccountRows.length,
          healthStatusRows: healthStatus ? 1 : 0,
          dailyPortfolioRows: dailyPortfolio.length,
        latestDecisionRows: latestDecisionRows.length,
        decisionsRows: decisionsRows.length,
        targetWeightsRows: targetWeightsRows.length,
        targetWeightHistoryRows: targetWeightHistoryRows.length,
        positionsRows: positionsRows.length,
        plannedOrdersRows: displayedPlannedOrdersRows.length,
        plannedAllocationsRows: plannedAllocationsRows.length,
        submittedOrdersRows: submittedOrdersRows.length,
        ordersHistoryRows: ordersHistoryRows.length,
        signalHistoryRows: signalHistoryRows.length,
        readinessChecksRows: readinessChecksRows.length,
      },
      modelComparisonRows: modelComparison.map((m) => ({
        id: m.id,
        rowCount: m.rowCount,
        dailyRowCount: m.dailyRowCount,
        inceptionDate: m.inceptionDate,
        repo: m.repo,
        logsPath: m.logsPath,
      })),
      benchmarkRows: benchmarks.map((b) => ({
        name: b.name,
        ticker: b.ticker,
        rowCount: b.rowCount,
      })),
    },
    updatedAt: new Date().toISOString(),
  });
}
