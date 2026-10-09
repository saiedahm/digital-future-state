// Stripe Checkout server endpoint — intentionally disabled until secrets and price IDs are configured.
// Required server-only env: STRIPE_SECRET_KEY, STRIPE_PRICE_ESSENTIAL, STRIPE_PRICE_PLUS,
// STRIPE_PRICE_PREMIUM, STRIPE_PRICE_PROFESSIONAL, STRIPE_PRICE_BUSINESS,
// STRIPE_PRICE_ORGANIZATION, SUPABASE_URL, SUPABASE_ANON_KEY, APP_ALLOWED_ORIGINS.
// Add the official Stripe SDK dependency before enabling this endpoint.
module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const origin = req.headers.origin;
  const allowed = (process.env.APP_ALLOWED_ORIGINS || "").split(",").map(x => x.trim()).filter(Boolean);
  if (!origin || !allowed.includes(origin)) return res.status(403).json({ error: "Origin not allowed" });
  return res.status(503).json({
    error: "Payments are not enabled yet. Configure Stripe products, server secrets, authentication verification and the signed webhook before accepting payments."
  });
};
