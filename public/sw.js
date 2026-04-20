const CACHE_NAME = "komicats-v15";
const OFFLINE_SHELL_URL = "/offline-downloads-shell.html";
const DOWNLOADS_ENTRY_URL = "/profile/avatar/downloads";

const PRECACHE_URLS = [
  OFFLINE_SHELL_URL,
  "/offline-downloads-shell.js",
  "/manifest.webmanifest",
  "/pwa-icon.png",
  "/pwa-icon-2.png",
  "/BACKGROUND.png",
  "/icons/bg-logo.png",
  "/icons/Menu.png",
  "/icons/info.png",
  "/icons/dl.png",
];

async function putInCache(request, response) {
  if (!response || response.status !== 200) return;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
}

function toAbsoluteUrl(pathname) {
  return new URL(pathname, self.location.origin).toString();
}

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

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  if (req.method !== "GET") return;

  const url = new URL(req.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isDownloadsRoute = url.pathname.startsWith(DOWNLOADS_ENTRY_URL);
  const accept = req.headers.get("accept") || "";
  const wantsHtml = accept.includes("text/html");
  const isNavigationRequest = req.mode === "navigate" || wantsHtml;

  if (isSameOrigin && url.pathname === "/offline-downloads-shell.html") {
    event.respondWith(
      (async () => {
        try {
          const network = await fetch(req, { cache: "no-store" });
          if (
            network &&
            network.status === 200 &&
            (network.type === "basic" || network.type === "default")
          ) {
            await putInCache(req, network.clone());
          }
          return network;
        } catch (error) {
          const cached = await caches.match(req);
          if (cached) return cached;

          return new Response("Offline shell unavailable", {
            status: 503,
            headers: { "Content-Type": "text/plain" },
          });
        }
      })(),
    );
    return;
  }

  // 1) Downloads routes
  // online => real Next page
  // offline => offline shell
  if (isDownloadsRoute && isNavigationRequest) {
    event.respondWith(
      (async () => {
        try {
          const preload = await event.preloadResponse;
          if (preload) return preload;

          return await fetch(req, { cache: "no-store" });
        } catch (error) {
          const shell = await caches.match(OFFLINE_SHELL_URL);
          if (shell) return shell;

          return new Response("Offline shell unavailable", {
            status: 503,
            headers: { "Content-Type": "text/plain" },
          });
        }
      })(),
    );
    return;
  }

  // 2) If offline and opening another page, send user to downloads
  if (
    isNavigationRequest &&
    self.navigator &&
    self.navigator.onLine === false
  ) {
    event.respondWith(
      Response.redirect(toAbsoluteUrl(DOWNLOADS_ENTRY_URL), 302),
    );
    return;
  }

  // 3) Normal app navigations
  // always fresh online, no HTML caching
  if (isNavigationRequest && isSameOrigin) {
    event.respondWith(
      (async () => {
        try {
          const preload = await event.preloadResponse;
          if (preload) return preload;

          return await fetch(req, { cache: "no-store" });
        } catch (error) {
          return Response.redirect(toAbsoluteUrl(DOWNLOADS_ENTRY_URL), 302);
        }
      })(),
    );
    return;
  }

  // 4) Only cache simple public assets needed by offline shell
  const isOfflineShellAsset =
    isSameOrigin &&
    (url.pathname === "/offline-downloads-shell.html" ||
      url.pathname === "/offline-downloads-shell.js" ||
      url.pathname === "/pwa-icon.png" ||
      url.pathname === "/pwa-icon-2.png" ||
      url.pathname === "/BACKGROUND.png" ||
      url.pathname.startsWith("/icons/"));

  if (isOfflineShellAsset) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(req);
        if (cached) return cached;

        try {
          const network = await fetch(req);
          if (
            network &&
            network.status === 200 &&
            (network.type === "basic" || network.type === "default")
          ) {
            await putInCache(req, network.clone());
          }
          return network;
        } catch (error) {
          return new Response("", { status: 504 });
        }
      })(),
    );
    return;
  }

  // 5) IMPORTANT:
  // Never cache Next.js build assets, always fetch fresh.
  if (isSameOrigin && url.pathname.startsWith("/_next/")) {
    event.respondWith(fetch(req, { cache: "no-store" }));
    return;
  }
});
