create table if not exists public.api_customers (
  id text primary key,
  organization text not null,
  primary_contact text not null,
  email text not null,
  plan text not null check (plan in ('Starter', 'Professional', 'Institutional', 'Enterprise')),
  status text not null check (status in ('trial', 'active', 'past_due', 'suspended', 'cancelled')),
  billing_status text not null check (billing_status in ('trial', 'current', 'past_due', 'manual_invoice', 'cancelled')),
  billing_cycle text not null check (billing_cycle in ('monthly', 'annual', 'custom')),
  currency text not null,
  monthly_revenue numeric(14, 2) not null default 0 check (monthly_revenue >= 0),
  seats integer not null default 1 check (seats > 0),
  renewal_at timestamptz,
  sales_owner text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.model_entitlements (
  id text primary key,
  customer_id text not null references public.api_customers(id) on delete cascade,
  model_id text not null,
  environment text not null check (environment in ('sandbox', 'paper', 'live')),
  scope text not null check (scope in ('signals', 'read_only', 'paper_execution', 'live_execution')),
  status text not null check (status in ('pending', 'active', 'suspended', 'expired')),
  request_limit bigint not null default 10000 check (request_limit > 0),
  requests_used bigint not null default 0 check (requests_used >= 0),
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (customer_id, model_id, environment)
);

create table if not exists public.api_credentials (
  id text primary key,
  customer_id text not null references public.api_customers(id) on delete cascade,
  label text not null,
  key_prefix text not null,
  key_hash text not null unique,
  environment text not null check (environment in ('sandbox', 'paper', 'live')),
  status text not null check (status in ('active', 'revoked', 'expired')),
  last_used_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.commerce_audit_events (
  id text primary key,
  action text not null,
  entity_type text not null check (entity_type in ('customer', 'entitlement', 'api_key')),
  entity_id text not null,
  detail text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.model_submissions (
  id text primary key,
  model_id text not null,
  name text not null,
  description text not null,
  repo text not null,
  branch text not null,
  logs_path text not null,
  asset_class text not null,
  broker text not null,
  delivery_mode text not null,
  submitted_by text not null,
  status text not null check (status in ('submitted', 'technical_review', 'risk_review', 'approved', 'published', 'rejected')),
  color text not null,
  starting_capital numeric(18, 2),
  validation_passed boolean not null default false,
  validation_message text,
  validated_at timestamptz,
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists model_submissions_active_model_idx
  on public.model_submissions(model_id)
  where status <> 'rejected';

create table if not exists public.model_submission_events (
  id text primary key,
  submission_id text not null references public.model_submissions(id) on delete cascade,
  action text not null,
  detail text not null,
  created_at timestamptz not null default now()
);

create index if not exists api_customers_status_idx on public.api_customers(status);
create index if not exists model_entitlements_customer_idx on public.model_entitlements(customer_id);
create index if not exists api_credentials_customer_idx on public.api_credentials(customer_id);
create index if not exists commerce_audit_events_created_idx on public.commerce_audit_events(created_at desc);
create index if not exists model_submissions_status_idx on public.model_submissions(status);
create index if not exists model_submission_events_created_idx on public.model_submission_events(created_at desc);

alter table public.api_customers enable row level security;
alter table public.model_entitlements enable row level security;
alter table public.api_credentials enable row level security;
alter table public.commerce_audit_events enable row level security;
alter table public.model_submissions enable row level security;
alter table public.model_submission_events enable row level security;

revoke all on public.api_customers from anon, authenticated;
revoke all on public.model_entitlements from anon, authenticated;
revoke all on public.api_credentials from anon, authenticated;
revoke all on public.commerce_audit_events from anon, authenticated;
revoke all on public.model_submissions from anon, authenticated;
revoke all on public.model_submission_events from anon, authenticated;
