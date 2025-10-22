/* ===========================================================
 * 👑 Royal Network Guard — blocks direct GAS calls
 * File: src/utils/guard.js
 * Load once on the client (e.g., in app/layout.tsx or _app.tsx)
 * ===========================================================
 *
 * Modes:
 *   - MODE = 'block'   → throw on any direct script.google.com call
 *   - MODE = 'rewrite' → transparently reroute to /api/proxy
 *
 * What it guards:
 *   - window.fetch(...)
 *   - XMLHttpRequest (open/send)
 *   - navigator.sendBeacon
 *
 * Notes:
 *   - SSR-safe (no-op when window is undefined)
 *   - Only touches calls that target Google Apps Script hosts
 *   - Keeps method/body/headers when rewriting via fetch
 */

export function initRoyalNetworkGuard(options = {}) {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  // ====== Config ======
  const MODE = options.mode === "rewrite" ? "rewrite" : "block"; // 'block' | 'rewrite'
  const PROXY_PATH = options.proxyPath || "/api/proxy";
  const GAS_HOSTS = [
    "https://script.google.com",
    "https://script.googleusercontent.com",
  ];

  // Helpful log prefix
  const TAG = "👑 Royal Guard";

  // ====== Helpers ======
  function isGASUrl(input) {
    try {
      const url = typeof input === "string" ? input : input?.url || "";
      if (!url) return false;
      const u = new URL(url, window.location.href);
      return GAS_HOSTS.some((h) => u.origin === h);
    } catch {
      return false;
    }
  }

  function buildProxyUrlFrom(originalUrl) {
    // Preserve query string for GETs like ?action=stats
    try {
      const u = new URL(originalUrl, window.location.href);
      // Pass original query to proxy too (it will forward to GAS)
      return `${PROXY_PATH}${u.search || ""}`;
    } catch {
      return PROXY_PATH;
    }
  }

  function explain(url) {
    console.warn(
      `${TAG}: Direct call blocked → ${url}\n` +
      `Use ${PROXY_PATH} instead.`
    );
  }

  function throwGuardError(url) {
    explain(url);
    throw new Error("Direct GAS call blocked. Use /api/proxy instead.");
  }

  function rewriteRequestForFetch(input, init = {}) {
    // Convert any fetch to hit /api/proxy, keeping method/body/headers
    const originalUrl = typeof input === "string" ? input : input?.url || "";
    const proxyUrl = buildProxyUrlFrom(originalUrl);

    // Clone the init to avoid mutations
    const nextInit = { ...init };

    // Default method = GET if not provided
    nextInit.method = (init.method || "GET").toUpperCase();

    // If original was GET with a body (rare), drop body (browser does that anyway)
    if (nextInit.method === "GET") {
      delete nextInit.body;
    }

    // Ensure Content-Type remains consistent; avoid adding custom headers if not present
    // (preflight will still hit our proxy, which is fine)
    return [proxyUrl, nextInit];
  }

  // ====== fetch guard ======
  try {
    const _fetch = window.fetch.bind(window);
    window.fetch = async (input, init) => {
      const url = typeof input === "string" ? input : input?.url || "";
      if (isGASUrl(url)) {
        if (MODE === "block") {
          throwGuardError(url);
        } else {
          console.warn(`${TAG}: Rewriting fetch → ${url} → ${PROXY_PATH}`);
          const [rewrittenUrl, nextInit] = rewriteRequestForFetch(url, init || {});
          return _fetch(rewrittenUrl, nextInit);
        }
      }
      return _fetch(input, init);
    };
  } catch (err) {
    console.error(`${TAG}: Failed to wrap fetch`, err);
  }

  // ====== XHR guard ======
  try {
    const OriginalXHR = window.XMLHttpRequest;
    function RoyalXHR() {
      const xhr = new OriginalXHR();

      let origMethod = "GET";
      let origUrl = "";
      let proxied = false;
      let proxyUrl = "";

      const _open = xhr.open;
      xhr.open = function(method, url, async, user, password) {
        try {
          origMethod = (method || "GET").toUpperCase();
          origUrl = String(url || "");
          if (isGASUrl(origUrl)) {
            if (MODE === "block") {
              throwGuardError(origUrl);
            } else {
              proxied = true;
              proxyUrl = buildProxyUrlFrom(origUrl);
              console.warn(`${TAG}: Rewriting XHR.open → ${origUrl} → ${proxyUrl}`);
              return _open.call(xhr, origMethod, proxyUrl, async, user, password);
            }
          }
        } catch {}
        return _open.call(xhr, method, url, async, user, password);
      };

      // If we rewrote the URL, we simply forward body as-is
      const _send = xhr.send;
      xhr.send = function(body) {
        if (proxied) {
          // Nothing else to do; proxy route will forward content-type/body downstream
          try {
            return _send.call(xhr, body);
          } catch (e) {
            console.error(`${TAG}: XHR.send failed on proxied request`, e);
            throw e;
          }
        }
        return _send.call(xhr, body);
      };

      return xhr;
    }
    window.XMLHttpRequest = RoyalXHR;
  } catch (err) {
    console.error(`${TAG}: Failed to wrap XMLHttpRequest`, err);
  }

  // ====== sendBeacon guard ======
  try {
    if (navigator && typeof navigator.sendBeacon === "function") {
      const _sendBeacon = navigator.sendBeacon.bind(navigator);
      navigator.sendBeacon = function(url, data) {
        if (isGASUrl(url)) {
          if (MODE === "block") {
            explain(url);
            return false; // signal failure to queue the beacon
          } else {
            console.warn(`${TAG}: Rewriting sendBeacon → ${url} → ${PROXY_PATH}`);
            // Emulate beacon with fetch keepalive
            try {
              const proxyUrl = buildProxyUrlFrom(url);
              fetch(proxyUrl, { method: "POST", body: data, keepalive: true });
              return true;
            } catch {
              return false;
            }
          }
        }
        return _sendBeacon(url, data);
      };
    }
  } catch (err) {
    console.error(`${TAG}: Failed to wrap sendBeacon`, err);
  }

  console.info(`${TAG}: active (mode="${MODE}", proxy="${PROXY_PATH}")`);
}

/* ===========================================================
 * Usage (App Router):
 *   // app/layout.tsx (client component)
 *   "use client";
 *   import { useEffect } from "react";
 *   import { initRoyalNetworkGuard } from "@/utils/guard";
 *
 *   export default function RootLayout({ children }) {
 *     useEffect(() => {
 *       initRoyalNetworkGuard({ mode: "block", proxyPath: "/api/proxy" });
 *     }, []);
 *     return <html><body>{children}</body></html>;
 *   }
 *
 * Usage (Pages Router):
 *   // pages/_app.tsx
 *   import { useEffect } from "react";
 *   import { initRoyalNetworkGuard } from "@/utils/guard";
 *   export default function App({ Component, pageProps }) {
 *     useEffect(() => {
 *       initRoyalNetworkGuard({ mode: "block", proxyPath: "/api/proxy" });
 *     }, []);
 *     return <Component {...pageProps} />;
 *   }
 * ===========================================================
 */
