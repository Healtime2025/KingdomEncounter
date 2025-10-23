/***************************************************************
 * 👑 FlowRSVP Proxy Gateway — Royal Mirror Build (v5.0 Stable)
 * Bridges Vercel ↔ Google Apps Script (JSON only)
 ***************************************************************/

export const runtime = "edge"; // Faster & stateless

// ✅ Use your working Googleusercontent endpoint
const SCRIPT_URL =
  "https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLg8Vf1D4aLDLI7MdX6CVU5T2ulCvLWW2_..."; // ← paste full URL

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

    // Forward JSON directly to your GAS endpoint
    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

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
