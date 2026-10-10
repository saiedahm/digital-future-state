const crypto = require("node:crypto");

// Stripe signs the exact raw request body. Never trust an unsigned event.
// Disable Vercel/Next automatic body parsing so signature verification uses
// the original bytes received from Stripe.
// This endpoint verifies and acknowledges events only; it does NOT grant
// membership access until durable, idempotent subscription processing exists.
module.exports.config = { api: { bodyParser: false } };

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return res.status(503).json({ error: "Stripe webhook is not configured" });
  }

  const signature = req.headers["stripe-signature"];
  if (typeof signature !== "string") {
    return res.status(400).json({ error: "Missing Stripe signature" });
  }

  // Vercel may expose the original bytes as rawBody. A string body is also
  // acceptable only if the platform preserved the exact bytes received.
  let raw = req.rawBody || (Buffer.isBuffer(req.body) ? req.body :
    (typeof req.body === "string" ? Buffer.from(req.body, "utf8") : null));
  if (!raw) {
    try {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      raw = Buffer.concat(chunks);
    } catch {
      return res.status(400).json({ error: "Unable to read raw request body" });
    }
  }
  if (!raw || !Buffer.isBuffer(raw)) {
    return res.status(400).json({
      error: "Raw request body unavailable; signature cannot be verified safely"
    });
  }

  const parts = Object.fromEntries(signature.split(",").map((part) => {
    const i = part.indexOf("=");
    return i < 0 ? [part, ""] : [part.slice(0, i), part.slice(i + 1)];
  }));
  const timestamp = parts.t;
  const supplied = signature.split(",")
    .filter((part) => part.startsWith("v1="))
    .map((part) => part.slice(3));

  if (!timestamp || !supplied.length || !/^\d+$/.test(timestamp)) {
    return res.status(400).json({ error: "Malformed Stripe signature" });
  }

  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (age > 300) {
    return res.status(400).json({ error: "Expired Stripe signature" });
  }

  const signedPayload = Buffer.concat([
    Buffer.from(timestamp + ".", "utf8"),
    raw
  ]);
  const expected = crypto.createHmac("sha256", secret).update(signedPayload).digest();

  const valid = supplied.some((value) => {
    if (!/^[a-f0-9]{64}$/i.test(value)) return false;
    const candidate = Buffer.from(value, "hex");
    return candidate.length === expected.length &&
      crypto.timingSafeEqual(candidate, expected);
  });
  if (!valid) {
    return res.status(400).json({ error: "Invalid Stripe signature" });
  }

  let event;
  try {
    event = JSON.parse(raw.toString("utf8"));
  } catch {
    return res.status(400).json({ error: "Invalid JSON payload" });
  }

  // Deliberately acknowledge only after signature validation. Subscription
  // activation is withheld until event-id deduplication and DB writes are added.
  return res.status(200).json({
    received: true,
    eventType: typeof event.type === "string" ? event.type : "unknown",
    subscriptionActivation: "not_enabled"
  });
};
