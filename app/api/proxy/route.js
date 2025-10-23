/***************************************************************
 * 👑 FlowRSVP Proxy Gateway — Royal Mirror Build (v5.1 Final)
 * Bridges Vercel ↔ Google Apps Script (JSON only)
 ***************************************************************/

export const runtime = "edge"; // ultra-fast, stateless

// ✅ Your verified Google Apps Script endpoint
const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzP12f7PrNTLY8Jz0y9RGlxpKDNGUQ6U7C1lWz4o7JwPk_ekQ-kn7ihSKYLq6CnSMzVSw/exec";

/* ------------------------------------------------------------
 * 🛰️  CORS-SAFE PROXY HANDLER
 * ------------------------------------------------------------ */
export async function OPTIONS() {
  return new Response("OK", {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export async function POST(req) {
  try {
    const body = await req.text();

    // Forward JSON directly to GAS endpoint
    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    // Pass GAS response straight back to client
    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: err.message || "Proxy failed" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
