// Authenticated Stripe Billing Portal session for managing/canceling a subscription.
module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Vary", "Origin");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const origin = req.headers.origin;
  const allowedOrigins = (process.env.APP_ALLOWED_ORIGINS || "")
    .split(",").map(value => value.trim()).filter(Boolean);
  if (!origin || !allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: "Origin not allowed" });
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const supabaseUrl = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!stripeSecret || !supabaseUrl || !serviceKey) {
    return res.status(503).json({ error: "Billing management is not fully configured yet." });
  }

  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ") || authHeader.length < 20) {
    return res.status(401).json({ error: "Sign in to manage your membership." });
  }

  try {
    const userResponse = await fetch(supabaseUrl + "/auth/v1/user", {
      headers: { apikey: serviceKey, Authorization: authHeader }
    });
    if (!userResponse.ok) return res.status(401).json({ error: "Your session is invalid or expired." });
    const user = await userResponse.json();
    if (!user || typeof user.id !== "string" || !/^[0-9a-f-]{36}$/i.test(user.id)) {
      return res.status(401).json({ error: "Could not verify your account." });
    }

    const query = new URLSearchParams({
      user_id: "eq." + user.id,
      select: "provider_customer_id,status,created_at",
      order: "created_at.desc",
      limit: "20"
    });
    const rowsResponse = await fetch(supabaseUrl + "/rest/v1/memberships?" + query.toString(), {
      headers: { apikey: serviceKey, Authorization: "Bearer " + serviceKey }
    });
    if (!rowsResponse.ok) {
      console.error("Billing portal membership lookup failed", rowsResponse.status);
      return res.status(503).json({ error: "Membership storage is not ready." });
    }

    const rows = await rowsResponse.json();
    const customerRow = Array.isArray(rows) ? rows.find(row =>
      row.provider_customer_id && ["active", "past_due", "incomplete", "pending", "canceled"].includes(row.status)
    ) : null;
    if (!customerRow) {
      return res.status(404).json({ error: "No Stripe billing account is linked to this user yet." });
    }

    const params = new URLSearchParams({
      customer: customerRow.provider_customer_id,
      return_url: origin + "/account/"
    });
    if (process.env.STRIPE_BILLING_PORTAL_CONFIGURATION_ID) {
      params.set("configuration", process.env.STRIPE_BILLING_PORTAL_CONFIGURATION_ID);
    }

    const portalResponse = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + stripeSecret,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params
    });
    const portal = await portalResponse.json();
    if (!portalResponse.ok) {
      console.error("Stripe Billing Portal creation failed", portalResponse.status,
        portal && portal.error && portal.error.type ? portal.error.type : "unknown");
      return res.status(503).json({ error: "Stripe Billing Portal is not enabled for this account yet." });
    }
    if (!portal || typeof portal.url !== "string" || !portal.url.startsWith("https://billing.stripe.com/")) {
      return res.status(502).json({ error: "Stripe returned an invalid billing destination." });
    }

    return res.status(200).json({ url: portal.url });
  } catch (error) {
    console.error("Billing Portal service failed", error && error.message ? error.message : "unknown");
    return res.status(502).json({ error: "Billing management is temporarily unavailable." });
  }
};
