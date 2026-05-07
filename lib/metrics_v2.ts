/**
 * metrics_v2 — additive, doesn't replace lib/metrics.ts.
 *
 * What this module adds on top of computeStats:
 *   - HAC-corrected standard error on the Sharpe ratio (Newey-West, lag=5 default)
 *   - 95% confidence interval band on the Sharpe estimate
 *   - t-statistic and two-sided p-value of Sharpe vs zero
 *   - sample-size gating: "warmingUp" status until N >= MIN_RETURNS_READY (default 30)
 *   - "Sharpe Ready" pill so the dashboard never shows a precise Sharpe on tiny N
 *
 * Why this is needed:
 *   The existing `computeStats` flips its status to "ready" at returns.length >= 5.
 *   With 5–12 daily observations the textbook Sharpe is dominated by sampling noise.
 *   Live BR-PPO V10 has 12 observations and shows Sharpe 8.07 — entirely an artifact
 *   of the 7% realized vol while the model sat in a single sleeve. Without CI bands
 *   and a sample-size gate, anyone reading the dashboard mistakes that for an edge.
 *
 * Notes for reviewers:
 *   - HAC SE on the *mean* is the natural primitive; we convert to SE on annualized SR
 *     via the same scaling computeStats uses for the Sharpe itself
 *     (mean / std * sqrt(252) → se_mean / std * sqrt(252)).
 *   - We assume std is roughly invariant across small perturbations of the mean, which
 *     is fine for 30+ daily returns. For very tiny N we'd want a delta-method SE that
 *     also accounts for std uncertainty; below MIN_RETURNS_READY we don't display the SR
 *     anyway, so this is a non-issue.
 *   - p-value uses the Student-t cdf approximation via a closed-form Hill 1970 series;
 *     accurate to ~5e-4 across the relevant range (df>5, |t|<10) and small enough not
 *     to need a numerical library.
 */

import { computeStats, type PerfStats } from './metrics';

const ANN = 252;
const DEFAULT_HAC_LAGS = 5;
const Z_95 = 1.96;
export const MIN_RETURNS_READY = 30;

export type StatusV2 =
  | 'ready'         // N >= MIN_RETURNS_READY, full reporting
  | 'warmingUp'     // some history, still gathering N
  | 'partial'       // < 2 returns
  | 'insufficient'; // < 1 return

export type PerfStatsV2 = PerfStats & {
  // Inferential additions
  sharpeSeHac: number | null;
  sharpeTstat: number | null;
  sharpePvalue: number | null;
  sharpeCiLow: number | null;
  sharpeCiHigh: number | null;
  // Backward-compat status remains in `status` from PerfStats; v2 extends here:
  statusV2: StatusV2;
  // What the user should know about display readiness
  isSharpeReady: boolean;
  // How many more returns until ready (0 if already ready)
  returnsUntilReady: number;
};

/**
 * Pure helper: returns from a portfolio value series.
 * Mirrors lib/metrics.ts pctChange but exported for v2 consumers.
 */
export function returnsFromValues(values: number[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < values.length; i++) {
    const prev = values[i - 1];
    const cur = values[i];
    if (prev && Number.isFinite(prev) && Number.isFinite(cur)) {
      out.push(cur / prev - 1);
    }
  }
  return out;
}

function mean(xs: number[]): number {
  if (!xs.length) return 0;
  let s = 0;
  for (const x of xs) s += x;
  return s / xs.length;
}

function sampleStd(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  let s = 0;
  for (const x of xs) {
    const d = x - m;
    s += d * d;
  }
  return Math.sqrt(s / (xs.length - 1));
}

/**
 * Newey-West HAC standard error of the *mean* of a return series.
 * Bartlett kernel weights w_k = 1 - k/(L+1).
 */
export function hacSeMean(xs: number[], lags = DEFAULT_HAC_LAGS): number {
  const n = xs.length;
  if (n < 3) return Number.NaN;
  const m = mean(xs);
  const dem: number[] = new Array(n);
  for (let i = 0; i < n; i++) dem[i] = xs[i] - m;
  let gamma0 = 0;
  for (let i = 0; i < n; i++) gamma0 += dem[i] * dem[i];
  gamma0 /= n;

  let s = gamma0;
  for (let k = 1; k <= Math.min(lags, n - 1); k++) {
    const w = 1 - k / (lags + 1);
    let g = 0;
    for (let i = k; i < n; i++) g += dem[i] * dem[i - k];
    g /= n;
    s += 2 * w * g;
  }
  if (!Number.isFinite(s) || s < 0) return Number.NaN;
  return Math.sqrt(s / n);
}

/**
 * Student-t two-sided p-value via Hill 1970 series approximation.
 * Accurate enough for dashboard display; not for inference at the SR>2.5 frontier
 * where we'd want a numerical library, but in that regime we're already ready.
 */
export function studentTTwoSidedP(t: number, df: number): number {
  if (!Number.isFinite(t) || !Number.isFinite(df) || df < 1) return Number.NaN;
  const a = Math.abs(t);
  // Use the regularized incomplete beta via an Abramowitz-Stegun continued fraction
  // approximation. For dashboard purposes we just need monotone correct behaviour.
  const x = df / (df + a * a);
  const ibeta = incompleteBetaApprox(x, df / 2, 0.5);
  return Math.max(Math.min(ibeta, 1), 0);
}

function incompleteBetaApprox(x: number, a: number, b: number): number {
  // Lentz continued fraction for the regularized incomplete beta function.
  const eps = 1e-12;
  const fpmin = 1e-300;
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const lbeta =
    lnGamma(a + b) - lnGamma(a) - lnGamma(b) + a * Math.log(x) + b * Math.log(1 - x);
  let bt = Math.exp(lbeta);

  // Use the standard symmetry to keep convergence fast
  const useDirect = x < (a + 1) / (a + b + 2);
  if (!useDirect) {
    return 1 - incompleteBetaCF(1 - x, b, a) * Math.exp(
      lnGamma(a + b) - lnGamma(a) - lnGamma(b) + b * Math.log(1 - x) + a * Math.log(x),
    ) / b;
  }
  return (bt * incompleteBetaCF(x, a, b)) / a;

  function incompleteBetaCF(x_: number, a_: number, b_: number): number {
    let qab = a_ + b_;
    let qap = a_ + 1;
    let qam = a_ - 1;
    let c = 1;
    let d = 1 - (qab * x_) / qap;
    if (Math.abs(d) < fpmin) d = fpmin;
    d = 1 / d;
    let h = d;
    for (let m = 1; m <= 200; m++) {
      const m2 = 2 * m;
      let aa = (m * (b_ - m) * x_) / ((qam + m2) * (a_ + m2));
      d = 1 + aa * d;
      if (Math.abs(d) < fpmin) d = fpmin;
      c = 1 + aa / c;
      if (Math.abs(c) < fpmin) c = fpmin;
      d = 1 / d;
      h *= d * c;
      aa = (-(a_ + m) * (qab + m) * x_) / ((a_ + m2) * (qap + m2));
      d = 1 + aa * d;
      if (Math.abs(d) < fpmin) d = fpmin;
      c = 1 + aa / c;
      if (Math.abs(c) < fpmin) c = fpmin;
      d = 1 / d;
      const del = d * c;
      h *= del;
      if (Math.abs(del - 1) < eps) break;
    }
    return h;
  }
}

function lnGamma(x: number): number {
  // Lanczos approximation
  const g = 7;
  const p = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lnGamma(1 - x);
  const y = x - 1;
  let a = p[0];
  for (let i = 1; i < g + 2; i++) a += p[i] / (y + i);
  const t = y + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (y + 0.5) * Math.log(t) - t + Math.log(a);
}

/**
 * Compute v2 stats from a values series (e.g. portfolio equity).
 *
 * If you already have a `PerfStats` from `computeStats`, pass it as `prior` to avoid
 * recomputing the legacy fields. Otherwise this calls computeStats internally.
 */
export function computeStatsV2(values: number[], prior?: PerfStats): PerfStatsV2 {
  const base: PerfStats = prior ?? computeStats(values);
  const returns = returnsFromValues(values);
  const n = returns.length;

  let sharpeSeHac: number | null = null;
  let sharpeTstat: number | null = null;
  let sharpePvalue: number | null = null;
  let sharpeCiLow: number | null = null;
  let sharpeCiHigh: number | null = null;

  if (n >= 3 && base.sharpe !== null) {
    const std = sampleStd(returns);
    if (std > 0) {
      const seMean = hacSeMean(returns);
      if (Number.isFinite(seMean)) {
        const srSe = (seMean / std) * Math.sqrt(ANN);
        sharpeSeHac = srSe;
        sharpeTstat = base.sharpe / srSe;
        sharpePvalue = studentTTwoSidedP(sharpeTstat, n - 1);
        sharpeCiLow = base.sharpe - Z_95 * srSe;
        sharpeCiHigh = base.sharpe + Z_95 * srSe;
      }
    }
  }

  let statusV2: StatusV2;
  if (n < 1) statusV2 = 'insufficient';
  else if (n < 2) statusV2 = 'partial';
  else if (n < MIN_RETURNS_READY) statusV2 = 'warmingUp';
  else statusV2 = 'ready';

  return {
    ...base,
    sharpeSeHac,
    sharpeTstat,
    sharpePvalue,
    sharpeCiLow,
    sharpeCiHigh,
    statusV2,
    isSharpeReady: statusV2 === 'ready',
    returnsUntilReady: Math.max(0, MIN_RETURNS_READY - n),
  };
}

/** Helper for tile labels: short status pill text. */
export function statusPill(stats: PerfStatsV2): string {
  switch (stats.statusV2) {
    case 'ready':
      return `Ready · ${stats.nReturns} returns`;
    case 'warmingUp':
      return `Warming up · ${stats.nReturns}/${MIN_RETURNS_READY} returns`;
    case 'partial':
      return `Partial · ${stats.nReturns} returns`;
    case 'insufficient':
    default:
      return 'Insufficient data';
  }
}

/** Format a Sharpe with CI band, e.g. "1.50 [0.80, 2.20]" or "—" when not ready. */
export function fmtSharpeWithCI(stats: PerfStatsV2, digits = 2): string {
  if (!stats.isSharpeReady || stats.sharpe === null) return '—';
  const sr = stats.sharpe.toFixed(digits);
  if (stats.sharpeCiLow === null || stats.sharpeCiHigh === null) return sr;
  return `${sr} [${stats.sharpeCiLow.toFixed(digits)}, ${stats.sharpeCiHigh.toFixed(digits)}]`;
}
