const CACHE_NAME = "komicats-v6";
const OFFLINE_HTML_URL = "/offline.html";

const PRECACHE_URLS = [
  "/",
  OFFLINE_HTML_URL,
  "/manifest.webmanifest",
  "/pwa-icon.png",
  "/pwa-icon-2.png",
  "/BACKGROUND.png",
  "/icons/bg-logo.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(PRECACHE_URLS);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
          return Promise.resolve();
        }),
      );

      if ("navigationPreload" in self.registration) {
        await self.registration.navigationPreload.enable();
      }

      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  if (req.method !== "GET") return;

  const url = new URL(req.url);
  const isSameOrigin = url.origin === self.location.origin;

  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) return preloadResponse;

          const networkResponse = await fetch(req);

          if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(req, networkResponse.clone());
          }

          return networkResponse;
        } catch (error) {
          const cachedPage = await caches.match(req);
          if (cachedPage) return cachedPage;

          const offlineResponse = await caches.match(OFFLINE_HTML_URL);
          if (offlineResponse) return offlineResponse;

          return new Response("Offline", {
            status: 503,
            headers: { "Content-Type": "text/plain" },
          });
        }
      })(),
    );
    return;
  }

  const isStaticAsset =
    isSameOrigin &&
    (url.pathname.startsWith("/_next/static/") ||
      url.pathname.startsWith("/icons/") ||
      url.pathname === "/pwa-icon.png" ||
      url.pathname === "/pwa-icon-2.png" ||
      url.pathname === "/BACKGROUND.png" ||
      url.pathname.endsWith(".css") ||
      url.pathname.endsWith(".js") ||
      url.pathname.endsWith(".png") ||
      url.pathname.endsWith(".jpg") ||
      url.pathname.endsWith(".jpeg") ||
      url.pathname.endsWith(".svg") ||
      url.pathname.endsWith(".webp") ||
      url.pathname.endsWith(".woff") ||
      url.pathname.endsWith(".woff2"));

  if (isStaticAsset) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(req);
        if (cached) return cached;

        try {
          const networkResponse = await fetch(req);

          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === "basic"
          ) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(req, networkResponse.clone());
          }

          return networkResponse;
        } catch (error) {
          return new Response("", { status: 504 });
        }
      })(),
    );
  }
});
