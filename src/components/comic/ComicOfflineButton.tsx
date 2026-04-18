"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { CloudDownload, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  registerComicOfflineDownload,
  removeComicOfflineDownload,
  syncComicOfflineProgress,
} from "@/actions/comic-offline.action";
import {
  hasOfflineComic,
  removeOfflineComic,
  saveComicOffline,
} from "@/lib/offline-comic-db";
import { warmOfflineComicRoutes } from "@/lib/offline-route-cache";

type EpisodeInput = {
  id: string;
  title: string;
  images: { imageUrl: string }[];
};

type Props = {
  comicId: string;
  comicTitle: string;
  coverImage?: string | null;
  previewVideo?: string | null;
  episodes: EpisodeInput[];
  initialSaved?: boolean;
};

export function ComicOfflineButton({
  comicId,
  comicTitle,
  coverImage,
  previewVideo,
  episodes,
  initialSaved = false,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(initialSaved);
  const [checkingSaved, setCheckingSaved] = useState(true);
  const [progress, setProgress] = useState<{
    cached: number;
    total: number;
  } | null>(null);

  const totalPages = useMemo(
    () => episodes.reduce((sum, episode) => sum + episode.images.length, 0),
    [episodes],
  );

  useEffect(() => {
    let mounted = true;

    async function checkSavedStatus() {
      try {
        const exists = await hasOfflineComic(comicId);

        if (!mounted) return;
        setSaved(exists);
      } catch (error) {
        console.error("Failed to check offline comic status:", error);
      } finally {
        if (mounted) {
          setCheckingSaved(false);
        }
      }
    }

    checkSavedStatus();

    return () => {
      mounted = false;
    };
  }, [comicId]);

  function prefetchOfflineRoutes() {
    try {
      router.prefetch("/profile/avatar/downloads");
      router.prefetch(`/profile/avatar/downloads/${comicId}`);

      episodes.forEach((episode) => {
        router.prefetch(`/profile/avatar/downloads/${comicId}/${episode.id}`);
      });
    } catch (error) {
      console.error("Failed to prefetch offline routes:", error);
    }
  }

  const handleSaveOffline = () => {
    startTransition(async () => {
      try {
        await registerComicOfflineDownload({
          comicId,
          title: comicTitle,
          coverImage: coverImage ?? null,
          totalPages,
        });

        const result = await saveComicOffline(
          {
            comicId,
            title: comicTitle,
            coverImage,
            previewVideo,
            episodes,
          },
          async (cached, total) => {
            setProgress({ cached, total });

            if (cached === 1 || cached === total || cached % 10 === 0) {
              await syncComicOfflineProgress({
                comicId,
                cachedPages: cached,
                totalPages: total,
                status: cached === total ? "COMPLETED" : "DOWNLOADING",
              });
            }
          },
        );

        await syncComicOfflineProgress({
          comicId,
          cachedPages: result.cachedPages,
          totalPages: result.totalPages,
          status: "COMPLETED",
        });

        await warmOfflineComicRoutes(
          comicId,
          episodes.map((episode) => episode.id),
        );

        prefetchOfflineRoutes();

        setSaved(true);
        setProgress({
          cached: result.cachedPages,
          total: result.totalPages,
        });

        router.refresh();
      } catch (error) {
        console.error("Offline save failed:", error);

        await syncComicOfflineProgress({
          comicId,
          cachedPages: progress?.cached ?? 0,
          totalPages,
          status: "FAILED",
        }).catch((syncError) => {
          console.error("Failed to sync download failure status:", syncError);
        });
      }
    });
  };

  const handleRemove = () => {
    startTransition(async () => {
      await removeOfflineComic(comicId);

      if (typeof navigator !== "undefined" && navigator.onLine) {
        await removeComicOfflineDownload(comicId).catch((error) => {
          console.error("Failed to sync offline removal:", error);
        });
      }

      setSaved(false);
      setProgress(null);
      router.refresh();
    });
  };

  if (checkingSaved) {
    return (
      <Button type="button" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Checking...
      </Button>
    );
  }

  if (saved || progress?.cached === totalPages) {
    return (
      <Button type="button" onClick={handleRemove}>
        <Trash2 className="mr-2 h-4 w-4" />
        Remove Offline Copy
      </Button>
    );
  }

  return (
    <Button
      type="button"
      onClick={handleSaveOffline}
      disabled={isPending || totalPages === 0}
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {progress
            ? `Saving ${progress.cached}/${progress.total}`
            : "Saving..."}
        </>
      ) : (
        <>
          <CloudDownload className="mr-2 h-4 w-4" />
          Save Offline
        </>
      )}
    </Button>
  );
}
