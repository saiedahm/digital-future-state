# DIGITAL FUTURE STATE — production integration checklist

This repository currently deploys as a static website. The added account and membership pages are UI scaffolds; they do not create authenticated accounts or charge payments.

## Repository areas
- `/`: public landing page and current passport/profile preview.
- `/account/`: personal-account UI scaffold and printable passport-style preview.
- `/membership/`: six planned monthly membership tiers.
- `/database/schema.sql`: PostgreSQL/Supabase schema with row-level security policies.
- Existing legal pages: `agb.html`, `datenschutz.html`, `impressum.html`, `widerruf.html`.

## Required service configuration
1. Create a Supabase project in the intended region; configure email confirmation, password reset, redirect URLs, and MFA policy as appropriate.
2. Apply and review `database/schema.sql` in a development project. Configure a private storage bucket for profile photos with per-user object policies. Do not store photos as unrestricted public files.
3. Implement server-backed account API flows using the verified Supabase session. Add rate limiting, validation, CSRF/origin protections where applicable, logging without sensitive payloads, and account deletion/export flows.
4. Configure Stripe products/prices for €4.99, €6.99, €8.99, €11.99, €13.99, and €15.99 per month. The server creates checkout sessions; signed webhooks update membership rows idempotently. Never trust a browser redirect as proof of payment.
5. Implement request/complaint intake to a protected database and an operator workflow; define access, retention, and response processes.
6. Add automated tests for authentication, row-level access isolation, photo upload limits, request validation, subscription lifecycle, webhook signature verification, cancellation, and deletion/export.
7. Configure Vercel environment variables only after service creation. Public browser configuration may include Supabase URL and anon key with RLS correctly enforced. Keep service-role and Stripe secret keys server-only.
8. Complete legal pages with verified operator identity, contact details, privacy purposes/retention, subscription terms, cancellation, and withdrawal information; obtain appropriate legal review.

## Release gates
- No production release while account pages imply server persistence that is not active.
- No real personal data collection until access controls and retention are tested.
- No payments until checkout, signed webhooks, cancellation, refunds, and entitlement checks are tested end to end.
- Test desktop/mobile navigation and all assets on the Vercel preview before attaching the official domain.

## Data minimization
Collect only fields needed for the service. A profile card is not a government ID, passport, visa, proof of citizenship, or verified identity credential. Avoid collecting identity document numbers or scans unless a separately assessed legal and security requirement is established.
