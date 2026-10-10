# Production readiness — DIGITAL FUTURE STATE

## Implemented in repository

- Static landing page, directory, passport-style platform-profile preview and informational legal pages.
- Supabase browser client and account/profile UI.
- Server-side Stripe Checkout endpoint with session validation, plan allowlist, live Stripe Price verification and duplicate-subscription guard.
- Stripe webhook raw-body signature verification, five-minute timestamp tolerance, trusted subscription lookup, membership upsert and event deduplication ledger.
- Stripe Billing Portal endpoint and account UI for viewing membership status and opening billing management.
- Configuration-presence health endpoint and setup documentation.

## Must be configured and verified before live launch

- Apply all Supabase migrations in the dedicated project, including the webhook event ledger; confirm the membership table and unique subscription-ID constraint.
- Set server-only `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `APP_ALLOWED_ORIGINS`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` and all five `STRIPE_PRICE_*` values in Vercel.
- Confirm the Supabase email/redirect configuration and test authentication.
- Create the five approved monthly EUR Prices in the same Stripe mode as the secret key and webhook; confirm each Price ID maps to its approved amount.
- Configure the Stripe Billing Portal, including cancellation and payment-method settings.
- Subscribe the webhook to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid` and `invoice.payment_failed`.
- Complete sandbox checkout and test valid/invalid signatures, duplicate events, subscription updates, failed invoices, cancellation and membership isolation across two user accounts.
- Verify profile save/load, photo upload/deletion, request intake and the actual production domain in a real browser.
- Add rate limiting/abuse controls, request retention and monitoring.
- Replace legal draft placeholders with verified operator details and legal review.

## Safety rule

Checkout and webhook code are present, but correct environment values and applied migrations have not been confirmed from the code repository alone. A deployment marked Ready does not mean payments work. Do not enable live charges until end-to-end test-mode verification is complete.
