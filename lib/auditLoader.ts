/**
 * auditLoader — fetch backtest audit JSONs from per-repo locations and normalize.
 *
 * Why: every paper-trading repo carries some form of backtest evidence
 * (PSR, DSR, PBO, test/validation/full Sharpe), but the dashboard never reads them.
 * It only displays the noisy live paper Sharpe over 6–12 observations. This module
 * loads whatever audit-like JSON each repo publishes and normalizes the fields
 * the dashboard cares about.
 *
 * Audit JSON locations are heterogeneous across repos:
 *   - alpha_long_top10:   PRODUCTION_AUDIT_SUMMARY.json (root) + artifacts/eval_report.json
 *   - Base_Model_BR_PPO:  artifacts/model_a/metadata.json (V10 metadata; sparse)
 *   - Model_B/C/D:        artifacts/mlp.joblib only (no JSON sidecar yet)
 *   - Model_E:            artifacts/manifest.json (sparse)
 *   - v10-trader:         artifacts/manifest.json (sparse)
 *
 * For repos without rich audits we return whatever we can extract; the caller
 * should treat any field as optional.
 */

const RAW_BASE = 'https://raw.githubusercontent.com';

export type ModelLike = {
  id: string;
  repo: string;          // "owner/name"
  branch: string;        // usually "main"
  logs_path: string;     // logs path inside the repo (used to derive default model_id)
};

/**
 * Normalized audit shape exposed to UI. All fields optional — different repos
 * publish different subsets.
 */
export type ModelAudit = {
  modelId: string;
  source: 'production_audit' | 'eval_report' | 'metadata' | 'manifest' | null;
  sourcePath: string | null;

  // Headline backtest metrics
  testSharpe?: number | null;
  testTstat?: number | null;
  testNDays?: number | null;
  testMaxDd?: number | null;
  testAnnReturn?: number | null;

  validationSharpe?: number | null;
  validationNDays?: number | null;
  validationMaxDd?: number | null;
  validationAnnReturn?: number | null;

  fullSharpe?: number | null;
  fullNDays?: number | null;
  fullMaxDd?: number | null;
  fullAnnReturn?: number | null;

  // Selection-bias metrics
  testPsr?: number | null;
  testDsr?: number | null;
  fullPsr?: number | null;
  fullDsr?: number | null;
  pbo?: number | null;

  // Notes that should be surfaced verbatim if present
  notes?: string[];

  // Did the model beat the benchmark suite at backtest time?
  beatsAllEquitySharpe?: boolean | null;
  beatsAllEquityReturn?: boolean | null;
};

function rawUrl(repo: string, branch: string, path: string): string {
  return `${RAW_BASE}/${repo}/${branch}/${path.replace(/^\/+/, '')}`;
}

async function fetchJson<T = unknown>(repo: string, branch: string, path: string): Promise<T | null> {
  try {
    const res = await fetch(rawUrl(repo, branch, path), {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function num(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function bool(v: unknown): boolean | null {
  if (typeof v === 'boolean') return v;
  return null;
}

/**
 * Try the known audit JSON locations for a model in priority order.
 * Returns the first one that loads, normalized.
 */
export async function loadModelAudit(model: ModelLike): Promise<ModelAudit> {
  const audit: ModelAudit = {
    modelId: model.id,
    source: null,
    sourcePath: null,
  };

  // 1. Top-of-repo PRODUCTION_AUDIT_SUMMARY.json (alpha_long_top10 pattern)
  {
    const path = 'PRODUCTION_AUDIT_SUMMARY.json';
    const data = await fetchJson<Record<string, unknown>>(model.repo, model.branch, path);
    if (data) {
      const test = (data.test_metrics as Record<string, unknown>) || {};
      const val = (data.validation_metrics as Record<string, unknown>) || {};
      const full = (data.full_metrics as Record<string, unknown>) || {};
      Object.assign(audit, {
        source: 'production_audit',
        sourcePath: path,
        testSharpe: num(test.sharpe),
        testTstat: num(test.tstat),
        testNDays: num(test.n_days),
        testMaxDd: num(test.max_dd),
        testAnnReturn: num(test.ann_return),
        testPsr: num(test.psr),
        testDsr: num(test.dsr),
        validationSharpe: num(val.sharpe),
        validationNDays: num(val.n_days),
        validationMaxDd: num(val.max_dd),
        validationAnnReturn: num(val.ann_return),
        fullSharpe: num(full.sharpe),
        fullNDays: num(full.n_days),
        fullMaxDd: num(full.max_dd),
        fullAnnReturn: num(full.ann_return),
        fullPsr: num(full.psr),
        fullDsr: num(full.dsr),
        pbo: num(data.pbo),
        notes: Array.isArray(data.notes) ? (data.notes as string[]) : [],
      });
      return audit;
    }
  }

  // 2. artifacts/eval_report.json (richer per-strategy view inside alpha_long_top10)
  {
    const path = 'artifacts/eval_report.json';
    const data = await fetchJson<Record<string, unknown>>(model.repo, model.branch, path);
    if (data && data.selected_strategy) {
      // We only care about the selected strategy's per-period metrics.
      const sel = data.selected_strategy as string;
      const perStrategy =
        (data.per_strategy_per_period as Record<string, Record<string, Record<string, unknown>>>) ||
        {};
      const selPerf = perStrategy[sel] || {};
      const test = selPerf.Test || {};
      const val = selPerf.Validation || {};
      const full = selPerf.Full || {};
      Object.assign(audit, {
        source: 'eval_report',
        sourcePath: path,
        testSharpe: num(test.sharpe),
        testTstat: num(test.tstat),
        testNDays: num(test.n_days),
        testMaxDd: num(test.max_dd),
        testAnnReturn: num(test.ann_return),
        testPsr: num(test.psr),
        testDsr: num(test.dsr),
        validationSharpe: num(val.sharpe),
        validationNDays: num(val.n_days),
        validationMaxDd: num(val.max_dd),
        validationAnnReturn: num(val.ann_return),
        fullSharpe: num(full.sharpe),
        fullNDays: num(full.n_days),
        fullMaxDd: num(full.max_dd),
        fullAnnReturn: num(full.ann_return),
        fullPsr: num(full.psr),
        fullDsr: num(full.dsr),
        pbo: num(data.pbo),
      });
      return audit;
    }
  }

  // 3. Per-model metadata.json (Base_Model_BR_PPO/artifacts/<id>/metadata.json)
  {
    const path = `artifacts/${model.id}/metadata.json`;
    const data = await fetchJson<Record<string, unknown>>(model.repo, model.branch, path);
    if (data) {
      Object.assign(audit, {
        source: 'metadata',
        sourcePath: path,
        beatsAllEquitySharpe: bool(data.beats_all_equity_sharpe),
        beatsAllEquityReturn: bool(data.beats_all_equity_return),
      });
      return audit;
    }
  }

  // 4. artifacts/metadata.json (alpha_long_top10 also writes this; flat schema)
  {
    const path = 'artifacts/metadata.json';
    const data = await fetchJson<Record<string, unknown>>(model.repo, model.branch, path);
    if (data) {
      Object.assign(audit, {
        source: 'metadata',
        sourcePath: path,
        beatsAllEquitySharpe: bool(data.beats_all_equity_sharpe),
        beatsAllEquityReturn: bool(data.beats_all_equity_return),
      });
      return audit;
    }
  }

  // 5. artifacts/manifest.json (Model_E + v10-trader; sparse, just shape)
  {
    const path = 'artifacts/manifest.json';
    const data = await fetchJson<Record<string, unknown>>(model.repo, model.branch, path);
    if (data) {
      Object.assign(audit, {
        source: 'manifest',
        sourcePath: path,
        // manifest only carries shape; no perf fields
      });
      return audit;
    }
  }

  return audit;
}

/** Parallel-load audits for a list of models. */
export async function loadAudits(models: ModelLike[]): Promise<Record<string, ModelAudit>> {
  const out: Record<string, ModelAudit> = {};
  const results = await Promise.all(models.map((m) => loadModelAudit(m)));
  models.forEach((m, i) => {
    out[m.id] = results[i];
  });
  return out;
}

/** UI helper: short label describing whether a model has audit evidence. */
export function auditCoverageLabel(audit: ModelAudit): string {
  if (audit.source === 'production_audit' || audit.source === 'eval_report') {
    if (audit.pbo !== null && audit.pbo !== undefined) return 'Full audit · PBO available';
    return 'Full audit';
  }
  if (audit.source === 'metadata') return 'Partial audit · backtest summary only';
  if (audit.source === 'manifest') return 'Manifest only · no audit JSON yet';
  return 'No audit JSON found';
}

/** UI helper: pill class for PBO. < 0.5 = green, [0.5, 0.7) = amber, >= 0.7 = red. */
export function pboBadge(audit: ModelAudit): { label: string; tone: 'green' | 'amber' | 'red' | 'gray' } {
  if (audit.pbo === null || audit.pbo === undefined) return { label: 'PBO n/a', tone: 'gray' };
  const v = audit.pbo;
  const pct = (v * 100).toFixed(0);
  if (v < 0.5) return { label: `PBO ${pct}%`, tone: 'green' };
  if (v < 0.7) return { label: `PBO ${pct}% — caution`, tone: 'amber' };
  return { label: `PBO ${pct}% — overfit risk`, tone: 'red' };
}
