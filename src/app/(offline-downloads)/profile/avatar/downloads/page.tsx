"use client";

import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { listOfflineComics } from "@/lib/offline-comic-db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type OfflineComic = {
  comicId: string;
  title: string;
  coverImage?: string | null;
  previewVideo?: string | null;
  totalPages: number;
  cachedPages: number;
  updatedAt: number;
};

function OfflineComicHoverCard({ comic }: { comic: OfflineComic }) {
  const [hovered, setHovered] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !comic.previewVideo || videoError) return;

    if (hovered) {
      const playPromise = video.play();
      if (playPromise) {
        playPromise.catch(() => {});
      }
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [hovered, comic.previewVideo, videoError]);

  return (
    <Link
      href={`/profile/avatar/downloads/${comic.comicId}`}
      className="group block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Card className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] p-0 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.08] hover:shadow-2xl">
        <CardContent className="p-0">
          <div className="relative aspect-[3/4] overflow-hidden">
            {comic.coverImage ? (
              <img
                src={comic.coverImage}
                alt={comic.title}
                className={`h-full w-full object-cover transition-all duration-500 ${
                  comic.previewVideo && videoReady && !videoError && hovered
                    ? "scale-105 opacity-0"
                    : "scale-100 opacity-100 group-hover:scale-105"
                }`}
              />
            ) : (
              <div className="absolute inset-0 bg-white/[0.05]" />
            )}

            {comic.previewVideo ? (
              <video
                ref={videoRef}
                src={comic.previewVideo}
                muted
                loop
                playsInline
                preload="metadata"
                onCanPlay={() => setVideoReady(true)}
                onLoadedData={() => setVideoReady(true)}
                onError={() => {
                  setVideoError(true);
                  setVideoReady(false);
                }}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                  videoReady && !videoError && hovered
                    ? "opacity-100"
                    : "opacity-0"
                }`}
              />
            ) : null}

            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-3">
              <h2
                className="line-clamp-2 text-sm font-extrabold uppercase leading-tight text-white md:text-base"
                style={{
                  textShadow:
                    "0 2px 10px rgba(0,0,0,0.9), 0 1px 2px rgba(0,0,0,0.8)",
                }}
              >
                {comic.title}
              </h2>

              <p className="mt-1 text-xs font-medium text-white/80">
                {comic.cachedPages}/{comic.totalPages} pages cached
              </p>

              <p className="mt-2 text-[11px] font-medium text-emerald-400">
                Available on this device
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<OfflineComic[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await listOfflineComics();

        if (!mounted) return;
        setDownloads((data as OfflineComic[]) ?? []);
      } catch (error) {
        console.error("Failed to load offline comics:", error);

        if (!mounted) return;
        setDownloads([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  function showNeedInternetToast() {
    toast.error("Need internet first");
  }

  function handleProtectedLinkClick(
    event: React.MouseEvent<HTMLAnchorElement>,
  ) {
    if (!isOnline) {
      event.preventDefault();
      showNeedInternetToast();
    }
  }

  return (
    <>
      <div className="sticky top-0 z-50 mb-6 flex h-16 w-full items-center justify-between gap-3 border-b border-white/10 bg-black/95 px-4 backdrop-blur-xl">
        <Link href="/profile/avatar/profile" onClick={handleProtectedLinkClick}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full text-white hover:bg-white/10 hover:text-white sm:h-10 sm:w-10"
          >
            <ArrowLeft className="size-6" />
          </Button>
        </Link>

        <div className="flex items-center justify-center space-x-4">
          <Download className="size-5" />
          <h1 className="text-xl font-semibold">Downloads</h1>
        </div>

        <div className="w-9 sm:w-10" />
      </div>

      <section className="relative mx-auto w-full max-w-7xl px-4 py-6 text-white md:px-6 md:py-8">
        {!isOnline && (
          <div className="mb-4 rounded-xl border border-yellow-400/20 bg-yellow-400/10 px-4 py-3 text-sm text-yellow-200">
            You are offline. Only downloaded comics on this device are
            available.
          </div>
        )}

        {loading ? (
          <Card className="border border-white/10 bg-white/[0.03]">
            <CardContent className="flex min-h-[240px] items-center justify-center">
              <p className="text-sm text-white/60">Loading downloads...</p>
            </CardContent>
          </Card>
        ) : downloads.length === 0 ? (
          <Card className="border border-white/10 bg-white/[0.03]">
            <CardContent className="flex min-h-[240px] items-center justify-center">
              <p className="text-sm text-white/60">
                No offline comics on this device yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {downloads.map((comic) => (
              <OfflineComicHoverCard key={comic.comicId} comic={comic} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
