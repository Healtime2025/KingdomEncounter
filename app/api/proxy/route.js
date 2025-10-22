/***************************************************************
 * 👑 FlowRSVP Proxy Gateway — Royal Mirror Build (v4.0)
 * App Router file: app/api/proxy/route.js
 * - Locks to your kingdom-encounter Vercel domains (prod + previews)
 * - Reflects exact origin; adds Max-Age + Vary
 * - Always returns JSON; forwards origin hint to GAS
 ***************************************************************/

export const runtime = 'edge'; // optional: fast, low-latency

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzP12f7PrNTLY8Jz0y9RGlxpKDNGUQ6U7C1lWz4o7JwPk_ekQ-kn7ihSKYLq6CnSMzVSw/exec';

// Allow production and previews for this project only
function isAllowedOriginHeader(origin) {
  if (!origin || typeof origin !== 'string') return false;
  try {
    const u = new URL(origin);
    const host = u.hostname; // e.g., kingdom-encounter.vercel.app or kingdom-encounter-xxxxx.vercel.app
    // Prod:
    if (host === 'kingdom-encounter.vercel.app') return true;
    // Previews created by the same project:
    if (host.endsWith('.vercel.app') && host.startsWith('kingdom-encounter-')) return true;
    return false;
  } catch {
    return false;
  }
}

function pickOrigin(req) {
  const o = req.headers.get('origin') || '';
  return isAllowedOriginHeader(o) ? o : '';
}

function corsHeaders(origin) {
  const base = {
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '7200',
    'Vary': 'Origin'
  };
  // If we have a valid origin, reflect it; otherwise don’t set ACAO
  return origin ? { 'Access-Control-Allow-Origin': origin, ...base } : base;
}

function jsonResponse(obj, status = 200, origin = '') {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(origin)
    }
  });
}

/* ------------------------------------------------------------
 * OPTIONS — preflight
 * ------------------------------------------------------------ */
export async function OPTIONS(req) {
  const origin = pickOrigin(req);
  return new Response('OK', { status: 200, headers: corsHeaders(origin) });
}

/* ------------------------------------------------------------
 * GET — forward to GAS (adds origin hint)
 *   /api/proxy?action=stats
 * ------------------------------------------------------------ */
export async function GET(req) {
  const origin = pickOrigin(req);
  if (!origin) return jsonResponse({ ok: false, error: 'Forbidden — unauthorized domain' }, 403);

  try {
    const inUrl = new URL(req.url);
    const outUrl = new URL(SCRIPT_URL);
    // forward query + origin hint
    inUrl.searchParams.forEach((v, k) => outUrl.searchParams.set(k, v));
    outUrl.searchParams.set('origin', origin);

    const r = await fetch(outUrl.toString(), { method: 'GET' });
    const text = await r.text();

    // try to return JSON; if GAS sent HTML/text, wrap it
    try {
      const json = JSON.parse(text);
      return jsonResponse(json, r.status, origin);
    } catch {
      return jsonResponse({ ok: true, raw: text }, r.status, origin);
    }
  } catch (err) {
    return jsonResponse({ ok: false, error: 'Proxy GET failed', detail: String(err) }, 500, origin);
  }
}

/* ------------------------------------------------------------
 * POST — forward payload to GAS (adds origin hint)
 *   Accepts JSON or form-urlencoded
 * ------------------------------------------------------------ */
export async function POST(req) {
  const origin = pickOrigin(req);
  if (!origin) return jsonResponse({ ok: false, error: 'Forbidden — unauthorized domain' }, 403);

  try {
    const inUrl = new URL(req.url);
    const outUrl = new URL(SCRIPT_URL);
    inUrl.searchParams.forEach((v, k) => outUrl.searchParams.set(k, v));
    outUrl.searchParams.set('origin', origin);

    const contentType = (req.headers.get('content-type') || '').toLowerCase();
    let fetchInit;

    if (contentType.includes('application/json')) {
      // Pass through as JSON
      const bodyObj = await req.json().catch(() => ({}));
      // Also include origin in body for GAS logs if desired
      const merged = { ...bodyObj, origin };
      fetchInit = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged)
      };
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const raw = await req.text();
      // Ensure origin is included
      const params = new URLSearchParams(raw);
      if (!params.has('origin')) params.set('origin', origin);
      fetchInit = {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      };
    } else {
      // Fallback: treat as raw text, but still forward
      const raw = await req.text();
      fetchInit = { method: 'POST', body: raw };
    }

    const r = await fetch(outUrl.toString(), fetchInit);
    const text = await r.text();

    try {
      const json = JSON.parse(text);
      return jsonResponse(json, r.status, origin);
    } catch {
      return jsonResponse({ ok: true, raw: text }, r.status, origin);
    }
  } catch (err) {
    return jsonResponse({ ok: false, error: 'Proxy POST failed', detail: String(err) }, 500, origin);
  }
}
