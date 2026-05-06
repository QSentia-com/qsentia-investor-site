import { NextResponse } from 'next/server';
import { computeStats, normalizeTo100, pctChange } from '@/lib/metrics';
import Papa from 'papaparse';

export const dynamic = 'force-dynamic';

const REGISTRY_OWNER = process.env.NEXT_PUBLIC_QSENTIA_REPO_OWNER || 'FinTechEntrepreneurldz';
const REGISTRY_REPO = process.env.NEXT_PUBLIC_QSENTIA_REPO_NAME || 'Base_Model_BR_PPO';
const REGISTRY_BRANCH = process.env.NEXT_PUBLIC_QSENTIA_BRANCH || 'main';

const BENCHMARKS = [
  { name: 'S&P 500', ticker: 'SPY', color: '#111111' },
  { name: 'Nasdaq 100', ticker: 'QQQ', color: '#7c3aed' },
  { name: 'Dow Jones', ticker: 'DIA', color: '#737373' },
  { name: 'Russell 2000', ticker: 'IWM', color: '#b45309' },
  { name: 'Total US Market', ticker: 'VTI', color: '#0f766e' },
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
};

function rawUrl(repoFullName: string, branch: string, path: string) {
  const cleanPath = path.replace(/^\/+/, '');
  return `https://raw.githubusercontent.com/${repoFullName}/${branch}/${cleanPath}`;
}

async function fetchTextFromRaw(repoFullName: string, branch: string, path: string) {
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

async function fetchModelsRegistry(): Promise<ModelConfig[]> {
  const text = await fetchTextFromRaw(
    `${REGISTRY_OWNER}/${REGISTRY_REPO}`,
    REGISTRY_BRANCH,
    'models.yaml'
  );

  const parsed = parseSimpleModelsYaml(text);

  return parsed.length
    ? parsed.filter((m) => m.enabled !== false)
    : [
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

function latest<T>(arr: T[]): T | null {
  return arr.length ? arr[arr.length - 1] : null;
}

function normalizePortfolioRows(rows: CsvRow[]) {
  return rows
    .map((row) => {
      const value =
        num(row.portfolio_value) ??
        num(row.equity) ??
        num(row.account_value) ??
        num(row.total_equity);

      return {
        timestamp: row.timestamp_utc || row.timestamp || row.date || '',
        value,
        raw: row,
      };
    })
    .filter((row) => row.timestamp && row.value !== null) as {
      timestamp: string;
      value: number;
      raw: CsvRow;
    }[];
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
    const start = startDate ? new Date(startDate) : new Date('2024-01-01');
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
        timestamp: new Date(ts * 1000).toISOString(),
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const registry = await fetchModelsRegistry();

  const requestedModel = searchParams.get('model');
  const selectedModelConfig =
    registry.find((m) => m.id === requestedModel) || registry[0];

  const selectedModel = selectedModelConfig.id;

  const [
    portfolioRows,
    latestDecisionRows,
    decisionsRows,
    targetWeightsRows,
    targetWeightHistoryRows,
    positionsRows,
    plannedOrdersRows,
    submittedOrdersRows,
    ordersHistoryRows,
    signalHistoryRows,
    healthStatus,
  ] = await Promise.all([
    fetchCsvFromModel(selectedModelConfig, 'portfolio/portfolio.csv'),
    fetchCsvFromModel(selectedModelConfig, 'decisions/latest_decision.csv'),
    fetchCsvFromModel(selectedModelConfig, 'decisions/decisions.csv'),
    fetchCsvFromModel(selectedModelConfig, 'target_weights/latest_target_weights.csv'),
    fetchCsvFromModel(selectedModelConfig, 'target_weights/target_weights.csv'),
    fetchCsvFromModel(selectedModelConfig, 'positions/latest_positions.csv'),
    fetchCsvFromModel(selectedModelConfig, 'orders/latest_planned_orders.csv'),
    fetchCsvFromModel(selectedModelConfig, 'orders/latest_submitted_orders.csv'),
    fetchCsvFromModel(selectedModelConfig, 'orders/submitted_orders.csv'),
    fetchCsvFromModel(selectedModelConfig, 'health/signal_history.csv'),
    fetchJsonFromModel<Record<string, unknown>>(
      selectedModelConfig,
      'health/health_status.json'
    ),
  ]);

  const portfolio = normalizePortfolioRows(portfolioRows);
  const values = portfolio.map((p) => p.value);
  const normalizedValues = normalizeTo100(values);
  const returns = pctChange(values);
  const drawdowns = calculateDrawdown(values);
  const stats = computeStats(values);

  const equityCurve = portfolio.map((p, i) => ({
    timestamp: p.timestamp,
    portfolio: normalizedValues[i],
    portfolioValue: p.value,
    drawdown: drawdowns[i],
    return: i === 0 ? 0 : returns[i - 1] ?? 0,
  }));
  
  const modelAConfig = registry.find((m) => m.id === 'model_a') || registry[0];

  const modelAPortfolioRows = await fetchCsvFromModel(modelAConfig, 'portfolio/portfolio.csv');
  const modelAPortfolio = normalizePortfolioRows(modelAPortfolioRows);
  
  const benchmarkStartDate =
    modelAPortfolio.length > 0
      ? modelAPortfolio[0].timestamp.slice(0, 10)
      : portfolio.length > 0
        ? portfolio[0].timestamp.slice(0, 10)
        : undefined;
  
  const benchmarks = await fetchBenchmarks(benchmarkStartDate);

  const modelComparison = [];

  for (const model of registry) {
    const rows = await fetchCsvFromModel(model, 'portfolio/portfolio.csv');
    const normalized = normalizePortfolioRows(rows);
    const modelValues = normalized.map((p) => p.value);
    const curve = normalizeTo100(modelValues);

    modelComparison.push({
      id: model.id,
      name: model.name,
      description: model.description,
      repo: model.repo,
      logsPath: model.logs_path,
      color: model.color,
      points: normalized.map((p, i) => ({
        timestamp: p.timestamp,
        value: curve[i],
      })),
      stats: computeStats(modelValues),
      latestValue: modelValues.length ? modelValues[modelValues.length - 1] : null,
      rowCount: rows.length,
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
      portfolioValue: values.length ? values[values.length - 1] : null,
      firstPortfolioValue: values.length ? values[0] : null,
      lastRun:
        latest(latestDecisionRows)?.timestamp_utc ||
        latest(portfolioRows)?.timestamp_utc ||
        latest(decisionsRows)?.timestamp_utc ||
        null,
    },
    stats,
    equityCurve,
    benchmarks,
    returns: returns.map((r, i) => ({
      timestamp: portfolio[i + 1]?.timestamp,
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
    plannedOrders: plannedOrdersRows,
    submittedOrders: submittedOrdersRows,
    ordersHistory: ordersHistoryRows,
    signalHistory: signalHistoryRows,
    healthStatus,
    debug: {
      requestedModel,
      selectedModel,
      registryCount: registry.length,
      registry: registry.map((m) => ({
        id: m.id,
        name: m.name,
        repo: m.repo,
        logs_path: m.logs_path,
        branch: m.branch,
        enabled: m.enabled,
      })),
      selectedModelConfig,
      rowCounts: {
        portfolioRows: portfolioRows.length,
        latestDecisionRows: latestDecisionRows.length,
        decisionsRows: decisionsRows.length,
        targetWeightsRows: targetWeightsRows.length,
        targetWeightHistoryRows: targetWeightHistoryRows.length,
        positionsRows: positionsRows.length,
        plannedOrdersRows: plannedOrdersRows.length,
        submittedOrdersRows: submittedOrdersRows.length,
        ordersHistoryRows: ordersHistoryRows.length,
        signalHistoryRows: signalHistoryRows.length,
      },
      modelComparisonRows: modelComparison.map((m) => ({
        id: m.id,
        rowCount: m.rowCount,
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
