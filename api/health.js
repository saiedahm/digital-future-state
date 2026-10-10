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
  const stripeKey = process.env.STRIPE_SECRET_KEY || "";
  const stripeMode = stripeKey.startsWith("sk_test_")
    ? "test"
    : stripeKey.startsWith("sk_live_")
      ? "live"
      : "unknown";
  const stripeSecretFormatValid = /^sk_(test|live)_[A-Za-z0-9]+$/.test(stripeKey);
  const releaseReady = false;

  return res.status(200).json({
    service: "DIGITAL FUTURE STATE",
    status: checkoutConfigured && stripeSecretFormatValid ? "configuration-present-not-verified" : "configuration-incomplete",
    paymentConfigurationPresent: checkoutConfigured && stripeSecretFormatValid,
    paymentMode: stripeMode,
    releaseReady,
    checks: { ...checks, stripeSecretFormatValid },
    note: "Configuration presence and key format only. This endpoint does not verify database connectivity, applied migrations, Stripe account mode against Price IDs, webhook delivery, or successful end-to-end payments. Release readiness remains false until those tests pass."
  });
};
