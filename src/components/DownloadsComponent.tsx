"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  deleteOfflineComic,
  getAllOfflineComics,
  type OfflineComic,
} from "@/lib/offline-comics";
import { useIsInstalledApp } from "@/hooks/useIsInstalledApp";

export default function DownloadsPage() {
  const isInstalledApp = useIsInstalledApp();
  const [comics, setComics] = useState<OfflineComic[]>([]);
  const [loading, setLoading] = useState(true);

  const loadComics = async () => {
    try {
      const data = await getAllOfflineComics();
      setComics(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isInstalledApp) {
      setLoading(false);
      return;
    }

    void loadComics();
  }, [isInstalledApp]);

  const handleDelete = async (comicId: string) => {
    await deleteOfflineComic(comicId);
    await loadComics();
  };

  if (!isInstalledApp) return null;

  return (
    <div className="min-h-screen px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold">Downloaded Comics</h1>
        <p className="mt-2 text-white/70">
          Read your saved comics even when you are offline.
        </p>

        {loading ? (
          <div className="mt-8 text-white/70">Loading...</div>
        ) : comics.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 text-white/70">
            No downloaded comics yet.
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {comics.map((comic) => (
              <div
                key={comic.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <Link
                      href={`/profile/avatar/downloads/${comic.id}`}
                      className="group block"
                    >
                      <h2 className="text-xl font-semibold group-hover:text-white/90">
                        {comic.title}
                      </h2>
                      <p className="mt-1 text-sm text-white/65">
                        {comic.episodes.length} episodes
                      </p>
                    </Link>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      href={`/profile/avatar/downloads/${comic.id}/episode/${comic.episodes[0]?.id}`}
                      className="rounded-xl bg-white px-4 py-2 font-semibold text-black"
                    >
                      Read Offline
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDelete(comic.id)}
                      className="rounded-xl bg-white/10 px-4 py-2 font-semibold text-white hover:bg-white/20"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
