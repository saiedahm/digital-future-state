-- Allow an authenticated user to delete only their own saved profile row.
-- The associated Auth account remains intact; this does not delete the login identity.
grant delete on table public.profiles to authenticated;
drop policy if exists profiles_delete_own on public.profiles;
create policy profiles_delete_own
  on public.profiles
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
