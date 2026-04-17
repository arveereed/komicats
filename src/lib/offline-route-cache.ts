"use client";

const ROUTE_CACHE_NAME = "komicats-routes-v1";

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

export async function warmOfflineComicRoutes(
  comicId: string,
  episodeIds: string[],
) {
  if (
    typeof window === "undefined" ||
    !("caches" in window) ||
    navigator.onLine === false
  ) {
    return;
  }

  const urls = uniqueStrings([
    "/profile/avatar/downloads",
    "/offline",
    `/profile/avatar/downloads/${comicId}`,
    ...episodeIds.map(
      (episodeId) => `/profile/avatar/downloads/${comicId}/${episodeId}`,
    ),
  ]);

  const cache = await caches.open(ROUTE_CACHE_NAME);

  await Promise.all(
    urls.map(async (url) => {
      try {
        const response = await fetch(url, {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
          headers: {
            Accept: "text/html",
          },
        });

        if (response.ok) {
          await cache.put(url, response.clone());
        }
      } catch (error) {
        console.error("Failed to warm offline route cache:", url, error);
      }
    }),
  );
}
