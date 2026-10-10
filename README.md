# DIGITAL FUTURE STATE — v1 prototype

A responsive static website prototype for the DIGITAL FUTURE STATE concept.

## Files
- `index.html` — landing page, passport-style profile preview, sample directory, security notes, citizen contact form, footer legal links, and navigation to the integration pilot.
- `integrations/index.html` — 20 candidate technology providers with official developer documentation; these are research candidates, not confirmed partners.
- `account/auth.html` — email/password, email-link account access, password-reset completion, plus Google and Microsoft OAuth entry points through Supabase.
- `supabase/migrations/20261011000000_profile_self_delete.sql` — least-privilege policy allowing an authenticated user to delete only their own saved profile record.
- `docs/IDENTITY-INTEGRATION-PILOT.md` — provider configuration requirements and staged rollout plan.
- `styles.css` — responsive dark navy / gold design system.
- `app.js` — menu, profile preview, local photo preview, directory search, print action, email-draft contact interaction, cookie notice.
- `widerruf.html`, `agb.html`, `datenschutz.html`, `impressum.html` — German legal-information drafts.

## Preview
Open `index.html` in a browser or deploy this repository as a static site on Vercel / GitHub Pages.

## Important status
This is a **front-end prototype**, not a production identity or subscription service.
- The homepage's quick preview is browser-only. The separate account page can load/save the profile through Supabase only after the database migrations and authentication settings are configured.
- The profile/passport-style card is not a government document, passport, visa, or proof of citizenship.
- Supabase email/password and email-link authentication code is present; Google and Microsoft OAuth buttons are wired to Supabase but require provider configuration and production end-to-end testing before they can be called working.
- No identity verification, server-side contact storage, payment checkout, active paid membership, or universal single sign-on to external websites is implemented.
- The contact form opens the visitor's email application to prepare a message to `contact@digital-future.ai`; it does not send or store the message itself.
- The sample directory contains public external links and does not imply partnerships or supported single sign-on.
- Planned membership display prices are €4.99, €6.99, €8.99, €11.99, and €15.99/month for the non-free tiers. The €13.99 price is not approved. These prices are informational only; no charge can be made by this prototype.
- Legal pages contain draft text and placeholders. Complete them with accurate operator details and obtain legal review before production.

## Before production
1. Apply the Supabase migrations in chronological order to the intended project, then test each operation with two separate test accounts. The profile deletion control requires the `20261011000000_profile_self_delete.sql` migration.
2. Confirm provider setup for Google/Microsoft and test redirect URLs, sign-out, email confirmation, password reset and account recovery.
3. Add a secure authentication and database layer with access controls and data minimization.
2. Implement and test the real complaint/request intake path and privacy retention process.
3. Configure a payment provider and legally compliant subscription, cancellation, and refund flows.
4. Replace legal placeholders with verified details and reviewed legal text.
5. Verify the custom domain and production deployment settings before switching live traffic.


## Brand system and static quality files
- `assets/dfs-emblem.svg` — shared gold biometric shield emblem used by the header and passport preview.
- `assets/favicon.svg` — matching browser icon.
- `manifest.webmanifest` — basic installable-web-app metadata.
- `robots.txt` and `sitemap.xml` — basic crawl discovery files.

The passport preview consistently reads **DIGITAL FUTURE STATE** at the top, uses the shared platform emblem in the center/header area, and displays **PASSPORT** with a biometric emblem at the bottom. This is a design motif for a platform profile, not an official travel or government identity document.


## Pre-deployment quality gate
The repository includes automated syntax and static asset checks. A passing workflow is not a full browser, payment, authentication, or security penetration test. The current contact form prepares a `mailto:` message; no server receives it. The cookie notice stores only its dismissed state in local browser storage; this prototype does not run analytics or advertising scripts.

## Deployment checklist
- Preview the branch deployment and test desktop/mobile layouts and all navigation paths.
- Confirm the operator's legal details and obtain review of all legal pages.
- Configure a real, secure backend for accounts, requests, membership entitlements, and audit/security controls.
- Configure and test subscription checkout and cancellation with a payment provider; do not collect card details directly.
- Confirm domain DNS, TLS, redirects, and rollback plan before changing production traffic.
