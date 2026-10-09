# DIGITAL FUTURE STATE — Supabase setup

This project is a static HTML/CSS/JavaScript site. Do not use Next.js setup instructions.

## Current status
The Supabase project is not yet connected to the deployed website, and the database schema has not been confirmed as applied. Do not collect real personal data or enable payments until authentication, row-level security, storage policies, and server-side payment handling have been tested.

## Required security
- Use the project URL and publishable key in public frontend configuration only.
- Never expose Supabase secret/service-role keys or Stripe secret keys in browser code.
- Enable RLS and least-privilege grants for every exposed table.
- Keep profile photos in a private bucket with per-user access policies.
- Membership records must be changed only by trusted server/webhook code.

## Deployment sequence
1. Add and review a versioned SQL migration.
2. Apply it to the dedicated DIGITAL FUTURE STATE Supabase project.
3. Configure Auth email confirmation and redirect URLs for the actual domain and Vercel preview.
4. Add the public URL and publishable key to Vercel for this project only.
5. Implement real sign-in/profile/request UI integration and test user isolation.
6. Implement server-side Stripe checkout and signed, idempotent webhooks before accepting payments.
7. Test desktop/mobile, account recovery, photo limits, request submission, cancellation, and data export/deletion.
