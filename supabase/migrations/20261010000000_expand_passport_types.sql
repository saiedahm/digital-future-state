-- DIGITAL FUTURE STATE: align profile types with the six passport choices shown in the site.
-- Apply this migration in the dedicated Supabase project after the initial schema migration.
alter table public.profiles drop constraint if exists profiles_profile_type_check;
alter table public.profiles
  add constraint profiles_profile_type_check
  check (profile_type in ('Global Pass','Visitor Pass','Citizen / Resident','Organization / State','Diplomat','Business Executive'));

-- Keep the photo bucket private and enforce per-user folders.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-photos', 'profile-photos', false, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = false,
  file_size_limit = 2097152,
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
