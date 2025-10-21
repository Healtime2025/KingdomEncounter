// 👑 FlowRSVP Proxy Gateway — Royal Mirror Build (v2.0)
// Safely bridges Vercel ↔ Google Apps Script for cross-domain POST + GET

export default async function handler(req, res) {
  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbzP12f7PrNTLY8Jz0y9RGlxpKDNGUQ6U7C1lWz4o7JwPk_ekQ-kn7ihSKYLq6CnSMzVSw/exec";

  // --- CORS preflight (important for browser POST) ---
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.status(200).end();
    return;
  }

  const query = req.url.split("?")[1] || "";
  const targetUrl = `${SCRIPT_URL}${query ? "?" + query : ""}`;

  try {
    // Normalize body for Google Apps Script
    let body;
    if (req.method === "POST") {
      if (typeof req.body === "string") {
        body = req.body;
      } else if (req.headers["content-type"]?.includes("application/json")) {
        body = JSON.stringify(req.body);
      } else {
        body = new URLSearchParams(req.body).toString();
      }
    }

    // Forward the request
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: { "Content-Type": req.headers["content-type"] || "application/x-www-form-urlencoded" },
      body: req.method === "POST" ? body : undefined,
    });

    const text = await response.text();

    // --- Always respond with CORS headers ---
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    // Try parse JSON safely
    try {
      const data = JSON.parse(text);
      res.status(200).json(data);
    } catch {
      res.status(200).send(text);
    }
  } catch (error) {
    console.error("🔥 Proxy error:", error);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(500).json({ ok: false, error: "Proxy failed to reach backend" });
  }
}

// ✅ Ensure bodyParser is enabled for both JSON and form posts
export const config = {
  api: {
    bodyParser: true,
  },
};
