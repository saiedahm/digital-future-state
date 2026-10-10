-- DIGITAL FUTURE STATE: private profile-photo storage setup.
-- Run once in the Supabase SQL Editor for the dedicated DIGITAL FUTURE STATE project.
-- This does not make profile photos public. Each signed-in user can access only files
-- stored beneath their own auth.uid() folder.

insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', false)
on conflict (id) do update set public = false;

drop policy if exists "dfs_profile_photos_select_own" on storage.objects;
create policy "dfs_profile_photos_select_own"
on storage.objects for select
to authenticated
using (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "dfs_profile_photos_insert_own" on storage.objects;
create policy "dfs_profile_photos_insert_own"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "dfs_profile_photos_update_own" on storage.objects;
create policy "dfs_profile_photos_update_own"
on storage.objects for update
to authenticated
using (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "dfs_profile_photos_delete_own" on storage.objects;
create policy "dfs_profile_photos_delete_own"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);
