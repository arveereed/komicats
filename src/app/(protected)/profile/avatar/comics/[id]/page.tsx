import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import prisma from "@/lib/prisma";
import { getComicById } from "@/actions/comic.action";
import { ComicDetailsView } from "@/components/comic/ComicDetailsView";

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
    : null;

  const FREE_EPISODE_LIMIT = 5;
  const isUnlocked = comic.isUnlocked;

  const downloadEpisodes = comic.episodes.map((episode) => ({
    id: episode.id,
    title: episode.title,
    description: episode.description ?? null,
    images: episode.images.map((image) => ({
      imageUrl: image.imageUrl,
    })),
  }));

  const offlineEpisodes = comic.episodes
    .filter((_, index) => index + 1 <= FREE_EPISODE_LIMIT || isUnlocked)
    .map((episode) => ({
      id: episode.id,
      title: episode.title,
      description: episode.description ?? null,
      images: episode.images.map((image) => ({
        imageUrl: image.imageUrl,
      })),
    }));

  return (
    <ComicDetailsView
      mode="online"
      backHref="/profile/avatar/profile"
      title={comic.title}
      createdYear={new Date(comic.createdAt).getFullYear()}
      totalEpisodes={totalEpisodes}
      heroImage={heroImage}
      previewVideo={comic.previewVideo ?? null}
      description={comic.description?.trim() ?? null}
      readHref={readHref}
      comicId={comic.id}
      creatorLabel={`Added by ${comic.user.fullname || comic.user.email}`}
      onlineButtons={{
        comicId: comic.id,
        comicTitle: comic.title,
        comicDescription: comic.description?.trim() ?? null,
        coverImage: heroImage,
        downloadEpisodes,
        offlineEpisodes,
      }}
      reactions={{
        comicId: comic.id,
        pathname: `/profile/avatar/comics/${comic.id}`,
        initialIsInMyList,
        initialIsLiked,
        initialIsDisliked,
      }}
      episodes={comic.episodes.map((episode, index) => {
        const previewImage = episode.images?.[0]?.imageUrl ?? null;
        const episodeNumber = index + 1;
        const isLockedEpisode =
          episodeNumber > FREE_EPISODE_LIMIT && !isUnlocked;
        const episodeHref = `/profile/avatar/comics/${comic.id}/episode/${episode.id}`;

        return {
          id: episode.id,
          title: episode.title,
          description: episode.description || "No description available.",
          imageUrl: previewImage,
          pages: episode.images?.length || 0,
          href: episodeHref,
          downloadImages: episode.images.map((image) => image.imageUrl),
          isLocked: isLockedEpisode,
          priceCoins: 50,
        };
      })}
    />
  );
}
