const ASSET_CACHE = "hue-tour-assets-v1";
const SHELL_CACHE = "hue-tour-shell-v1";
const KNOWN_CACHES = new Set([ASSET_CACHE, SHELL_CACHE]);

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => !KNOWN_CACHES.has(name))
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || request.headers.has("range")) return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (
    url.pathname === "/online" ||
    url.pathname === "/ws" ||
    url.pathname === "/health" ||
    url.pathname === "/sw.js"
  ) {
    return;
  }

  // Immutable content-hashed build assets (JS chunks, CSS, GLBs, WAVs, images)
  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(ASSET_CACHE);
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response && response.status === 200) {
          void cache.put(request, response.clone());
        }
        return response;
      })(),
    );
    return;
  }

  // Network-first for HTML navigations so deploys always pick up new hashed bundles
  if (
    request.mode === "navigate" ||
    url.pathname === "/" ||
    url.pathname === "/index.html"
  ) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(SHELL_CACHE);
        try {
          const response = await fetch(request);
          if (response && response.status === 200) {
            void cache.put(request, response.clone());
          }
          return response;
        } catch (error) {
          const cached = await cache.match(request);
          if (cached) return cached;
          throw error;
        }
      })(),
    );
  }
});
