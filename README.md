# DIGITAL FUTURE STATE — v1 platform prototype

A responsive static website prototype for the DIGITAL FUTURE STATE concept, with Supabase account/profile features and server-side Stripe subscription endpoints.

## Main areas

- `index.html` — public landing page, profile preview, directory, contact form and legal links.
- `account/auth.html` and `account/index.html` — Supabase authentication, profile UI, membership status and billing-portal entry point.
- `membership/index.html` and `membership/success.html` — monthly plans and a safe checkout return page.
- `api/stripe-checkout.js` — authenticated Stripe Checkout session creation, fixed plan allowlist, price verification and prevention of duplicate concurrent subscriptions.
- `api/stripe-webhook.js` — raw-body Stripe signature validation, event deduplication and membership lifecycle writes.
- `api/stripe-portal.js` — authenticated Stripe Billing Portal session creation.
- `api/health.js`, `api/requests.js` — configuration checks and support-request endpoint.
- `database/schema.sql` — core tables and row-level security policies.
- `database/storage-profile-photos.sql` — private profile-photo bucket and per-user storage policies; apply in the intended Supabase project.
- `database/stripe-webhook-events.sql` — private Stripe webhook event ledger used for event deduplication; apply before configuring the webhook.
- `supabase/migrations/` — additional versioned database migrations.
- `app.js`, `styles.css` — public-site behavior and design.
- `widerruf.html`, `agb.html`, `datenschutz.html`, `impressum.html` — legal-information drafts.

## Important status

This repository is **not yet cleared for live payment launch**. Subscription code is implemented, but real operation depends on correct Vercel secrets, matching Stripe mode and recurring EUR Price IDs, applied Supabase migrations, Stripe event destination configuration, and successful end-to-end tests.

- Public browsing is available without a subscription.
- Account creation and profile save/load depend on Supabase setup, database migrations and authentication redirect settings.
- The profile/passport-style card is only a platform profile, not a government document, passport, visa, proof of citizenship or verified identity credential.
- Google and Microsoft sign-in require provider configuration and end-to-end tests.
- Stripe Checkout and the Billing Portal fail closed when required settings are absent or invalid. Membership access is written only from validated server-side Stripe notifications; this must be verified with test-mode transactions before launch.
- The public contact form currently prepares an email draft; it does not submit a server-side request.
- The directory lists public external links and does not imply partnerships or universal sign-in.
- Legal pages are drafts and must be completed with verified operator details and reviewed before production.

## Approved display prices

The approved paid monthly prices are **€4.99, €6.99, €8.99, €11.99 and €13.99**. Each price is mapped server-side to a dedicated recurring Stripe Price ID and is checked for currency, amount and monthly interval before a checkout session is created. Do not use €15.99.

## Required Supabase and Stripe setup

Before testing accounts and subscriptions, open the Supabase SQL Editor for the project configured in Vercel and apply, in order:

1. `database/schema.sql` if the core tables and row-level security policies have not already been applied.
2. `database/storage-profile-photos.sql` to create the private profile-photo bucket and per-user storage rules.
3. `database/stripe-webhook-events.sql` to create the private webhook event ledger used by `api/stripe-webhook.js`.

Then configure server-only Vercel variables for the same Supabase project and the Stripe test environment. Do not paste secret keys into source files or browser configuration. The repository cannot apply SQL to the external Supabase project by itself; verify the SQL editor reports success and then test a new account and profile-photo upload.

## Production release gates

1. Apply and verify all Supabase migrations, including `database/stripe-webhook-events.sql`, in the intended Supabase project.
2. Set server-only variables in Vercel. Configure all five approved Stripe Price IDs and ensure test-mode keys/prices/webhook are all in test mode.
3. Enable Stripe Billing Portal cancellation settings and subscribe the webhook destination to checkout, subscription update/delete and invoice paid/failed events.
4. Complete sandbox checkout, confirm a membership row is written to the correct user, and verify duplicate webhook delivery does not create duplicate records.
5. Test renewals, failed payments, cancellation and access status updates, plus two-user account isolation.
6. Verify email confirmation, sign-in/out, password reset, OAuth redirects, profile save/load, private photo upload, export and deletion in a real browser.
7. Configure and test secure support-request intake and appropriate abuse controls, monitoring and data retention.
8. Replace legal placeholders with verified operator details, obtain legal review, test desktop/mobile and keep a rollback plan.

A green deployment or static-validation workflow is not a full browser, payment, authentication or security test. Do not switch to live-mode payments until all applicable release gates pass.
