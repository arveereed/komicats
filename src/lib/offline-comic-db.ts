"use client";

import { DBSchema, IDBPDatabase, openDB } from "idb";

type OfflineEpisodeInput = {
  id: string;
  title: string;
  description?: string | null;
  images: { imageUrl: string }[];
};

type OfflineComicInput = {
  comicId: string;
  title: string;
  description?: string | null;
  coverImage?: string | null;
  previewVideo?: string | null;
  episodes: OfflineEpisodeInput[];
};

type StoredComicRow = {
  comicId: string;
  title: string;
  description?: string | null;
  coverImage?: string | null;
  coverImageBlob?: Blob | null;
  previewVideo?: string | null;
  previewVideoBlob?: Blob | null;
  totalPages: number;
  cachedPages: number;
  updatedAt: number;
};

type StoredPageRow = {
  id: string;
  comicId: string;
  episodeId: string;
  episodeTitle: string;
  episodeDescription?: string | null;
  episodePreviewImageBlob?: Blob | null;
  episodeIndex: number;
  episodeKey: string;
  pageIndex: number;
  blob: Blob;
};

interface ComicOfflineDB extends DBSchema {
  comics: {
    key: string;
    value: StoredComicRow;
  };
  pages: {
    key: string;
    value: StoredPageRow;
    indexes: {
      "by-comic": string;
      "by-episode": string;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<ComicOfflineDB>> | null = null;

function isBrowser() {
  return typeof window !== "undefined" && typeof indexedDB !== "undefined";
}

async function getDB() {
  if (!isBrowser()) {
    throw new Error("IndexedDB is only available in the browser");
  }

  if (!dbPromise) {
    dbPromise = openDB<ComicOfflineDB>("comic-offline-db", 2, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("comics")) {
          db.createObjectStore("comics", { keyPath: "comicId" });
        }

        if (!db.objectStoreNames.contains("pages")) {
          const pages = db.createObjectStore("pages", { keyPath: "id" });
          pages.createIndex("by-comic", "comicId");
          pages.createIndex("by-episode", "episodeKey");
        }
      },
    });
  }

  return dbPromise;
}

async function fetchBlobThroughProxy(url: string) {
  const response = await fetch(
    `/api/offline-image?url=${encodeURIComponent(url)}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(
      `Failed to cache media (${response.status}): ${message || url}`,
    );
  }

  return response.blob();
}

export async function hasOfflineComic(comicId: string) {
  const db = await getDB();
  const comic = await db.get("comics", comicId);
  return !!comic;
}

export async function saveComicOffline(
  payload: OfflineComicInput,
  onProgress?: (cached: number, total: number) => Promise<void> | void,
) {
  const db = await getDB();

  const totalPages = payload.episodes.reduce(
    (sum, episode) => sum + episode.images.length,
    0,
  );

  let cachedPages = 0;

  let coverImageBlob: Blob | null = null;
  let previewVideoBlob: Blob | null = null;

  try {
    if (payload.coverImage) {
      coverImageBlob = await fetchBlobThroughProxy(payload.coverImage);
    }
  } catch (error) {
    console.error("Failed to cache cover image:", error);
  }

  try {
    if (payload.previewVideo) {
      previewVideoBlob = await fetchBlobThroughProxy(payload.previewVideo);
    }
  } catch (error) {
    console.error("Failed to cache preview video:", error);
  }

  await db.put("comics", {
    comicId: payload.comicId,
    title: payload.title,
    description: payload.description ?? null,
    coverImage: payload.coverImage ?? null,
    coverImageBlob,
    previewVideo: payload.previewVideo ?? null,
    previewVideoBlob,
    totalPages,
    cachedPages: 0,
    updatedAt: Date.now(),
  });

  for (
    let episodeIndex = 0;
    episodeIndex < payload.episodes.length;
    episodeIndex++
  ) {
    const episode = payload.episodes[episodeIndex];

    let episodePreviewImageBlob: Blob | null = null;

    try {
      if (episode.images[0]?.imageUrl) {
        episodePreviewImageBlob = await fetchBlobThroughProxy(
          episode.images[0].imageUrl,
        );
      }
    } catch (error) {
      console.error("Failed to cache episode preview image:", error);
    }

    for (let pageIndex = 0; pageIndex < episode.images.length; pageIndex++) {
      const imageUrl = episode.images[pageIndex].imageUrl;
      const blob = await fetchBlobThroughProxy(imageUrl);

      await db.put("pages", {
        id: `${payload.comicId}:${episode.id}:${pageIndex}`,
        comicId: payload.comicId,
        episodeId: episode.id,
        episodeTitle: episode.title || `Episode ${episodeIndex + 1}`,
        episodeDescription: episode.description ?? null,
        episodePreviewImageBlob,
        episodeIndex,
        episodeKey: `${payload.comicId}:${episode.id}`,
        pageIndex,
        blob,
      });

      cachedPages += 1;

      await db.put("comics", {
        comicId: payload.comicId,
        title: payload.title,
        description: payload.description ?? null,
        coverImage: payload.coverImage ?? null,
        coverImageBlob,
        previewVideo: payload.previewVideo ?? null,
        previewVideoBlob,
        totalPages,
        cachedPages,
        updatedAt: Date.now(),
      });

      await onProgress?.(cachedPages, totalPages);
    }
  }

  return {
    cachedPages,
    totalPages,
  };
}

export async function getOfflineComicById(comicId: string) {
  const db = await getDB();
  const comic = await db.get("comics", comicId);

  if (!comic) {
    return null;
  }

  const rows = await db.getAllFromIndex("pages", "by-comic", comicId);

  const episodesMap = new Map<
    string,
    {
      episodeId: string;
      title: string;
      description?: string | null;
      previewImage?: string | null;
      episodeIndex: number;
      pageCount: number;
    }
  >();

  for (const row of rows) {
    const existing = episodesMap.get(row.episodeId);

    if (existing) {
      existing.pageCount += 1;
      continue;
    }

    episodesMap.set(row.episodeId, {
      episodeId: row.episodeId,
      title: row.episodeTitle || `Episode ${row.episodeIndex + 1}`,
      description: row.episodeDescription ?? null,
      previewImage:
        row.episodePreviewImageBlob != null
          ? URL.createObjectURL(row.episodePreviewImageBlob)
          : null,
      episodeIndex: row.episodeIndex ?? 0,
      pageCount: 1,
    });
  }

  const episodes = Array.from(episodesMap.values()).sort(
    (a, b) => a.episodeIndex - b.episodeIndex,
  );

  return {
    comicId: comic.comicId,
    title: comic.title,
    description: comic.description ?? null,
    coverImage:
      comic.coverImageBlob != null
        ? URL.createObjectURL(comic.coverImageBlob)
        : (comic.coverImage ?? null),
    previewVideo:
      comic.previewVideoBlob != null
        ? URL.createObjectURL(comic.previewVideoBlob)
        : (comic.previewVideo ?? null),
    totalPages: comic.totalPages,
    cachedPages: comic.cachedPages,
    updatedAt: comic.updatedAt,
    episodes,
  };
}

export async function getOfflineEpisodePageUrls(
  comicId: string,
  episodeId: string,
) {
  const db = await getDB();

  const rows = await db.getAllFromIndex(
    "pages",
    "by-episode",
    `${comicId}:${episodeId}`,
  );

  return rows
    .sort((a, b) => a.pageIndex - b.pageIndex)
    .map((row) => URL.createObjectURL(row.blob));
}

export async function removeOfflineComic(comicId: string) {
  const db = await getDB();
  const tx = db.transaction(["comics", "pages"], "readwrite");

  await tx.objectStore("comics").delete(comicId);

  let cursor = await tx.objectStore("pages").openCursor();

  while (cursor) {
    if (cursor.value.comicId === comicId) {
      await cursor.delete();
    }
    cursor = await cursor.continue();
  }

  await tx.done;
}

export async function listOfflineComics() {
  const db = await getDB();
  const comics = await db.getAll("comics");

  return comics.map((comic) => ({
    comicId: comic.comicId,
    title: comic.title,
    description: comic.description ?? null,
    coverImage:
      comic.coverImageBlob != null
        ? URL.createObjectURL(comic.coverImageBlob)
        : (comic.coverImage ?? null),
    previewVideo:
      comic.previewVideoBlob != null
        ? URL.createObjectURL(comic.previewVideoBlob)
        : (comic.previewVideo ?? null),
    totalPages: comic.totalPages,
    cachedPages: comic.cachedPages,
    updatedAt: comic.updatedAt,
  }));
}
