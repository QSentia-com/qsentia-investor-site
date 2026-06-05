import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export type LeadSource = 'signup' | 'contact' | 'google' | 'manual';
export type LeadStage = 'new' | 'qualified' | 'demo' | 'proposal' | 'won' | 'lost';
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in_progress' | 'waiting' | 'resolved';
export type CareerStatus = 'draft' | 'open' | 'paused' | 'closed';
export type ApplicationStage = 'received' | 'screening' | 'interview' | 'offer' | 'rejected' | 'hired';
export type OfferStatus = 'draft' | 'active' | 'paused' | 'expired';
export type DiscountType = 'percent' | 'amount' | 'trial_extension' | 'custom';

export type BackOfficeLead = {
  id: string;
  name: string;
  email: string;
  organization: string | null;
  source: LeadSource;
  interest: string | null;
  modelId: string | null;
  stage: LeadStage;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type InternalTicket = {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  owner: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CareerRole = {
  id: string;
  title: string;
  department: string;
  location: string;
  status: CareerStatus;
  hiringManager: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CareerApplication = {
  id: string;
  roleId: string | null;
  candidateName: string;
  email: string;
  stage: ApplicationStage;
  source: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ModelActivity = {
  modelId: string;
  slug: string | null;
  name: string | null;
  views: number;
  lastViewedAt: string;
};

export type CommercialOffer = {
  id: string;
  code: string;
  title: string;
  modelId: string | null;
  status: OfferStatus;
  trialDays: number;
  discountType: DiscountType;
  discountValue: number;
  maxRedemptions: number | null;
  redemptions: number;
  expiresAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BackOfficeStore = {
  version: 1;
  updatedAt: string | null;
  leads: BackOfficeLead[];
  tickets: InternalTicket[];
  careerRoles: CareerRole[];
  applications: CareerApplication[];
  offers: CommercialOffer[];
  modelActivity: Record<string, ModelActivity>;
};

const STORE_DIR = path.join(process.cwd(), '.qsentia-cache');
const STORE_PATH = path.join(STORE_DIR, 'admin-back-office.json');

const LEAD_SOURCES = new Set<LeadSource>(['signup', 'contact', 'google', 'manual']);
const LEAD_STAGES = new Set<LeadStage>(['new', 'qualified', 'demo', 'proposal', 'won', 'lost']);
const TICKET_PRIORITIES = new Set<TicketPriority>(['low', 'normal', 'high', 'urgent']);
const TICKET_STATUSES = new Set<TicketStatus>(['open', 'in_progress', 'waiting', 'resolved']);
const CAREER_STATUSES = new Set<CareerStatus>((['draft', 'open', 'paused', 'closed']));
const OFFER_STATUSES = new Set<OfferStatus>((['draft', 'active', 'paused', 'expired']));
const DISCOUNT_TYPES = new Set<DiscountType>((['percent', 'amount', 'trial_extension', 'custom']));
const APPROVED_CAREER_ROLES = [
  {
    title: 'Developer',
    department: 'Engineering',
    location: 'Remote',
    hiringManager: 'Technology office',
  },
  {
    title: 'Investor Relations Manager',
    department: 'Investor Relations',
    location: 'Remote',
    hiringManager: 'CEO office',
  },
  {
    title: 'Researcher',
    department: 'Research',
    location: 'Remote',
    hiringManager: 'Research office',
  },
  {
    title: 'CEO Quant Researcher',
    department: 'Quant Research',
    location: 'Remote',
    hiringManager: 'CEO office',
  },
] as const;
const TICKET_CATEGORIES = new Set(['Operations', 'Website', 'Data/API', 'Model access', 'Careers', 'Compliance']);
const TICKET_OWNERS = new Set(['Operations', 'Engineering', 'Research', 'Investor Relations', 'Compliance', 'Unassigned']);
const APPLICATION_STAGES = new Set<ApplicationStage>([
  'received',
  'screening',
  'interview',
  'offer',
  'rejected',
  'hired',
]);

function blankStore(): BackOfficeStore {
  return {
    version: 1,
    updatedAt: null,
    leads: [],
    tickets: [],
    careerRoles: [],
    applications: [],
    offers: [],
    modelActivity: {},
  };
}

function id(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function nullableText(value: unknown, maxLength = 300): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
}

function requiredText(value: unknown, fallback: string, maxLength = 180): string {
  return nullableText(value, maxLength) || fallback;
}

function enumValue<T extends string>(value: unknown, allowed: Set<T>, fallback: T): T {
  return typeof value === 'string' && allowed.has(value as T) ? (value as T) : fallback;
}

function allowedText(value: unknown, allowed: Set<string>, fallback: string): string {
  if (typeof value === 'string' && allowed.has(value)) return value;
  if (allowed.has(fallback)) return fallback;
  return Array.from(allowed)[0] || fallback;
}

function approvedCareerRole(value: unknown, fallback?: string) {
  const preferred =
    typeof value === 'string'
      ? APPROVED_CAREER_ROLES.find((role) => role.title === value)
      : null;
  const existing =
    fallback ? APPROVED_CAREER_ROLES.find((role) => role.title === fallback) : null;

  return preferred || existing || APPROVED_CAREER_ROLES[0];
}

function isoDate(value: unknown, fallback: string) {
  if (typeof value !== 'string') return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString();
}

function futureIsoDate(value: unknown): string | null {
  const text = nullableText(value, 80);
  if (!text) return null;
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function nonNegativeInteger(value: unknown, fallback = 0): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) return fallback;
  return Math.floor(numeric);
}

function sanitizeLead(input: unknown, existing?: BackOfficeLead): BackOfficeLead {
  const raw = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  const now = new Date().toISOString();

  return {
    id: existing?.id || (typeof raw.id === 'string' ? raw.id : id('lead')),
    name: requiredText(raw.name, existing?.name || 'Unknown contact'),
    email: requiredText(raw.email, existing?.email || 'unknown@example.com').toLowerCase(),
    organization: nullableText(raw.organization, 180) ?? existing?.organization ?? null,
    source: enumValue(raw.source, LEAD_SOURCES, existing?.source || 'manual'),
    interest: nullableText(raw.interest, 300) ?? existing?.interest ?? null,
    modelId: nullableText(raw.modelId, 160) ?? existing?.modelId ?? null,
    stage: enumValue(raw.stage, LEAD_STAGES, existing?.stage || 'new'),
    notes: nullableText(raw.notes, 1200) ?? existing?.notes ?? null,
    createdAt: existing?.createdAt || isoDate(raw.createdAt, now),
    updatedAt: now,
  };
}

function sanitizeTicket(input: unknown, existing?: InternalTicket): InternalTicket {
  const raw = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  const now = new Date().toISOString();

  return {
    id: existing?.id || (typeof raw.id === 'string' ? raw.id : id('ticket')),
    title: requiredText(raw.title, existing?.title || 'Internal ticket'),
    description: requiredText(raw.description, existing?.description || 'No description provided.', 2000),
    category: allowedText(raw.category, TICKET_CATEGORIES, existing?.category || 'Operations'),
    priority: enumValue(raw.priority, TICKET_PRIORITIES, existing?.priority || 'normal'),
    status: enumValue(raw.status, TICKET_STATUSES, existing?.status || 'open'),
    owner: allowedText(raw.owner, TICKET_OWNERS, existing?.owner || 'Unassigned'),
    createdAt: existing?.createdAt || isoDate(raw.createdAt, now),
    updatedAt: now,
  };
}

function sanitizeCareerRole(input: unknown, existing?: CareerRole): CareerRole {
  const raw = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  const now = new Date().toISOString();
  const role = approvedCareerRole(raw.title, existing?.title);

  return {
    id: existing?.id || (typeof raw.id === 'string' ? raw.id : id('role')),
    title: role.title,
    department: role.department,
    location: role.location,
    status: enumValue(raw.status, CAREER_STATUSES, existing?.status || 'draft'),
    hiringManager: role.hiringManager,
    notes: nullableText(raw.notes, 1400) ?? existing?.notes ?? null,
    createdAt: existing?.createdAt || isoDate(raw.createdAt, now),
    updatedAt: now,
  };
}

function sanitizeApplication(input: unknown, existing?: CareerApplication): CareerApplication {
  const raw = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  const now = new Date().toISOString();

  return {
    id: existing?.id || (typeof raw.id === 'string' ? raw.id : id('app')),
    roleId: nullableText(raw.roleId, 160) ?? existing?.roleId ?? null,
    candidateName: requiredText(raw.candidateName, existing?.candidateName || 'Candidate'),
    email: requiredText(raw.email, existing?.email || 'unknown@example.com').toLowerCase(),
    stage: enumValue(raw.stage, APPLICATION_STAGES, existing?.stage || 'received'),
    source: nullableText(raw.source, 160) ?? existing?.source ?? null,
    createdAt: existing?.createdAt || isoDate(raw.createdAt, now),
    updatedAt: now,
  };
}

function sanitizeOffer(input: unknown, existing?: CommercialOffer): CommercialOffer {
  const raw = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  const now = new Date().toISOString();
  const rawCode = requiredText(raw.code, existing?.code || 'TRIAL').toUpperCase();
  const code = rawCode.replace(/[^A-Z0-9-]/g, '').slice(0, 32) || existing?.code || 'TRIAL';
  const trialDays = nonNegativeInteger(raw.trialDays, existing?.trialDays ?? 14);
  const discountValue = Number(raw.discountValue);

  return {
    id: existing?.id || (typeof raw.id === 'string' ? raw.id : id('offer')),
    code,
    title: requiredText(raw.title, existing?.title || 'Trial offer'),
    modelId: nullableText(raw.modelId, 160) ?? existing?.modelId ?? null,
    status: enumValue(raw.status, OFFER_STATUSES, existing?.status || 'draft'),
    trialDays,
    discountType: enumValue(raw.discountType, DISCOUNT_TYPES, existing?.discountType || 'percent'),
    discountValue: Number.isFinite(discountValue) && discountValue >= 0 ? discountValue : existing?.discountValue || 0,
    maxRedemptions:
      raw.maxRedemptions === null || raw.maxRedemptions === ''
        ? null
        : nonNegativeInteger(raw.maxRedemptions, existing?.maxRedemptions ?? 0) || null,
    redemptions: nonNegativeInteger(raw.redemptions, existing?.redemptions || 0),
    expiresAt: futureIsoDate(raw.expiresAt) ?? existing?.expiresAt ?? null,
    notes: nullableText(raw.notes, 1200) ?? existing?.notes ?? null,
    createdAt: existing?.createdAt || isoDate(raw.createdAt, now),
    updatedAt: now,
  };
}

function normalizeStore(payload: unknown): BackOfficeStore {
  if (!payload || typeof payload !== 'object') return blankStore();
  const raw = payload as Partial<BackOfficeStore>;

  const store = blankStore();
  store.updatedAt = typeof raw.updatedAt === 'string' ? raw.updatedAt : null;
  store.leads = Array.isArray(raw.leads)
    ? raw.leads.map((lead) => {
        const sanitized = sanitizeLead(lead);
        const rawLead = lead && typeof lead === 'object' ? (lead as Partial<BackOfficeLead>) : {};
        return {
          ...sanitized,
          updatedAt: isoDate(rawLead.updatedAt, sanitized.updatedAt),
        };
      })
    : [];
  store.tickets = Array.isArray(raw.tickets)
    ? raw.tickets.map((ticket) => {
        const sanitized = sanitizeTicket(ticket);
        const rawTicket = ticket && typeof ticket === 'object' ? (ticket as Partial<InternalTicket>) : {};
        return {
          ...sanitized,
          updatedAt: isoDate(rawTicket.updatedAt, sanitized.updatedAt),
        };
      })
    : [];
  store.careerRoles = Array.isArray(raw.careerRoles)
    ? raw.careerRoles.map((role) => {
        const sanitized = sanitizeCareerRole(role);
        const rawRole = role && typeof role === 'object' ? (role as Partial<CareerRole>) : {};
        return {
          ...sanitized,
          updatedAt: isoDate(rawRole.updatedAt, sanitized.updatedAt),
        };
      })
    : [];
  store.applications = Array.isArray(raw.applications)
    ? raw.applications.map((application) => {
        const sanitized = sanitizeApplication(application);
        const rawApplication =
          application && typeof application === 'object'
            ? (application as Partial<CareerApplication>)
            : {};
        return {
          ...sanitized,
          updatedAt: isoDate(rawApplication.updatedAt, sanitized.updatedAt),
        };
      })
    : [];
  store.offers = Array.isArray(raw.offers)
    ? raw.offers.map((offer) => {
        const sanitized = sanitizeOffer(offer);
        const rawOffer = offer && typeof offer === 'object' ? (offer as Partial<CommercialOffer>) : {};
        return {
          ...sanitized,
          updatedAt: isoDate(rawOffer.updatedAt, sanitized.updatedAt),
        };
      })
    : [];

  if (raw.modelActivity && typeof raw.modelActivity === 'object') {
    store.modelActivity = Object.fromEntries(
      Object.entries(raw.modelActivity).map(([modelId, activity]) => {
        const rawActivity =
          activity && typeof activity === 'object' ? (activity as Partial<ModelActivity>) : {};
        return [
          modelId,
          {
            modelId,
            slug: typeof rawActivity.slug === 'string' ? rawActivity.slug : null,
            name: typeof rawActivity.name === 'string' ? rawActivity.name : null,
            views: Math.max(0, Math.floor(Number(rawActivity.views) || 0)),
            lastViewedAt: isoDate(rawActivity.lastViewedAt, new Date().toISOString()),
          },
        ];
      })
    );
  }

  return store;
}

export async function readBackOfficeStore(): Promise<BackOfficeStore> {
  try {
    const contents = await readFile(STORE_PATH, 'utf8');
    return normalizeStore(JSON.parse(contents));
  } catch {
    return blankStore();
  }
}

export async function writeBackOfficeStore(store: BackOfficeStore): Promise<BackOfficeStore> {
  const normalized = normalizeStore(store);
  await mkdir(STORE_DIR, { recursive: true });
  await writeFile(STORE_PATH, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8');
  return normalized;
}

export async function upsertLead(input: unknown, leadId?: string) {
  const store = await readBackOfficeStore();
  const index = leadId ? store.leads.findIndex((lead) => lead.id === leadId) : -1;
  const nextLead = sanitizeLead(input, index >= 0 ? store.leads[index] : undefined);

  const nextLeads = [...store.leads];
  if (index >= 0) {
    nextLeads[index] = nextLead;
  } else {
    nextLeads.unshift(nextLead);
  }

  return writeBackOfficeStore({
    ...store,
    updatedAt: nextLead.updatedAt,
    leads: nextLeads,
  });
}

export async function upsertTicket(input: unknown, ticketId?: string) {
  const store = await readBackOfficeStore();
  const index = ticketId ? store.tickets.findIndex((ticket) => ticket.id === ticketId) : -1;
  const nextTicket = sanitizeTicket(input, index >= 0 ? store.tickets[index] : undefined);

  const nextTickets = [...store.tickets];
  if (index >= 0) {
    nextTickets[index] = nextTicket;
  } else {
    nextTickets.unshift(nextTicket);
  }

  return writeBackOfficeStore({
    ...store,
    updatedAt: nextTicket.updatedAt,
    tickets: nextTickets,
  });
}

export async function upsertCareerRole(input: unknown, roleId?: string) {
  const store = await readBackOfficeStore();
  const incoming = sanitizeCareerRole(input);
  const index = roleId
    ? store.careerRoles.findIndex((role) => role.id === roleId)
    : store.careerRoles.findIndex((role) => role.title === incoming.title);
  const nextRole = sanitizeCareerRole(input, index >= 0 ? store.careerRoles[index] : undefined);

  const nextRoles = [...store.careerRoles];
  if (index >= 0) {
    nextRoles[index] = nextRole;
  } else {
    nextRoles.unshift(nextRole);
  }

  return writeBackOfficeStore({
    ...store,
    updatedAt: nextRole.updatedAt,
    careerRoles: nextRoles,
  });
}

export async function upsertApplication(input: unknown, applicationId?: string) {
  const store = await readBackOfficeStore();
  const index = applicationId
    ? store.applications.findIndex((application) => application.id === applicationId)
    : -1;
  const nextApplication = sanitizeApplication(
    input,
    index >= 0 ? store.applications[index] : undefined
  );

  const nextApplications = [...store.applications];
  if (index >= 0) {
    nextApplications[index] = nextApplication;
  } else {
    nextApplications.unshift(nextApplication);
  }

  return writeBackOfficeStore({
    ...store,
    updatedAt: nextApplication.updatedAt,
    applications: nextApplications,
  });
}

export async function upsertOffer(input: unknown, offerId?: string) {
  const store = await readBackOfficeStore();
  const incoming = sanitizeOffer(input);
  const index = offerId
    ? store.offers.findIndex((offer) => offer.id === offerId)
    : store.offers.findIndex((offer) => offer.code === incoming.code);
  const nextOffer = sanitizeOffer(input, index >= 0 ? store.offers[index] : undefined);

  const nextOffers = [...store.offers];
  if (index >= 0) {
    nextOffers[index] = nextOffer;
  } else {
    nextOffers.unshift(nextOffer);
  }

  return writeBackOfficeStore({
    ...store,
    updatedAt: nextOffer.updatedAt,
    offers: nextOffers,
  });
}

export function offerIsUsable(offer: CommercialOffer, modelId?: string | null) {
  if (offer.status !== 'active') return false;
  if (offer.expiresAt && new Date(offer.expiresAt).getTime() < Date.now()) return false;
  if (offer.maxRedemptions !== null && offer.redemptions >= offer.maxRedemptions) return false;
  if (offer.modelId && modelId && offer.modelId !== modelId) return false;
  return true;
}

export async function redeemOfferCode(code: unknown, modelId?: string | null) {
  const normalizedCode = nullableText(code, 64)?.toUpperCase().replace(/[^A-Z0-9-]/g, '') || '';
  if (!normalizedCode) return null;

  const store = await readBackOfficeStore();
  const offer = store.offers.find((candidate) => candidate.code === normalizedCode);
  if (!offer || !offerIsUsable(offer, modelId)) return null;

  const now = new Date().toISOString();
  const nextOffers = store.offers.map((candidate) =>
    candidate.id === offer.id
      ? {
          ...candidate,
          redemptions: candidate.redemptions + 1,
          updatedAt: now,
        }
      : candidate
  );

  await writeBackOfficeStore({
    ...store,
    updatedAt: now,
    offers: nextOffers,
  });

  return {
    ...offer,
    redemptions: offer.redemptions + 1,
    updatedAt: now,
  };
}

export async function recordModelView(input: unknown) {
  const raw = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  const modelId = nullableText(raw.modelId, 160);
  if (!modelId) return readBackOfficeStore();

  const store = await readBackOfficeStore();
  const now = new Date().toISOString();
  const current = store.modelActivity[modelId];

  return writeBackOfficeStore({
    ...store,
    updatedAt: now,
    modelActivity: {
      ...store.modelActivity,
      [modelId]: {
        modelId,
        slug: nullableText(raw.slug, 160) ?? current?.slug ?? null,
        name: nullableText(raw.name, 180) ?? current?.name ?? null,
        views: (current?.views || 0) + 1,
        lastViewedAt: now,
      },
    },
  });
}
