// Vercel serverless endpoint for support requests.
// Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY as server-only environment variables.
// Do not expose the service-role key to browser code.
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
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return res.status(503).json({ error: "Request service is not configured" });
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) return res.status(401).json({ error: "Sign-in required" });
  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { return res.status(400).json({ error: "Invalid JSON" }); } }
  if (!body || typeof body !== "object") return res.status(400).json({ error: "Invalid request body" });
  const category = String(body.category || "");
  const subject = String(body.subject || "").trim();
  const message = String(body.message || "").trim();
  const categories = ["complaint","service_request","technical","privacy","suggestion","other"];
  if (!categories.includes(category) || subject.length < 1 || subject.length > 160 || message.length < 1 || message.length > 10000) {
    return res.status(400).json({ error: "Please check the category, subject and message lengths." });
  }
  try {
    const userResponse = await fetch(url.replace(/\/$/, "") + "/auth/v1/user", {
      headers: { apikey: key, Authorization: auth }
    });
    if (!userResponse.ok) return res.status(401).json({ error: "Session is invalid or expired" });
    const user = await userResponse.json();
    const insertResponse = await fetch(url.replace(/\/$/, "") + "/rest/v1/requests", {
      method: "POST",
      headers: { apikey: key, Authorization: "Bearer " + key, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ user_id: user.id, category, subject, message })
    });
    if (!insertResponse.ok) {
      const detail = await insertResponse.text();
      console.error("Support request insert failed", insertResponse.status, detail.slice(0, 300));
      return res.status(502).json({ error: "Could not save request. Please try again later." });
    }
    return res.status(201).json({ ok: true, message: "Request received." });
  } catch (error) {
    console.error("Support request service failed", error && error.message);
    return res.status(502).json({ error: "Request service temporarily unavailable." });
  }
};
