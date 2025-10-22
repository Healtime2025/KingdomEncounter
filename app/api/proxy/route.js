/***************************************************************
 * 👑 FlowRSVP Proxy Gateway — Royal Mirror Build (v4.1 Edge)
 * App Router File: app/api/proxy/route.js
 * - Runs on Edge runtime for ultra-low latency
 * - Restricts requests to verified Vercel domains
 * - Reflects exact Origin + adds 2h CORS preflight caching
 * - Returns consistent JSON output for all responses
 ***************************************************************/

export const runtime = "edge";

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzP12f7PrNTLY8Jz0y9RGlxpKDNGUQ6U7C1lWz4o7JwPk_ekQ-kn7ihSKYLq6CnSMzVSw/exec";

/* ============================================================
 * 🧭 Domain Whitelist
 * ============================================================ */
function isAllowedOriginHeader(origin) {
  if (!origin || typeof origin !== "string") return false;
  try {
    const { hostname } = new URL(origin);
    return (
      hostname === "kingdom-encounter.vercel.app" ||
      (hostname.endsWith(".vercel.app") &&
        hostname.startsWith("kingdom-encounter-")) // preview builds
    );
  } catch {
    return false;
  }
}

function pickOrigin(req) {
  const origin = req.headers.get("origin") || "";
  return isAllowedOriginHeader(origin) ? origin : "";
}

/* ============================================================
 * 🛡️ CORS Helpers
 * ============================================================ */
function corsHeaders(origin) {
  const base = {
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Max-Age": "7200", // 2h
    Vary: "Origin"
  };
  return origin ? { "Access-Control-Allow-Origin": origin, ...base } : base;
}

function jsonResponse(obj, status = 200, origin = "") {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) }
  });
}

/* ============================================================
 * 🛰️ OPTIONS — Preflight
 * ============================================================ */
export async function OPTIONS(req) {
  const origin = pickOrigin(req);
  return new Response("OK", { status: 200, headers: corsHeaders(origin) });
}

/* ============================================================
 * 📡 GET — Proxy to GAS
 * ============================================================ */
export async function GET(req) {
  const origin = pickOrigin(req);
  if (!origin)
    return jsonResponse(
      { ok: false, error: "Forbidden — unauthorized domain" },
      403
    );

  try {
    const inUrl = new URL(req.url);
    const outUrl = new URL(SCRIPT_URL);

    inUrl.searchParams.forEach((v, k) => outUrl.searchParams.set(k, v));
    outUrl.searchParams.set("origin", origin);

    const response = await fetch(outUrl.toString());
    const text = await response.text();

    try {
      const json = JSON.parse(text);
      return jsonResponse(json, response.status, origin);
    } catch {
      return jsonResponse({ ok: true, raw: text }, response.status, origin);
    }
  } catch (err) {
    return jsonResponse(
      { ok: false, error: "Proxy GET failed", detail: String(err) },
      500,
      origin
    );
  }
}

/* ============================================================
 * 📨 POST — Proxy JSON or Form Data to GAS
 * ============================================================ */
export async function POST(req) {
  const origin = pickOrigin(req);
  if (!origin)
    return jsonResponse(
      { ok: false, error: "Forbidden — unauthorized domain" },
      403
    );

  try {
    const inUrl = new URL(req.url);
    const outUrl = new URL(SCRIPT_URL);
    inUrl.searchParams.forEach((v, k) => outUrl.searchParams.set(k, v));
    outUrl.searchParams.set("origin", origin);

    const contentType = (req.headers.get("content-type") || "").toLowerCase();
    let body;

    if (contentType.includes("application/json")) {
      const data = await req.json().catch(() => ({}));
      body = JSON.stringify({ ...data, origin });
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const raw = await req.text();
      const params = new URLSearchParams(raw);
      if (!params.has("origin")) params.set("origin", origin);
      body = params.toString();
    } else {
      body = await req.text();
    }

    const backend = await fetch(outUrl.toString(), {
      method: "POST",
      headers: { "Content-Type": contentType },
      body
    });

    const text = await backend.text();
    try {
      const json = JSON.parse(text);
      return jsonResponse(json, backend.status, origin);
    } catch {
      return jsonResponse({ ok: true, raw: text }, backend.status, origin);
    }
  } catch (err) {
    return jsonResponse(
      { ok: false, error: "Proxy POST failed", detail: String(err) },
      500,
      origin
    );
  }
}
