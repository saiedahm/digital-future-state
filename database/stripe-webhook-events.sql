-- DIGITAL FUTURE STATE: Stripe webhook event ledger.
-- Apply in the intended Supabase project's SQL Editor before enabling Stripe webhooks.
-- The unique event ID provides an atomic claim; status prevents acknowledging an event
-- that another request is still processing. Failed processing releases the claim for retry.
create table if not exists public.stripe_webhook_events (
  event_id text primary key check (event_id ~ '^evt_[A-Za-z0-9]+$'),
  event_type text not null check (char_length(event_type) between 1 and 120),
  status text not null default 'processing' check (status in ('processing','processed')),
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

alter table public.stripe_webhook_events
  add column if not exists status text not null default 'processing';
alter table public.stripe_webhook_events
  add column if not exists created_at timestamptz not null default now();
alter table public.stripe_webhook_events
  add column if not exists processed_at timestamptz;

alter table public.stripe_webhook_events enable row level security;
revoke all on table public.stripe_webhook_events from anon, authenticated;
grant select, insert, update, delete on table public.stripe_webhook_events to service_role;

-- Keep browser-facing roles unable to write subscription entitlements.
revoke insert, update, delete on table public.memberships from anon, authenticated;
