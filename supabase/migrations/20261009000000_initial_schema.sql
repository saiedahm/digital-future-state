-- DIGITAL FUTURE STATE initial Supabase schema.
-- Apply only to the dedicated DIGITAL FUTURE STATE Supabase project.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 80),
  country text not null default '' check (char_length(country) <= 60),
  birth_date date,
  profile_type text not null default 'Global Pass'
    check (profile_type in ('Global Pass','Visitor Pass','Premium Pass','Professional Pass','Business Pass','Organization Pass')),
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

create index if not exists requests_user_created_idx on public.requests(user_id, created_at desc);
create index if not exists memberships_user_status_idx on public.memberships(user_id, status);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
drop trigger if exists requests_set_updated_at on public.requests;
create trigger requests_set_updated_at before update on public.requests
for each row execute function public.set_updated_at();
drop trigger if exists memberships_set_updated_at on public.memberships;
create trigger memberships_set_updated_at before update on public.memberships
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.requests enable row level security;
alter table public.memberships enable row level security;

revoke all on table public.profiles, public.requests, public.memberships from anon, authenticated;
grant select, insert, update on table public.profiles to authenticated;
grant select, insert on table public.requests to authenticated;
grant select on table public.memberships to authenticated;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists requests_select_own on public.requests;
create policy requests_select_own on public.requests for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists requests_insert_own on public.requests;
create policy requests_insert_own on public.requests for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists memberships_select_own on public.memberships;
create policy memberships_select_own on public.memberships for select to authenticated using ((select auth.uid()) = user_id);

-- Private profile photo bucket, limited to 2 MiB and common image types.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-photos', 'profile-photos', false, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false, file_size_limit = 2097152,
  allowed_mime_types = array['image/jpeg','image/png','image/webp'];

drop policy if exists profile_photos_read_own on storage.objects;
create policy profile_photos_read_own on storage.objects for select to authenticated
using (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists profile_photos_insert_own on storage.objects;
create policy profile_photos_insert_own on storage.objects for insert to authenticated
with check (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists profile_photos_update_own on storage.objects;
create policy profile_photos_update_own on storage.objects for update to authenticated
using (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists profile_photos_delete_own on storage.objects;
create policy profile_photos_delete_own on storage.objects for delete to authenticated
using (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- No client-side policy allows membership writes. Trusted payment server/webhook only.
