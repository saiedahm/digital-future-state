-- DIGITAL FUTURE STATE: remove the unapproved €13.99 amount from future membership records.
-- No checkout is active. Existing historical rows, if any, are not rewritten by this migration.
alter table public.memberships
  drop constraint if exists memberships_amount_cents_check;

alter table public.memberships
  add constraint memberships_amount_cents_check
  check (amount_cents in (499, 699, 899, 1199, 1599)) not valid;

-- Intentionally no payment-provider or active-entitlement changes here.
