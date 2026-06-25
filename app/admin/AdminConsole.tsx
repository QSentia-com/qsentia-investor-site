'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState, type ReactNode } from 'react';
import useSWR from 'swr';
import {
  AlertCircle,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  CreditCard,
  Eye,
  EyeOff,
  Gauge,
  Inbox,
  KeyRound,
  LineChart,
  LockKeyhole,
  MessageSquarePlus,
  RefreshCw,
  Save,
  Search,
  Settings2,
  SlidersHorizontal,
  UsersRound,
  UploadCloud,
} from 'lucide-react';
import AuthSessionMenu from '@/components/AuthSessionMenu';
import AdminAccessWorkspace from '@/components/admin/AdminAccessWorkspace';
import ApiCommerceWorkspace from '@/components/admin/ApiCommerceWorkspace';
import ModelOnboardingWorkspace from '@/components/admin/ModelOnboardingWorkspace';

type SectionId = 'overview' | 'access' | 'onboarding' | 'models' | 'customers' | 'apiAccess' | 'billing' | 'offers' | 'leads' | 'careers' | 'tickets';
type AccessStatus = 'draft' | 'active' | 'private' | 'waitlist' | 'retired';
type BillingInterval = 'monthly' | 'annual' | 'one_time' | 'custom';
type Visibility = 'public' | 'hidden';
type LeadStage = 'new' | 'qualified' | 'demo' | 'proposal' | 'won' | 'lost';
type LeadSource = 'signup' | 'contact' | 'google' | 'manual';
type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';
type TicketStatus = 'open' | 'in_progress' | 'waiting' | 'resolved';
type CareerStatus = 'draft' | 'open' | 'paused' | 'closed';
type OfferStatus = 'draft' | 'active' | 'paused' | 'expired';
type DiscountType = 'percent' | 'amount' | 'trial_extension' | 'custom';

type AdminSetting = {
  pricing: string | null;
  billingInterval: BillingInterval;
  currency: string;
  setupFee: string | null;
  minimumCapital: string | null;
  accessStatus: AccessStatus;
  visibility: Visibility;
  featured: boolean;
  soldUnits: number;
  trialCount: number;
  salesOwner: string | null;
  onboardingNotes: string | null;
  updatedAt?: string;
};

type AdminModel = {
  id: string;
  slug: string;
  name: string;
  category: string;
  repo: string | null;
  logsPath: string | null;
  performance: {
    sharpeRatio: number | null;
    annualizedReturn: number | null;
    maxDrawdown: number | null;
    winRate: number | null;
  };
  settings: AdminSetting;
  configured: boolean;
  activity: { views: number; lastViewedAt: string } | null;
  sales: {
    soldUnits: number;
    trialCount: number;
    views: number;
    viewedNotPurchased: number;
  };
};

type Lead = {
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

type Ticket = {
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

type CareerRole = {
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

type Application = {
  id: string;
  roleId: string | null;
  candidateName: string;
  email: string;
  stage: string;
  source: string | null;
  createdAt: string;
  updatedAt: string;
};

type Offer = {
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

type AdminOverview = {
  updatedAt: string | null;
  metrics: {
    models: number;
    configuredModels: number;
    activePublicModels: number;
    soldModels: number;
    activeTrials: number;
    modelViews: number;
    viewedNotPurchased: number;
    leads: number;
    qualifiedLeads: number;
    wonLeads: number;
    openTickets: number;
    openRoles: number;
    candidates: number;
    activeOffers: number;
    offerRedemptions: number;
  };
  models: AdminModel[];
  bestPerforming: AdminModel[];
  leads: Lead[];
  tickets: Ticket[];
  careerRoles: CareerRole[];
  applications: Application[];
  offers: Offer[];
};

type ApiError = Error & { status?: number };

const EMPTY_SETTING: AdminSetting = {
  pricing: 'Contact sales',
  billingInterval: 'monthly',
  currency: 'USD',
  setupFee: null,
  minimumCapital: null,
  accessStatus: 'draft',
  visibility: 'public',
  featured: false,
  soldUnits: 0,
  trialCount: 0,
  salesOwner: 'Investor Relations',
  onboardingNotes: null,
};

const sections: Array<{ id: SectionId; label: string; detail: string; icon: ReactNode }> = [
  { id: 'overview', label: 'Overview', detail: 'Commercial and operating health', icon: <Gauge className="h-4 w-4" /> },
  { id: 'access', label: 'Access control', detail: 'Admins, invites, and role grants', icon: <LockKeyhole className="h-4 w-4" /> },
  { id: 'onboarding', label: 'Model onboarding', detail: 'Research submission, review, and publication', icon: <UploadCloud className="h-4 w-4" /> },
  { id: 'models', label: 'Models & pricing', detail: 'Catalog, access, and licensing', icon: <CircleDollarSign className="h-4 w-4" /> },
  { id: 'customers', label: 'Customers', detail: 'Accounts, plans, and renewals', icon: <Building2 className="h-4 w-4" /> },
  { id: 'apiAccess', label: 'API access', detail: 'Entitlements, keys, and quotas', icon: <KeyRound className="h-4 w-4" /> },
  { id: 'billing', label: 'Billing', detail: 'Revenue and payment operations', icon: <CreditCard className="h-4 w-4" /> },
  { id: 'offers', label: 'Offers', detail: 'Trials and discount controls', icon: <KeyRound className="h-4 w-4" /> },
  { id: 'leads', label: 'CRM', detail: 'Pipeline and account interest', icon: <UsersRound className="h-4 w-4" /> },
  { id: 'careers', label: 'Careers', detail: 'Open roles and candidates', icon: <BriefcaseBusiness className="h-4 w-4" /> },
  { id: 'tickets', label: 'Service desk', detail: 'Internal issues and requests', icon: <MessageSquarePlus className="h-4 w-4" /> },
];

const accessOptions: Array<{ value: AccessStatus; label: string }> = [
  { value: 'active', label: 'Active' },
  { value: 'private', label: 'Private' },
  { value: 'waitlist', label: 'Waitlist' },
  { value: 'draft', label: 'Draft' },
  { value: 'retired', label: 'Retired' },
];

const billingOptions: Array<{ value: BillingInterval; label: string }> = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual' },
  { value: 'one_time', label: 'One-time' },
  { value: 'custom', label: 'Custom' },
];

const leadStages: LeadStage[] = ['new', 'qualified', 'demo', 'proposal', 'won', 'lost'];
const ticketStatuses: TicketStatus[] = ['open', 'in_progress', 'waiting', 'resolved'];
const ticketPriorities: TicketPriority[] = ['low', 'normal', 'high', 'urgent'];
const careerStatuses: CareerStatus[] = ['draft', 'open', 'paused', 'closed'];
const offerStatuses: OfferStatus[] = ['draft', 'active', 'paused', 'expired'];
const discountTypes: DiscountType[] = ['percent', 'amount', 'trial_extension', 'custom'];
const currencyOptions = ['USD', 'INR', 'EUR', 'GBP', 'SGD', 'AED'];
const approvedCareerRoles = [
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
const ticketCategories = ['Operations', 'Website', 'Data/API', 'Model access', 'Careers', 'Compliance'] as const;
const ticketOwners = ['Operations', 'Engineering', 'Research', 'Investor Relations', 'Compliance', 'Unassigned'] as const;
const leadInterests = ['Model licensing', 'Investor diligence', 'Dashboard access', 'Research terminal', 'Partnership', 'Support'] as const;
const pricingLabels = ['Contact sales', 'Custom quote', 'Trial access', 'Enterprise plan'] as const;
const commercialOwners = ['Investor Relations', 'Research', 'Engineering', 'CEO office', 'Operations'] as const;

async function adminFetcher(url: string) {
  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const error = new Error(payload.error || `Request failed: ${response.status}`) as ApiError;
    error.status = response.status;
    throw error;
  }

  return response.json();
}

function labelFromToken(value: string | null | undefined) {
  if (!value) return 'Not configured';
  return value
    .split(/[-_]/g)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function compactText(value: string | null | undefined, fallback = 'Not configured') {
  return value && value.trim() ? value : fallback;
}

function formatNumber(value: number | null | undefined) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '0';
  return value.toLocaleString('en-US');
}

function formatRatio(value: number | null | undefined) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'N/A';
  return value.toFixed(2);
}

function formatPct(value: number | null | undefined, signed = false) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'N/A';
  const prefix = signed && value > 0 ? '+' : '';
  return `${prefix}${(value * 100).toFixed(2)}%`;
}

function shortDate(value: string | null | undefined) {
  if (!value) return 'No timestamp';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No timestamp';
  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

function settingForEdit(setting: AdminSetting | undefined): AdminSetting {
  return { ...EMPTY_SETTING, ...(setting || {}) };
}

function statusClasses(status: string) {
  if (['active', 'won', 'open'].includes(status)) return 'border-[#a7e8cc] bg-[#ecfdf5] text-[#047857]';
  if (['private', 'proposal', 'in_progress'].includes(status)) return 'border-[#c7d2fe] bg-[#eef2ff] text-[#3046c8]';
  if (['waitlist', 'demo', 'waiting', 'paused', 'high'].includes(status)) return 'border-[#fde68a] bg-[#fffbeb] text-[#a16207]';
  if (['retired', 'lost', 'closed', 'resolved', 'urgent'].includes(status)) return 'border-[#fecdd3] bg-[#fff1f2] text-[#be123c]';
  return 'border-[#d9e0ec] bg-[#f8fafc] text-[#46554b]';
}

export default function AdminConsole({ initialData = null }: { initialData?: AdminOverview | null }) {
  const [activeSection, setActiveSection] = useState<SectionId>('overview');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modelQuery, setModelQuery] = useState('');
  const [draftState, setDraftState] = useState<{ modelId: string | null; setting: AdminSetting }>({
    modelId: null,
    setting: EMPTY_SETTING,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [leadForm, setLeadForm] = useState<{
    name: string;
    email: string;
    organization: string;
    interest: string;
    source: LeadSource;
  }>({
    name: '',
    email: '',
    organization: '',
    interest: leadInterests[0],
    source: 'manual' as LeadSource,
  });
  const defaultCareerRole = approvedCareerRoles[0];
  const [roleForm, setRoleForm] = useState<{
    title: string;
    department: string;
    location: string;
    status: CareerStatus;
    hiringManager: string;
  }>({
    title: defaultCareerRole.title,
    department: defaultCareerRole.department,
    location: defaultCareerRole.location,
    status: 'draft' as CareerStatus,
    hiringManager: defaultCareerRole.hiringManager,
  });
  const [offerForm, setOfferForm] = useState({
    code: '',
    title: '',
    modelId: '',
    status: 'draft' as OfferStatus,
    trialDays: 14,
    discountType: 'percent' as DiscountType,
    discountValue: 0,
    maxRedemptions: '',
    expiresAt: '',
    notes: '',
  });
  const [ticketForm, setTicketForm] = useState<{
    title: string;
    category: string;
    priority: TicketPriority;
    owner: string;
    description: string;
  }>({
    title: '',
    category: ticketCategories[0],
    priority: 'normal' as TicketPriority,
    owner: ticketOwners[0],
    description: '',
  });

  const { data, error, isLoading, mutate } = useSWR<AdminOverview>(
    '/api/admin/overview',
    adminFetcher,
    { fallbackData: initialData || undefined, shouldRetryOnError: false }
  );

  const models = useMemo(() => data?.models || [], [data?.models]);
  const showInitialLoading = isLoading && !data;
  const selectedModel = models.find((model) => model.id === selectedId) || models[0] || null;
  const draft =
    selectedModel && draftState.modelId === selectedModel.id
      ? draftState.setting
      : settingForEdit(selectedModel?.settings);

  const filteredModels = models.filter((model) => {
    const query = modelQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      model.name.toLowerCase().includes(query) ||
      model.id.toLowerCase().includes(query) ||
      model.category.toLowerCase().includes(query) ||
      (model.repo || '').toLowerCase().includes(query)
    );
  });

  const activeSectionMeta = sections.find((section) => section.id === activeSection) || sections[0];

  function updateDraft<K extends keyof AdminSetting>(field: K, value: AdminSetting[K]) {
    if (!selectedModel) return;

    setDraftState((current) => ({
      modelId: selectedModel.id,
      setting: {
        ...(current.modelId === selectedModel.id
          ? current.setting
          : settingForEdit(selectedModel.settings)),
        [field]: value,
      },
    }));
  }

  async function saveModelSettings() {
    if (!selectedModel) return;
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/model-settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelId: selectedModel.id,
          settings: draft,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || `Save failed: ${response.status}`);
      }

      setMessage({ tone: 'success', text: 'Model settings saved.' });
      await mutate();
    } catch (saveError) {
      setMessage({
        tone: 'error',
        text: saveError instanceof Error ? saveError.message : 'Unable to save model settings.',
      });
    } finally {
      setSaving(false);
    }
  }

  async function writeBackOfficeRecord(
    type: 'lead' | 'ticket' | 'careerRole' | 'application' | 'offer',
    payload: unknown,
    id?: string
  ) {
    const response = await fetch('/api/admin/back-office', {
      method: id ? 'PATCH' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, id, payload }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || 'Back-office update failed');
    }

    await mutate();
  }

  async function createLead() {
    if (!leadForm.name.trim() || !leadForm.email.trim()) {
      setMessage({ tone: 'error', text: 'Lead name and email are required.' });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      await writeBackOfficeRecord('lead', leadForm);
      setLeadForm({ name: '', email: '', organization: '', interest: leadInterests[0], source: 'manual' });
      setMessage({ tone: 'success', text: 'Lead created.' });
    } catch (createError) {
      setMessage({
        tone: 'error',
        text: createError instanceof Error ? createError.message : 'Unable to create lead.',
      });
    } finally {
      setSaving(false);
    }
  }

  async function createCareerRole() {
    if (!roleForm.title.trim()) {
      setMessage({ tone: 'error', text: 'Role title is required.' });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      await writeBackOfficeRecord('careerRole', roleForm);
      setRoleForm({
        title: defaultCareerRole.title,
        department: defaultCareerRole.department,
        location: defaultCareerRole.location,
        status: 'draft',
        hiringManager: defaultCareerRole.hiringManager,
      });
      setMessage({ tone: 'success', text: 'Career role created.' });
    } catch (createError) {
      setMessage({
        tone: 'error',
        text: createError instanceof Error ? createError.message : 'Unable to create career role.',
      });
    } finally {
      setSaving(false);
    }
  }

  async function createOffer() {
    if (!offerForm.code.trim() || !offerForm.title.trim()) {
      setMessage({ tone: 'error', text: 'Offer code and title are required.' });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      await writeBackOfficeRecord('offer', {
        ...offerForm,
        modelId: offerForm.modelId || null,
        maxRedemptions: offerForm.maxRedemptions ? Number(offerForm.maxRedemptions) : null,
      });
      setOfferForm({
        code: '',
        title: '',
        modelId: '',
        status: 'draft',
        trialDays: 14,
        discountType: 'percent',
        discountValue: 0,
        maxRedemptions: '',
        expiresAt: '',
        notes: '',
      });
      setMessage({ tone: 'success', text: 'Trial or discount code created.' });
    } catch (createError) {
      setMessage({
        tone: 'error',
        text: createError instanceof Error ? createError.message : 'Unable to create offer code.',
      });
    } finally {
      setSaving(false);
    }
  }

  async function createTicket() {
    if (!ticketForm.title.trim() || !ticketForm.description.trim()) {
      setMessage({ tone: 'error', text: 'Ticket title and description are required.' });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      await writeBackOfficeRecord('ticket', ticketForm);
      setTicketForm({
        title: '',
        category: ticketCategories[0],
        priority: 'normal',
        owner: ticketOwners[0],
        description: '',
      });
      setMessage({ tone: 'success', text: 'Ticket raised.' });
    } catch (createError) {
      setMessage({
        tone: 'error',
        text: createError instanceof Error ? createError.message : 'Unable to create ticket.',
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="admin-portal min-h-screen bg-[#f4f6fa] text-[#0f172a]">
      <div className="mx-auto min-h-screen max-w-[1720px] md:grid md:grid-cols-[236px_minmax(0,1fr)] xl:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="flex flex-col border-b border-[#1d2942] bg-[#0b1220] p-4 text-white md:sticky md:top-0 md:min-h-screen md:self-start md:border-b-0 md:border-r">
          <div className="flex items-center gap-3 border-b border-white/10 pb-5">
            <Link href="/" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white" aria-label="QSentia home">
              <Image src="/logo/qsentia-primary.png" alt="QSentia" width={27} height={27} className="h-7 w-7 object-contain" />
            </Link>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white">QSentia</div>
              <div className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#8ea0ff]">Administration</div>
            </div>
          </div>

          <div className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#73809d]">Workspace</div>
          <nav className="mt-3 grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-1" aria-label="Admin sections">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => {
                  setActiveSection(section.id);
                  setMessage(null);
                }}
                className={`flex min-h-10 w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition ${
                  activeSection === section.id
                    ? 'bg-white/10 text-white'
                    : 'text-[#bac4d8] hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${activeSection === section.id ? 'bg-[#3d52da] text-white' : 'bg-[#131e32] text-[#9dacff]'}`}>
                  {section.icon}
                </span>
                <span className="min-w-0 truncate text-[13px] font-semibold">{section.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-5 grid gap-1 border-t border-white/10 pt-4 md:mt-auto">
            <div className="flex items-center gap-2 px-2 py-2 text-xs font-semibold text-[#cbd5e1]">
                <LockKeyhole className="h-4 w-4 text-[#9dacff]" />
                Admin role verified
            </div>
            <Link href="/" className="inline-flex items-center justify-between rounded-md px-2 py-2 text-xs font-semibold text-[#dbe4ff] hover:bg-white/5">
              Public site
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="sticky top-0 z-40 border-b border-[#dfe5f2] bg-white/95 backdrop-blur">
            <div className="flex min-h-16 flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between xl:px-8">
              <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#647269]">Operations workspace</div>
                <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h1 className="text-xl font-semibold text-[#0f172a]">{activeSectionMeta.label}</h1>
                  <span className="text-sm text-[#647269]">{activeSectionMeta.detail}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden text-xs text-[#647269] lg:block">Updated {shortDate(data?.updatedAt)}</span>
                <AuthSessionMenu />
              </div>
            </div>
          </header>

          <div className="min-w-0 p-4 sm:p-6 xl:p-8">
            {error && (
              <StatusMessage tone="error">
                {(error as ApiError).message || 'Admin data could not be loaded.'}
              </StatusMessage>
            )}
            {message && <StatusMessage tone={message.tone}>{message.text}</StatusMessage>}

            {showInitialLoading && (
              <WorkspacePanel title="Loading operations" icon={<RefreshCw className="h-4 w-4 animate-spin" />}>
                <div className="grid gap-3 md:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="h-28 animate-pulse rounded-md border border-[#dfe5f2] bg-[#f8faff]" />
                  ))}
                </div>
              </WorkspacePanel>
            )}

            {data && activeSection === 'overview' && (
              <>
                <OverviewSection data={data} onRefresh={() => void mutate()} />
                <ApiCommerceWorkspace view="summary" models={data.models.map(({ id, name }) => ({ id, name }))} />
              </>
            )}

            {activeSection === 'access' && <AdminAccessWorkspace />}

            {data && activeSection === 'models' && (
            <ModelsSection
              draft={draft}
              filteredModels={filteredModels}
              modelQuery={modelQuery}
              onModelQuery={setModelQuery}
              onRefresh={() => void mutate()}
              onSave={saveModelSettings}
              onSelectModel={(id) => {
                setSelectedId(id);
                setMessage(null);
              }}
              onUpdateDraft={updateDraft}
              saving={saving}
              selectedModel={selectedModel}
            />
            )}

            {activeSection === 'onboarding' && <ModelOnboardingWorkspace />}

            {data && activeSection === 'offers' && (
            <OffersSection
              models={data.models}
              offerForm={offerForm}
              offers={data.offers}
              onCreate={createOffer}
              onForm={setOfferForm}
              onUpdateOffer={(offer, status) =>
                writeBackOfficeRecord('offer', { ...offer, status }, offer.id).catch((updateError) =>
                  setMessage({
                    tone: 'error',
                    text: updateError instanceof Error ? updateError.message : 'Unable to update offer.',
                  })
                )
              }
              saving={saving}
            />
            )}

            {data && activeSection === 'customers' && (
              <ApiCommerceWorkspace view="customers" models={data.models.map(({ id, name }) => ({ id, name }))} />
            )}

            {data && activeSection === 'apiAccess' && (
              <ApiCommerceWorkspace view="apiAccess" models={data.models.map(({ id, name }) => ({ id, name }))} />
            )}

            {data && activeSection === 'billing' && (
              <ApiCommerceWorkspace view="billing" models={data.models.map(({ id, name }) => ({ id, name }))} />
            )}

            {data && activeSection === 'leads' && (
            <LeadsSection
              leadForm={leadForm}
              leads={data.leads}
              onCreate={createLead}
              onForm={setLeadForm}
              onUpdateLead={(lead, stage) =>
                writeBackOfficeRecord('lead', { ...lead, stage }, lead.id).catch((updateError) =>
                  setMessage({
                    tone: 'error',
                    text: updateError instanceof Error ? updateError.message : 'Unable to update lead.',
                  })
                )
              }
              saving={saving}
            />
            )}

            {data && activeSection === 'careers' && (
            <CareersSection
              applications={data.applications}
              onCreate={createCareerRole}
              onForm={setRoleForm}
              roleForm={roleForm}
              roles={data.careerRoles}
              saving={saving}
            />
            )}

            {data && activeSection === 'tickets' && (
            <TicketsSection
              onCreate={createTicket}
              onForm={setTicketForm}
              onUpdateTicket={(ticket, status) =>
                writeBackOfficeRecord('ticket', { ...ticket, status }, ticket.id).catch((updateError) =>
                  setMessage({
                    tone: 'error',
                    text: updateError instanceof Error ? updateError.message : 'Unable to update ticket.',
                  })
                )
              }
              saving={saving}
              ticketForm={ticketForm}
              tickets={data.tickets}
            />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function OverviewSection({ data, onRefresh }: { data: AdminOverview; onRefresh: () => void }) {
  const metrics = data.metrics;
  const funnel = [
    { label: 'Views', value: metrics.modelViews },
    { label: 'Viewed, not purchased', value: metrics.viewedNotPurchased },
    { label: 'Trials', value: metrics.activeTrials },
    { label: 'Sold licenses', value: metrics.soldModels },
  ];

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={<LineChart className="h-5 w-5" />} label="Model views" value={formatNumber(metrics.modelViews)} helper="Tracked from model profile pages" />
        <MetricCard icon={<EyeOff className="h-5 w-5" />} label="Viewed, not bought" value={formatNumber(metrics.viewedNotPurchased)} helper="Views minus configured sold licenses" />
        <MetricCard icon={<CircleDollarSign className="h-5 w-5" />} label="Models sold" value={formatNumber(metrics.soldModels)} helper="Configured in model commerce" />
        <MetricCard icon={<KeyRound className="h-5 w-5" />} label="Active codes" value={formatNumber(metrics.activeOffers)} helper="Published trial and discount codes" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <WorkspacePanel
          title="Model performance ranking"
          icon={<Gauge className="h-4 w-4" />}
          action={
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#647269]">
                {data.bestPerforming.length} models
              </span>
              <button type="button" onClick={onRefresh} className="admin-secondary-button">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          }
        >
          {data.bestPerforming.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-[#647269]">
                  <tr>
                    <th className="pb-3">Model</th>
                    <th className="pb-3">Sharpe</th>
                    <th className="pb-3">Return</th>
                    <th className="pb-3">Drawdown</th>
                    <th className="pb-3">Sold</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e7fb]">
                  {data.bestPerforming.map((model) => (
                    <tr key={model.id}>
                      <td className="py-3 font-semibold text-[#0f172a]">{model.name}</td>
                      <td className="py-3 text-[#172554]">{formatRatio(model.performance.sharpeRatio)}</td>
                      <td className="py-3 text-[#65f0dc]">{formatPct(model.performance.annualizedReturn, true)}</td>
                      <td className="py-3 text-[#fda4af]">{formatPct(model.performance.maxDrawdown, true)}</td>
                      <td className="py-3 text-[#172554]">{formatNumber(model.sales.soldUnits)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyPanel title="No model performance rows" body="The model API has not returned comparison metrics yet." />
          )}
        </WorkspacePanel>

        <WorkspacePanel title="Commercial funnel" icon={<SlidersHorizontal className="h-4 w-4" />}>
          <div className="grid gap-3">
            {funnel.map((row) => (
              <div key={row.label} className="flex items-center justify-between rounded-md border border-[#dfe5f2] bg-[#f8fafc] px-4 py-3">
                <span className="text-sm text-[#46554b]">{row.label}</span>
                <span className="text-xl font-semibold text-[#0f172a]">{formatNumber(row.value)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <MiniStat label="Leads" value={metrics.leads} />
            <MiniStat label="Qualified" value={metrics.qualifiedLeads} />
            <MiniStat label="Open roles" value={metrics.openRoles} />
            <MiniStat label="Candidates" value={metrics.candidates} />
            <MiniStat label="Code uses" value={metrics.offerRedemptions} />
            <MiniStat label="Open tickets" value={metrics.openTickets} />
          </div>
        </WorkspacePanel>
      </div>
    </div>
  );
}

function ModelsSection({
  draft,
  filteredModels,
  modelQuery,
  onModelQuery,
  onRefresh,
  onSave,
  onSelectModel,
  onUpdateDraft,
  saving,
  selectedModel,
}: {
  draft: AdminSetting;
  filteredModels: AdminModel[];
  modelQuery: string;
  onModelQuery: (value: string) => void;
  onRefresh: () => void;
  onSave: () => void;
  onSelectModel: (id: string) => void;
  onUpdateDraft: <K extends keyof AdminSetting>(field: K, value: AdminSetting[K]) => void;
  saving: boolean;
  selectedModel: AdminModel | null;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[410px_minmax(0,1fr)]">
      <WorkspacePanel
        title="Model registry"
        icon={<Settings2 className="h-4 w-4" />}
        action={
          <button type="button" onClick={onRefresh} className="admin-icon-button" aria-label="Refresh models">
            <RefreshCw className="h-4 w-4" />
          </button>
        }
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#62708f]" />
          <input
            type="text"
            value={modelQuery}
            onChange={(event) => onModelQuery(event.target.value)}
            placeholder="Search model, category, or repo"
            className="admin-input pl-10"
          />
        </div>
        <div className="mt-4 max-h-[720px] overflow-y-auto pr-1">
          {filteredModels.length ? (
            filteredModels.map((model) => (
              <button
                key={model.id}
                type="button"
                onClick={() => onSelectModel(model.id)}
                className={`mb-2 w-full rounded-md border p-3 text-left transition ${
                  selectedModel?.id === model.id
                    ? 'border-[#3d52da] bg-[#eef2ff]'
                    : 'border-[#dfe5f2] bg-white hover:border-[#aab8eb]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-[#0f172a]">{model.name}</div>
                    <div className="mt-1 truncate text-xs text-[#647269]">{model.id}</div>
                  </div>
                  {model.settings.visibility === 'hidden' ? (
                    <EyeOff className="h-4 w-4 shrink-0 text-[#647269]" />
                  ) : (
                    <Eye className="h-4 w-4 shrink-0 text-[#3d52da]" />
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Chip tone={model.settings.accessStatus}>{model.settings.accessStatus}</Chip>
                  <Chip>{formatNumber(model.sales.views)} views</Chip>
                  <Chip>{formatNumber(model.sales.soldUnits)} sold</Chip>
                </div>
              </button>
            ))
          ) : (
            <EmptyPanel title="No matching models" body="Try a broader registry search." />
          )}
        </div>
      </WorkspacePanel>

      {selectedModel ? (
        <div className="grid gap-6">
          <WorkspacePanel
            title={selectedModel.name}
            icon={<CircleDollarSign className="h-4 w-4" />}
            action={
              <button type="button" onClick={onSave} disabled={saving} className="admin-primary-button">
                <Save className="h-4 w-4" />
                {saving ? 'Saving' : 'Save'}
              </button>
            }
          >
            <div className="grid gap-4 md:grid-cols-3">
              <MiniStat label="Profile views" value={selectedModel.sales.views} />
              <MiniStat label="Viewed, not purchased" value={selectedModel.sales.viewedNotPurchased} />
              <MiniStat label="Sold licenses" value={draft.soldUnits} />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="grid gap-4">
                <Field label="Public pricing label">
                  <select
                    value={draft.pricing || pricingLabels[0]}
                    onChange={(event) => onUpdateDraft('pricing', event.target.value || null)}
                    className="admin-input"
                  >
                    {pricingLabels.map((label) => (
                      <option key={label} value={label}>{label}</option>
                    ))}
                  </select>
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Currency">
                    <select
                      value={draft.currency}
                      onChange={(event) => onUpdateDraft('currency', event.target.value)}
                      className="admin-input"
                    >
                      {currencyOptions.map((currency) => (
                        <option key={currency} value={currency}>{currency}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Billing interval">
                    <select
                      value={draft.billingInterval}
                      onChange={(event) => onUpdateDraft('billingInterval', event.target.value as BillingInterval)}
                      className="admin-input"
                    >
                      {billingOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Setup fee">
                    <input
                      type="number"
                      min={0}
                      step={100}
                      value={draft.setupFee || ''}
                      onChange={(event) => onUpdateDraft('setupFee', event.target.value || null)}
                      className="admin-input"
                      placeholder="Optional"
                    />
                  </Field>
                  <Field label="Minimum capital">
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={draft.minimumCapital || ''}
                      onChange={(event) => onUpdateDraft('minimumCapital', event.target.value || null)}
                      className="admin-input"
                      placeholder="Optional"
                    />
                  </Field>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Access status">
                    <select
                      value={draft.accessStatus}
                      onChange={(event) => onUpdateDraft('accessStatus', event.target.value as AccessStatus)}
                      className="admin-input"
                    >
                      {accessOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Visibility">
                    <select
                      value={draft.visibility}
                      onChange={(event) => onUpdateDraft('visibility', event.target.value as Visibility)}
                      className="admin-input"
                    >
                      <option value="public">Public</option>
                      <option value="hidden">Hidden</option>
                    </select>
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Sold licenses">
                    <input
                      type="number"
                      min={0}
                      value={draft.soldUnits}
                      onChange={(event) => onUpdateDraft('soldUnits', Number(event.target.value))}
                      className="admin-input"
                    />
                  </Field>
                  <Field label="Active trials">
                    <input
                      type="number"
                      min={0}
                      value={draft.trialCount}
                      onChange={(event) => onUpdateDraft('trialCount', Number(event.target.value))}
                      className="admin-input"
                    />
                  </Field>
                </div>
                <Field label="Sales owner">
                  <select
                    value={draft.salesOwner || commercialOwners[0]}
                    onChange={(event) => onUpdateDraft('salesOwner', event.target.value || null)}
                    className="admin-input"
                  >
                    {commercialOwners.map((owner) => (
                      <option key={owner} value={owner}>{owner}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              <label className="flex items-center gap-3 rounded-md border border-[#dfe5f2] bg-[#f8fafc] p-3 text-sm font-semibold text-[#172554]">
                <input
                  type="checkbox"
                  checked={draft.featured}
                  onChange={(event) => onUpdateDraft('featured', event.target.checked)}
                  className="h-4 w-4 border-[#cbd5e1] accent-[#3d52da]"
                />
                Feature this model in marketplace ordering and commercial review.
              </label>
              <Field label="Internal onboarding notes">
                <textarea
                  value={draft.onboardingNotes || ''}
                  onChange={(event) => onUpdateDraft('onboardingNotes', event.target.value || null)}
                  maxLength={700}
                  rows={4}
                  className="admin-input resize-none"
                  placeholder="Eligibility, contracts, deployment, or follow-up notes"
                />
              </Field>
            </div>
          </WorkspacePanel>
        </div>
      ) : (
        <WorkspacePanel title="Model setup" icon={<Settings2 className="h-4 w-4" />}>
          <EmptyPanel title="No model selected" body="Load the live registry to configure model commerce." />
        </WorkspacePanel>
      )}
    </div>
  );
}

function OffersSection({
  models,
  offerForm,
  offers,
  onCreate,
  onForm,
  onUpdateOffer,
  saving,
}: {
  models: AdminModel[];
  offerForm: {
    code: string;
    title: string;
    modelId: string;
    status: OfferStatus;
    trialDays: number;
    discountType: DiscountType;
    discountValue: number;
    maxRedemptions: string;
    expiresAt: string;
    notes: string;
  };
  offers: Offer[];
  onCreate: () => void;
  onForm: (value: {
    code: string;
    title: string;
    modelId: string;
    status: OfferStatus;
    trialDays: number;
    discountType: DiscountType;
    discountValue: number;
    maxRedemptions: string;
    expiresAt: string;
    notes: string;
  }) => void;
  onUpdateOffer: (offer: Offer, status: OfferStatus) => void;
  saving: boolean;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
      <WorkspacePanel title="Create trial or discount code" icon={<KeyRound className="h-4 w-4" />}>
        <div className="grid gap-4">
          <Field label="Code">
            <input
              className="admin-input uppercase"
              value={offerForm.code}
              onChange={(event) => onForm({ ...offerForm, code: event.target.value.toUpperCase() })}
              placeholder="QSENTIA-TRIAL"
            />
          </Field>
          <Field label="Title">
            <input
              className="admin-input"
              value={offerForm.title}
              onChange={(event) => onForm({ ...offerForm, title: event.target.value })}
              placeholder="Institutional trial offer"
            />
          </Field>
          <Field label="Applies to model">
            <select
              className="admin-input"
              value={offerForm.modelId}
              onChange={(event) => onForm({ ...offerForm, modelId: event.target.value })}
            >
              <option value="">All public models</option>
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Status">
              <select
                className="admin-input"
                value={offerForm.status}
                onChange={(event) => onForm({ ...offerForm, status: event.target.value as OfferStatus })}
              >
                {offerStatuses.map((status) => (
                  <option key={status} value={status}>{labelFromToken(status)}</option>
                ))}
              </select>
            </Field>
            <Field label="Trial days">
              <input
                className="admin-input"
                type="number"
                min={0}
                value={offerForm.trialDays}
                onChange={(event) => onForm({ ...offerForm, trialDays: Number(event.target.value) })}
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Discount type">
              <select
                className="admin-input"
                value={offerForm.discountType}
                onChange={(event) => onForm({ ...offerForm, discountType: event.target.value as DiscountType })}
              >
                {discountTypes.map((type) => (
                  <option key={type} value={type}>{labelFromToken(type)}</option>
                ))}
              </select>
            </Field>
            <Field label="Discount value">
              <input
                className="admin-input"
                type="number"
                min={0}
                value={offerForm.discountValue}
                onChange={(event) => onForm({ ...offerForm, discountValue: Number(event.target.value) })}
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Max redemptions">
              <input
                className="admin-input"
                type="number"
                min={0}
                value={offerForm.maxRedemptions}
                onChange={(event) => onForm({ ...offerForm, maxRedemptions: event.target.value })}
                placeholder="Unlimited"
              />
            </Field>
            <Field label="Expires">
              <input
                className="admin-input"
                type="date"
                value={offerForm.expiresAt}
                onChange={(event) => onForm({ ...offerForm, expiresAt: event.target.value })}
              />
            </Field>
          </div>
          <Field label="Internal notes">
            <textarea
              className="admin-input resize-none"
              rows={4}
              value={offerForm.notes}
              onChange={(event) => onForm({ ...offerForm, notes: event.target.value })}
              placeholder="Eligibility, campaign, or sales notes"
            />
          </Field>
          <button type="button" onClick={onCreate} disabled={saving} className="admin-primary-button justify-center">
            <Save className="h-4 w-4" />
            Create code
          </button>
        </div>
      </WorkspacePanel>

      <WorkspacePanel title="Published code register" icon={<ClipboardList className="h-4 w-4" />}>
        {offers.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-[#647269]">
                <tr>
                  <th className="pb-3">Code</th>
                  <th className="pb-3">Offer</th>
                  <th className="pb-3">Model</th>
                  <th className="pb-3">Terms</th>
                  <th className="pb-3">Uses</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e7fb]">
                {offers.map((offer) => {
                  const model = models.find((candidate) => candidate.id === offer.modelId);
                  return (
                    <tr key={offer.id}>
                    <td className="py-3 font-mono font-semibold text-[#0f172a]">{offer.code}</td>
                      <td className="py-3">
                        <div className="font-semibold text-[#0f172a]">{offer.title}</div>
                        <div className="mt-1 text-xs text-[#647269]">Expires: {offer.expiresAt ? shortDate(offer.expiresAt) : 'No expiry'}</div>
                      </td>
                    <td className="py-3 text-[#172554]">{model?.name || 'All models'}</td>
                    <td className="py-3 text-[#172554]">
                        {offer.trialDays} trial days, {labelFromToken(offer.discountType)} {offer.discountValue}
                      </td>
                    <td className="py-3 text-[#172554]">
                        {formatNumber(offer.redemptions)} / {offer.maxRedemptions ?? 'Unlimited'}
                      </td>
                      <td className="py-3">
                        <select
                          value={offer.status}
                          onChange={(event) => onUpdateOffer(offer, event.target.value as OfferStatus)}
                          className="admin-compact-select"
                        >
                          {offerStatuses.map((status) => (
                            <option key={status} value={status}>{labelFromToken(status)}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyPanel title="No trial or discount codes" body="Create a code here, then prospects can use it from model trial requests." />
        )}
      </WorkspacePanel>
    </div>
  );
}

function LeadsSection({
  leadForm,
  leads,
  onCreate,
  onForm,
  onUpdateLead,
  saving,
}: {
  leadForm: { name: string; email: string; organization: string; interest: string; source: LeadSource };
  leads: Lead[];
  onCreate: () => void;
  onForm: (value: { name: string; email: string; organization: string; interest: string; source: LeadSource }) => void;
  onUpdateLead: (lead: Lead, stage: LeadStage) => void;
  saving: boolean;
}) {
  const stageCounts = leadStages.map((stage) => ({
    stage,
    count: leads.filter((lead) => lead.stage === stage).length,
  }));

  return (
    <div className="grid gap-6">
      <div className="grid gap-3 md:grid-cols-6">
        {stageCounts.map((row) => (
          <MiniStat key={row.stage} label={labelFromToken(row.stage)} value={row.count} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <WorkspacePanel title="Create lead" icon={<UsersRound className="h-4 w-4" />}>
          <div className="grid gap-4">
            <Field label="Name">
              <input className="admin-input" maxLength={80} value={leadForm.name} onChange={(event) => onForm({ ...leadForm, name: event.target.value })} />
            </Field>
            <Field label="Email">
              <input className="admin-input" maxLength={120} type="email" value={leadForm.email} onChange={(event) => onForm({ ...leadForm, email: event.target.value })} />
            </Field>
            <Field label="Organization">
              <input className="admin-input" maxLength={120} value={leadForm.organization} onChange={(event) => onForm({ ...leadForm, organization: event.target.value })} />
            </Field>
            <Field label="Interest">
              <select className="admin-input" value={leadForm.interest} onChange={(event) => onForm({ ...leadForm, interest: event.target.value })}>
                {leadInterests.map((interest) => (
                  <option key={interest} value={interest}>{interest}</option>
                ))}
              </select>
            </Field>
            <Field label="Source">
              <select className="admin-input" value={leadForm.source} onChange={(event) => onForm({ ...leadForm, source: event.target.value as LeadSource })}>
                <option value="manual">Manual</option>
                <option value="signup">Signup</option>
                <option value="contact">Contact</option>
                <option value="google">Google</option>
              </select>
            </Field>
            <button type="button" onClick={onCreate} disabled={saving} className="admin-primary-button justify-center">
              <Save className="h-4 w-4" />
              Add lead
            </button>
          </div>
        </WorkspacePanel>

        <WorkspacePanel title="CRM pipeline" icon={<ClipboardList className="h-4 w-4" />}>
          {leads.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-[#647269]">
                  <tr>
                    <th className="pb-3">Contact</th>
                    <th className="pb-3">Source</th>
                    <th className="pb-3">Interest</th>
                    <th className="pb-3">Stage</th>
                    <th className="pb-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e7fb]">
                  {leads.map((lead) => (
                    <tr key={lead.id}>
                      <td className="py-3">
                        <div className="font-semibold text-[#0f172a]">{lead.name}</div>
                        <div className="text-xs text-[#647269]">{lead.email}</div>
                        {lead.organization && <div className="text-xs text-[#647269]">{lead.organization}</div>}
                      </td>
                      <td className="py-3"><Chip>{labelFromToken(lead.source)}</Chip></td>
                      <td className="py-3 text-[#172554]">{compactText(lead.interest)}</td>
                      <td className="py-3">
                        <select
                          value={lead.stage}
                          onChange={(event) => onUpdateLead(lead, event.target.value as LeadStage)}
                          className="admin-compact-select"
                        >
                          {leadStages.map((stage) => (
                            <option key={stage} value={stage}>{labelFromToken(stage)}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 text-[#647269]">{shortDate(lead.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyPanel title="No leads yet" body="Signup, contact, Google, or manual leads will appear here when captured." />
          )}
        </WorkspacePanel>
      </div>
    </div>
  );
}

function CareersSection({
  applications,
  onCreate,
  onForm,
  roleForm,
  roles,
  saving,
}: {
  applications: Application[];
  onCreate: () => void;
  onForm: (value: { title: string; department: string; location: string; status: CareerStatus; hiringManager: string }) => void;
  roleForm: { title: string; department: string; location: string; status: CareerStatus; hiringManager: string };
  roles: CareerRole[];
  saving: boolean;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
      <WorkspacePanel title="Career role setup" icon={<BriefcaseBusiness className="h-4 w-4" />}>
        <div className="grid gap-4">
          <Field label="Role title">
            <select
              className="admin-input"
              value={roleForm.title}
              onChange={(event) => {
                const role = approvedCareerRoles.find((candidate) => candidate.title === event.target.value) || approvedCareerRoles[0];
                onForm({
                  ...roleForm,
                  title: role.title,
                  department: role.department,
                  location: role.location,
                  hiringManager: role.hiringManager,
                });
              }}
            >
              {approvedCareerRoles.map((role) => (
                <option key={role.title} value={role.title}>{role.title}</option>
              ))}
            </select>
          </Field>
          <LockedField label="Department" value={roleForm.department} />
          <LockedField label="Location" value={roleForm.location} />
          <Field label="Status">
            <select className="admin-input" value={roleForm.status} onChange={(event) => onForm({ ...roleForm, status: event.target.value as CareerStatus })}>
              {careerStatuses.map((status) => (
                <option key={status} value={status}>{labelFromToken(status)}</option>
              ))}
            </select>
          </Field>
          <LockedField label="Hiring owner" value={roleForm.hiringManager} />
          <button type="button" onClick={onCreate} disabled={saving} className="admin-primary-button justify-center">
            <Save className="h-4 w-4" />
            Add role
          </button>
        </div>
      </WorkspacePanel>

      <div className="grid gap-6">
        <WorkspacePanel title="Open role board" icon={<BriefcaseBusiness className="h-4 w-4" />}>
          {roles.length ? (
            <div className="grid gap-3">
              {roles.map((role) => (
                <div key={role.id} className="rounded-md border border-[#dfe5f2] bg-[#f8fafc] p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="font-semibold text-[#0f172a]">{role.title}</div>
                      <div className="mt-1 text-sm text-[#647269]">{role.department} - {role.location}</div>
                    </div>
                    <Chip tone={role.status}>{labelFromToken(role.status)}</Chip>
                  </div>
                  <div className="mt-3 text-xs text-[#647269]">Hiring manager: {compactText(role.hiringManager)}</div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyPanel title="No career roles configured" body="Add roles here before publishing or recruiting." />
          )}
        </WorkspacePanel>

        <WorkspacePanel title="Applications" icon={<Inbox className="h-4 w-4" />}>
          {applications.length ? (
            <div className="grid gap-3">
              {applications.map((application) => (
                <div key={application.id} className="rounded-md border border-[#dfe5f2] bg-[#f8fafc] p-4">
                  <div className="font-semibold text-[#0f172a]">{application.candidateName}</div>
                  <div className="mt-1 text-sm text-[#647269]">{application.email}</div>
                  <div className="mt-3"><Chip tone={application.stage}>{labelFromToken(application.stage)}</Chip></div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyPanel title="No applications captured" body="Candidate records will appear here when a careers intake is connected." />
          )}
        </WorkspacePanel>
      </div>
    </div>
  );
}

function TicketsSection({
  onCreate,
  onForm,
  onUpdateTicket,
  saving,
  ticketForm,
  tickets,
}: {
  onCreate: () => void;
  onForm: (value: { title: string; category: string; priority: TicketPriority; owner: string; description: string }) => void;
  onUpdateTicket: (ticket: Ticket, status: TicketStatus) => void;
  saving: boolean;
  ticketForm: { title: string; category: string; priority: TicketPriority; owner: string; description: string };
  tickets: Ticket[];
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
      <WorkspacePanel title="Raise internal ticket" icon={<MessageSquarePlus className="h-4 w-4" />}>
        <div className="grid gap-4">
          <Field label="Title">
            <input className="admin-input" maxLength={120} value={ticketForm.title} onChange={(event) => onForm({ ...ticketForm, title: event.target.value })} placeholder="Issue or request" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category">
              <select className="admin-input" value={ticketForm.category} onChange={(event) => onForm({ ...ticketForm, category: event.target.value })}>
                {ticketCategories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </Field>
            <Field label="Priority">
              <select className="admin-input" value={ticketForm.priority} onChange={(event) => onForm({ ...ticketForm, priority: event.target.value as TicketPriority })}>
                {ticketPriorities.map((priority) => (
                  <option key={priority} value={priority}>{labelFromToken(priority)}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Owner">
            <select className="admin-input" value={ticketForm.owner} onChange={(event) => onForm({ ...ticketForm, owner: event.target.value })}>
              {ticketOwners.map((owner) => (
                <option key={owner} value={owner}>{owner}</option>
              ))}
            </select>
          </Field>
          <Field label="Description">
            <textarea className="admin-input resize-none" maxLength={600} rows={5} value={ticketForm.description} onChange={(event) => onForm({ ...ticketForm, description: event.target.value })} placeholder="What needs attention?" />
          </Field>
          <button type="button" onClick={onCreate} disabled={saving} className="admin-primary-button justify-center">
            <MessageSquarePlus className="h-4 w-4" />
            Raise ticket
          </button>
        </div>
      </WorkspacePanel>

      <WorkspacePanel title="Internal communication queue" icon={<ClipboardList className="h-4 w-4" />}>
        {tickets.length ? (
          <div className="grid gap-3">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="rounded-md border border-[#dfe5f2] bg-[#f8fafc] p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="font-semibold text-[#0f172a]">{ticket.title}</div>
                    <div className="mt-1 text-sm text-[#647269]">{ticket.category} - {shortDate(ticket.createdAt)}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Chip tone={ticket.priority}>{labelFromToken(ticket.priority)}</Chip>
                    <select
                      value={ticket.status}
                      onChange={(event) => onUpdateTicket(ticket, event.target.value as TicketStatus)}
                      className="admin-compact-select"
                    >
                      {ticketStatuses.map((status) => (
                        <option key={status} value={status}>{labelFromToken(status)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-[#46554b]">{ticket.description}</p>
                <div className="mt-3 text-xs text-[#647269]">Owner: {compactText(ticket.owner)}</div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyPanel title="No internal tickets" body="Raise operational, support, data, or website tickets here." />
        )}
      </WorkspacePanel>
    </div>
  );
}

function MetricCard({ helper, icon, label, value }: { helper: string; icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md border border-[#dfe5f2] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#eef2ff] text-[#3d52da]">
          {icon}
        </span>
        <span className="text-3xl font-semibold text-[#0f172a]">{value}</span>
      </div>
      <div className="mt-4 text-xs font-bold uppercase tracking-wide text-[#647269]">{label}</div>
      <p className="mt-2 text-sm leading-5 text-[#647269]">{helper}</p>
    </div>
  );
}

function WorkspacePanel({
  action,
  children,
  icon,
  title,
}: {
  action?: ReactNode;
  children: ReactNode;
  icon: ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-md border border-[#dfe5f2] bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#eef2ff] text-[#3d52da]">
            {icon}
          </span>
          <h2 className="text-lg font-semibold text-[#0f172a]">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Field({ children, label }: { children: ReactNode; label: string }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold uppercase tracking-wide text-[#647269]">{label}</span>
      {children}
    </label>
  );
}

function LockedField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-2">
      <span className="text-xs font-bold uppercase tracking-wide text-[#647269]">{label}</span>
      <div className="rounded-md border border-[#d9e0ec] bg-[#f8fafc] px-3 py-2.5 text-sm font-semibold text-[#172554]">
        {value}
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-[#dfe5f2] bg-[#f8fafc] p-4">
      <div className="text-xs font-bold uppercase tracking-wide text-[#647269]">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-[#0f172a]">{formatNumber(value)}</div>
    </div>
  );
}

function Chip({ children, tone }: { children: ReactNode; tone?: string }) {
  return (
    <span className={`inline-flex rounded-md border px-2 py-1 text-[11px] font-bold uppercase tracking-wide ${statusClasses(tone || '')}`}>
      {children}
    </span>
  );
}

function EmptyPanel({ body, title }: { body: string; title: string }) {
  return (
    <div className="rounded-md border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-6 text-center">
      <div className="font-semibold text-[#0f172a]">{title}</div>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#647269]">{body}</p>
    </div>
  );
}

function StatusMessage({ children, tone }: { children: ReactNode; tone: 'success' | 'error' }) {
  return (
    <div
      className={`mb-5 flex items-start gap-2 rounded-md border p-3 text-sm leading-5 ${
        tone === 'success'
          ? 'border-[#a7e8cc] bg-[#ecfdf5] text-[#047857]'
          : 'border-[#fecdd3] bg-[#fff1f2] text-[#be123c]'
      }`}
    >
      {tone === 'success' ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
      ) : (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      )}
      <span>{children}</span>
    </div>
  );
}
