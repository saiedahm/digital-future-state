# Identity integration pilot — implementation notes

## Current state
- The public directory and the 20-candidate integration research page are available in the static site.
- The account page is a platform profile preview; it is not a government ID.
- The authentication page now offers email/password, email-link, Google OAuth, and Microsoft OAuth through the Supabase JS client.
- Google and Microsoft sign-in are **not confirmed working** until the corresponding providers are enabled/configured in the project's Supabase Auth settings and end-to-end tested.
- The provider candidate list does not represent signed partnerships. Third-party SSO is not achieved merely by adding an OAuth button.

## Provider setup required
1. In the Supabase dashboard for the configured project, enable Google under Authentication → Sign In / Providers and enter the Google OAuth client ID and client secret obtained from the Google Cloud project.
2. Enable Azure/Microsoft and configure the Microsoft application client ID and secret plus the supported tenant configuration.
3. In Supabase Authentication URL configuration, set the exact production Site URL and allow-list the exact callback URL `https://YOUR-PRODUCTION-DOMAIN/account/auth.html`. Replace the placeholder with the real production domain; do not add broad wildcards.
4. In Google Cloud and Microsoft Entra, add the exact callback URL shown by Supabase as the provider redirect URI. The provider callback usually points to Supabase Auth, while the Supabase redirect allow-list contains the site return URL.
5. Test signup/sign-in/sign-out, email confirmation, password reset, account persistence, denied consent, mobile browser behavior, and redirect behavior on the real production domain.
6. Never put provider client secrets or Supabase service-role keys in browser files, Git commits, or public environment variables. Provider secrets belong only in the provider settings / secure server configuration.
7. Only label a provider “Connected” after a successful end-to-end test. Do not advertise automatic login to other websites unless a specific service has implemented and approved a supported federation integration.

## Roadmap
- Phase 1: one secure account for DIGITAL FUTURE STATE.
- Phase 2: first external identity provider, tested end to end.
- Phase 3: account linking and privacy/data deletion controls.
- Phase 4: integrate partner services individually with written permission and least-privilege scopes.
- Phase 5: only after actual paid features exist, implement checkout, verified webhooks, entitlement checks, cancellation, refunds, and legal review.

## Membership pricing
- Global Pass: free basic profile.
- Visitor Pass: €4.99/month planned.
- Citizen / Resident: €6.99/month planned.
- Organization / State: €8.99/month planned.
- Diplomat: €11.99/month planned.
- Business Executive: €15.99/month planned.
- €13.99 is not an approved price. All non-free prices remain proposals and are not purchasable. No payment integration is active.
