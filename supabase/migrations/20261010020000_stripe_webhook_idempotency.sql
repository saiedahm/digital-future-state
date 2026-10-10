-- Stripe webhook event deduplication for DIGITAL FUTURE STATE.
-- Apply this migration to the dedicated Supabase project before enabling paid plans.
create table if not exists public.stripe_webhook_events (
  event_id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);

alter table public.stripe_webhook_events enable row level security;
revoke all on public.stripe_webhook_events from anon, authenticated;
-- The table is accessed only by the server using the Supabase service-role key.
