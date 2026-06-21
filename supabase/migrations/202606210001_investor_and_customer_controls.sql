create table if not exists public.investor_requests (
  id uuid primary key,
  name text not null,
  email text not null,
  organization text not null,
  investor_type text not null,
  ticket_size text not null,
  qualification text not null,
  strategy_interest text not null,
  timeline text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.customer_controls (
  customer_id text primary key,
  broker_provider text not null default 'none',
  broker_status text not null default 'not_connected',
  execution_mode text not null default 'disabled',
  kill_switch boolean not null default true,
  schedule text not null default 'manual',
  timezone text not null default 'UTC',
  approval_policy text not null default 'manual',
  confidence_floor numeric,
  max_daily_loss_pct numeric,
  max_notional numeric,
  max_contracts integer,
  stale_quote_seconds integer,
  email_alerts boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.investor_requests enable row level security;
alter table public.customer_controls enable row level security;

revoke all on public.investor_requests from anon, authenticated;
revoke all on public.customer_controls from anon, authenticated;
