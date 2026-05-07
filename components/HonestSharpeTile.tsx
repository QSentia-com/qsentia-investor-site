/**
 * HonestSharpeTile — additive Sharpe display with CI band, sample-size pill,
 * and optional audit-derived DSR/PBO badges.
 *
 * Drop-in replacement for the existing Sharpe MetricTile in app/dashboard/page.tsx.
 * Doesn't break anything: if metrics_v2 is unavailable or the sample is too small,
 * it falls back to "—" with a "warming up" pill rather than displaying a misleading
 * point estimate.
 *
 * Usage:
 *
 *   import { HonestSharpeTile } from '@/components/HonestSharpeTile';
 *   import type { ModelAudit } from '@/lib/auditLoader';
 *
 *   <HonestSharpeTile
 *     values={portfolioValues}     // number[] of equity observations
 *     audit={modelAudit}           // optional ModelAudit, null OK
 *   />
 */
'use client';

import { computeStatsV2, fmtSharpeWithCI, MIN_RETURNS_READY, statusPill } from '@/lib/metrics_v2';

// Re-exposed for the explainer copy below.
const MIN_RETURNS_READY_DISPLAY = MIN_RETURNS_READY;
import type { ModelAudit } from '@/lib/auditLoader';
import { pboBadge, auditCoverageLabel } from '@/lib/auditLoader';

type Tone = 'green' | 'amber' | 'red' | 'gray';

const TONE_CLASSES: Record<Tone, string> = {
  green: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200',
  amber: 'bg-amber-100 text-amber-800 ring-1 ring-amber-200',
  red: 'bg-rose-100 text-rose-800 ring-1 ring-rose-200',
  gray: 'bg-neutral-100 text-neutral-700 ring-1 ring-neutral-200',
};

export function HonestSharpeTile({
  values,
  audit,
}: {
  values: number[];
  audit?: ModelAudit | null;
}) {
  const stats = computeStatsV2(values);
  const sharpeLabel = fmtSharpeWithCI(stats);
  const pill = statusPill(stats);

  // Backtest evidence row: surface DSR/PBO from the audit when we have it
  const audited = audit && (audit.source === 'production_audit' || audit.source === 'eval_report');
  const pbo = audit ? pboBadge(audit) : null;

  return (
    <div className="rounded-3xl border border-[#4b3fd1]/20 bg-white/80 p-6 shadow-[0_24px_80px_rgba(25,20,90,0.08)] backdrop-blur-xl">
      <div className="text-[11px] font-black uppercase tracking-[0.24em] text-[#4b3fd1]">
        Sharpe (live, CI-corrected)
      </div>

      <div className="mt-3 flex items-baseline gap-3">
        <div className="text-5xl font-light tracking-[-0.04em] text-black">
          {stats.isSharpeReady ? stats.sharpe!.toFixed(2) : '—'}
        </div>
        {stats.isSharpeReady && stats.sharpeCiLow !== null && stats.sharpeCiHigh !== null && (
          <div className="text-sm text-neutral-600">
            95% CI [{stats.sharpeCiLow.toFixed(2)}, {stats.sharpeCiHigh.toFixed(2)}]
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Pill tone={stats.statusV2 === 'ready' ? 'green' : 'amber'} text={pill} />
        {stats.isSharpeReady && stats.sharpeTstat !== null && (
          <Pill
            tone={Math.abs(stats.sharpeTstat) >= 1.96 ? 'green' : 'amber'}
            text={`t = ${stats.sharpeTstat.toFixed(2)}`}
          />
        )}
        {stats.isSharpeReady && stats.sharpePvalue !== null && (
          <Pill
            tone={stats.sharpePvalue < 0.05 ? 'green' : 'amber'}
            text={`p = ${stats.sharpePvalue < 0.001 ? '< 0.001' : stats.sharpePvalue.toFixed(3)}`}
          />
        )}
      </div>

      {!stats.isSharpeReady && (
        <p className="mt-4 text-xs leading-5 text-neutral-600">
          Live Sharpe is held back until{' '}
          <span className="font-semibold">{stats.returnsUntilReady} more</span> daily
          returns come in. With fewer than {MIN_RETURNS_READY_DISPLAY} observations the
          number is dominated by sampling noise.
        </p>
      )}

      {audited && (
        <div className="mt-5 border-t border-neutral-200 pt-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-500">
            Backtest evidence (from audit JSON)
          </div>
          <div className="mt-2 grid grid-cols-3 gap-3 text-sm">
            <AuditCell
              label="Test SR"
              value={audit!.testSharpe}
              extra={audit!.testNDays !== null ? `${audit!.testNDays} d` : undefined}
            />
            <AuditCell label="Validation SR" value={audit!.validationSharpe} />
            <AuditCell label="Full SR" value={audit!.fullSharpe} />
            <AuditCell label="Test DSR" value={audit!.testDsr} digits={3} />
            <AuditCell
              label="Full DSR"
              value={audit!.fullDsr}
              digits={5}
              warnIfBelow={0.05}
            />
            <AuditCell label="Test PSR" value={audit!.testPsr} digits={3} />
          </div>
          {pbo && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Pill tone={pbo.tone} text={pbo.label} />
              <span className="text-[11px] text-neutral-500">
                PBO target &lt; 0.5 (lower = more out-of-sample-stable)
              </span>
            </div>
          )}
          {audit!.notes && audit!.notes.length > 0 && (
            <ul className="mt-3 space-y-1 text-[11px] leading-4 text-neutral-600">
              {audit!.notes.slice(0, 3).map((n, i) => (
                <li key={i}>· {n}</li>
              ))}
            </ul>
          )}
          <div className="mt-3 text-[10px] uppercase tracking-[0.18em] text-neutral-400">
            Source: {audit!.sourcePath}
          </div>
        </div>
      )}

      {!audited && audit && (
        <div className="mt-5 border-t border-neutral-200 pt-3 text-[11px] text-neutral-500">
          {auditCoverageLabel(audit)}
        </div>
      )}
    </div>
  );
}

function Pill({ tone, text }: { tone: Tone; text: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${TONE_CLASSES[tone]}`}
    >
      {text}
    </span>
  );
}

function AuditCell({
  label,
  value,
  digits = 2,
  extra,
  warnIfBelow,
}: {
  label: string;
  value: number | null | undefined;
  digits?: number;
  extra?: string;
  warnIfBelow?: number;
}) {
  const has = value !== null && value !== undefined && Number.isFinite(value);
  const isLow = has && warnIfBelow !== undefined && (value as number) < warnIfBelow;
  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2">
      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">
        {label}
      </div>
      <div
        className={`mt-1 text-base font-medium ${
          isLow ? 'text-rose-700' : 'text-black'
        }`}
      >
        {has ? (value as number).toFixed(digits) : '—'}
      </div>
      {extra && <div className="text-[10px] text-neutral-500">{extra}</div>}
    </div>
  );
}
