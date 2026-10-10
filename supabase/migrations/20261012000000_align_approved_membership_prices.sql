-- Align the database membership amount allowlist with the approved display prices.
-- The prototype has no active checkout; this migration does not activate or charge subscriptions.
alter table public.memberships
  drop constraint if exists memberships_amount_cents_check;

alter table public.memberships
  add constraint memberships_amount_cents_check
  check (amount_cents in (499, 699, 899, 1199, 1399)) not valid;

-- Validate existing rows only after confirming there are no unapproved historical amounts.
-- Do not enable payments until checkout and signed webhook processing are implemented and tested.
