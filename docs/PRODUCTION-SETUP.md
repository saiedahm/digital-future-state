# DIGITAL FUTURE STATE — production integration checklist

This repository deploys a static website with account and membership UI plus serverless endpoint scaffolds. The presence of these files does not mean all connected services have been configured or tested.

## Repository areas
- `/`: public landing page and passport-style profile preview.
- `/account/`: personal account UI; persistence requires configured Supabase.
- `/membership/`: six displayed tiers (one free, five paid).
- `/database/schema.sql` and `/supabase/migrations/`: PostgreSQL/Supabase schema and access policies.
- `/api/`: health check, support-request endpoint, and disabled payment endpoints.
- Legal pages: `agb.html`, `datenschutz.html`, `impressum.html`, `widerruf.html`.

## Required service configuration
1. Apply and verify the Supabase migrations in the intended project. Verify the deployed public configuration points to that same project.
2. Configure email confirmation, password reset, redirect URLs, and Google/Microsoft providers if offered; test registration, confirmation, login, logout, and recovery.
3. Verify profile save/load, private photo upload, export, and deletion with two separate test users. Ensure row-level security prevents cross-user access.
4. Configure Vercel server-only environment variables for request intake. Never expose the service-role key in browser code. Test allowed origins, authentication, validation, retention, and operator access.
5. The approved paid monthly display prices are €4.99, €6.99, €8.99, €11.99, and €13.99. Do not use €15.99. Configure provider products and server-side price-ID allowlisting only after the operator account is ready.
6. Implement and test authenticated checkout, raw-body webhook signature verification, idempotent subscription updates, cancellation/refunds, and entitlement checks. Until then, payments must remain disabled.
7. Add rate limiting, monitoring, privacy retention, and account/data export/deletion processes.
8. Complete legal pages with verified operator identity, contact details, privacy purposes/retention, subscription terms, cancellation, and withdrawal information; obtain appropriate legal review.

## Release gates
- No production release while account pages imply server persistence that is not active.
- No real personal data collection until access controls and retention are tested.
- No payments until checkout, signed webhooks, cancellation, refunds, and entitlement checks pass end to end.
- Test desktop/mobile navigation and all assets on the Vercel deployment before attaching official domains.

## Data minimization
Collect only fields needed for the service. A profile card is not a government ID, passport, visa, proof of citizenship, or verified identity credential. Avoid collecting identity document numbers or scans unless a separately assessed legal and security requirement is established.
