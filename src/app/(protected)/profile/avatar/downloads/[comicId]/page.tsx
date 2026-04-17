"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { ComicDetailsView } from "@/components/comic/ComicDetailsView";
import {
  getOfflineComicById,
  removeOfflineComic,
} from "@/lib/offline-comic-db";
import { removeComicOfflineDownload } from "@/actions/comic-offline.action";

type OfflineComic = {
  comicId: string;
  title: string;
  coverImage?: string | null;
  totalPages: number;
  cachedPages: number;
  updatedAt: number;
  episodes: {
    episodeId: string;
    title: string;
    previewImage?: string | null;
    episodeIndex: number;
    pageCount: number;
  }[];
};

export default function OfflineComicDetailsPage() {
  const params = useParams<{ comicId: string }>();
  const router = useRouter();
  const comicId = params.comicId;

  const [comic, setComic] = useState<OfflineComic | null>(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const data = await getOfflineComicById(comicId);

      if (!mounted) return;

      setComic(data as OfflineComic | null);
      setLoading(false);
    }

    load();

    return () => {
      mounted = false;
    };
  }, [comicId]);

  async function handleRemove() {
    try {
      setRemoving(true);
      await removeOfflineComic(comicId);
      await removeComicOfflineDownload(comicId);
      router.push("/profile/avatar/downloads");
      router.refresh();
    } finally {
      setRemoving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#04080b] p-6 text-white">
        Loading offline comic...
      </div>
    );
  }

  if (!comic) {
    return (
      <div className="min-h-screen bg-[#04080b] p-6 text-white">
        Offline comic not found.
      </div>
    );
  }

  const firstEpisode = comic.episodes[0];
  const readHref = firstEpisode
    ? `/profile/avatar/downloads/${comicId}/${firstEpisode.episodeId}`
    : null;

  return (
    <ComicDetailsView
      mode="offline"
      backHref="/profile/avatar/downloads"
      title={comic.title}
      createdYear={null}
      totalEpisodes={comic.episodes.length}
      heroImage={comic.coverImage ?? null}
      previewVideo={null}
      description="Saved for offline reading."
      readHref={readHref}
      creatorLabel={`Cached ${comic.cachedPages}/${comic.totalPages} pages`}
      offlineRemove={{
        onRemove: handleRemove,
        removing,
      }}
      episodes={comic.episodes.map((episode) => ({
        id: episode.episodeId,
        title: episode.title,
        description: "Available offline.",
        imageUrl: episode.previewImage ?? comic.coverImage ?? null,
        pages: episode.pageCount,
        href: `/profile/avatar/downloads/${comicId}/${episode.episodeId}`,
        downloadImages: [],
        isLocked: false,
      }))}
    />
  );
}
