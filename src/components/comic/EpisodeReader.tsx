"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  FileImage,
  Heart,
  MessageCircle,
  ArrowLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useUser } from "@clerk/nextjs";
import { toggleLike } from "@/actions/like.action";
import { useIsInstalledApp } from "@/hooks/useIsInstalledApp";

type EpisodeImage = {
  id: string;
  imageUrl: string;
};

type EpisodeItem = {
  id: string;
  title: string;
  description?: string | null;
  imageCount?: number;
};

type EpisodeReaderProps = {
  commentsCount: number;
  comicId: string;
  comicTitle: string;
  episodeId: string;
  episodeTitle: string;
  episodeDescription?: string | null;
  episodeNumber?: number;
  pages: EpisodeImage[];
  episodes?: EpisodeItem[];
  previousEpisodeId?: string | null;
  nextEpisodeId?: string | null;
  initialLiked: boolean;
  initialLikeCount: number;
};

type OptimisticLikeState = {
  liked: boolean;
  count: number;
};

export default function EpisodeReader({
  commentsCount,
  comicId,
  comicTitle,
  episodeId,
  episodeTitle,
  episodeDescription,
  episodeNumber,
  pages,
  episodes = [],
  previousEpisodeId,
  nextEpisodeId,
  initialLiked,
  initialLikeCount,
}: EpisodeReaderProps) {
  const router = useRouter();
  const [episodesOpen, setEpisodesOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { user: clerkUser } = useUser();

  const currentEpisode = useMemo(
    () => episodes.find((episode) => episode.id === episodeId),
    [episodes, episodeId],
  );

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const isAdmin =
    !!adminEmail && clerkUser?.emailAddresses[0]?.emailAddress === adminEmail;

  const [optimisticLike, setOptimisticLike] = useOptimistic<
    OptimisticLikeState,
    void
  >(
    {
      liked: initialLiked,
      count: initialLikeCount,
    },
    (state) => ({
      liked: !state.liked,
      count: state.liked ? Math.max(0, state.count - 1) : state.count + 1,
    }),
  );

  const commentsHref = isAdmin
    ? `/admin/comics/${comicId}/episode/${episodeId}/comments`
    : `/profile/avatar/comics/${comicId}/episode/${episodeId}/comments`;

  async function handleToggleLike() {
    startTransition(async () => {
      setOptimisticLike();

      const result = await toggleLike(episodeId, comicId, isAdmin);

      if (!result?.success) {
        router.refresh();
        return;
      }

      router.refresh();
    });
  }

  const isInstalledApp = useIsInstalledApp();

  return (
    <section className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-3 sm:h-20 sm:px-4 lg:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Link
              href={
                isAdmin
                  ? `/admin/comics/${comicId}`
                  : isInstalledApp
                    ? `/profile/avatar/downloads/${comicId}`
                    : `/profile/avatar/comics/${comicId}`
              }
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full text-white hover:bg-white/10 hover:text-white sm:h-10 sm:w-10"
              >
                <ArrowLeft className="size-6" />
              </Button>
            </Link>
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold sm:text-base lg:text-lg">
              {comicTitle}
            </h1>
            <p className="truncate text-xs text-white/70 sm:text-sm">
              {episodeNumber ? `Episode ${episodeNumber}` : "Episode"} ·{" "}
              {episodeTitle}
            </p>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Sheet open={episodesOpen} onOpenChange={setEpisodesOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full text-white/80 hover:bg-white/10 hover:text-white sm:h-10 sm:w-10"
                >
                  <Image
                    src="/icons/Menu.png"
                    alt="Menu"
                    width={24}
                    height={24}
                  />
                </Button>
              </SheetTrigger>

              <SheetContent className="flex w-[90vw] flex-col border-white/10 bg-slate-950 text-white sm:max-w-md">
                <SheetHeader>
                  <SheetTitle className="text-white">Episodes</SheetTitle>
                  <SheetDescription className="text-white/60">
                    Browse all episodes for this comic
                  </SheetDescription>
                </SheetHeader>

                <div className="mt-6 flex-1 space-y-3 overflow-y-auto pr-2">
                  {episodes.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
                      No episodes available.
                    </div>
                  ) : (
                    episodes.map((episode, index) => {
                      const isActive = episode.id === episodeId;

                      return (
                        <Link
                          key={episode.id}
                          href={
                            isAdmin
                              ? `/admin/comics/${comicId}/episode/${episode.id}`
                              : isInstalledApp
                                ? `/profile/avatar/downloads/${comicId}/episode/${episode.id}`
                                : `/profile/avatar/comics/${comicId}/episode/${episode.id}`
                          }
                          onClick={() => setEpisodesOpen(false)}
                          className={`block rounded-2xl border p-4 transition ${
                            isActive
                              ? "border-primary bg-primary/15"
                              : "border-white/10 bg-white/5 hover:bg-white/10"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-xs text-white/50">
                                Episode {index + 1}
                              </p>
                              <h3 className="truncate font-semibold text-white">
                                {episode.title}
                              </h3>

                              {episode.description ? (
                                <p className="mt-1 line-clamp-2 text-sm text-white/60">
                                  {episode.description}
                                </p>
                              ) : null}
                            </div>

                            {isActive ? (
                              <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
                                Current
                              </span>
                            ) : null}
                          </div>

                          <div className="mt-3 flex items-center gap-2 text-xs text-white/50">
                            <FileImage className="h-3.5 w-3.5" />
                            <span>{episode.imageCount ?? 0} pages</span>
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>
              </SheetContent>
            </Sheet>

            <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setInfoOpen(true)}
                className="h-9 w-9 rounded-full text-white/80 hover:bg-white/10 hover:text-white sm:h-10 sm:w-10"
              >
                <Image
                  src="/icons/info.png"
                  alt="Info"
                  width={24}
                  height={24}
                />
              </Button>

              <DialogContent className="border-white/10 bg-slate-950 text-white sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-white">Episode Info</DialogTitle>
                  <DialogDescription className="text-white/60">
                    Details about the current episode
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-wide text-white/40">
                      Comic
                    </p>
                    <h3 className="mt-1 text-lg font-semibold">{comicTitle}</h3>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-wide text-white/40">
                      Episode
                    </p>
                    <h3 className="mt-1 text-lg font-semibold">
                      {episodeNumber ? `Episode ${episodeNumber}: ` : ""}
                      {episodeTitle}
                    </h3>

                    {episodeDescription || currentEpisode?.description ? (
                      <p className="mt-2 text-sm leading-6 text-white/70">
                        {episodeDescription || currentEpisode?.description}
                      </p>
                    ) : (
                      <p className="mt-2 text-sm text-white/50">
                        No description available.
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2 text-white/60">
                        <BookOpen className="h-4 w-4" />
                        <span className="text-sm">Total Episodes</span>
                      </div>
                      <p className="mt-2 text-2xl font-bold">
                        {episodes.length || 1}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2 text-white/60">
                        <FileImage className="h-4 w-4" />
                        <span className="text-sm">Pages</span>
                      </div>
                      <p className="mt-2 text-2xl font-bold">{pages.length}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <Link
                      href={
                        isAdmin
                          ? `/admin/comics/${comicId}`
                          : `/profile/avatar/comics/${comicId}`
                      }
                      className="flex-1"
                    >
                      <Button className="w-full">Back to Comic</Button>
                    </Link>

                    <Button
                      variant="outline"
                      onClick={() => setInfoOpen(false)}
                      className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col items-center px-2 py-4 pb-24 sm:px-4 sm:py-6 sm:pb-6 lg:px-6">
        {pages.length === 0 ? (
          <div className="mt-10 w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur-md">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-white">
                No pages found
              </h2>
              <p className="text-sm text-white/60">
                This episode does not have any uploaded pages yet.
              </p>
            </div>

            <div className="mt-6">
              <Link
                href={
                  isAdmin
                    ? `/admin/comics/${comicId}`
                    : `/profile/avatar/comics/${comicId}`
                }
              >
                <Button variant="secondary" className="rounded-full px-6">
                  Back to Comic
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="w-full">
            {pages.map((page, index) => (
              <div
                key={page.id}
                className="mx-auto w-full max-w-3xl overflow-hidden  border border-white/10 bg-white shadow-2xl "
              >
                <div className="relative w-full">
                  <Image
                    src={page.imageUrl}
                    alt={`${episodeTitle} - Page ${index + 1}`}
                    width={1400}
                    height={2200}
                    priority={index === 0}
                    className="h-auto w-full object-contain"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <div className="hidden w-full bg-black/85 sm:block">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center divide-x divide-white/10 overflow-hidden rounded-md border border-white/10 bg-white/5">
            <button
              type="button"
              onClick={handleToggleLike}
              disabled={isPending}
              className="flex h-11 items-center gap-2 px-4 text-sm text-white/90 transition hover:bg-white/10 disabled:opacity-60"
            >
              <Heart
                className={`h-4 w-4 stroke-[1.75] transition ${
                  optimisticLike.liked ? "fill-red-500 text-red-500" : ""
                }`}
              />
              <span>{optimisticLike.count}</span>
            </button>

            <Link href={commentsHref}>
              <div className="flex h-11 items-center gap-2 px-4 text-sm text-white/90">
                <MessageCircle className="h-4 w-4 stroke-[1.75]" />
                <span>{commentsCount}</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center divide-x divide-white/10 overflow-hidden rounded-md border border-white/10 bg-white/5">
            {previousEpisodeId ? (
              <Link
                href={
                  isAdmin
                    ? `/admin/comics/${comicId}/episode/${previousEpisodeId}`
                    : `/profile/avatar/comics/${comicId}/episode/${previousEpisodeId}`
                }
              >
                <button
                  type="button"
                  className="flex h-11 w-14 items-center justify-center text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                  <ChevronLeft className="h-5 w-5 stroke-[1.75]" />
                </button>
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="flex h-11 w-14 items-center justify-center text-white/30"
              >
                <ChevronLeft className="h-5 w-5 stroke-[1.75]" />
              </button>
            )}

            {nextEpisodeId ? (
              <Link
                href={
                  isAdmin
                    ? `/admin/comics/${comicId}/episode/${nextEpisodeId}`
                    : `/profile/avatar/comics/${comicId}/episode/${nextEpisodeId}`
                }
              >
                <button
                  type="button"
                  className="flex h-11 w-14 items-center justify-center text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                  <ChevronRight className="h-5 w-5 stroke-[1.75]" />
                </button>
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="flex h-11 w-14 items-center justify-center text-white/30"
              >
                <ChevronRight className="h-5 w-5 stroke-[1.75]" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 sm:hidden">
        <div className="border-t border-white/10 bg-black/85 backdrop-blur-md">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
            <div className="flex items-center divide-x divide-white/10 overflow-hidden rounded-md border border-white/10 bg-white/5">
              <button
                type="button"
                onClick={handleToggleLike}
                disabled={isPending}
                className="flex h-11 items-center gap-2 px-4 text-sm text-white/90 transition hover:bg-white/10 disabled:opacity-60"
              >
                <Heart
                  className={`h-4 w-4 stroke-[1.75] transition ${
                    optimisticLike.liked ? "fill-red-500 text-red-500" : ""
                  }`}
                />
                <span>{optimisticLike.count}</span>
              </button>

              <Link href={commentsHref}>
                <div className="flex h-11 items-center gap-2 px-4 text-sm text-white/90">
                  <MessageCircle className="h-4 w-4 stroke-[1.75]" />
                  <span>{commentsCount}</span>
                </div>
              </Link>
            </div>

            <div className="flex items-center divide-x divide-white/10 overflow-hidden rounded-md border border-white/10 bg-white/5">
              {previousEpisodeId ? (
                <Link
                  href={
                    isAdmin
                      ? `/admin/comics/${comicId}/episode/${previousEpisodeId}`
                      : `/profile/avatar/comics/${comicId}/episode/${previousEpisodeId}`
                  }
                >
                  <button
                    type="button"
                    className="flex h-11 w-14 items-center justify-center text-white/80 transition hover:bg-white/10 hover:text-white"
                  >
                    <ChevronLeft className="h-5 w-5 stroke-[1.75]" />
                  </button>
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="flex h-11 w-14 items-center justify-center text-white/30"
                >
                  <ChevronLeft className="h-5 w-5 stroke-[1.75]" />
                </button>
              )}

              {nextEpisodeId ? (
                <Link
                  href={
                    isAdmin
                      ? `/admin/comics/${comicId}/episode/${nextEpisodeId}`
                      : `/profile/avatar/comics/${comicId}/episode/${nextEpisodeId}`
                  }
                >
                  <button
                    type="button"
                    className="flex h-11 w-14 items-center justify-center text-white/80 transition hover:bg-white/10 hover:text-white"
                  >
                    <ChevronRight className="h-5 w-5 stroke-[1.75]" />
                  </button>
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="flex h-11 w-14 items-center justify-center text-white/30"
                >
                  <ChevronRight className="h-5 w-5 stroke-[1.75]" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
