# DIGITAL FUTURE STATE — v1 prototype

A responsive static website prototype for the DIGITAL FUTURE STATE concept.

## Files
- `index.html` — public landing page, passport-style profile preview, directory, contact form and legal links.
- `account/auth.html` and `account/index.html` — Supabase authentication and personal-profile UI.
- `membership/index.html` — informational membership plans.
- `database/schema.sql` and `supabase/migrations/` — PostgreSQL/Supabase schema and access policies.
- `api/health.js`, `api/requests.js`, `api/stripe-checkout.js`, `api/stripe-webhook.js` — serverless endpoint scaffolds.
- `app.js`, `styles.css` — public-site behavior and design.
- `widerruf.html`, `agb.html`, `datenschutz.html`, `impressum.html` — legal-information drafts.

## Important status
This repository is **not yet a production-ready identity or subscription service**.
- Public browsing and the landing-page preview are available without a subscription.
- Account creation and profile save/load depend on the configured Supabase project, applied migrations, and authentication redirect settings.
- The profile/passport-style card is a platform profile, not a government document, passport, visa, proof of citizenship, or verified identity credential.
- Google and Microsoft sign-in require provider configuration and end-to-end tests.
- Real checkout, active memberships, cancellation/refunds, and verified paid entitlements are not enabled. The API checkout and webhook endpoints intentionally fail closed.
- The public contact form currently prepares an email draft; it does not submit a server-side request.
- The directory lists public external links and does not imply partnerships or universal sign-in.
- Legal pages are drafts and must be completed with verified operator details and reviewed before production.

## Approved display prices
The approved paid monthly display prices are **€4.99, €6.99, €8.99, €11.99, and €13.99**. These are informational only until a real payment provider, server-side checkout, signed webhook processing, cancellation/refund flows, and entitlement checks have been configured and tested. No charge can currently be made by this prototype. Do not use €15.99.

## Production release gates
1. Apply and verify all Supabase migrations in the intended project.
2. Verify email confirmation, sign-in/out, password reset, OAuth redirects, and two-user data isolation.
3. Verify profile save/load, private photo upload, export, and deletion in a real browser.
4. Configure and test secure request intake and a support workflow.
5. Configure a real payment provider and test checkout, signed/idempotent webhooks, subscription lifecycle, cancellation, refunds, and access entitlements.
6. Add appropriate rate limiting, monitoring, privacy retention, and account/data export/deletion processes.
7. Replace legal placeholders with verified operator details and obtain legal review.
8. Test the deployed Vercel site on desktop and mobile, confirm the production domain, and keep a rollback plan.

A green static validation workflow is not a full browser, payment, authentication, or security test. Do not describe the platform as 100% complete until all applicable release gates pass.
