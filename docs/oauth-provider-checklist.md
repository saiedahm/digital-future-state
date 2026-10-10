# OAuth provider checklist

The account page uses Supabase Auth. The Google and Microsoft buttons are present in the interface, but that does not prove live provider connectivity.

## Provider setup

1. In the Supabase dashboard, enable the Google provider and configure its client ID and secret.
2. In the Google Cloud OAuth client, register the exact Supabase callback URL shown in Supabase provider settings.
3. In the Supabase dashboard, enable the Azure (Microsoft) provider and configure its application ID and secret.
4. In Microsoft Entra, register the callback URL shown by Supabase as a Web redirect URI.
5. In Supabase URL Configuration, set the production Site URL and add the exact production account URL to the allowed Redirect URLs list. Include the correct path ending in `/account/auth.html` only if that is the actual configured callback/return destination.
6. Verify that the configured production domain and callback URLs match exactly, including HTTPS, hostname, and path. Avoid wildcard production redirects.

## End-to-end verification

- Test email registration and email confirmation.
- Test sign-in and sign-out.
- Test Google sign-in and confirm the user returns to the intended production account page.
- Test Microsoft sign-in and confirm the user returns to the intended production account page.
- Test password recovery and its return URL.
- Test expired sessions and invalid callback parameters.

Keep private credentials in provider dashboards or server-side environment settings, never in public website files or Git. Do not place provider secrets in browser JavaScript. A successful deployment does not prove OAuth works; do not mark a provider live until the complete sign-in and callback flow passes in a real browser.
