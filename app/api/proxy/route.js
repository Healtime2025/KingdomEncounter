/***************************************************************
 * 👑 FlowRSVP Proxy Gateway — Royal Mirror Build (v5.2)
 * Bridges Vercel ↔ Google Apps Script (JSON only)
 ***************************************************************/
export const runtime = "edge"; // ultra-fast, stateless

// ✅ Your verified Google Apps Script endpoint
const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzP12f7PrNTLY8Jz0y9RGlxpKDNGUQ6U7C1lWz4o7JwPk_ekQ-kn7ihSKYLq6CnSMzVSw/exec";

/* ------------------------------------------------------------
 * GET — simple health check (visit in browser)
 * ------------------------------------------------------------ */
export async function GET() {
  return new Response(
    JSON.stringify({ ok: true, service: "FlowRSVP Proxy Online" }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

/* ------------------------------------------------------------
 * OPTIONS — CORS preflight
 * ------------------------------------------------------------ */
export async function OPTIONS() {
  return new Response("OK", {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400"
    }
  });
}

/* ------------------------------------------------------------
 * POST — forward JSON to GAS and return its JSON
 * ------------------------------------------------------------ */
export async function POST(req) {
  try {
    const body = await req.text();

    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body
    });

    const text = await res.text(); // GAS returns JSON text
    return new Response(text, {
      status: res.status,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      }
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: err.message || "Proxy failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
