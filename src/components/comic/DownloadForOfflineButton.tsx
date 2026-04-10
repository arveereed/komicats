"use client";

import { useEffect, useState } from "react";
import { isComicDownloaded, saveOfflineComic } from "@/lib/offline-comics";
import { useIsInstalledApp } from "@/hooks/useIsInstalledApp";

type DownloadForOfflineButtonProps = {
  comic: {
    id: string;
    title: string;
    description: string;
    thumbnail: string | null;
    createdAt: string;
    episodes: {
      id: string;
      title: string;
      description: string;
      order: number;
      images: {
        id: string;
        imageUrl: string;
        order: number;
      }[];
    }[];
  };
};

export function DownloadForOfflineButton({
  comic,
}: DownloadForOfflineButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkDownloaded = async () => {
      try {
        const downloaded = await isComicDownloaded(comic.id);
        setIsSaved(downloaded);
      } finally {
        setIsChecking(false);
      }
    };

    void checkDownloaded();
  }, [comic.id]);

  if (comic.episodes.length === 0) return null;

  const handleDownload = async () => {
    if (isDownloading || isSaved) return;

    try {
      setIsDownloading(true);

      const episodes = await Promise.all(
        comic.episodes.map(async (episode) => {
          const pages = await Promise.all(
            episode.images.map(async (image) => {
              const response = await fetch(image.imageUrl);

              if (!response.ok) {
                throw new Error(`Failed to fetch image: ${image.imageUrl}`);
              }

              const imageBlob = await response.blob();

              return {
                id: image.id,
                imageBlob,
                order: image.order,
              };
            }),
          );

          return {
            id: episode.id,
            title: episode.title,
            description: episode.description,
            order: episode.order,
            pages,
          };
        }),
      );

      await saveOfflineComic({
        id: comic.id,
        title: comic.title,
        description: comic.description,
        thumbnail: comic.thumbnail,
        createdAt: comic.createdAt,
        downloadedAt: new Date().toISOString(),
        episodes,
      });

      setIsSaved(true);
    } catch (error) {
      console.error("OFFLINE_COMIC_DOWNLOAD_ERROR", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const buttonText = isChecking
    ? "Checking..."
    : isDownloading
      ? "Saving offline..."
      : isSaved
        ? "Downloaded"
        : "Download for Offline";

  const isInstalledApp = useIsInstalledApp();

  return (
    <>
      {isInstalledApp && (
        <button
          type="button"
          onClick={handleDownload}
          disabled={isChecking || isDownloading || isSaved}
          className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl bg-[#3a555d] text-base font-semibold text-white transition hover:bg-[#45636c] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {buttonText}
        </button>
      )}
    </>
  );
}
