// 👑 FlowRSVP Proxy Gateway — Royal Mirror Build
export default async function handler(req, res) {
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzP12f7PrNTLY8Jz0y9RGlxpKDNGUQ6U7C1lWz4o7JwPk_ekQ-kn7ihSKYLq6CnSMzVSw/exec";

  // Determine method + prepare target
  const target = new URL(SCRIPT_URL);
  target.search = req.url.split("?")[1] || "";

  try {
    const response = await fetch(target.toString(), {
      method: req.method,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: req.method === "POST" ? new URLSearchParams(req.body).toString() : undefined,
    });

    const text = await response.text();
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Return JSON or text based on response
    try {
      res.status(200).json(JSON.parse(text));
    } catch {
      res.status(200).send(text);
    }
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ ok: false, error: "Proxy failed to reach backend" });
  }
}

// Preflight handler
export const config = {
  api: {
    bodyParser: true,
  },
};
