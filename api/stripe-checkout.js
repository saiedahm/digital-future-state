// Authenticated Stripe Checkout for DIGITAL FUTURE STATE.
// Uses Stripe's HTTPS API without exposing secret credentials to the browser.
const PLANS = Object.freeze({
  essential: { amount: 499, env: "STRIPE_PRICE_499" },
  plus: { amount: 699, env: "STRIPE_PRICE_699" },
  premium: { amount: 899, env: "STRIPE_PRICE_899" },
  professional: { amount: 1199, env: "STRIPE_PRICE_1199" },
  business: { amount: 1399, env: "STRIPE_PRICE_1399" }
});

function json(res, status, body) {
  return res.status(status).json(body);
}

function parseBody(body) {
  if (body && typeof body === "object" && !Buffer.isBuffer(body)) return body;
  if (typeof body === "string") {
    try { return JSON.parse(body); } catch { return null; }
  }
  if (Buffer.isBuffer(body)) {
    try { return JSON.parse(body.toString("utf8")); } catch { return null; }
  }
  return null;
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Vary", "Origin");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Method not allowed" });
  }

  const origin = req.headers.origin;
  const allowedOrigins = (process.env.APP_ALLOWED_ORIGINS || "")
    .split(",").map(value => value.trim()).filter(Boolean);
  if (!origin || !allowedOrigins.includes(origin)) {
    return json(res, 403, { error: "Origin not allowed" });
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const supabaseUrl = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!stripeSecret || !supabaseUrl || !serviceKey) {
    return json(res, 503, { error: "Checkout is not fully configured yet." });
  }

  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ") || authHeader.length < 20) {
    return json(res, 401, { error: "Sign in before selecting a paid membership." });
  }

  const body = parseBody(req.body);
  const planCode = body && typeof body.planCode === "string" ? body.planCode : "";
  const plan = PLANS[planCode];
  if (!plan) {
    return json(res, 400, { error: "Choose a valid membership plan." });
  }

  const priceId = process.env[plan.env];
  if (!priceId || !/^price_[A-Za-z0-9]+$/.test(priceId)) {
    return json(res, 503, {
      error: "The selected plan's Stripe price is not configured yet. No payment has been started."
    });
  }

  try {
    const userResponse = await fetch(supabaseUrl + "/auth/v1/user", {
      headers: {
        apikey: serviceKey,
        Authorization: authHeader
      }
    });
    if (!userResponse.ok) {
      return json(res, 401, { error: "Your session is invalid or expired. Sign in again." });
    }
    const user = await userResponse.json();
    if (!user || typeof user.id !== "string" || !/^[0-9a-f-]{36}$/i.test(user.id)) {
      return json(res, 401, { error: "Could not verify your account." });
    }

    // Validate the configured Price ID against the approved plan before redirecting
    // any user to checkout. This prevents a mistaken env var from charging the wrong amount.
    const priceResponse = await fetch("https://api.stripe.com/v1/prices/" + encodeURIComponent(priceId), {
      headers: { Authorization: "Bearer " + stripeSecret }
    });
    const price = await priceResponse.json();
    if (!priceResponse.ok || !price || price.active !== true ||
        price.type !== "recurring" || price.currency !== "eur" ||
        price.unit_amount !== plan.amount || !price.recurring ||
        price.recurring.interval !== "month" || price.recurring.interval_count !== 1) {
      console.error("Stripe Price ID does not match the approved monthly EUR plan", priceResponse.status);
      return json(res, 503, {
        error: "This plan's Stripe price must be configured as the approved monthly EUR amount. No payment has been started."
      });
    }

    const membershipQuery = new URLSearchParams({
      user_id: "eq." + user.id,
      select: "provider_customer_id,status,created_at",
      order: "created_at.desc",
      limit: "20"
    });
    const membershipsResponse = await fetch(
      supabaseUrl + "/rest/v1/memberships?" + membershipQuery.toString(),
      { headers: { apikey: serviceKey, Authorization: "Bearer " + serviceKey } }
    );
    if (!membershipsResponse.ok) {
      console.error("Could not check existing memberships", membershipsResponse.status);
      return json(res, 503, { error: "Membership storage is not ready. No payment has been started." });
    }
    const existingRows = await membershipsResponse.json();
    const activeLike = Array.isArray(existingRows) && existingRows.find(row =>
      ["active", "past_due", "pending", "incomplete"].includes(row.status)
    );
    if (activeLike) {
      return json(res, 409, {
        error: "An existing membership is active or still being processed. Use the account billing controls instead of starting a second subscription."
      });
    }
    const reusableCustomer = Array.isArray(existingRows)
      ? existingRows.find(row => row.provider_customer_id && row.status === "canceled")
      : null;

    const params = new URLSearchParams();
    params.set("mode", "subscription");
    params.set("success_url", origin + "/membership/success.html?session_id={CHECKOUT_SESSION_ID}");
    params.set("cancel_url", origin + "/membership/?checkout=cancelled");
    params.set("client_reference_id", user.id);
    params.set("line_items[0][price]", priceId);
    params.set("line_items[0][quantity]", "1");
    params.set("metadata[user_id]", user.id);
    params.set("metadata[plan_code]", planCode);
    params.set("metadata[amount_cents]", String(plan.amount));
    params.set("subscription_data[metadata][user_id]", user.id);
    params.set("subscription_data[metadata][plan_code]", planCode);
    params.set("subscription_data[metadata][amount_cents]", String(plan.amount));
    params.set("allow_promotion_codes", "false");

    if (reusableCustomer) {
      params.set("customer", reusableCustomer.provider_customer_id);
    } else if (typeof user.email === "string" && user.email.length <= 254) {
      params.set("customer_email", user.email);
    }

    const checkoutResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + stripeSecret,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params
    });
    const session = await checkoutResponse.json();
    if (!checkoutResponse.ok) {
      console.error("Stripe Checkout session creation failed", checkoutResponse.status,
        session && session.error && session.error.type ? session.error.type : "unknown");
      return json(res, 502, { error: "Stripe could not start checkout. Please try again later." });
    }
    if (!session || typeof session.url !== "string" ||
        !session.url.startsWith("https://checkout.stripe.com/")) {
      return json(res, 502, { error: "Stripe returned an invalid checkout destination." });
    }
    return json(res, 200, { url: session.url });
  } catch (error) {
    console.error("Checkout service failed", error && error.message ? error.message : "unknown");
    return json(res, 502, { error: "Checkout is temporarily unavailable. Please try again later." });
  }
};
