# DIGITAL FUTURE STATE identity provider — NEXORA pilot

## Current state (do not overstate)
The account page uses a Supabase browser client for DIGITAL FUTURE STATE's own sign-in. Google/Microsoft buttons authenticate with those providers for the DFS account flow. This does not make DFS an OIDC provider for NEXORA or for every external website.

## Goal
Offer DIGITAL FUTURE STATE as the identity provider for NEXORA using a standard, documented OAuth 2.0 Authorization Code + PKCE / OpenID Connect flow. Each participating site must be registered as a client and must validate tokens independently.

## Setup gate
Before changing any production login behavior:
1. Verify the actual Supabase project plan and whether the OAuth Server feature is available and enabled for this project.
2. Follow the official Supabase OAuth Server documentation: https://supabase.com/docs/guides/auth/oauth-server and https://supabase.com/docs/guides/auth/oauth-server/getting-started.
3. Register NEXORA as a client using its exact callback URL. Keep client credentials in Vercel environment variables, never in public JavaScript or Git.
4. Confirm provider metadata, issuer, signing keys/JWKS, token lifetimes, consent requirements and verified-email behavior from the provider's official configuration.
5. Run end-to-end tests with a non-admin test account before enabling any production feature.

## Security requirements
- Never expose a service-role key or OAuth client secret in browser code.
- Never accept email/role values as proof of identity.
- Use a stable subject identifier and require each relying party to validate issuer, audience, signature, expiration, state and nonce.
- Do not assign roles in client-controlled data. NEXORA retains its own role and permissions model.
- Avoid silent linking of existing accounts solely by matching email.
- Keep the existing DFS login path and NEXORA's existing email/password login as fallback until tests pass.
- Do not claim universal internet SSO: external platforms must explicitly support and register this identity provider.

## Rollback
The NEXORA pilot lives on a separate branch. Do not merge to the production branch until the provider configuration, callbacks, client validation and all negative security tests pass.
