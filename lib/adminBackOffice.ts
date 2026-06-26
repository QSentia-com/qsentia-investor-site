function hasSupabaseAdminConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

async function requireSupabaseAdmin() {
  if (!hasSupabaseAdminConfig()) {
    throw new Error("Supabase admin access is not configured");
  }

  const { supabaseAdmin } = await import("../backend/lib/supabase");
  return supabaseAdmin;
}

export type LeadSource = "signup" | "contact" | "google" | "manual";

export type LeadStage =
  | "new"
  | "qualified"
  | "demo"
  | "proposal"
  | "won"
  | "lost";

export type TicketPriority = "low" | "normal" | "high" | "urgent";

export type TicketStatus = "open" | "in_progress" | "waiting" | "resolved";

export type CareerStatus = "draft" | "open" | "paused" | "closed";

export type ApplicationStage =
  | "received"
  | "screening"
  | "interview"
  | "offer"
  | "accepted"
  | "rejected"
  | "hired";

export type OfferStatus = "draft" | "active" | "paused" | "expired";

export type DiscountType = "percent" | "amount" | "trial_extension" | "custom";

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
  linkedInUrl: string | null;
  profileConsent: boolean;
  cvFileName: string | null;
  cvStoragePath: string | null;
  cvUrl: string | null;
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

type ModelActivityRow = {
  model_id: string;
  slug: string | null;
  name: string | null;
  views: number;
  last_viewed_at: string;
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

// ======================================================
// VALIDATION ENUM SETS
// ======================================================

const LEAD_SOURCES = new Set<LeadSource>([
  "signup",
  "contact",
  "google",
  "manual",
]);

const LEAD_STAGES = new Set<LeadStage>([
  "new",
  "qualified",
  "demo",
  "proposal",
  "won",
  "lost",
]);

const TICKET_PRIORITIES = new Set<TicketPriority>([
  "low",
  "normal",
  "high",
  "urgent",
]);

const TICKET_STATUSES = new Set<TicketStatus>([
  "open",
  "in_progress",
  "waiting",
  "resolved",
]);

const CAREER_STATUSES = new Set<CareerStatus>([
  "draft",
  "open",
  "paused",
  "closed",
]);

const OFFER_STATUSES = new Set<OfferStatus>([
  "draft",
  "active",
  "paused",
  "expired",
]);

const DISCOUNT_TYPES = new Set<DiscountType>([
  "percent",
  "amount",
  "trial_extension",
  "custom",
]);

const APPLICATION_STAGES = new Set<ApplicationStage>([
  "received",
  "screening",
  "interview",
  "offer",
  "accepted",
  "rejected",
  "hired",
]);

// ======================================================
// STATIC DATA
// ======================================================

const APPROVED_CAREER_ROLES = [
  {
    title: "Developer",
    department: "Engineering",
    location: "Remote",
    hiringManager: "Technology office",
  },
  {
    title: "Investor Relations Manager",
    department: "Investor Relations",
    location: "Remote",
    hiringManager: "CEO office",
  },
  {
    title: "Researcher",
    department: "Research",
    location: "Remote",
    hiringManager: "Research office",
  },
  {
    title: "CEO Quant Researcher",
    department: "Quant Research",
    location: "Remote",
    hiringManager: "CEO office",
  },
] as const;

const TICKET_CATEGORIES = new Set([
  "Operations",
  "Website",
  "Data/API",
  "Model access",
  "Careers",
  "Compliance",
]);

const TICKET_OWNERS = new Set([
  "Operations",
  "Engineering",
  "Research",
  "Investor Relations",
  "Compliance",
  "Unassigned",
]);

// ======================================================
// UTILITY FUNCTIONS
// ======================================================

// generate unique ids
function id(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

// sanitize nullable text
function nullableText(value: unknown, maxLength = 300): string | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();

  return trimmed ? trimmed.slice(0, maxLength) : null;
}

// required text fallback
function requiredText(
  value: unknown,
  fallback: string,
  maxLength = 180,
): string {
  return nullableText(value, maxLength) || fallback;
}

// enum validator
function enumValue<T extends string>(
  value: unknown,
  allowed: Set<T>,
  fallback: T,
): T {
  return typeof value === "string" && allowed.has(value as T)
    ? (value as T)
    : fallback;
}

// allowed text validator
function allowedText(
  value: unknown,
  allowed: Set<string>,
  fallback: string,
): string {
  if (typeof value === "string" && allowed.has(value)) {
    return value;
  }

  if (allowed.has(fallback)) {
    return fallback;
  }

  return Array.from(allowed)[0] || fallback;
}

// date sanitizer
function isoDate(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? fallback : date.toISOString();
}

// future date sanitizer
function futureIsoDate(value: unknown): string | null {
  const text = nullableText(value, 80);

  if (!text) return null;

  const date = new Date(text);

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function optionalUrl(value: unknown, maxLength = 500): string | null {
  const text = nullableText(value, maxLength);
  if (!text) return null;

  try {
    const url = new URL(text);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

// numeric sanitizer
function nonNegativeInteger(value: unknown, fallback = 0): number {
  const numeric = Number(value);

  if (!Number.isFinite(numeric) || numeric < 0) {
    return fallback;
  }

  return Math.floor(numeric);
}

// ======================================================
// SANITIZERS
// ======================================================

function sanitizeLead(
  input: unknown,
  existing?: BackOfficeLead,
): BackOfficeLead {
  const raw =
    input && typeof input === "object"
      ? (input as Record<string, unknown>)
      : {};

  const now = new Date().toISOString();

  return {
    id: existing?.id || (typeof raw.id === "string" ? raw.id : id("lead")),
    name: requiredText(raw.name, existing?.name || ""),
    email: requiredText(
      raw.email,
      existing?.email || "",
    ).toLowerCase(),
    organization:
      nullableText(raw.organization, 180) ?? existing?.organization ?? null,
    source: enumValue(raw.source, LEAD_SOURCES, existing?.source || "manual"),
    interest: nullableText(raw.interest, 300) ?? existing?.interest ?? null,
    modelId: nullableText(raw.modelId, 160) ?? existing?.modelId ?? null,
    stage: enumValue(raw.stage, LEAD_STAGES, existing?.stage || "new"),
    notes: nullableText(raw.notes, 1200) ?? existing?.notes ?? null,
    createdAt: existing?.createdAt || isoDate(raw.createdAt, now),
    updatedAt: now,
  };
}

// ======================================================
// UPSERT LEAD
// ======================================================

export async function upsertLead(input: unknown, leadId?: string) {
  const raw = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const name = nullableText(raw.name, 180);
  const email = nullableText(raw.email, 240);
  if (!name || !email || !email.includes("@")) {
    throw new Error("Lead name and valid email are required");
  }
  const supabaseAdmin = await requireSupabaseAdmin();
  // validate input first
  const nextLead = sanitizeLead(input);

  // postgres payload
  const payload = {
    id: leadId || nextLead.id,
    name: nextLead.name,
    email: nextLead.email,
    organization: nextLead.organization,
    source: nextLead.source,
    interest: nextLead.interest,
    model_id: nextLead.modelId,
    stage: nextLead.stage,
    notes: nextLead.notes,
    created_at: nextLead.createdAt,
    updated_at: nextLead.updatedAt,
  };

  // upsert into supabase
  const { data, error } = await supabaseAdmin
    .from("leads")
    .upsert(payload)
    .select()
    .single();

  if (error) {
    console.error("Lead upsert failed:", error);
    throw error;
  }

  return data;
}

// ======================================================
// SANITIZE TICKET
// ======================================================

function sanitizeTicket(
  input: unknown,
  existing?: InternalTicket,
): InternalTicket {
  const raw =
    input && typeof input === "object"
      ? (input as Record<string, unknown>)
      : {};

  const now = new Date().toISOString();

  return {
    id: existing?.id || (typeof raw.id === "string" ? raw.id : id("ticket")),
    title: requiredText(raw.title, existing?.title || "Internal ticket"),

    description: requiredText(
      raw.description,
      existing?.description || "No description provided.",
      2000,
    ),

    category: allowedText(
      raw.category,
      TICKET_CATEGORIES,
      existing?.category || "Operations",
    ),

    priority: enumValue(
      raw.priority,
      TICKET_PRIORITIES,
      existing?.priority || "normal",
    ),

    status: enumValue(raw.status, TICKET_STATUSES, existing?.status || "open"),

    owner: allowedText(
      raw.owner,
      TICKET_OWNERS,
      existing?.owner || "Unassigned",
    ),

    createdAt: existing?.createdAt || isoDate(raw.createdAt, now),
    updatedAt: now,
  };
}

// ======================================================
// SANITIZE CAREER ROLE
// ======================================================

function approvedCareerRole(value: unknown, fallback?: string) {
  const preferred =
    typeof value === "string"
      ? APPROVED_CAREER_ROLES.find((role) => role.title === value)
      : null;

  const existing = fallback
    ? APPROVED_CAREER_ROLES.find((role) => role.title === fallback)
    : null;

  return preferred || existing || APPROVED_CAREER_ROLES[0];
}

function sanitizeCareerRole(input: unknown, existing?: CareerRole): CareerRole {
  const raw =
    input && typeof input === "object"
      ? (input as Record<string, unknown>)
      : {};

  const now = new Date().toISOString();

  const role = approvedCareerRole(raw.title, existing?.title);

  return {
    id: existing?.id || (typeof raw.id === "string" ? raw.id : id("role")),

    title: role.title,
    department: role.department,
    location: role.location,

    status: enumValue(raw.status, CAREER_STATUSES, existing?.status || "draft"),

    hiringManager: role.hiringManager,

    notes: nullableText(raw.notes, 1400) ?? existing?.notes ?? null,

    createdAt: existing?.createdAt || isoDate(raw.createdAt, now),
    updatedAt: now,
  };
}

// ======================================================
// SANITIZE APPLICATION
// ======================================================

function sanitizeApplication(
  input: unknown,
  existing?: CareerApplication,
): CareerApplication {
  const raw =
    input && typeof input === "object"
      ? (input as Record<string, unknown>)
      : {};

  const now = new Date().toISOString();

  return {
    id: existing?.id || (typeof raw.id === "string" ? raw.id : id("app")),

    roleId: nullableText(raw.roleId, 160) ?? existing?.roleId ?? null,

    candidateName: requiredText(
      raw.candidateName,
      existing?.candidateName || "",
    ),

    email: requiredText(
      raw.email,
      existing?.email || "",
    ).toLowerCase(),

    linkedInUrl:
      optionalUrl(raw.linkedInUrl, 500) ??
      optionalUrl(raw.linkedinUrl, 500) ??
      existing?.linkedInUrl ??
      null,

    profileConsent:
      typeof raw.profileConsent === "boolean"
        ? raw.profileConsent
        : existing?.profileConsent ?? false,

    cvFileName:
      nullableText(raw.cvFileName, 260) ?? existing?.cvFileName ?? null,

    cvStoragePath:
      nullableText(raw.cvStoragePath, 600) ?? existing?.cvStoragePath ?? null,

    cvUrl:
      nullableText(raw.cvUrl, 1000) ?? existing?.cvUrl ?? null,

    stage: enumValue(
      raw.stage,
      APPLICATION_STAGES,
      existing?.stage || "received",
    ),

    source: nullableText(raw.source, 160) ?? existing?.source ?? null,

    createdAt: existing?.createdAt || isoDate(raw.createdAt, now),
    updatedAt: now,
  };
}

// ======================================================
// SANITIZE OFFER
// ======================================================

function sanitizeOffer(
  input: unknown,
  existing?: CommercialOffer,
): CommercialOffer {
  const raw =
    input && typeof input === "object"
      ? (input as Record<string, unknown>)
      : {};

  const now = new Date().toISOString();

  const rawCode = requiredText(
    raw.code,
    existing?.code || "TRIAL",
  ).toUpperCase();

  const code =
    rawCode.replace(/[^A-Z0-9-]/g, "").slice(0, 32) ||
    existing?.code ||
    "TRIAL";

  const trialDays = nonNegativeInteger(
    raw.trialDays,
    existing?.trialDays ?? 14,
  );

  const discountValue = Number(raw.discountValue);

  return {
    id: existing?.id || (typeof raw.id === "string" ? raw.id : id("offer")),

    code,

    title: requiredText(raw.title, existing?.title || "Trial offer"),

    modelId: nullableText(raw.modelId, 160) ?? existing?.modelId ?? null,

    status: enumValue(raw.status, OFFER_STATUSES, existing?.status || "draft"),

    trialDays,

    discountType: enumValue(
      raw.discountType,
      DISCOUNT_TYPES,
      existing?.discountType || "percent",
    ),

    discountValue:
      Number.isFinite(discountValue) && discountValue >= 0
        ? discountValue
        : existing?.discountValue || 0,

    maxRedemptions:
      raw.maxRedemptions === null || raw.maxRedemptions === ""
        ? null
        : nonNegativeInteger(
            raw.maxRedemptions,
            existing?.maxRedemptions ?? 0,
          ) || null,

    redemptions: nonNegativeInteger(
      raw.redemptions,
      existing?.redemptions || 0,
    ),

    expiresAt: futureIsoDate(raw.expiresAt) ?? existing?.expiresAt ?? null,

    notes: nullableText(raw.notes, 1200) ?? existing?.notes ?? null,

    createdAt: existing?.createdAt || isoDate(raw.createdAt, now),
    updatedAt: now,
  };
}

// ======================================================
// UPSERT TICKET
// ======================================================

export async function upsertTicket(input: unknown, ticketId?: string) {
  const supabaseAdmin = await requireSupabaseAdmin();
  const nextTicket = sanitizeTicket(input);

  const payload = {
    id: ticketId || nextTicket.id,
    title: nextTicket.title,
    description: nextTicket.description,
    category: nextTicket.category,
    priority: nextTicket.priority,
    status: nextTicket.status,
    owner: nextTicket.owner,
    created_at: nextTicket.createdAt,
    updated_at: nextTicket.updatedAt,
  };

  const { data, error } = await supabaseAdmin
    .from("tickets")
    .upsert(payload)
    .select()
    .single();

  if (error) {
    console.error("Ticket upsert failed:", error);
    throw error;
  }

  return data;
}

// ======================================================
// UPSERT CAREER ROLE
// ======================================================

export async function upsertCareerRole(input: unknown, roleId?: string) {
  const supabaseAdmin = await requireSupabaseAdmin();
  const nextRole = sanitizeCareerRole(input);

  const payload = {
    id: roleId || nextRole.id,
    title: nextRole.title,
    department: nextRole.department,
    location: nextRole.location,
    status: nextRole.status,
    hiring_manager: nextRole.hiringManager,
    notes: nextRole.notes,
    created_at: nextRole.createdAt,
    updated_at: nextRole.updatedAt,
  };

  const { data, error } = await supabaseAdmin
    .from("career_roles")
    .upsert(payload)
    .select()
    .single();

  if (error) {
    console.error("Career role upsert failed:", error);
    throw error;
  }

  return data;
}

// ======================================================
// UPSERT APPLICATION
// ======================================================

export async function upsertApplication(
  input: unknown,
  applicationId?: string,
) {
  const raw = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const candidateName = nullableText(raw.candidateName, 180);
  const email = nullableText(raw.email, 240);
  if (!candidateName || !email || !email.includes("@")) {
    throw new Error("Candidate name and valid email are required");
  }
  const supabaseAdmin = await requireSupabaseAdmin();
  const nextApplication = sanitizeApplication(input);

  const payload = {
    id: applicationId || nextApplication.id,
    role_id: nextApplication.roleId,
    candidate_name: nextApplication.candidateName,
    email: nextApplication.email,
    linkedin_url: nextApplication.linkedInUrl,
    profile_consent: nextApplication.profileConsent,
    cv_file_name: nextApplication.cvFileName,
    cv_storage_path: nextApplication.cvStoragePath,
    stage: nextApplication.stage,
    source: nextApplication.source,
    created_at: nextApplication.createdAt,
    updated_at: nextApplication.updatedAt,
  };

  const { data, error } = await supabaseAdmin
    .from("applications")
    .upsert(payload)
    .select()
    .single();

  if (error) {
    console.error("Application upsert failed:", error);
    throw error;
  }

  return data;
}

export async function uploadCandidateCv(input: {
  file: File;
  roleId: string;
  email: string;
}) {
  const supabaseAdmin = await requireSupabaseAdmin();
  const fileName = input.file.name.trim();
  const extension = fileName.includes(".") ? fileName.split(".").pop()?.toLowerCase() : "pdf";
  const safeExtension = extension && /^[a-z0-9]{2,8}$/.test(extension) ? extension : "pdf";
  const normalizedEmail = input.email.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const path = `${input.roleId}/${Date.now()}-${normalizedEmail || "candidate"}.${safeExtension}`;
  const buffer = Buffer.from(await input.file.arrayBuffer());

  const { error } = await supabaseAdmin.storage
    .from("candidate-cvs")
    .upload(path, buffer, {
      contentType: input.file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) throw error;

  return {
    cvFileName: fileName,
    cvStoragePath: path,
  };
}

export async function deleteCareerRole(roleId: string) {
  const role = nullableText(roleId, 160);
  if (!role) throw new Error("Career role id is required");

  const supabaseAdmin = await requireSupabaseAdmin();
  const { error } = await supabaseAdmin.from("career_roles").delete().eq("id", role);
  if (error) throw error;
}

// ======================================================
// UPSERT OFFER
// ======================================================

export async function upsertOffer(input: unknown, offerId?: string) {
  const supabaseAdmin = await requireSupabaseAdmin();
  const nextOffer = sanitizeOffer(input);

  const payload = {
    id: offerId || nextOffer.id,
    code: nextOffer.code,
    title: nextOffer.title,
    model_id: nextOffer.modelId,
    status: nextOffer.status,
    trial_days: nextOffer.trialDays,
    discount_type: nextOffer.discountType,
    discount_value: nextOffer.discountValue,
    max_redemptions: nextOffer.maxRedemptions,
    redemptions: nextOffer.redemptions,
    expires_at: nextOffer.expiresAt,
    notes: nextOffer.notes,
    created_at: nextOffer.createdAt,
    updated_at: nextOffer.updatedAt,
  };

  const { data, error } = await supabaseAdmin
    .from("offers")
    .upsert(payload)
    .select()
    .single();

  if (error) {
    console.error("Offer upsert failed:", error);
    throw error;
  }

  return data;
}

// ======================================================
// OFFER VALIDATION
// ======================================================

export function offerIsUsable(offer: CommercialOffer, modelId?: string | null) {
  // must be active
  if (offer.status !== "active") {
    return false;
  }

  // check expiry
  if (offer.expiresAt && new Date(offer.expiresAt).getTime() < Date.now()) {
    return false;
  }

  // check redemption limits
  if (
    offer.maxRedemptions !== null &&
    offer.redemptions >= offer.maxRedemptions
  ) {
    return false;
  }

  // model-specific validation
  if (offer.modelId && modelId && offer.modelId !== modelId) {
    return false;
  }

  return true;
}

// ======================================================
// REDEEM OFFER CODE
// ======================================================

export async function redeemOfferCode(code: unknown, modelId?: string | null) {
  const supabaseAdmin = await requireSupabaseAdmin();
  // sanitize incoming code
  const normalizedCode =
    nullableText(code, 64)
      ?.toUpperCase()
      .replace(/[^A-Z0-9-]/g, "") || "";

  if (!normalizedCode) {
    return null;
  }

  // fetch offer from db
  const { data: offer, error } = await supabaseAdmin
    .from("offers")
    .select("*")
    .eq("code", normalizedCode)
    .single();

  if (error || !offer) {
    return null;
  }

  // validate offer
  if (offer.status !== "active") {
    return null;
  }

  if (offer.expires_at && new Date(offer.expires_at).getTime() < Date.now()) {
    return null;
  }

  if (
    offer.max_redemptions !== null &&
    offer.redemptions >= offer.max_redemptions
  ) {
    return null;
  }

  if (offer.model_id && modelId && offer.model_id !== modelId) {
    return null;
  }

  // increment redemption count
  const updatedAt = new Date().toISOString();

  const nextRedemptions = offer.redemptions + 1;

  const { error: updateError } = await supabaseAdmin
    .from("offers")
    .update({
      redemptions: nextRedemptions,
      updated_at: updatedAt,
    })
    .eq("id", offer.id);

  if (updateError) {
    console.error("Offer redemption failed:", updateError);
    throw updateError;
  }

  return {
    ...offer,
    redemptions: nextRedemptions,
    updated_at: updatedAt,
  };
}

// ======================================================
// RECORD MODEL VIEW
// ======================================================

export async function recordModelView(input: unknown) {
  const supabaseAdmin = await requireSupabaseAdmin();
  const raw =
    input && typeof input === "object"
      ? (input as Record<string, unknown>)
      : {};

  const modelId = nullableText(raw.modelId, 160);

  if (!modelId) {
    return null;
  }

  const now = new Date().toISOString();

  // fetch existing activity row
  const { data: existing } = await supabaseAdmin
    .from("model_activity")
    .select("*")
    .eq("model_id", modelId)
    .single();

  // increment view count
  const payload = {
    model_id: modelId,
    slug: nullableText(raw.slug, 160) ?? existing?.slug ?? null,
    name: nullableText(raw.name, 180) ?? existing?.name ?? null,
    views: (existing?.views || 0) + 1,
    last_viewed_at: now,
  };

  // upsert updated activity
  const { data, error } = await supabaseAdmin
    .from("model_activity")
    .upsert(payload)
    .select()
    .single();

  if (error) {
    console.error("Model activity update failed:", error);
    throw error;
  }

  return data;
}

function mapLead(row: Record<string, unknown>): BackOfficeLead {
  return {
    id: String(row.id),
    name: String(row.name || ""),
    email: String(row.email || ""),
    organization: typeof row.organization === "string" ? row.organization : null,
    source: row.source as LeadSource,
    interest: typeof row.interest === "string" ? row.interest : null,
    modelId: typeof row.model_id === "string" ? row.model_id : null,
    stage: row.stage as LeadStage,
    notes: typeof row.notes === "string" ? row.notes : null,
    createdAt: String(row.created_at || ""),
    updatedAt: String(row.updated_at || ""),
  };
}

function mapTicket(row: Record<string, unknown>): InternalTicket {
  return {
    id: String(row.id),
    title: String(row.title || ""),
    description: String(row.description || ""),
    category: String(row.category || "Operations"),
    priority: row.priority as TicketPriority,
    status: row.status as TicketStatus,
    owner: typeof row.owner === "string" ? row.owner : null,
    createdAt: String(row.created_at || ""),
    updatedAt: String(row.updated_at || ""),
  };
}

function mapCareerRole(row: Record<string, unknown>): CareerRole {
  return {
    id: String(row.id),
    title: String(row.title || ""),
    department: String(row.department || ""),
    location: String(row.location || ""),
    status: row.status as CareerStatus,
    hiringManager: typeof row.hiring_manager === "string" ? row.hiring_manager : null,
    notes: typeof row.notes === "string" ? row.notes : null,
    createdAt: String(row.created_at || ""),
    updatedAt: String(row.updated_at || ""),
  };
}

function mapApplication(row: Record<string, unknown>, cvUrl: string | null): CareerApplication {
  return {
    id: String(row.id),
    roleId: typeof row.role_id === "string" ? row.role_id : null,
    candidateName: String(row.candidate_name || ""),
    email: String(row.email || ""),
    linkedInUrl: typeof row.linkedin_url === "string" ? row.linkedin_url : null,
    profileConsent: Boolean(row.profile_consent),
    cvFileName: typeof row.cv_file_name === "string" ? row.cv_file_name : null,
    cvStoragePath: typeof row.cv_storage_path === "string" ? row.cv_storage_path : null,
    cvUrl,
    stage: row.stage as ApplicationStage,
    source: typeof row.source === "string" ? row.source : null,
    createdAt: String(row.created_at || ""),
    updatedAt: String(row.updated_at || ""),
  };
}

function mapOffer(row: Record<string, unknown>): CommercialOffer {
  return {
    id: String(row.id),
    code: String(row.code || ""),
    title: String(row.title || ""),
    modelId: typeof row.model_id === "string" ? row.model_id : null,
    status: row.status as OfferStatus,
    trialDays: Number(row.trial_days || 0),
    discountType: row.discount_type as DiscountType,
    discountValue: Number(row.discount_value || 0),
    maxRedemptions: row.max_redemptions === null || row.max_redemptions === undefined ? null : Number(row.max_redemptions),
    redemptions: Number(row.redemptions || 0),
    expiresAt: typeof row.expires_at === "string" ? row.expires_at : null,
    notes: typeof row.notes === "string" ? row.notes : null,
    createdAt: String(row.created_at || ""),
    updatedAt: String(row.updated_at || ""),
  };
}

async function signedCvUrl(path: unknown) {
  const cvPath = nullableText(path, 600);
  if (!cvPath) return null;

  try {
    const supabaseAdmin = await requireSupabaseAdmin();
    const { data, error } = await supabaseAdmin.storage
      .from("candidate-cvs")
      .createSignedUrl(cvPath, 60 * 60);

    if (error) return null;
    return data.signedUrl;
  } catch {
    return null;
  }
}

// ======================================================
// READ BACK OFFICE STORE (temporary until we have a real caching layer in place)
// ======================================================

export async function readBackOfficeStore() {
  if (!hasSupabaseAdminConfig()) {
    return {
      version: 1 as const,
      updatedAt: null,
      leads: [] as BackOfficeLead[],
      tickets: [] as InternalTicket[],
      careerRoles: [] as CareerRole[],
      applications: [] as CareerApplication[],
      offers: [] as CommercialOffer[],
      modelActivity: {} as Record<string, ModelActivity>,
    };
  }

  const supabaseAdmin = await requireSupabaseAdmin();
  const [
    leadsResult,
    ticketsResult,
    rolesResult,
    applicationsResult,
    offersResult,
    modelActivityResult,
  ] = await Promise.all([
    supabaseAdmin.from("leads").select("*"),
    supabaseAdmin.from("tickets").select("*"),
    supabaseAdmin.from("career_roles").select("*"),
    supabaseAdmin.from("applications").select("*"),
    supabaseAdmin.from("offers").select("*"),
    supabaseAdmin.from("model_activity").select("*"),
  ]);
  const applicationRows = (applicationsResult.data || []) as Array<Record<string, unknown>>;
  const applications = await Promise.all(
    applicationRows.map(async (row) => mapApplication(row, await signedCvUrl(row.cv_storage_path)))
  );

  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    leads: ((leadsResult.data || []) as Array<Record<string, unknown>>).map(mapLead),
    tickets: ((ticketsResult.data || []) as Array<Record<string, unknown>>).map(mapTicket),
    careerRoles: ((rolesResult.data || []) as Array<Record<string, unknown>>).map(mapCareerRole),
    applications,
    offers: ((offersResult.data || []) as Array<Record<string, unknown>>).map(mapOffer),
    modelActivity: Object.fromEntries(
      ((modelActivityResult.data || []) as ModelActivityRow[]).map((entry) => [
        entry.model_id,
        {
          modelId: entry.model_id,
          slug: entry.slug,
          name: entry.name,
          views: entry.views,
          lastViewedAt: entry.last_viewed_at,
        },
      ]),
    ),
  };
}
