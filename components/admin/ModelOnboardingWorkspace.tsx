'use client';

import { useState, type ReactNode } from 'react';
import useSWR from 'swr';
import {
  CheckCircle2,
  CircleDot,
  GitBranch,
  RefreshCw,
  Rocket,
  SearchCheck,
  Send,
  ShieldCheck,
  UploadCloud,
} from 'lucide-react';

type SubmissionStatus = 'submitted' | 'technical_review' | 'risk_review' | 'approved' | 'published' | 'rejected';

type Submission = {
  id: string;
  modelId: string;
  name: string;
  description: string;
  repo: string;
  branch: string;
  logsPath: string;
  assetClass: string;
  broker: string;
  deliveryMode: string;
  submittedBy: string;
  status: SubmissionStatus;
  color: string;
  startingCapital: number | null;
  validationPassed: boolean;
  validationMessage: string | null;
  validatedAt: string | null;
  reviewNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

type OnboardingData = {
  updatedAt: string | null;
  submissions: Submission[];
  events: Array<{ id: string; submissionId: string; action: string; detail: string; createdAt: string }>;
};

const assetClasses = ['Crypto', 'Equities', 'Multi-asset', 'Fixed income', 'FX', 'Commodities'];
const brokers = ['IBKR', 'Alpaca', 'Broker neutral'];
const deliveryModes = ['Signals only', 'Paper execution', 'Live execution'];
const colors = ['#3d52da', '#0ea5e9', '#14b8a6', '#8b5cf6', '#f59e0b', '#ef4444'];
const nextStatus: Partial<Record<SubmissionStatus, SubmissionStatus>> = {
  submitted: 'technical_review',
  technical_review: 'risk_review',
  risk_review: 'approved',
  approved: 'published',
};
const actionLabels: Partial<Record<SubmissionStatus, string>> = {
  submitted: 'Start technical review',
  technical_review: 'Send to risk review',
  risk_review: 'Approve model',
  approved: 'Publish to marketplace',
};

async function fetcher(url: string) {
  const response = await fetch(url, { cache: 'no-store' });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Request failed: ${response.status}`);
  return payload;
}

function label(value: string) {
  return value.split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

function shortDate(value: string | null) {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not recorded';
  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

export default function ModelOnboardingWorkspace() {
  const { data, error, isLoading, mutate } = useSWR<OnboardingData>('/api/admin/model-onboarding', fetcher, { shouldRetryOnError: false });
  const [saving, setSaving] = useState(false);
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [form, setForm] = useState({
    modelId: '', name: '', description: '', repo: '', branch: 'main', logsPath: 'logs',
    assetClass: 'Crypto', broker: 'Broker neutral', deliveryMode: 'Signals only',
    submittedBy: '', color: '#3d52da', startingCapital: '', reviewNotes: '',
  });

  async function submitModel() {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch('/api/admin/model-onboarding', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit', payload: form }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Submission failed');
      setForm({
        modelId: '', name: '', description: '', repo: '', branch: 'main', logsPath: 'logs',
        assetClass: 'Crypto', broker: 'Broker neutral', deliveryMode: 'Signals only',
        submittedBy: '', color: '#3d52da', startingCapital: '', reviewNotes: '',
      });
      await mutate();
      setMessage({ tone: 'success', text: 'Model submitted for technical review.' });
    } catch (submissionError) {
      setMessage({ tone: 'error', text: submissionError instanceof Error ? submissionError.message : 'Submission failed' });
    } finally {
      setSaving(false);
    }
  }

  async function validate(submission: Submission) {
    setValidatingId(submission.id);
    setMessage(null);
    try {
      const response = await fetch('/api/admin/model-onboarding', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'validate', id: submission.id }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Validation failed');
      await mutate();
      setMessage({ tone: payload.validation.passed ? 'success' : 'error', text: payload.validation.message });
    } catch (validationError) {
      setMessage({ tone: 'error', text: validationError instanceof Error ? validationError.message : 'Validation failed' });
    } finally {
      setValidatingId(null);
    }
  }

  async function advance(submission: Submission) {
    const status = nextStatus[submission.status];
    if (!status) return;
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch('/api/admin/model-onboarding', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: submission.id, status, reviewNotes: submission.reviewNotes }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Review update failed');
      await mutate();
      setMessage({ tone: 'success', text: status === 'published' ? 'Model published to the live registry.' : `Model moved to ${label(status)}.` });
    } catch (reviewError) {
      setMessage({ tone: 'error', text: reviewError instanceof Error ? reviewError.message : 'Review update failed' });
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return <Panel title="Loading model pipeline" icon={<RefreshCw className="h-4 w-4 animate-spin" />}><div className="h-32 animate-pulse rounded-md bg-[#f1f4f9]" /></Panel>;
  }

  if (error || !data) {
    return <Notice tone="error">{error instanceof Error ? error.message : 'Model onboarding could not be loaded.'}</Notice>;
  }

  const counts = {
    review: data.submissions.filter((item) => ['submitted', 'technical_review', 'risk_review'].includes(item.status)).length,
    approved: data.submissions.filter((item) => item.status === 'approved').length,
    published: data.submissions.filter((item) => item.status === 'published').length,
  };

  return (
    <div className="grid gap-6">
      {message && <Notice tone={message.tone}>{message.text}</Notice>}

      <div className="grid gap-4 md:grid-cols-3">
        <Metric icon={<SearchCheck className="h-5 w-5" />} label="In review" value={counts.review} />
        <Metric icon={<ShieldCheck className="h-5 w-5" />} label="Approved" value={counts.approved} />
        <Metric icon={<Rocket className="h-5 w-5" />} label="Published" value={counts.published} />
      </div>

      <div className="grid gap-3 border-y border-[#dfe5f2] bg-white px-4 py-4 sm:grid-cols-4">
        <Stage icon={<UploadCloud className="h-4 w-4" />} number="01" label="Research submission" />
        <Stage icon={<GitBranch className="h-4 w-4" />} number="02" label="Technical validation" />
        <Stage icon={<ShieldCheck className="h-4 w-4" />} number="03" label="Risk approval" />
        <Stage icon={<Rocket className="h-4 w-4" />} number="04" label="Registry publication" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[390px_minmax(0,1fr)]">
        <Panel title="Submit model" icon={<UploadCloud className="h-4 w-4" />}>
          <div className="grid gap-4">
            <Field label="Model id"><input className="admin-input" maxLength={100} value={form.modelId} onChange={(event) => setForm({ ...form, modelId: event.target.value })} placeholder="lowercase_model_id" /></Field>
            <Field label="Display name"><input className="admin-input" maxLength={160} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
            <Field label="GitHub repository"><input className="admin-input" maxLength={180} value={form.repo} onChange={(event) => setForm({ ...form, repo: event.target.value })} placeholder="owner/repository" /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Branch"><input className="admin-input" maxLength={80} value={form.branch} onChange={(event) => setForm({ ...form, branch: event.target.value })} /></Field>
              <Field label="Logs path"><input className="admin-input" maxLength={180} value={form.logsPath} onChange={(event) => setForm({ ...form, logsPath: event.target.value })} /></Field>
            </div>
            <Field label="Description"><textarea className="admin-input resize-none" rows={4} maxLength={900} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Asset class"><Select value={form.assetClass} options={assetClasses} onChange={(value) => setForm({ ...form, assetClass: value })} /></Field>
              <Field label="Broker"><Select value={form.broker} options={brokers} onChange={(value) => setForm({ ...form, broker: value })} /></Field>
            </div>
            <Field label="Delivery mode"><Select value={form.deliveryMode} options={deliveryModes} onChange={(value) => setForm({ ...form, deliveryMode: value })} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Research owner"><input className="admin-input" maxLength={160} value={form.submittedBy} onChange={(event) => setForm({ ...form, submittedBy: event.target.value })} /></Field>
              <Field label="Starting capital"><input className="admin-input" type="number" min="1" value={form.startingCapital} onChange={(event) => setForm({ ...form, startingCapital: event.target.value })} /></Field>
            </div>
            <Field label="Chart color"><div className="flex gap-2">{colors.map((color) => <button key={color} type="button" aria-label={`Use ${color}`} onClick={() => setForm({ ...form, color })} className={`h-8 w-8 rounded-md border-2 ${form.color === color ? 'border-[#0f172a]' : 'border-white ring-1 ring-[#cbd5e1]'}`} style={{ backgroundColor: color }} />)}</div></Field>
            <button type="button" onClick={submitModel} disabled={saving} className="admin-primary-button justify-center"><Send className="h-4 w-4" />Submit for review</button>
          </div>
        </Panel>

        <Panel title="Review pipeline" icon={<GitBranch className="h-4 w-4" />}>
          {data.submissions.length ? (
            <div className="grid gap-3">
              {data.submissions.map((submission) => {
                const canAdvance = submission.status !== 'technical_review' || submission.validationPassed;
                return (
                  <article key={submission.id} className="border-b border-[#e2e7fb] pb-4 last:border-b-0 last:pb-0">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-[#0f172a]">{submission.name}</h3><Status value={submission.status} /></div>
                        <div className="mt-1 font-mono text-xs text-[#647269]">{submission.modelId} · {submission.repo}</div>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#647269]"><span>{submission.assetClass}</span><span>{submission.broker}</span><span>{submission.deliveryMode}</span><span>{shortDate(submission.createdAt)}</span></div>
                        {submission.validationMessage && <div className={`mt-2 text-xs font-semibold ${submission.validationPassed ? 'text-[#047857]' : 'text-[#be123c]'}`}>{submission.validationMessage}</div>}
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        {['submitted', 'technical_review'].includes(submission.status) && (
                          <button type="button" onClick={() => validate(submission)} disabled={validatingId === submission.id} className="admin-secondary-button"><SearchCheck className="h-4 w-4" />{validatingId === submission.id ? 'Checking' : 'Validate'}</button>
                        )}
                        {nextStatus[submission.status] && (
                          <button type="button" onClick={() => advance(submission)} disabled={saving || !canAdvance} className="admin-primary-button">{submission.status === 'approved' ? <Rocket className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}{actionLabels[submission.status]}</button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : <Empty title="No model submissions" body="Research submissions will appear here before they can enter the live registry." />}
        </Panel>
      </div>
    </div>
  );
}

function Panel({ children, icon, title }: { children: ReactNode; icon: ReactNode; title: string }) {
  return <section className="rounded-md border border-[#dfe5f2] bg-white p-5 shadow-sm"><div className="mb-5 flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#eef2ff] text-[#3d52da]">{icon}</span><h2 className="text-lg font-semibold text-[#0f172a]">{title}</h2></div>{children}</section>;
}

function Field({ children, label: fieldLabel }: { children: ReactNode; label: string }) {
  return <label className="grid gap-2"><span className="text-xs font-bold uppercase tracking-wide text-[#647269]">{fieldLabel}</span>{children}</label>;
}

function Select({ onChange, options, value }: { onChange: (value: string) => void; options: string[]; value: string }) {
  return <select className="admin-input" value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select>;
}

function Metric({ icon, label: metricLabel, value }: { icon: ReactNode; label: string; value: number }) {
  return <div className="flex items-center justify-between rounded-md border border-[#dfe5f2] bg-white p-4 shadow-sm"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#eef2ff] text-[#3d52da]">{icon}</span><span className="text-sm font-semibold text-[#647269]">{metricLabel}</span></div><span className="text-2xl font-semibold text-[#0f172a]">{value}</span></div>;
}

function Stage({ icon, label: stageLabel, number }: { icon: ReactNode; label: string; number: string }) {
  return <div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#eef2ff] text-[#3d52da]">{icon}</span><div><div className="text-[10px] font-bold uppercase tracking-wide text-[#94a3b8]">{number}</div><div className="text-sm font-semibold text-[#0f172a]">{stageLabel}</div></div></div>;
}

function Status({ value }: { value: SubmissionStatus }) {
  const tone = value === 'published' || value === 'approved' ? 'border-[#a7e8cc] bg-[#ecfdf5] text-[#047857]' : value === 'rejected' ? 'border-[#fecdd3] bg-[#fff1f2] text-[#be123c]' : 'border-[#c7d2fe] bg-[#eef2ff] text-[#3046c8]';
  return <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-bold uppercase tracking-wide ${tone}`}><CircleDot className="h-3 w-3" />{label(value)}</span>;
}

function Notice({ children, tone }: { children: ReactNode; tone: 'success' | 'error' }) {
  return <div className={`rounded-md border p-3 text-sm ${tone === 'success' ? 'border-[#a7e8cc] bg-[#ecfdf5] text-[#047857]' : 'border-[#fecdd3] bg-[#fff1f2] text-[#be123c]'}`}>{children}</div>;
}

function Empty({ body, title }: { body: string; title: string }) {
  return <div className="rounded-md border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-6 text-center"><div className="font-semibold text-[#0f172a]">{title}</div><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#647269]">{body}</p></div>;
}
