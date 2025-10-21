/* =========================================================
 * 👑 FlowRSVP — Royal Smart Service Worker (v2.0)
 * - Clears old caches on activation
 * - No caching of API/form requests
 * - Detects new version updates
 * - Shows toast: "New version available — Refresh now"
 * ========================================================= */

const CACHE_NAME = "flowrsvp-v2";
const APP_SHELL = ["/"]; // you can list static routes if needed

// Install — precache minimal shell
self.addEventListener("install", (event) => {
  console.log("👑 FlowRSVP SW installed");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Activate — remove old caches
self.addEventListener("activate", (event) => {
  console.log("👑 FlowRSVP SW activated — clearing old caches");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch — always get latest from network (no stale cache)
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (
    request.url.includes("/api/") ||
    request.method !== "GET" ||
    request.cache === "no-store"
  ) {
    event.respondWith(fetch(request));
    return;
  }

  // Basic network-first fetch for normal pages
  event.respondWith(
    fetch(request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// Listen for new SW waiting — trigger client notification
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

/* =========================================================
 * 👑 Broadcast update prompt
 * ========================================================= */
self.addEventListener("statechange", (event) => {
  if (event.target.state === "installed") {
    sendMessageToClients({ type: "UPDATE_AVAILABLE" });
  }
});

function sendMessageToClients(msg) {
  self.clients.matchAll({ includeUncontrolled: true }).then((clients) => {
    for (const client of clients) {
      client.postMessage(msg);
    }
  });
}
