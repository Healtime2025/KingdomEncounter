/* =========================================================
 * FlowRSVP Service Worker (No Cache Mode for Debugging)
 * ---------------------------------------------------------
 * Purpose: Prevent cached JS/HTML from reloading old pages
 * ========================================================= */

self.addEventListener("install", (event) => {
  console.log("FlowRSVP SW installed");
  // Force activation immediately
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("FlowRSVP SW activated — clearing old caches");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => caches.delete(key)))
    )
  );
  // Take control of all open pages right away
  self.clients.claim();
});

/* 🔒 Intercept all fetches and bypass cache completely */
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request, { cache: "no-store" }).catch(() =>
      new Response("Offline mode unavailable.", { status: 503 })
    )
  );
});
