"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { BookOpen, ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getOfflineComic, type OfflineComic } from "@/lib/offline-comics";
import { useIsInstalledApp } from "@/hooks/useIsInstalledApp";

export default function OfflineComicDetailsPage() {
  const { comicId } = useParams<{ comicId: string }>();
  const isInstalledApp = useIsInstalledApp();

  const [comic, setComic] = useState<OfflineComic | null>(null);
  const [loading, setLoading] = useState(true);
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isInstalledApp || !comicId) {
      setLoading(false);
      return;
    }

    const loadComic = async () => {
      try {
        const data = await getOfflineComic(comicId);
        setComic(data);
      } finally {
        setLoading(false);
      }
    };

    void loadComic();
  }, [comicId, isInstalledApp]);

  const sortedEpisodes = useMemo(() => {
    if (!comic) return [];
    return [...comic.episodes].sort((a, b) => a.order - b.order);
  }, [comic]);

  const firstEpisode = sortedEpisodes[0];
  const totalEpisodes = sortedEpisodes.length;

  useEffect(() => {
    if (!comic) return;

    const urlsToRevoke: string[] = [];

    if (comic.thumbnail) {
      setHeroImageUrl(comic.thumbnail);
    } else {
      const firstBlob = firstEpisode?.pages?.[0]?.imageBlob;
      if (firstBlob) {
        const url = URL.createObjectURL(firstBlob);
        setHeroImageUrl(url);
        urlsToRevoke.push(url);
      } else {
        setHeroImageUrl(null);
      }
    }

    const nextPreviewUrls: Record<string, string> = {};

    for (const episode of sortedEpisodes) {
      const previewBlob = episode.pages?.[0]?.imageBlob;
      if (!previewBlob) continue;

      const url = URL.createObjectURL(previewBlob);
      nextPreviewUrls[episode.id] = url;
      urlsToRevoke.push(url);
    }

    setPreviewUrls(nextPreviewUrls);

    return () => {
      urlsToRevoke.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [comic, firstEpisode, sortedEpisodes]);

  if (!isInstalledApp) {
    return (
      <div className="min-h-screen bg-[#060b10] px-4 py-8 text-white">
        Offline downloads are only available in the installed app.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060b10] px-4 py-8 text-white">
        Loading...
      </div>
    );
  }

  if (!comic) {
    return (
      <div className="min-h-screen bg-[#060b10] px-4 py-8 text-white">
        Offline comic not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060b10] text-white">
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0">
          {heroImageUrl ? (
            <Image
              src={heroImageUrl}
              alt={comic.title}
              fill
              priority
              unoptimized
              className="object-cover object-center opacity-75"
            />
          ) : (
            <div className="h-full w-full bg-slate-900" />
          )}

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(40,70,77,0.28),transparent_36%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/75" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060b10] via-[#081117]/70 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-[#060b10]" />
        </div>

        <div className="relative mx-auto min-h-[520px] max-w-7xl px-4 pb-10 pt-4 sm:min-h-[600px] sm:px-6 sm:pb-14 sm:pt-6 lg:min-h-[700px] lg:px-8 lg:pb-16">
          <div className="absolute left-4 top-4 z-20 sm:left-6 sm:top-6 lg:left-8">
            <Link href="/profile/avatar/downloads">
              <Button
                variant="secondary"
                className="h-11 rounded-full border border-white/10 bg-black/35 px-4 text-white shadow-lg backdrop-blur-md hover:bg-black/50"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>

          <div className="flex min-h-[520px] items-end sm:min-h-[600px] lg:min-h-[700px]">
            <div className="w-full max-w-3xl pt-24 sm:pt-28 lg:pt-32">
              <div className="rounded-[28px] border border-white/10 bg-black/20 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-md sm:p-7 lg:p-8">
                <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_3px_16px_rgba(0,0,0,0.55)] sm:text-5xl lg:text-6xl">
                  {comic.title}
                </h1>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/75 sm:text-[15px]">
                  <span className="font-medium">
                    {new Date(comic.createdAt).getFullYear()}
                  </span>
                  <span className="rounded-md border border-white/10 bg-white/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white/90">
                    16+
                  </span>
                  <span className="font-medium">{totalEpisodes} Episodes</span>
                  <span className="rounded-md border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
                    Offline
                  </span>
                </div>

                <div className="mt-6 flex w-full flex-col gap-3 sm:max-w-xl">
                  {firstEpisode ? (
                    <Link
                      href={`/profile/avatar/downloads/${comic.id}/episode/${firstEpisode.id}`}
                    >
                      <Button className="h-14 w-full rounded-2xl bg-white text-base font-semibold text-black shadow-[0_10px_30px_rgba(255,255,255,0.16)] transition hover:bg-white/90">
                        <BookOpen className="mr-2 h-5 w-5" />
                        Read Offline
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      disabled
                      className="h-14 w-full rounded-2xl bg-white text-base font-semibold text-black"
                    >
                      <BookOpen className="mr-2 h-5 w-5" />
                      Read Offline
                    </Button>
                  )}
                </div>

                <p className="mt-6 max-w-3xl text-sm leading-7 text-white/80 sm:text-base sm:leading-8">
                  {comic.description?.trim() || "No description available yet."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 -mt-2 px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[28px] border border-white/10 bg-gradient-to-b from-[#122028]/95 via-[#0d171e]/95 to-[#091118]/95 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)] ring-1 ring-white/5 backdrop-blur-xl sm:p-7">
            <div className="max-w-5xl">
              <div className="flex flex-wrap gap-6 border-b border-white/10 text-sm font-semibold">
                <button className="border-b-2 border-cyan-300 pb-3 text-white">
                  Episodes
                </button>
              </div>

              <div className="mt-5 space-y-4">
                {sortedEpisodes.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/70">
                    No episodes found.
                  </div>
                ) : (
                  sortedEpisodes.map((episode, index) => {
                    const previewImageUrl = previewUrls[episode.id] ?? null;

                    return (
                      <Link
                        key={episode.id}
                        href={`/profile/avatar/downloads/${comic.id}/episode/${episode.id}`}
                        className="block"
                      >
                        <div className="group flex items-start gap-4 rounded-2xl p-2 transition hover:bg-white/5">
                          <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-white/10 sm:h-28 sm:w-24">
                            {previewImageUrl ? (
                              <Image
                                src={previewImageUrl}
                                alt={episode.title}
                                fill
                                unoptimized
                                className="object-cover transition duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-xs text-white/50">
                                No image
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1 pt-1">
                            <h3 className="line-clamp-1 text-xl font-semibold text-white">
                              {index + 1}. {episode.title}
                            </h3>

                            <p className="mt-2 line-clamp-2 text-base leading-7 text-white/85">
                              {episode.description ||
                                "No description available."}
                            </p>

                            <div className="mt-2 flex items-center gap-3 text-sm text-white/55">
                              <span>
                                {episode.pages.length} page
                                {episode.pages.length > 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
