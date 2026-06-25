-- QSentia customer dashboard and API commerce schema
-- Paste this into the Supabase SQL editor.
-- No sample, mock, or dummy rows are inserted by this script.
-- The application reads these tables through server-side API routes using the service role key.

begin;

create table if not exists public.api_customers (
  id text primary key,
  organization text not null,
  primary_contact text not null,
  email text not null,
  plan text not null check (plan in ('Starter', 'Professional', 'Institutional', 'Enterprise')),
  status text not null check (status in ('trial', 'active', 'past_due', 'suspended', 'cancelled')),
  billing_status text not null check (billing_status in ('trial', 'current', 'past_due', 'manual_invoice', 'cancelled')),
  billing_cycle text not null check (billing_cycle in ('monthly', 'annual', 'custom')),
  currency text not null default 'USD',
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

create table if not exists public.customer_controls (
  customer_id text primary key references public.api_customers(id) on delete cascade,
  broker_provider text not null default 'none' check (broker_provider in ('none', 'IBKR', 'Alpaca')),
  broker_status text not null default 'not_connected' check (broker_status in ('not_connected', 'onboarding_requested')),
  execution_mode text not null default 'disabled' check (execution_mode in ('disabled', 'paper', 'live')),
  kill_switch boolean not null default true,
  schedule text not null default 'manual' check (schedule in ('manual', 'hourly', 'daily', 'weekdays')),
  timezone text not null default 'UTC' check (timezone in ('UTC', 'Asia/Kolkata', 'America/New_York', 'Europe/London')),
  approval_policy text not null default 'manual' check (approval_policy in ('manual', 'risk_gated')),
  confidence_floor numeric check (confidence_floor is null or (confidence_floor >= 0 and confidence_floor <= 1)),
  max_daily_loss_pct numeric check (max_daily_loss_pct is null or (max_daily_loss_pct >= 0.01 and max_daily_loss_pct <= 100)),
  max_notional numeric check (max_notional is null or max_notional >= 1),
  max_contracts integer check (max_contracts is null or max_contracts >= 1),
  stale_quote_seconds integer check (stale_quote_seconds is null or (stale_quote_seconds >= 1 and stale_quote_seconds <= 3600)),
  email_alerts boolean not null default true,
  updated_at timestamptz not null default now()
);

create index if not exists api_customers_email_idx on public.api_customers(lower(email));
create index if not exists api_customers_status_idx on public.api_customers(status);
create index if not exists model_entitlements_customer_idx on public.model_entitlements(customer_id);
create index if not exists model_entitlements_model_idx on public.model_entitlements(model_id);
create index if not exists api_credentials_customer_idx on public.api_credentials(customer_id);
create index if not exists commerce_audit_events_entity_idx on public.commerce_audit_events(entity_type, entity_id);
create index if not exists commerce_audit_events_created_idx on public.commerce_audit_events(created_at desc);

alter table public.api_customers enable row level security;
alter table public.model_entitlements enable row level security;
alter table public.api_credentials enable row level security;
alter table public.commerce_audit_events enable row level security;
alter table public.customer_controls enable row level security;

revoke all on public.api_customers from anon, authenticated;
revoke all on public.model_entitlements from anon, authenticated;
revoke all on public.api_credentials from anon, authenticated;
revoke all on public.commerce_audit_events from anon, authenticated;
revoke all on public.customer_controls from anon, authenticated;

grant all on public.api_customers to service_role;
grant all on public.model_entitlements to service_role;
grant all on public.api_credentials to service_role;
grant all on public.commerce_audit_events to service_role;
grant all on public.customer_controls to service_role;

commit;
