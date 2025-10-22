/***************************************************************
 * 👑 FlowRSVP Proxy Gateway — Royal Mirror Build (v3.5 LOCKED)
 * Secure, fault-tolerant bridge between Vercel and Google Apps Script.
 * Locks down to official domain only.
 ***************************************************************/

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzP12f7PrNTLY8Jz0y9RGlxpKDNGUQ6U7C1lWz4o7JwPk_ekQ-kn7ihSKYLq6CnSMzVSw/exec";

// 🛡️ Allowed domain for all requests
const ALLOWED_DOMAIN = "https://kingdom-encounter.vercel.app";

/* ------------------------------------------------------------
 * 🛰️ OPTIONS — handle preflight safely
 * ------------------------------------------------------------ */
export async function OPTIONS() {
  return new Response("OK", {
    status: 200,
    headers: corsHeaders(),
  });
}

/* ------------------------------------------------------------
 * 📡 GET — simply forward to GAS
 * ------------------------------------------------------------ */
export async function GET(req) {
  if (!isAllowedOrigin(req)) return forbiddenResponse(req);

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

/* ------------------------------------------------------------
 * 📨 POST — forward payload to GAS
 * ------------------------------------------------------------ */
export async function POST(req) {
  if (!isAllowedOrigin(req)) return forbiddenResponse(req);

  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.toString();
    const targetUrl = `${SCRIPT_URL}${query ? "?" + query : ""}`;

    const contentType = req.headers.get("content-type") || "";
    let body;

    if (contentType.includes("application/json")) {
      body = JSON.stringify(await req.json());
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      body = await req.text();
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
 * 🧩 Utility Helpers
 * ------------------------------------------------------------ */

// ✅ CORS headers with fixed allowlist
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_DOMAIN,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

// ✅ Check request origin (strict match)
function isAllowedOrigin(req) {
  try {
    const origin = req.headers.get("origin") || "";
    const referer = req.headers.get("referer") || "";
    return (
      origin.startsWith(ALLOWED_DOMAIN) ||
      referer.startsWith(ALLOWED_DOMAIN)
    );
  } catch {
    return false;
  }
}

// 🚫 Deny all disallowed origins
function forbiddenResponse(req) {
  const origin = req.headers.get("origin") || "unknown";
  console.warn("🚫 Blocked unauthorized origin:", origin);
  return new Response(
    JSON.stringify({
      ok: false,
      error: "Forbidden — unauthorized domain",
      origin,
      allowed: ALLOWED_DOMAIN,
    }),
    {
      status: 403,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders(),
      },
    }
  );
}

// ✅ Format safe JSON response
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

// ❌ Standardized error handler
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
