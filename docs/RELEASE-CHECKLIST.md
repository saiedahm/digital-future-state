# DIGITAL FUTURE STATE release checklist

## Database and authentication
- [ ] Apply `supabase/migrations/20261009000000_initial_schema.sql` to the dedicated DFS Supabase project.
- [ ] Confirm SQL succeeds without errors; inspect tables, grants, RLS policies, and the private `profile-photos` bucket.
- [ ] Create `supabase/config.js` with the correct public URL and publishable key; never put a secret/service-role key there.
- [ ] Configure email confirmation, password recovery, and allowed redirect URLs for production and the approved Vercel preview.
- [ ] Test two separate accounts and verify neither can read or modify the other's profile, requests, or photos.
- [ ] Test profile save/load, signed photo URL expiry, file MIME type and 2 MiB limit.

## Requests
- [ ] Set server-only `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and exact `APP_ALLOWED_ORIGINS`.
- [ ] Connect the visible contact form to `POST /api/requests` with the signed-in user's access token.
- [ ] Test invalid session, disallowed origin, malformed JSON, oversize messages, and successful request persistence.
- [ ] Define who can review requests, response times, retention, export, and deletion before collecting real user submissions.

## Payments
- [ ] Configure Stripe products/prices for €4.99, €6.99, €8.99, €11.99, €13.99, and €15.99 per month.
- [ ] Implement server-side checkout with verified authenticated user and a strict plan-to-price allowlist.
- [ ] Implement webhook signature verification against the raw request body, idempotent event processing, and subscription lifecycle updates.
- [ ] Verify cancellation, payment failure, refunds, entitlement checks, and duplicate webhook delivery.
- [ ] Do not enable live payments while the checkout/webhook endpoints return 503.

## Launch
- [ ] Review legal pages with verified operator details and legal review.
- [ ] Run syntax/build checks and desktop/mobile browser tests.
- [ ] Confirm Vercel deployment is Ready and check its production URL.
- [ ] Confirm the custom domain and HTTPS configuration.
- [ ] Keep test data only until privacy/security gates pass.
