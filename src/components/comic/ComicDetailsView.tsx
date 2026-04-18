"use client";

import Link from "next/link";
import { ChevronLeft, Play, Trash2 } from "lucide-react";

import { LockedEpisodeCard } from "@/components/comic/locked-episode-card";
import { Button } from "@/components/ui/button";
import { EpisodeRowCard } from "@/components/comic/EpisodeRowCard";
import { ComicDownloadButton } from "@/components/comic/ComicDownloadButton";
import { ComicOfflineButton } from "@/components/comic/ComicOfflineButton";
import { ComicReactionButtons } from "@/components/comic/ComicReactionButtons";
import ComicHeroPreview from "@/components/comic/ComicHeroPreview";
import ExpandableDescription from "@/components/comic/ExpandableDescription";

type EpisodeViewItem = {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  pages: number;
  href: string;
  downloadImages?: string[];
  isLocked?: boolean;
  priceCoins?: number;
};

type EpisodeButtonItem = {
  id: string;
  title: string;
  images: { imageUrl: string }[];
};

type OnlineButtonsData = {
  comicId: string;
  comicTitle: string;
  coverImage?: string | null;
  downloadEpisodes?: EpisodeButtonItem[] | null;
  offlineEpisodes?: EpisodeButtonItem[] | null;

  // old fallback shape
  episodes?: EpisodeButtonItem[] | null;
};

type ReactionsData = {
  comicId: string;
  pathname: string;
  initialIsInMyList: boolean;
  initialIsLiked: boolean;
  initialIsDisliked: boolean;
};

type OfflineRemoveData = {
  onRemove: () => void;
  removing: boolean;
};

type Props = {
  mode: "online" | "offline";
  backHref: string;
  title: string;
  createdYear?: number | null;
  totalEpisodes: number;
  heroImage?: string | null;
  previewVideo?: string | null;
  description?: string | null;
  readHref?: string | null;
  episodes: EpisodeViewItem[];
  creatorLabel?: string | null;
  comicId?: string;
  onlineButtons?: OnlineButtonsData;
  reactions?: ReactionsData;
  offlineRemove?: OfflineRemoveData;
};

export function ComicDetailsView({
  mode,
  backHref,
  title,
  createdYear,
  totalEpisodes,
  heroImage,
  previewVideo,
  description,
  readHref,
  episodes,
  creatorLabel,
  comicId,
  onlineButtons,
  reactions,
  offlineRemove,
}: Props) {
  const downloadEpisodes = Array.isArray(onlineButtons?.downloadEpisodes)
    ? onlineButtons.downloadEpisodes
    : Array.isArray(onlineButtons?.episodes)
      ? onlineButtons.episodes
      : [];

  const offlineEpisodes = Array.isArray(onlineButtons?.offlineEpisodes)
    ? onlineButtons.offlineEpisodes
    : Array.isArray(onlineButtons?.episodes)
      ? onlineButtons.episodes
      : [];

  function normalizeEpisodeButtons(value: unknown): EpisodeButtonItem[] {
    if (!Array.isArray(value)) return [];

    return value.filter((item): item is EpisodeButtonItem => {
      if (!item || typeof item !== "object") return false;

      const candidate = item as EpisodeButtonItem;

      return (
        typeof candidate.id === "string" &&
        typeof candidate.title === "string" &&
        Array.isArray(candidate.images)
      );
    });
  }

  return (
    <section className="min-h-screen bg-[#04080b] text-white">
      <div className="relative">
        <div className="relative min-h-[720px] overflow-hidden bg-black">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#1a2f36_0%,_#0d171b_42%,_#05080b_100%)]" />
          <div className="absolute inset-0 bg-black/20" />

          <div className="absolute left-4 top-4 z-30 sm:left-6 sm:top-6">
            <Link href={backHref}>
              <Button
                variant="secondary"
                className="h-10 w-10 rounded-full border-0 bg-black/35 p-0 text-white backdrop-blur hover:bg-black/50"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
          </div>

          <div className="relative z-10 min-h-screen pb-[260px] sm:pb-[300px]">
            <ComicHeroPreview
              thumbnail={heroImage ?? null}
              previewVideo={previewVideo ?? null}
              title={title}
            />
          </div>

          <div className="absolute inset-x-0 bottom-0 z-20">
            <div className="border-t border-white/10 bg-[linear-gradient(180deg,rgba(18,29,34,0.78)_0%,rgba(8,14,18,0.96)_100%)] px-4 pb-6 pt-4 backdrop-blur-md sm:px-6">
              <div className="mx-auto max-w-5xl">
                <h1 className="text-[20px] font-semibold leading-tight sm:text-[30px]">
                  {title}
                </h1>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/80 sm:text-sm">
                  {createdYear ? <span>{createdYear}</span> : null}
                  <span className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-medium text-white sm:text-xs">
                    16+
                  </span>
                  <span>{totalEpisodes} Episodes</span>
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  {readHref ? (
                    <Link href={readHref} className="block">
                      <Button className="h-12 w-full rounded-[4px] bg-white text-base font-semibold text-black hover:bg-white/90">
                        <Play className="mr-2 h-4 w-4 fill-current" />
                        {mode === "offline" ? "Read Offline" : "Read"}
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      disabled
                      className="h-12 w-full rounded-[4px] bg-white text-base font-semibold text-black"
                    >
                      <Play className="mr-2 h-4 w-4 fill-current" />
                      {mode === "offline" ? "Read Offline" : "Read"}
                    </Button>
                  )}

                  {mode === "online" && onlineButtons ? (
                    <>
                      {/* <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div className="[&>button]:h-12 [&>button]:w-full [&>button]:rounded-[4px] [&>button]:border [&>button]:border-white/10 [&>button]:bg-[#35505b] [&>button]:text-base [&>button]:font-semibold [&>button]:text-white [&>button]:hover:bg-[#40606d]">
                        <ComicDownloadButton
                          comicTitle={onlineButtons.comicTitle}
                          episodes={downloadEpisodes}
                        />
                      </div> */}

                      <div className="[&>button]:h-12 [&>button]:w-full [&>button]:rounded-[4px] [&>button]:border [&>button]:border-white/10 [&>button]:bg-[#35505b] [&>button]:text-base [&>button]:font-semibold [&>button]:text-white [&>button]:hover:bg-[#40606d]">
                        <ComicOfflineButton
                          comicId={onlineButtons.comicId}
                          comicTitle={onlineButtons.comicTitle}
                          coverImage={onlineButtons.coverImage ?? null}
                          episodes={offlineEpisodes}
                        />
                      </div>
                    </>
                  ) : null}

                  {mode === "offline" && offlineRemove ? (
                    <div className="[&>button]:h-12 [&>button]:w-full [&>button]:rounded-[4px] [&>button]:border [&>button]:border-white/10 [&>button]:bg-[#35505b] [&>button]:text-base [&>button]:font-semibold [&>button]:text-white [&>button]:hover:bg-[#40606d]">
                      <Button
                        type="button"
                        onClick={offlineRemove.onRemove}
                        disabled={offlineRemove.removing}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {offlineRemove.removing
                          ? "Removing..."
                          : "Remove Download"}
                      </Button>
                    </div>
                  ) : null}
                </div>

                <ExpandableDescription
                  collapsedLines={4}
                  text={description?.trim() || "No description available."}
                  isNotificationCard={false}
                />

                {reactions ? (
                  <ComicReactionButtons
                    comicId={reactions.comicId}
                    pathname={reactions.pathname}
                    initialIsInMyList={reactions.initialIsInMyList}
                    initialIsLiked={reactions.initialIsLiked}
                    initialIsDisliked={reactions.initialIsDisliked}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 -mt-2 px-4 pb-8 sm:px-6">
          <div className="mx-auto w-full max-w-5xl">
            <div className="w-full">
              <div className="mt-4 flex flex-wrap gap-6 border-b border-white/10 text-sm font-semibold">
                <button className="border-b-2 border-cyan-300 pb-3 text-white">
                  Episodes
                </button>
              </div>

              <div className="mt-5 space-y-4">
                {episodes.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/70">
                    No episodes found.
                  </div>
                ) : (
                  episodes.map((episode, index) => {
                    if (episode.isLocked) {
                      return (
                        <LockedEpisodeCard
                          key={episode.id}
                          comicId={comicId ?? ""}
                          title={`${index + 1}. ${episode.title}`}
                          description="Unlock this episode by purchasing this comic."
                          imageUrl={episode.imageUrl ?? null}
                          pages={episode.pages}
                          priceCoins={episode.priceCoins ?? 50}
                        />
                      );
                    }

                    return (
                      <EpisodeRowCard
                        key={episode.id}
                        href={episode.href}
                        title={`${index + 1}. ${episode.title}`}
                        description={
                          episode.description || "No description available."
                        }
                        imageUrl={episode.imageUrl ?? null}
                        pages={episode.pages}
                        downloadImages={episode.downloadImages ?? []}
                      />
                    );
                  })
                )}
              </div>

              {creatorLabel ? (
                <div className="mt-8 text-sm text-white/50">{creatorLabel}</div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
