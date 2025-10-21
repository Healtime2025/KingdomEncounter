// 👑 FlowRSVP Proxy Gateway — Royal Mirror Build (v3.0)
// Secure, fault-tolerant bridge between Vercel and Google Apps Script.

export default async function handler(req, res) {
  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbzP12f7PrNTLY8Jz0y9RGlxpKDNGUQ6U7C1lWz4o7JwPk_ekQ-kn7ihSKYLq6CnSMzVSw/exec";

  // ---------- 🌍 CORS Preflight ----------
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
    // ---------- 🧾 Normalize body ----------
    let body;
    if (req.method === "POST") {
      const ctype = req.headers["content-type"] || "";
      if (ctype.includes("application/json")) {
        body = JSON.stringify(req.body);
      } else if (ctype.includes("application/x-www-form-urlencoded")) {
        body = new URLSearchParams(req.body).toString();
      } else if (typeof req.body === "string") {
        body = req.body;
      } else {
        body = JSON.stringify(req.body || {});
      }
    }

    // ---------- 🚀 Forward request ----------
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        "Content-Type": req.headers["content-type"] || "application/x-www-form-urlencoded",
      },
      body: req.method === "POST" ? body : undefined,
    });

    const text = await response.text();

    // ---------- 🧠 Parse & respond ----------
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (!response.ok) {
      console.error("⚠️ Backend returned non-OK:", response.status, text);
      res
        .status(500)
        .json({ ok: false, error: `Backend error (${response.status})`, raw: text });
      return;
    }

    // Try to parse JSON; fallback safely
    try {
      const json = JSON.parse(text);
      res.status(200).json(json);
    } catch {
      res.status(200).json({ ok: true, raw: text });
    }
  } catch (error) {
    console.error("🔥 Proxy error:", error);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.status(500).json({
      ok: false,
      error: "Proxy failed to reach backend",
      detail: error.message || String(error),
    });
  }
}

// ✅ Allow JSON + form body parsing
export const config = {
  api: { bodyParser: true },
};
