/***************************************************************
 * 👑 FlowRSVP Proxy Gateway — Royal Mirror Build (v3.0)
 * Secure, fault-tolerant bridge between Vercel and Google Apps Script.
 * Supports CORS, JSON, and form-encoded bodies gracefully.
 ***************************************************************/

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzP12f7PrNTLY8Jz0y9RGlxpKDNGUQ6U7C1lWz4o7JwPk_ekQ-kn7ihSKYLq6CnSMzVSw/exec";

/* ------------------------------------------------------------
 * 🛰️  Handle all HTTP methods (Next.js App Router format)
 * ------------------------------------------------------------ */
export async function OPTIONS() {
  return new Response("OK", {
    status: 200,
    headers: corsHeaders(),
  });
}

export async function GET(req) {
  const query = req.url.split("?")[1] || "";
  const targetUrl = `${SCRIPT_URL}${query ? "?" + query : ""}`;
  try {
    const res = await fetch(targetUrl);
    const text = await res.text();
    return makeSafeResponse(text, res.status);
  } catch (err) {
    return errorResponse("Proxy GET failed", err);
  }
}

export async function POST(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.toString();
    const targetUrl = `${SCRIPT_URL}${query ? "?" + query : ""}`;

    const contentType = req.headers.get("content-type") || "";
    let body;

    if (contentType.includes("application/json")) {
      const json = await req.json();
      body = JSON.stringify(json);
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const form = await req.text();
      body = form;
    } else {
      body = await req.text();
    }

    const backend = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": contentType },
      body,
    });

    const text = await backend.text();
    return makeSafeResponse(text, backend.status);
  } catch (err) {
    return errorResponse("Proxy POST failed", err);
  }
}

/* ------------------------------------------------------------
 * 🧩 Helper Functions
 * ------------------------------------------------------------ */
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

function makeSafeResponse(text, status = 200) {
  try {
    const json = JSON.parse(text);
    return new Response(JSON.stringify(json), {
      status,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  } catch {
    return new Response(JSON.stringify({ ok: true, raw: text }), {
      status,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  }
}

function errorResponse(message, error) {
  console.error("🔥 Royal Proxy Error:", message, error);
  return new Response(
    JSON.stringify({
      ok: false,
      error: message,
      detail: error?.message || String(error),
    }),
    {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    }
  );
}
