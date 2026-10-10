# OAuth provider checklist

The account page uses Supabase Auth. Google and Microsoft buttons are present in the code, but they are not proof of live provider connectivity.

1. In the Supabase dashboard, enable the Google provider and configure its client ID and secret.
2. In the Google Cloud OAuth client, register the Supabase project's callback URL shown in Supabase provider settings.
3. In the Supabase dashboard, enable the Azure (Microsoft) provider and configure its application ID and secret.
4. In Microsoft Entra, register the callback URL shown by Supabase as a Web redirect URI.
5. In Supabase URL Configuration, set the production Site URL and allow the exact production URL ending in `/account/auth.html`.
6. Test registration, email confirmation, Google sign-in, Microsoft sign-in and password recovery in a real browser.

Keep private credentials in provider dashboards or server-side environment settings, never in public website files or Git. A successful deployment does not prove OAuth works. Do not mark a provider live until the full sign-in and callback are tested.