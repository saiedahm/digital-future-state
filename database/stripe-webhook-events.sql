-- DIGITAL FUTURE STATE: Stripe webhook event ledger.
-- Run in the intended Supabase project's SQL Editor before enabling Stripe webhooks.
-- The table is private to trusted server-side service-role code; it is not exposed to users.
create table if not exists public.stripe_webhook_events (
  event_id text primary key check (event_id ~ '^evt_[A-Za-z0-9]+$'),
  event_type text not null check (char_length(event_type) between 1 and 120),
  processed_at timestamptz not null default now()
);

alter table public.stripe_webhook_events enable row level security;
revoke all on table public.stripe_webhook_events from anon, authenticated;
grant select, insert on table public.stripe_webhook_events to service_role;

-- Keep the browser-facing roles unable to write subscription entitlements.
revoke insert, update, delete on table public.memberships from anon, authenticated;
