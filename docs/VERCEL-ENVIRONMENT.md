# Vercel environment setup — DIGITAL FUTURE STATE

Configure all variables only in the Vercel project connected to `saiedahm/digital-future-state`. Use Production and Preview environments deliberately; Stripe test-mode keys and test Price IDs must never be mixed with live-mode credentials.

## Public browser configuration

`supabase/config.js` contains the Supabase project URL and publishable key. Publishable keys are designed for browser use; database Row Level Security must still be enabled. Do not copy values from the old NEXORA project.

## Server-only environment variables

Required for authenticated checkout, webhook processing, and support requests:

- `SUPABASE_URL` — dedicated DIGITAL FUTURE STATE project URL.
- `SUPABASE_SERVICE_ROLE_KEY` — secret service-role key; server-side only.
- `APP_ALLOWED_ORIGINS` — comma-separated exact trusted origins, e.g. `https://digital-future-state.vercel.app`. Do not include paths or trailing slashes.
- `STRIPE_SECRET_KEY` — secret API key for the same Stripe mode used by your webhook and Price IDs.
- `STRIPE_WEBHOOK_SECRET` — signing secret for the Stripe destination pointing at `https://digital-future-state.vercel.app/api/stripe-webhook`.

Create five recurring monthly EUR prices in Stripe for the approved amounts, then set the corresponding Price IDs in Vercel:

- `STRIPE_PRICE_499` — €4.99/month
- `STRIPE_PRICE_699` — €6.99/month
- `STRIPE_PRICE_899` — €8.99/month
- `STRIPE_PRICE_1199` — €11.99/month
- `STRIPE_PRICE_1399` — €13.99/month

Each value must be a Stripe Price ID beginning with `price_`. Test-mode Price IDs only work with a test-mode secret key. Do not create or use an unapproved €15.99 price.

Never put service-role keys or Stripe secret keys in `supabase/config.js`, HTML, CSS, browser JavaScript, public GitHub files, screenshots, or chat.

## Database migration

Apply `supabase/migrations/20261010020000_stripe_webhook_idempotency.sql` to the dedicated Supabase project before using the webhook. It creates a server-only event ledger used to avoid processing the same Stripe event more than once. Keep Row Level Security enabled. The subscription table must exist with a unique `provider_subscription_id` and must only be writable by trusted server/webhook code.

## Stripe destination events

Configure the destination URL above and subscribe to these events so the membership lifecycle can be synchronized:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

Keep the signing secret private. If you recreate the Stripe destination, its new signing secret must replace `STRIPE_WEBHOOK_SECRET` in Vercel, then trigger a fresh deployment.

## Release checks

1. Apply and verify the Supabase schema and webhook event migration.
2. Confirm email verification and redirect URLs use the actual production domain.
3. Check the Vercel configuration endpoint `/api/health`; it reports configuration presence only, not working connectivity.
4. Complete a sandbox checkout with a dedicated test account.
5. Confirm the webhook delivery succeeds, the membership row appears for that test user, and repeat event delivery does not duplicate or revert it.
6. Test subscription updates, cancellation, failed invoices, and user isolation before switching to live mode.
7. Complete a production build, browser/mobile tests, and legal review.

An HTTP 200 from a health/configuration endpoint does not prove Stripe or Supabase is functioning. Do not enable live payments until end-to-end tests pass.
