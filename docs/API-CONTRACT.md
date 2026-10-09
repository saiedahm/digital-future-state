# Server API contract

## GET /api/health
Returns configuration-presence flags only. It does not reveal secret values or validate provider credentials.

## POST /api/requests
Requires a signed-in Supabase access token in the Authorization Bearer header and an exact allowed Origin.
JSON body: `{ "category": "complaint|service_request|technical|privacy|suggestion|other", "subject": "1–160 chars", "message": "1–10000 chars" }`.
Requires server-only `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `APP_ALLOWED_ORIGINS`.
Never send a service-role key from the browser.

## POST /api/stripe-checkout
Currently returns HTTP 503 intentionally. It must not be enabled until authentication validation, strict price mapping, official Stripe SDK usage, and checkout lifecycle are implemented.

## POST /api/stripe-webhook
Currently returns HTTP 503 intentionally. It must not be enabled until raw-body signature verification, idempotency, and subscription-state reconciliation are implemented.
