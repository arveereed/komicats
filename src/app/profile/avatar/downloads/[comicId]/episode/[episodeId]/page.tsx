"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import EpisodeReader from "@/components/comic/EpisodeReader";
import { getOfflineComic, type OfflineComic } from "@/lib/offline-comics";

export default function OfflineEpisodeReaderPage() {
  const params = useParams<{ comicId: string; episodeId: string }>();

  const [comic, setComic] = useState<OfflineComic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadComic = async () => {
      try {
        const data = await getOfflineComic(params.comicId);
        setComic(data);
      } finally {
        setLoading(false);
      }
    };

    void loadComic();
  }, [params.comicId]);

  const prepared = useMemo(() => {
    if (!comic) return null;

    const sortedEpisodes = [...comic.episodes].sort(
      (a, b) => a.order - b.order,
    );
    const currentIndex = sortedEpisodes.findIndex(
      (episode) => episode.id === params.episodeId,
    );

    if (currentIndex === -1) return null;

    const currentEpisode = sortedEpisodes[currentIndex];

    const pages = [...currentEpisode.pages]
      .sort((a, b) => a.order - b.order)
      .map((page) => ({
        id: page.id,
        imageUrl: URL.createObjectURL(page.imageBlob),
      }));

    const episodes = sortedEpisodes.map((episode) => ({
      id: episode.id,
      title: episode.title,
      description: episode.description,
      imageCount: episode.pages.length,
    }));

    return {
      currentEpisode,
      currentIndex,
      pages,
      episodes,
      previousEpisodeId:
        currentIndex > 0 ? sortedEpisodes[currentIndex - 1].id : null,
      nextEpisodeId:
        currentIndex < sortedEpisodes.length - 1
          ? sortedEpisodes[currentIndex + 1].id
          : null,
    };
  }, [comic, params.episodeId]);

  useEffect(() => {
    return () => {
      if (!prepared) return;
      prepared.pages.forEach((page) => URL.revokeObjectURL(page.imageUrl));
    };
  }, [prepared]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black px-4 py-8 text-white">
        Loading...
      </div>
    );
  }

  if (!comic || !prepared) {
    return (
      <div className="min-h-screen bg-black px-4 py-8 text-white">
        Offline episode not found.
      </div>
    );
  }

  return (
    <EpisodeReader
      commentsCount={0}
      comicId={comic.id}
      comicTitle={comic.title}
      episodeId={prepared.currentEpisode.id}
      episodeTitle={prepared.currentEpisode.title}
      episodeDescription={prepared.currentEpisode.description}
      episodeNumber={prepared.currentIndex + 1}
      pages={prepared.pages}
      episodes={prepared.episodes}
      previousEpisodeId={prepared.previousEpisodeId}
      nextEpisodeId={prepared.nextEpisodeId}
      initialLiked={false}
      initialLikeCount={0}
    />
  );
}
