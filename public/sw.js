const CACHE_NAME = "komicats-v11";
const OFFLINE_SHELL_URL = "/offline-downloads-shell.html";
const DOWNLOADS_ENTRY_URL = "/profile/avatar/downloads";

const PRECACHE_URLS = [
  "/",
  "/offline",
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

  // If user opens downloads route, always serve the offline shell first.
  if (isDownloadsRoute && isNavigationRequest) {
    event.respondWith(
      (async () => {
        const shell = await caches.match(OFFLINE_SHELL_URL);
        if (shell) return shell;

        try {
          const response = await fetch(OFFLINE_SHELL_URL, {
            cache: "no-store",
          });

          if (response.ok) {
            await putInCache(OFFLINE_SHELL_URL, response.clone());
            return response;
          }
        } catch (error) {
          console.error("Failed to fetch offline shell:", error);
        }

        return new Response("Offline shell unavailable", {
          status: 503,
          headers: { "Content-Type": "text/plain" },
        });
      })(),
    );
    return;
  }

  // If the user is offline and tries to open ANY other page,
  // automatically redirect them to downloads.
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

  // Normal navigations
  if (isNavigationRequest && isSameOrigin) {
    event.respondWith(
      (async () => {
        try {
          const preload = await event.preloadResponse;
          if (preload) {
            await putInCache(req, preload.clone());
            return preload;
          }

          const network = await fetch(req);
          await putInCache(req, network.clone());
          return network;
        } catch (error) {
          // If request fails, send user to downloads automatically.
          return Response.redirect(toAbsoluteUrl(DOWNLOADS_ENTRY_URL), 302);
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
      url.pathname === "/offline-downloads-shell.js" ||
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
  }
});
