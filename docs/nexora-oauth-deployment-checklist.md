# NEXORA OAuth consent screen — deployment checklist

## Current state

The consent page is committed on `feature/nexora-sso-pilot` at `/oauth/consent/index.html`, and the account sign-in page preserves the `oauth_consent` query parameter. These changes are not in `main` and have not been deployed or tested end-to-end.

## Required dashboard settings

1. In the intended Supabase project, open **Authentication → OAuth Server** and enable OAuth 2.1.
2. Configure the authorization path as `/oauth/consent`.
3. Confirm the project's Site URL is the actual deployed DIGITAL FUTURE STATE domain. Do not assume a GitHub branch URL is the deployed site.
4. Configure asymmetric signing keys (RS256 or ES256) before using OIDC `openid` scope.
5. Register NEXORA as a separate confidential OAuth client only after NEXORA's server callback is implemented and its exact URL is known.
6. Keep the client secret only in NEXORA's server-side environment variables.

## UI behavior

The consent screen should require an authenticated DIGITAL FUTURE STATE user, display the requesting client and exact redirect URI, show the requested scopes, and allow explicit approval or denial. Supabase's SDK handles code issuance after the consent method returns a redirect URL.

## Safety

- Never use an unverified query parameter as a trusted redirect target.
- Never expose OAuth client secrets or signing keys in browser code.
- Do not claim SSO works until the provider is enabled, the client is registered, the NEXORA callback is implemented, and the complete flow passes tests.
- Do not merge these files into `main` or change live sign-in before verification.
