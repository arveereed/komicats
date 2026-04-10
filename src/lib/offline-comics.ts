"use client";

export type OfflineComicPage = {
  id: string;
  imageBlob: Blob;
  order: number;
};

export type OfflineEpisode = {
  id: string;
  title: string;
  description: string;
  order: number;
  pages: OfflineComicPage[];
};

export type OfflineComic = {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  createdAt: string;
  downloadedAt: string;
  episodes: OfflineEpisode[];
};

const DB_NAME = "comic-reader-offline";
const DB_VERSION = 1;
const STORE_NAME = "comics";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveOfflineComic(comic: OfflineComic) {
  const db = await openDb();

  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    store.put(comic);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getOfflineComic(comicId: string) {
  const db = await openDb();

  return new Promise<OfflineComic | null>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(comicId);

    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllOfflineComics() {
  const db = await openDb();

  return new Promise<OfflineComic[]>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const result = (request.result ?? []) as OfflineComic[];
      result.sort(
        (a, b) =>
          new Date(b.downloadedAt).getTime() -
          new Date(a.downloadedAt).getTime(),
      );
      resolve(result);
    };

    request.onerror = () => reject(request.error);
  });
}

export async function deleteOfflineComic(comicId: string) {
  const db = await openDb();

  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    store.delete(comicId);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function isComicDownloaded(comicId: string) {
  const comic = await getOfflineComic(comicId);
  return Boolean(comic);
}
