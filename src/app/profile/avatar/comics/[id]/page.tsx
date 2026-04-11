import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, ChevronLeft } from "lucide-react";

import { getComicById } from "@/actions/comic.action";
import { LockedEpisodeCard } from "@/components/comic/locked-episode-card";
import { Button } from "@/components/ui/button";
import { EpisodeRowCard } from "@/components/comic/EpisodeRowCard";
import { ComicDownloadButton } from "@/components/comic/ComicDownloadButton";
import { DownloadForOfflineButton } from "@/components/comic/DownloadForOfflineButton";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ComicDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const comic = await getComicById(id);

  if (!comic) {
    notFound();
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
    <div /* className="min-h-screen overflow-hidden bg-[#0d1b1f] text-white" */>
      <div className="relative">
        <div className="relative h-[260px] w-full sm:h-[340px] lg:h-[430px]">
          {heroImage ? (
            <Image
              src={heroImage}
              alt={comic.title}
              fill
              priority
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full bg-slate-700" />
          )}

          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-[#173139]/60 to-[#13292f]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#173139]/10 via-transparent to-transparent" />

          <div className="absolute left-4 top-4 z-10 sm:left-6 sm:top-6">
            <Link href="/profile/avatar/profile">
              <Button
                variant="secondary"
                className="border-0 bg-black/35 text-white backdrop-blur hover:bg-black/50"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative z-10 -mt-6 px-4 pb-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[28px] bg-gradient-to-b from-[#28464d] to-[#13292f] p-4 shadow-2xl ring-1 ring-white/10 sm:p-7">
            <div className="max-w-5xl">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {comic.title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/80">
                <span>{new Date(comic.createdAt).getFullYear()}</span>
                <span className="rounded-md bg-white/15 px-2 py-0.5 text-xs font-medium text-white">
                  16+
                </span>
                <span>{totalEpisodes} Episodes</span>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:max-w-xl">
                {firstEpisode ? (
                  <Link href={readHref}>
                    <Button className="h-12 w-full rounded-2xl bg-white text-base font-semibold text-black hover:bg-white/90">
                      <BookOpen className="mr-2 h-5 w-5" />
                      Read
                    </Button>
                  </Link>
                ) : (
                  <Button
                    disabled
                    className="h-12 rounded-2xl bg-white text-base font-semibold text-black"
                  >
                    <BookOpen className="mr-2 h-5 w-5" />
                    Read
                  </Button>
                )}

                <ComicDownloadButton
                  comicTitle={comic.title}
                  episodes={comic.episodes.map((episode) => ({
                    title: episode.title,
                    images: episode.images.map((image) => ({
                      imageUrl: image.imageUrl,
                    })),
                  }))}
                />

                {/* <DownloadForOfflineButton
                  comic={{
                    id: comic.id,
                    title: comic.title,
                    description: comic.description,
                    thumbnail: comic.thumbnail ?? null,
                    createdAt: comic.createdAt.toISOString(),
                    episodes: comic.episodes
                      .filter((_, index) => {
                        const episodeNumber = index + 1;
                        const isLocked =
                          episodeNumber > FREE_EPISODE_LIMIT && !isUnlocked;
                        return !isLocked;
                      })
                      .map((episode) => ({
                        id: episode.id,
                        title: episode.title,
                        description: episode.description,
                        order: episode.order,
                        images: episode.images.map((image) => ({
                          id: image.id,
                          imageUrl: image.imageUrl,
                          order: image.order,
                        })),
                      })),
                  }}
                /> */}
              </div>
              <p className="mt-6 max-w-5xl text-base leading-8 text-white/90 sm:text-lg">
                {comic.description?.trim() ||
                  comic.episodes?.[0]?.description ||
                  "No description available yet."}
              </p>
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
    </div>
  );
}
