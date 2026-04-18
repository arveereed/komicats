"use client";

import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { listOfflineComics } from "@/lib/offline-comic-db";
import { Button } from "@/components/ui/button";

type OfflineComic = {
  comicId: string;
  title: string;
  coverImage?: string | null;
  totalPages: number;
  cachedPages: number;
  updatedAt: number;
};

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

      <section className="min-h-screen px-4 py-6 text-white sm:px-6">
        <div className="mx-auto max-w-5xl">
          {!isOnline && (
            <div className="mb-4 rounded-xl border border-yellow-400/20 bg-yellow-400/10 px-4 py-3 text-sm text-yellow-200">
              You are offline. Only downloaded comics on this device are
              available.
            </div>
          )}

          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
              Loading downloads...
            </div>
          ) : downloads.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
              No offline comics on this device yet.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {downloads.map((item) => (
                <Link
                  key={item.comicId}
                  href={`/profile/avatar/downloads/${item.comicId}`}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:bg-white/10"
                >
                  <div className="aspect-[16/9] bg-black">
                    {item.coverImage ? (
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>

                  <div className="p-4">
                    <h2 className="line-clamp-1 text-base font-semibold">
                      {item.title}
                    </h2>
                    <p className="mt-1 text-sm text-white/60">
                      {item.cachedPages}/{item.totalPages} pages cached
                    </p>
                    <p className="mt-2 text-xs text-emerald-400">
                      Available on this device
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
