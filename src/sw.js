// The build replaces these markers whenever the site's contents change.
const VERSION = "BUILD_VERSION";
const ASSETS = BUILD_ASSETS;
const PREFIX = `usdtoman-${self.registration.scope}-`;
const CACHE = PREFIX + VERSION;

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await cache.addAll(
        ASSETS.map(
          (path) =>
            new Request(new URL(path, self.registration.scope), {
              cache: "reload",
            }),
        ),
      );
      await self.skipWaiting();
    })(),
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith(PREFIX) && key !== CACHE)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (
    event.request.method !== "GET" ||
    !url.href.startsWith(self.registration.scope)
  )
    return;
  const path = url.pathname.slice(
    new URL(self.registration.scope).pathname.length,
  );
  const asset = event.request.mode === "navigate" ? "index.html" : path;
  if (!ASSETS.includes(asset)) return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const key = new URL(asset, self.registration.scope).href;
      // The build creates a new cache whenever assets change. Only the page
      // and price snapshot need network-first freshness within that version.
      if (asset !== "index.html" && asset !== "data.json") {
        const cached = await cache.match(key);
        if (cached) return cached;
      }
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      try {
        const response = await fetch(event.request, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw Error(response.status);
        // Keep the latest published data available for offline visits.
        await cache.put(key, response.clone());
        return response;
      } catch {
        const cached = await cache.match(key);
        return cached || Response.error();
      } finally {
        clearTimeout(timeout);
      }
    })(),
  );
});
