# Vercel environment setup — DIGITAL FUTURE STATE

Configure variables only in the Vercel project connected to `saiedahm/digital-future-state`.

## Public browser configuration
Create `supabase/config.js` from `supabase/config.js.example` using the dedicated DIGITAL FUTURE STATE project URL and publishable key. These are public values; Row Level Security must still be enabled. Do not copy the old NEXORA project's values.

## Server-only environment variables
- `SUPABASE_URL`: dedicated DIGITAL FUTURE STATE project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: secret service-role key; server-side only.
- `APP_ALLOWED_ORIGINS`: comma-separated exact trusted origins, e.g. production domain and approved Vercel preview domain.
- Stripe variables only after a Stripe account and recurring prices are configured: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and the six `STRIPE_PRICE_*` IDs.

Never put service-role keys or Stripe secrets in `supabase/config.js`, HTML, CSS, browser JavaScript, public GitHub files, screenshots, or chat.

## Current behavior
The support request endpoint validates input and session and will fail closed if required server variables are missing. Stripe checkout and webhook endpoints intentionally return HTTP 503 until official Stripe SDK integration, price IDs, session validation, signature verification, idempotency, and subscription state transitions are implemented and tested. This prevents accidental charging or false active memberships.

## Before launch
1. Apply `supabase/migrations/20261009000000_initial_schema.sql` in the dedicated project.
2. Configure Supabase email confirmation and redirect URLs.
3. Add the public config file and environment variables in the correct Vercel project.
4. Wire the contact form to `/api/requests` using the signed-in Supabase access token.
5. Implement and test Stripe checkout and raw-body signed webhook handling.
6. Test RLS isolation with two test accounts, request retention, account deletion, mobile layout, and production build.
