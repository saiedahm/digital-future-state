const crypto = require("node:crypto");

const PLANS = Object.freeze({
  essential: { amount: 499, env: "STRIPE_PRICE_499" },
  plus: { amount: 699, env: "STRIPE_PRICE_699" },
  premium: { amount: 899, env: "STRIPE_PRICE_899" },
  professional: { amount: 1199, env: "STRIPE_PRICE_1199" },
  business: { amount: 1399, env: "STRIPE_PRICE_1399" }
});

module.exports.config = { api: { bodyParser: false } };

function response(res, status, body) {
  return res.status(status).json(body);
}

async function readRawBody(req) {
  if (Buffer.isBuffer(req.rawBody)) return req.rawBody;
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === "string") return Buffer.from(req.body, "utf8");
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function verifySignature(raw, header, secret) {
  if (typeof header !== "string") return false;
  const parts = header.split(",");
  const timestampPart = parts.find(part => part.startsWith("t="));
  const timestamp = timestampPart && timestampPart.slice(2);
  const signatures = parts.filter(part => part.startsWith("v1=")).map(part => part.slice(3));
  if (!timestamp || !/^\d+$/.test(timestamp) || !signatures.length) return false;
  if (Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp)) > 300) return false;
  const signedPayload = Buffer.concat([Buffer.from(timestamp + ".", "utf8"), raw]);
  const expected = crypto.createHmac("sha256", secret).update(signedPayload).digest();
  return signatures.some(value => {
    if (!/^[a-f0-9]{64}$/i.test(value)) return false;
    const actual = Buffer.from(value, "hex");
    return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
  });
}

function configuredPlanForCode(code) {
  const plan = PLANS[code];
  if (!plan) throw new Error("Unsupported membership plan");
  const priceId = process.env[plan.env];
  if (!priceId || !/^price_[A-Za-z0-9]+$/.test(priceId)) {
    throw new Error("Stripe price configuration is incomplete");
  }
  return { code, amount: plan.amount, priceId };
}

async function stripeGet(path) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const r = await fetch("https://api.stripe.com/v1" + path, {
    headers: { Authorization: "Bearer " + secret }
  });
  const data = await r.json();
  if (!r.ok) {
    console.error("Stripe API read failed", r.status);
    throw new Error("Stripe API read failed");
  }
  return data;
}

function supabaseHeaders(serviceKey, prefer) {
  const headers = {
    apikey: serviceKey,
    Authorization: "Bearer " + serviceKey,
    "Content-Type": "application/json"
  };
  if (prefer) headers.Prefer = prefer;
  return headers;
}

async function supabaseRequest(base, serviceKey, path, options = {}) {
  return fetch(base + "/rest/v1/" + path, {
    method: options.method || "GET",
    headers: supabaseHeaders(serviceKey, options.prefer),
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });
}

function idFrom(value) {
  if (typeof value === "string") return value;
  return value && typeof value.id === "string" ? value.id : null;
}

function uuidLike(value) {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function subscriptionStatus(status) {
  if (status === "active" || status === "trialing") return "active";
  if (status === "past_due" || status === "unpaid") return "past_due";
  if (status === "canceled") return "canceled";
  return "incomplete";
}

async function saveMembership({ base, serviceKey, subscription, metadata, forcedStatus }) {
  const userId = metadata && metadata.user_id;
  const planCode = metadata && metadata.plan_code;
  if (!uuidLike(userId)) throw new Error("Subscription is missing a valid account reference");
  const plan = configuredPlanForCode(planCode);

  const items = subscription && subscription.items && Array.isArray(subscription.items.data)
    ? subscription.items.data : [];
  const priceIds = items.map(item => item && item.price && item.price.id).filter(Boolean);
  if (!priceIds.includes(plan.priceId)) {
    throw new Error("Subscription price does not match the approved plan");
  }

  const periodEndSeconds =
    (Number.isFinite(subscription.current_period_end) && subscription.current_period_end) ||
    (items[0] && Number.isFinite(items[0].current_period_end) && items[0].current_period_end) ||
    null;
  const customerId = idFrom(subscription.customer);
  const subscriptionId = subscription.id;
  if (typeof subscriptionId !== "string" || !subscriptionId.startsWith("sub_")) {
    throw new Error("Stripe subscription ID is invalid");
  }

  const status = forcedStatus === "past_due" && subscriptionStatus(subscription.status) !== "canceled"
    ? "past_due" : subscriptionStatus(subscription.status);
  const row = {
    user_id: userId,
    plan_code: plan.code,
    amount_cents: plan.amount,
    currency: "EUR",
    billing_interval: "month",
    provider_customer_id: customerId,
    provider_subscription_id: subscriptionId,
    status,
    current_period_end: periodEndSeconds ? new Date(periodEndSeconds * 1000).toISOString() : null,
    updated_at: new Date().toISOString()
  };

  const db = await supabaseRequest(base, serviceKey,
    "memberships?on_conflict=provider_subscription_id", {
      method: "POST",
      prefer: "resolution=merge-duplicates,return=minimal",
      body: row
    });
  if (!db.ok) {
    const detail = await db.text();
    console.error("Membership database write failed", db.status, detail.slice(0, 240));
    throw new Error("Membership database write failed");
  }
}

async function handleEvent(event, base, serviceKey) {
  const object = event.data && event.data.object;
  if (!object) return;

  if (event.type === "checkout.session.async_payment_failed") {
    // No membership is created for a failed payment.
    return;
  }

  if (event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded") {
    if (object.mode !== "subscription") return;
    if (event.type === "checkout.session.completed" && object.payment_status !== "paid") {
      // Delayed payment methods are handled only by the async-success event.
      return;
    }
    const subscriptionId = idFrom(object.subscription);
    if (!subscriptionId) throw new Error("Checkout session is missing a subscription");
    const userId = object.metadata && object.metadata.user_id;
    const planCode = object.metadata && object.metadata.plan_code;
    const subscription = await stripeGet("/subscriptions/" + encodeURIComponent(subscriptionId));
    await saveMembership({
      base,
      serviceKey,
      subscription,
      metadata: { user_id: userId || (subscription.metadata && subscription.metadata.user_id),
        plan_code: planCode || (subscription.metadata && subscription.metadata.plan_code) }
    });
    return;
  }

  if (event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted") {
    const subscriptionId = idFrom(object);
    if (!subscriptionId) throw new Error("Subscription event has no subscription ID");
    const subscription = await stripeGet("/subscriptions/" + encodeURIComponent(subscriptionId));
    await saveMembership({
      base, serviceKey, subscription,
      metadata: subscription.metadata || object.metadata
    });
    return;
  }

  if (event.type === "invoice.payment_failed" || event.type === "invoice.paid") {
    const subscriptionId = idFrom(object.subscription);
    if (!subscriptionId) return;
    const subscription = await stripeGet("/subscriptions/" + encodeURIComponent(subscriptionId));
    const metadata = subscription.metadata || {};
    await saveMembership({
      base, serviceKey, subscription, metadata,
      forcedStatus: event.type === "invoice.payment_failed" ? "past_due" : undefined
    });
  }
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return response(res, 405, { error: "Method not allowed" });
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const base = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret || !stripeSecret || !base || !serviceKey) {
    return response(res, 503, { error: "Subscription webhook is not fully configured." });
  }

  let raw;
  try {
    raw = await readRawBody(req);
  } catch {
    return response(res, 400, { error: "Unable to read raw request body" });
  }
  if (!Buffer.isBuffer(raw) || raw.length === 0) {
    return response(res, 400, { error: "Raw request body unavailable" });
  }
  if (!verifySignature(raw, req.headers["stripe-signature"], secret)) {
    return response(res, 400, { error: "Invalid or expired Stripe signature" });
  }

  let event;
  try {
    event = JSON.parse(raw.toString("utf8"));
  } catch {
    return response(res, 400, { error: "Invalid JSON payload" });
  }
  if (!event || typeof event.id !== "string" || !event.id.startsWith("evt_") ||
      typeof event.type !== "string") {
    return response(res, 400, { error: "Invalid Stripe event envelope" });
  }

  try {
    const query = new URLSearchParams({ event_id: "eq." + event.id, select: "event_id" });
    const existing = await supabaseRequest(base, serviceKey,
      "stripe_webhook_events?" + query.toString());
    if (!existing.ok) {
      const detail = await existing.text();
      console.error("Webhook deduplication lookup failed", existing.status, detail.slice(0, 200));
      return response(res, 503, { error: "Webhook storage is not ready. Apply the Stripe webhook migration." });
    }
    const rows = await existing.json();
    if (Array.isArray(rows) && rows.length) {
      return response(res, 200, { received: true, duplicate: true });
    }

    await handleEvent(event, base, serviceKey);

    const saved = await supabaseRequest(base, serviceKey, "stripe_webhook_events", {
      method: "POST",
      prefer: "resolution=ignore-duplicates,return=minimal",
      body: { event_id: event.id, event_type: event.type }
    });
    if (!saved.ok) {
      const detail = await saved.text();
      console.error("Webhook event record failed", saved.status, detail.slice(0, 200));
      return response(res, 503, { error: "Webhook event could not be recorded for idempotent processing." });
    }

    return response(res, 200, { received: true, eventType: event.type });
  } catch (error) {
    console.error("Stripe webhook processing failed", error && error.message ? error.message : "unknown");
    return response(res, 503, { error: "Subscription update failed; Stripe may retry this event." });
  }
};
