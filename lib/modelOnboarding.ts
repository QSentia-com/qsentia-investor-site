import { randomBytes } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export type ModelSubmissionStatus =
  | 'submitted'
  | 'technical_review'
  | 'risk_review'
  | 'approved'
  | 'published'
  | 'rejected';

export type ModelSubmission = {
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
  status: ModelSubmissionStatus;
  color: string;
  startingCapital: number | null;
  validationPassed: boolean;
  validationMessage: string | null;
  validatedAt: string | null;
  reviewNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ModelSubmissionEvent = {
  id: string;
  submissionId: string;
  action: string;
  detail: string;
  createdAt: string;
};

type OnboardingStore = {
  version: 1;
  updatedAt: string | null;
  submissions: ModelSubmission[];
  events: ModelSubmissionEvent[];
};

export type PublishedModelConfig = {
  id: string;
  name: string;
  description: string;
  repo: string;
  logs_path: string;
  branch: string;
  enabled: boolean;
  color: string;
  starting_capital?: number;
};

const STORE_DIR = path.join(process.cwd(), '.qsentia-cache');
const STORE_PATH = path.join(STORE_DIR, 'model-onboarding.json');
const STATUSES = new Set<ModelSubmissionStatus>(['submitted', 'technical_review', 'risk_review', 'approved', 'published', 'rejected']);
const ASSET_CLASSES = new Set(['Crypto', 'Equities', 'Multi-asset', 'Fixed income', 'FX', 'Commodities']);
const BROKERS = new Set(['IBKR', 'Alpaca', 'Broker neutral']);
const DELIVERY_MODES = new Set(['Signals only', 'Paper execution', 'Live execution']);
const COLORS = new Set(['#3d52da', '#0ea5e9', '#14b8a6', '#8b5cf6', '#f59e0b', '#ef4444']);
const NEXT_STATUS: Partial<Record<ModelSubmissionStatus, ModelSubmissionStatus>> = {
  submitted: 'technical_review',
  technical_review: 'risk_review',
  risk_review: 'approved',
  approved: 'published',
};

function blankStore(): OnboardingStore {
  return { version: 1, updatedAt: null, submissions: [], events: [] };
}

function id(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${randomBytes(4).toString('hex')}`;
}

function requiredText(value: unknown, field: string, maxLength = 240) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${field} is required`);
  return value.trim().slice(0, maxLength);
}

function optionalText(value: unknown, maxLength = 1200) {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, maxLength) : null;
}

function allowed(value: unknown, options: Set<string>, fallback: string) {
  return typeof value === 'string' && options.has(value) ? value : fallback;
}

function startingCapital(value: unknown) {
  if (value === '' || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function normalizeModelId(value: unknown) {
  const modelId = requiredText(value, 'Model id', 100).toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  if (!/^[a-z0-9][a-z0-9_-]{2,99}$/.test(modelId)) throw new Error('Model id must use lowercase letters, numbers, underscores, or hyphens');
  return modelId;
}

function normalizeRepo(value: unknown) {
  const repo = requiredText(value, 'GitHub repository', 180)
    .replace(/^https?:\/\/github\.com\//i, '')
    .replace(/\.git$/i, '')
    .replace(/^\/+|\/+$/g, '');
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo)) throw new Error('Repository must use owner/repository format');
  return repo;
}

function event(submissionId: string, action: string, detail: string): ModelSubmissionEvent {
  return { id: id('mse'), submissionId, action, detail, createdAt: new Date().toISOString() };
}

function hasSupabaseAdminConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

async function supabaseAdminClient() {
  if (!hasSupabaseAdminConfig()) return null;
  const { supabaseAdmin } = await import('../backend/lib/supabase');
  return supabaseAdmin;
}

async function readLocalStore(): Promise<OnboardingStore> {
  try {
    const parsed = JSON.parse(await readFile(STORE_PATH, 'utf8')) as Partial<OnboardingStore>;
    return {
      version: 1,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : null,
      submissions: Array.isArray(parsed.submissions) ? parsed.submissions : [],
      events: Array.isArray(parsed.events) ? parsed.events : [],
    };
  } catch {
    return blankStore();
  }
}

async function writeLocalStore(store: OnboardingStore) {
  const next = { ...store, updatedAt: new Date().toISOString() };
  await mkdir(STORE_DIR, { recursive: true });
  await writeFile(STORE_PATH, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  return next;
}

function submissionFromRow(row: Record<string, unknown>): ModelSubmission {
  return {
    id: String(row.id), modelId: String(row.model_id), name: String(row.name),
    description: String(row.description), repo: String(row.repo), branch: String(row.branch),
    logsPath: String(row.logs_path), assetClass: String(row.asset_class), broker: String(row.broker),
    deliveryMode: String(row.delivery_mode), submittedBy: String(row.submitted_by),
    status: row.status as ModelSubmissionStatus, color: String(row.color),
    startingCapital: row.starting_capital === null ? null : Number(row.starting_capital),
    validationPassed: Boolean(row.validation_passed),
    validationMessage: typeof row.validation_message === 'string' ? row.validation_message : null,
    validatedAt: typeof row.validated_at === 'string' ? row.validated_at : null,
    reviewNotes: typeof row.review_notes === 'string' ? row.review_notes : null,
    createdAt: String(row.created_at), updatedAt: String(row.updated_at),
  };
}

function eventFromRow(row: Record<string, unknown>): ModelSubmissionEvent {
  return {
    id: String(row.id), submissionId: String(row.submission_id), action: String(row.action),
    detail: String(row.detail), createdAt: String(row.created_at),
  };
}

async function readSupabaseStore(): Promise<OnboardingStore> {
  const client = await supabaseAdminClient();
  if (!client) return blankStore();
  const [submissions, events] = await Promise.all([
    client.from('model_submissions').select('*').order('created_at', { ascending: false }),
    client.from('model_submission_events').select('*').order('created_at', { ascending: false }).limit(200),
  ]);
  if (submissions.error) throw submissions.error;
  if (events.error) throw events.error;
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    submissions: (submissions.data || []).map((row) => submissionFromRow(row)),
    events: (events.data || []).map((row) => eventFromRow(row)),
  };
}

async function readStore() {
  return hasSupabaseAdminConfig() ? readSupabaseStore() : readLocalStore();
}

async function insertEvent(entry: ModelSubmissionEvent) {
  const client = await supabaseAdminClient();
  if (!client) return;
  const { error } = await client.from('model_submission_events').insert({
    id: entry.id, submission_id: entry.submissionId, action: entry.action,
    detail: entry.detail, created_at: entry.createdAt,
  });
  if (error) throw error;
}

export async function readModelOnboarding() {
  return readStore();
}

export async function createModelSubmission(input: unknown) {
  const raw = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  const store = await readStore();
  const modelId = normalizeModelId(raw.modelId);
  const repo = normalizeRepo(raw.repo);
  if (store.submissions.some((item) => item.modelId === modelId && item.status !== 'rejected')) {
    throw new Error('This model id already has an active submission');
  }
  const now = new Date().toISOString();
  const submission: ModelSubmission = {
    id: id('model'), modelId, name: requiredText(raw.name, 'Display name', 160),
    description: requiredText(raw.description, 'Description', 900), repo,
    branch: requiredText(raw.branch, 'Branch', 80), logsPath: requiredText(raw.logsPath, 'Logs path', 180),
    assetClass: allowed(raw.assetClass, ASSET_CLASSES, 'Multi-asset'),
    broker: allowed(raw.broker, BROKERS, 'Broker neutral'),
    deliveryMode: allowed(raw.deliveryMode, DELIVERY_MODES, 'Signals only'),
    submittedBy: requiredText(raw.submittedBy, 'Research owner', 160),
    status: 'submitted', color: allowed(raw.color, COLORS, '#3d52da'),
    startingCapital: startingCapital(raw.startingCapital), validationPassed: false,
    validationMessage: null, validatedAt: null, reviewNotes: optionalText(raw.reviewNotes),
    createdAt: now, updatedAt: now,
  };
  const entry = event(submission.id, 'submitted', `${submission.modelId} submitted by ${submission.submittedBy}`);
  const client = await supabaseAdminClient();
  if (client) {
    const { error } = await client.from('model_submissions').insert({
      id: submission.id, model_id: submission.modelId, name: submission.name,
      description: submission.description, repo: submission.repo, branch: submission.branch,
      logs_path: submission.logsPath, asset_class: submission.assetClass, broker: submission.broker,
      delivery_mode: submission.deliveryMode, submitted_by: submission.submittedBy,
      status: submission.status, color: submission.color, starting_capital: submission.startingCapital,
      validation_passed: false, validation_message: null, validated_at: null,
      review_notes: submission.reviewNotes, created_at: now, updated_at: now,
    });
    if (error) throw error;
    await insertEvent(entry);
  } else {
    store.submissions.unshift(submission);
    store.events.unshift(entry);
    await writeLocalStore(store);
  }
  return submission;
}

function githubHeaders() {
  const token = process.env.GITHUB_READ_TOKEN || process.env.QSENTIA_GITHUB_READ_TOKEN || process.env.GITHUB_TOKEN;
  return {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'QSentia-Model-Onboarding',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function validateModelSubmission(submissionId: string) {
  const store = await readStore();
  const submission = store.submissions.find((item) => item.id === submissionId);
  if (!submission) throw new Error('Model submission was not found');
  const headers = githubHeaders();
  const repoResponse = await fetch(`https://api.github.com/repos/${submission.repo}`, { headers, cache: 'no-store' });
  const logsResponse = repoResponse.ok
    ? await fetch(`https://api.github.com/repos/${submission.repo}/contents/${submission.logsPath}?ref=${encodeURIComponent(submission.branch)}`, { headers, cache: 'no-store' })
    : null;
  const passed = repoResponse.ok && Boolean(logsResponse?.ok);
  const message = !repoResponse.ok
    ? `Repository check failed (${repoResponse.status})`
    : !logsResponse?.ok
      ? `Logs path check failed (${logsResponse?.status || 'unavailable'})`
      : 'Repository and telemetry path verified';
  const now = new Date().toISOString();
  const entry = event(submission.id, 'validated', message);
  const client = await supabaseAdminClient();
  if (client) {
    const { error } = await client.from('model_submissions').update({
      validation_passed: passed, validation_message: message, validated_at: now, updated_at: now,
    }).eq('id', submission.id);
    if (error) throw error;
    await insertEvent(entry);
  } else {
    submission.validationPassed = passed;
    submission.validationMessage = message;
    submission.validatedAt = now;
    submission.updatedAt = now;
    store.events.unshift(entry);
    await writeLocalStore(store);
  }
  return { passed, message };
}

export async function advanceModelSubmission(input: unknown) {
  const raw = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  const submissionId = requiredText(raw.id, 'Submission id', 120);
  const target = requiredText(raw.status, 'Target status', 40) as ModelSubmissionStatus;
  if (!STATUSES.has(target)) throw new Error('Unsupported model status');
  const store = await readStore();
  const submission = store.submissions.find((item) => item.id === submissionId);
  if (!submission) throw new Error('Model submission was not found');
  const expected = NEXT_STATUS[submission.status];
  if (target !== 'rejected' && target !== expected) throw new Error(`Model cannot move from ${submission.status} to ${target}`);
  if ((target === 'risk_review' || target === 'approved' || target === 'published') && !submission.validationPassed) {
    throw new Error('Repository validation must pass before risk review or publication');
  }
  const notes = optionalText(raw.reviewNotes);
  if (target === 'rejected' && !notes) throw new Error('A rejection reason is required');
  const now = new Date().toISOString();
  const entry = event(submission.id, `status.${target}`, notes || `${submission.modelId} moved to ${target}`);
  const client = await supabaseAdminClient();
  if (client) {
    const { error } = await client.from('model_submissions').update({ status: target, review_notes: notes || submission.reviewNotes, updated_at: now }).eq('id', submission.id);
    if (error) throw error;
    await insertEvent(entry);
  } else {
    submission.status = target;
    submission.reviewNotes = notes || submission.reviewNotes;
    submission.updatedAt = now;
    store.events.unshift(entry);
    await writeLocalStore(store);
  }
  return { ...submission, status: target, reviewNotes: notes || submission.reviewNotes, updatedAt: now };
}

export async function readPublishedModelConfigs(): Promise<PublishedModelConfig[]> {
  try {
    const store = await readStore();
    return store.submissions
      .filter((submission) => submission.status === 'published' && submission.validationPassed)
      .map((submission) => ({
        id: submission.modelId,
        name: submission.name,
        description: submission.description,
        repo: submission.repo,
        logs_path: submission.logsPath,
        branch: submission.branch,
        enabled: true,
        color: submission.color,
        ...(submission.startingCapital ? { starting_capital: submission.startingCapital } : {}),
      }));
  } catch (error) {
    console.error('Unable to read published model submissions:', error);
    return [];
  }
}
