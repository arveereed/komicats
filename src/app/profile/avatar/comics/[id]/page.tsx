import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  Play,
  Bookmark,
  ThumbsUp,
  ThumbsDown,
  Plus,
} from "lucide-react";

import { getComicById } from "@/actions/comic.action";
import { LockedEpisodeCard } from "@/app/comic/locked-episode-card";
import { Button } from "@/components/ui/button";
import { EpisodeRowCard } from "@/app/comic/EpisodeRowCard";
import { ComicDownloadButton } from "@/app/comic/ComicDownloadButton";
import { ComicReactionButtons } from "@/app/comic/ComicReactionButtons";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ComicDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const comic = await getComicById(id);
  const { userId: clerkId } = await auth();

  if (!comic) {
    notFound();
  }

  let initialIsInMyList = false;
  let initialIsLiked = false;
  let initialIsDisliked = false;

  if (clerkId) {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        activeProfileId: true,
      },
    });

    if (user?.activeProfileId) {
      const [myListItem, reactions] = await Promise.all([
        prisma.comicMyList.findUnique({
          where: {
            profileId_comicId: {
              profileId: user.activeProfileId,
              comicId: comic.id,
            },
          },
        }),
        prisma.comicReaction.findMany({
          where: {
            profileId: user.activeProfileId,
            comicId: comic.id,
          },
          select: {
            type: true,
          },
        }),
      ]);

      initialIsInMyList = !!myListItem;
      initialIsLiked = reactions.some((reaction) => reaction.type === "LIKE");
      initialIsDisliked = reactions.some(
        (reaction) => reaction.type === "DISLIKE",
      );
    }
  }

  const totalEpisodes = comic.episodes.length;
  const heroImage =
    comic.thumbnail || comic.episodes?.[0]?.images?.[0]?.imageUrl || null;

  const firstEpisode = comic.episodes?.[0];
  const readHref = firstEpisode
    ? `/profile/avatar/comics/${comic.id}/episode/${firstEpisode.id}`
    : "#";

  const FREE_EPISODE_LIMIT = 5;
  const isUnlocked = comic.isUnlocked;

  return (
    <section className="min-h-screen bg-[#04080b] text-white">
      <div className="relative">
        {/* HERO */}
        <div className="relative min-h-[720px] overflow-hidden bg-black">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#1a2f36_0%,_#0d171b_42%,_#05080b_100%)]" />
          <div className="absolute inset-0 bg-black/20" />

          <div className="absolute left-4 top-4 z-30 sm:left-6 sm:top-6">
            <Link href="/profile/avatar/profile">
              <Button
                variant="secondary"
                className="h-10 w-10 rounded-full border-0 bg-black/35 p-0 text-white backdrop-blur hover:bg-black/50"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
          </div>

          <div className="relative z-10 flex justify-center px-4 pt-0">
            <div className="relative h-[430px] w-[290px] overflow-hidden bg-[#9a7a49] shadow-2xl ring-1 ring-white/10 sm:h-[500px] sm:w-[330px]">
              {heroImage ? (
                <Image
                  src={heroImage}
                  alt={comic.title}
                  fill
                  priority
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-[#9a7a49]" />
              )}
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 z-20">
            <div className="border-t border-white/10 bg-[linear-gradient(180deg,rgba(18,29,34,0.78)_0%,rgba(8,14,18,0.96)_100%)] px-4 pb-6 pt-4 backdrop-blur-md sm:px-6">
              <div className="mx-auto max-w-5xl">
                <h1 className="text-[20px] font-semibold leading-tight sm:text-[30px]">
                  {comic.title}
                </h1>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/80 sm:text-sm">
                  <span>{new Date(comic.createdAt).getFullYear()}</span>
                  <span className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-medium text-white sm:text-xs">
                    16+
                  </span>
                  <span>{totalEpisodes} Episodes</span>
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  {firstEpisode ? (
                    <Link href={readHref} className="block">
                      <Button className="h-12 w-full rounded-[4px] bg-white text-base font-semibold text-black hover:bg-white/90">
                        <Play className="mr-2 h-4 w-4 fill-current" />
                        Read
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      disabled
                      className="h-12 w-full rounded-[4px] bg-white text-base font-semibold text-black"
                    >
                      <Play className="mr-2 h-4 w-4 fill-current" />
                      Read
                    </Button>
                  )}

                  <div className="[&>button]:h-12 [&>button]:w-full [&>button]:rounded-[4px] [&>button]:border [&>button]:border-white/10 [&>button]:bg-[#35505b] [&>button]:text-base [&>button]:font-semibold [&>button]:text-white [&>button]:hover:bg-[#40606d]">
                    <ComicDownloadButton
                      comicTitle={comic.title}
                      episodes={comic.episodes.map((episode) => ({
                        title: episode.title,
                        images: episode.images.map((image) => ({
                          imageUrl: image.imageUrl,
                        })),
                      }))}
                    />
                  </div>
                </div>

                <p className="mt-4 max-w-4xl text-xs leading-5 text-white/75 sm:text-sm">
                  {comic.description?.trim() ||
                    comic.episodes?.[0]?.description ||
                    "No description available yet."}
                </p>

                {/* NEW: My List / Like / Dislike */}
                <ComicReactionButtons
                  comicId={comic.id}
                  pathname={`/profile/avatar/comics/${comic.id}`}
                  initialIsInMyList={initialIsInMyList}
                  initialIsLiked={initialIsLiked}
                  initialIsDisliked={initialIsDisliked}
                />
              </div>
            </div>
          </div>
        </div>

        {/* LOWER UI KEPT INTACT */}
        <div className="relative z-10 -mt-2 px-4 pb-8 sm:px-6">
          <div className="mx-auto w-full max-w-5xl">
            <div className="w-full">
              <div className="mt-4 flex flex-wrap gap-6 border-b border-white/10 text-sm font-semibold">
                <button className="border-b-2 border-cyan-300 pb-3 text-white">
                  Episodes
                </button>
              </div>

              <div className="mt-5 space-y-4">
                {comic.episodes.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/70">
                    No episodes found.
                  </div>
                ) : (
                  comic.episodes.map((episode, index) => {
                    const previewImage = episode.images?.[0]?.imageUrl ?? null;
                    const episodeNumber = index + 1;
                    const isLocked =
                      episodeNumber > FREE_EPISODE_LIMIT && !isUnlocked;
                    const episodeHref = `/profile/avatar/comics/${comic.id}/episode/${episode.id}`;

                    if (isLocked) {
                      return (
                        <LockedEpisodeCard
                          key={episode.id}
                          comicId={comic.id}
                          title={`${episodeNumber}. ${episode.title}`}
                          description="Unlock this episode by purchasing this comic."
                          imageUrl={previewImage}
                          pages={episode.images?.length || 0}
                          priceCoins={50}
                        />
                      );
                    }

                    return (
                      <EpisodeRowCard
                        key={episode.id}
                        href={episodeHref}
                        title={`${episodeNumber}. ${episode.title}`}
                        description={
                          episode.description || "No description available."
                        }
                        imageUrl={previewImage}
                        pages={episode.images?.length || 0}
                        downloadImages={episode.images.map(
                          (image) => image.imageUrl,
                        )}
                      />
                    );
                  })
                )}
              </div>

              <div className="mt-8 text-sm text-white/50">
                Added by {comic.user.fullname || comic.user.email}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
