module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const priceKeys = [
    "STRIPE_PRICE_499",
    "STRIPE_PRICE_699",
    "STRIPE_PRICE_899",
    "STRIPE_PRICE_1199",
    "STRIPE_PRICE_1399"
  ];
  const pricesConfigured = priceKeys.every(key => {
    const value = process.env[key];
    return typeof value === "string" && /^price_[A-Za-z0-9]+$/.test(value);
  });
  const checks = {
    supabaseUrlConfigured: Boolean(process.env.SUPABASE_URL),
    serviceRoleConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    allowedOriginsConfigured: Boolean(process.env.APP_ALLOWED_ORIGINS),
    stripeSecretConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
    stripeWebhookSecretConfigured: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    stripePriceIdsConfigured: pricesConfigured
  };
  const checkoutConfigured = checks.supabaseUrlConfigured &&
    checks.serviceRoleConfigured &&
    checks.allowedOriginsConfigured &&
    checks.stripeSecretConfigured &&
    checks.stripeWebhookSecretConfigured &&
    checks.stripePriceIdsConfigured;

  return res.status(200).json({
    service: "DIGITAL FUTURE STATE",
    status: "configuration-check-only",
    paymentConfigurationPresent: checkoutConfigured,
    checks,
    note: "Presence checks only. This endpoint does not verify database connectivity, applied migrations, Stripe account mode, webhook delivery, or successful payment processing."
  });
};
