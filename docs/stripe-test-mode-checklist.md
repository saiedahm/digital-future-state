# Stripe test-mode release checklist

This checklist documents the current server-side Stripe integration. It does not mean that Stripe credentials or webhooks are already configured.

## Environment variables

Set these in the hosting provider's server-side environment settings, for the intended deployment environment:

- `STRIPE_SECRET_KEY`: use a Stripe **test-mode** secret while validating.
- `STRIPE_WEBHOOK_SECRET`: signing secret for the webhook endpoint configured below.
- `STRIPE_PRICE_499`, `STRIPE_PRICE_699`, `STRIPE_PRICE_899`, `STRIPE_PRICE_1199`, `STRIPE_PRICE_1399`: active recurring EUR Price IDs matching €4.99, €6.99, €8.99, €11.99 and €13.99 per month.
- `SUPABASE_URL`: the project's Supabase URL.
- `SUPABASE_SERVICE_ROLE_KEY`: private service-role key; server-side only.
- `APP_ALLOWED_ORIGINS`: comma-separated exact origins allowed to start checkout, for example `https://YOUR-PRODUCTION-DOMAIN`.

Do not put any secret in `supabase/config.js`, HTML, frontend JavaScript, a public issue, or a Git commit. Never use a live Stripe secret with test Price IDs, or vice versa.

## Webhook

Configure the Stripe webhook destination as:

`https://YOUR-PRODUCTION-DOMAIN/api/stripe-webhook`

Use the matching test-mode signing secret for `STRIPE_WEBHOOK_SECRET`. The current `api/stripe-webhook.js` handles these event types:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`
- `invoice.paid`

Before enabling this endpoint, apply the migration `supabase/migrations/20261010020000_stripe_webhook_idempotency.sql` to the correct Supabase project and confirm that the `stripe_webhook_events` table exists. Also apply the remaining migrations required by the README and verify the membership table schema.

## End-to-end test before launch

1. Sign in using a dedicated test account.
2. Select each plan in test mode and verify Stripe displays the expected monthly EUR price.
3. Complete a sandbox payment and inspect Stripe webhook delivery for a successful response.
4. Verify the correct authenticated user's membership is saved with the expected plan and status.
5. Deliver the same event again and verify the endpoint acknowledges it as a duplicate without repeating the membership effect.
6. Test cancellation, subscription updates, failed invoice payments, and access changes.
7. Repeat with a second test user and verify account data remains isolated.
8. Confirm checkout fails closed when any required setting is missing or a Price ID does not match the approved plan.

A green deployment is not proof that these tests passed. Keep payments in test mode until the complete sequence succeeds and legal and operational release requirements are satisfied.
