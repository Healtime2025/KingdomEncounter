/* =========================================================
 * FlowRSVP — No Cache Service Worker (Final Version)
 * Ensures users always load the latest version
 * ========================================================= */
self.addEventListener("install", () => {
  console.log("FlowRSVP SW installed");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("FlowRSVP SW activated — clearing old caches");
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request, { cache: "no-store" }));
});
