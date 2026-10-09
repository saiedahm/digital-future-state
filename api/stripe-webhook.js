// Stripe webhook is deliberately fail-closed until signature verification is implemented.
// Never mark a membership active based on a browser redirect or unsigned event.
module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  return res.status(503).json({ error: "Webhook is not configured. Membership status has not been changed." });
};
