import { notFound, redirect } from "next/navigation";
import { getComicById } from "@/actions/comic.action";
import EpisodeReader from "@/components/comic/EpisodeReader";
import { getCommentsCount } from "@/actions/comment.action";
import { getLikeStatus } from "@/actions/like.action";

type PageProps = {
  params: Promise<{
    id: string;
    episodeId: string;
  }>;
};

const FREE_EPISODE_LIMIT = 5;

export default async function EpisodePage({ params }: PageProps) {
  const { id, episodeId } = await params;

  const comic = await getComicById(id);

  if (!comic) {
    notFound();
  }

  const accessibleEpisodes = comic.episodes.filter(
    (_, index) => index < FREE_EPISODE_LIMIT || comic.isUnlocked,
  );

  const currentIndex = accessibleEpisodes.findIndex(
    (episode) => episode.id === episodeId,
  );

  // If user tries to open a locked episode directly, send them back to comic details
  if (currentIndex === -1) {
    redirect(`/profile/avatar/comics/${comic.id}`);
  }

  const episode = accessibleEpisodes[currentIndex];
  const previousEpisode =
    currentIndex > 0 ? accessibleEpisodes[currentIndex - 1] : null;
  const nextEpisode =
    currentIndex < accessibleEpisodes.length - 1
      ? accessibleEpisodes[currentIndex + 1]
      : null;

  const comments = await getCommentsCount(episode.id);
  const likeStatus = await getLikeStatus(episode.id);

  return (
    <EpisodeReader
      commentsCount={comments.count}
      comicId={comic.id}
      comicTitle={comic.title}
      episodeId={episode.id}
      episodeTitle={episode.title}
      episodeDescription={episode.description}
      episodeNumber={episode.order ?? currentIndex + 1}
      pages={episode.images || []}
      previousEpisodeId={previousEpisode?.id ?? null}
      nextEpisodeId={nextEpisode?.id ?? null}
      initialLiked={likeStatus.liked}
      initialLikeCount={likeStatus.count}
      episodes={accessibleEpisodes.map((ep) => ({
        id: ep.id,
        title: ep.title,
        description: ep.description,
        imageCount: ep.images?.length || 0,
      }))}
    />
  );
}
