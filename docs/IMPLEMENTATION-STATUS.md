# DIGITAL FUTURE STATE implementation status

## Committed foundation
- Public landing page and profile/passport-style preview.
- Membership page with six informational monthly price tiers.
- Supabase SQL migration for profiles, support requests, memberships, RLS, and private photo storage.
- Public Supabase configuration template and browser-client loader.
- Standalone account sign-in / registration / password-reset page.

## Not yet production-ready
- The Supabase SQL migration must be applied to the dedicated DIGITAL FUTURE STATE project and checked for errors.
- `supabase/config.js.example` is a template. Create `supabase/config.js` with the project's URL and publishable key before the sign-in page can connect. Keep it public-key-only.
- Configure Supabase Auth email confirmation and redirect URLs for the production domain and Vercel preview.
- The existing `account/index.html` still contains a local preview form; it has not yet been wired to read/write authenticated profile rows or upload photos.
- The public contact form is currently an email-draft interaction, not server-side request intake.
- There is no trusted server-side Stripe checkout or signed webhook implementation yet. Do not accept payment or mark memberships active from browser code.
- No end-to-end auth, RLS, upload, payment, or browser deployment tests have been run in this change.

## Release rule
Do not describe the service as fully launched or collect real sensitive identity data until these remaining items are implemented and tested. The passport-style preview is not a government identity document.
