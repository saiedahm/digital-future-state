# Production readiness — DIGITAL FUTURE STATE

## Implemented in repository
- Static landing page and passport artwork presentation.
- Informational membership tiers.
- Supabase schema migration with row-level policies and private photo bucket.
- Account sign-in/registration page scaffold and Supabase browser client.
- Profile page integration attempt for authenticated profile read/write and photo upload.
- Request endpoint foundation and environment configuration notes.
- Fail-closed placeholders for Stripe checkout and webhook.
- Health/configuration endpoint and release checklist.

## Must be completed and verified before launch
- Apply migration in the correct Supabase project and verify it succeeded.
- Replace the public-key placeholder in `supabase/config.js`.
- Verify Supabase email auth and redirect URLs.
- Wire the visible contact form to the request API.
- Verify the profile form DOM IDs and test profile save/load and photo upload in a real browser.
- Implement a real Stripe checkout using the official SDK, authenticated-user verification, and a strict allowlist mapping each plan to a Stripe Price ID.
- Implement webhook raw-body signature verification, idempotent event handling, and subscription lifecycle updates.
- Add server-side rate limiting/abuse controls and appropriate request retention.
- Run build/deployment and two-user isolation tests on Vercel production.
- Replace legal draft placeholders with verified operator details and legal review.

Do not describe the service as production-ready until every applicable item above is checked.
