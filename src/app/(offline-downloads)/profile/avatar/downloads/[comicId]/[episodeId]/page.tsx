"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import EpisodeReader from "@/components/comic/EpisodeReader";
import {
  getOfflineComicById,
  getOfflineEpisodePageUrls,
} from "@/lib/offline-comic-db";

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
    episodeIndex: number;
    pageCount: number;
  }[];
};

type ReaderData = {
  comicTitle: string;
  episodeTitle: string;
  episodeNumber: number;
  previousEpisodeId: string | null;
  nextEpisodeId: string | null;
  episodes: {
    id: string;
    title: string;
    description?: string | null;
    imageCount?: number;
  }[];
  pages: {
    id: string;
    imageUrl: string;
  }[];
};

export default function OfflineEpisodePage() {
  const params = useParams<{ comicId: string; episodeId: string }>();
  const [data, setData] = useState<ReaderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let createdUrls: string[] = [];

    async function load() {
      const [comic, urls] = await Promise.all([
        getOfflineComicById(params.comicId),
        getOfflineEpisodePageUrls(params.comicId, params.episodeId),
      ]);

      if (!active) {
        urls.forEach((url) => URL.revokeObjectURL(url));
        return;
      }

      createdUrls = urls;

      if (!comic) {
        setData(null);
        setLoading(false);
        return;
      }

      const typedComic = comic as OfflineComic;
      const currentIndex = typedComic.episodes.findIndex(
        (episode) => episode.episodeId === params.episodeId,
      );

      if (currentIndex === -1) {
        setData(null);
        setLoading(false);
        return;
      }

      const currentEpisode = typedComic.episodes[currentIndex];
      const previousEpisodeId =
        currentIndex > 0
          ? typedComic.episodes[currentIndex - 1].episodeId
          : null;
      const nextEpisodeId =
        currentIndex < typedComic.episodes.length - 1
          ? typedComic.episodes[currentIndex + 1].episodeId
          : null;

      setData({
        comicTitle: typedComic.title,
        episodeTitle: currentEpisode.title || `Episode ${currentIndex + 1}`,
        episodeNumber: currentIndex + 1,
        previousEpisodeId,
        nextEpisodeId,
        episodes: typedComic.episodes.map((episode) => ({
          id: episode.episodeId,
          title: episode.title,
          description: "Available offline.",
          imageCount: episode.pageCount,
        })),
        pages: urls.map((url, index) => ({
          id: `${params.episodeId}-${index}`,
          imageUrl: url,
        })),
      });

      setLoading(false);
    }

    load();

    return () => {
      active = false;
      createdUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [params.comicId, params.episodeId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-6 text-white">Loading...</div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-black p-6 text-white">
        Offline episode not found.
      </div>
    );
  }

  return (
    <EpisodeReader
      mode="offline"
      comicId={params.comicId}
      comicTitle={data.comicTitle}
      episodeId={params.episodeId}
      episodeTitle={data.episodeTitle}
      episodeDescription="Saved for offline reading."
      episodeNumber={data.episodeNumber}
      pages={data.pages}
      episodes={data.episodes}
      previousEpisodeId={data.previousEpisodeId}
      nextEpisodeId={data.nextEpisodeId}
      initialLiked={false}
      initialLikeCount={0}
      commentsCount={0}
    />
  );
}
