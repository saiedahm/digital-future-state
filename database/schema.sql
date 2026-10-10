-- DIGITAL FUTURE STATE database scaffold for Supabase/PostgreSQL.
-- Apply only after reviewing in a non-production project. Authentication is handled by Supabase Auth.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 80),
  country text not null default '' check (char_length(country) <= 60),
  birth_date date,
  profile_type text not null default 'Global Pass'
    check (profile_type in ('Global Pass','Visitor Pass','Citizen / Resident','Organization / State','Diplomat','Business Executive')),
  photo_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  category text not null check (category in ('complaint','service_request','technical','privacy','suggestion','other')),
  subject text not null check (char_length(subject) between 1 and 160),
  message text not null check (char_length(message) between 1 and 10000),
  status text not null default 'received' check (status in ('received','in_review','waiting_for_user','resolved','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_code text not null check (plan_code in ('essential','plus','premium','professional','business','organization')),
  amount_cents integer not null check (amount_cents in (499,699,899,1199,1399,1599)),
  currency char(3) not null default 'EUR' check (currency = 'EUR'),
  billing_interval text not null default 'month' check (billing_interval = 'month'),
  provider_customer_id text,
  provider_subscription_id text unique,
  status text not null default 'pending' check (status in ('pending','active','past_due','canceled','incomplete')),
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.requests enable row level security;
alter table public.memberships enable row level security;

-- Users can only read/write their own profile. Never expose service-role keys in browser code.
create policy "profiles_select_own" on public.profiles for select to authenticated using (auth.uid() = user_id);
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (auth.uid() = user_id);
create policy "profiles_update_own" on public.profiles for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "requests_select_own" on public.requests for select to authenticated using (auth.uid() = user_id);
create policy "requests_insert_own" on public.requests for insert to authenticated with check (auth.uid() = user_id);
create policy "memberships_select_own" on public.memberships for select to authenticated using (auth.uid() = user_id);
-- Membership rows must be written by trusted server/webhook code, not directly by users.
revoke insert, update, delete on public.memberships from anon, authenticated;
