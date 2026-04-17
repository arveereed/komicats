"use client";

import Link from "next/link";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";

import { listOfflineComics } from "@/lib/offline-comic-db";

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

  return (
    <section className="min-h-screen bg-[#04080b] px-4 py-6 text-white sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center gap-3">
          <Download className="h-5 w-5" />
          <h1 className="text-2xl font-semibold">Downloads</h1>
        </div>

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
  );
}
