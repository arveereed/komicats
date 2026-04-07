import { notFound } from "next/navigation";
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

export default async function EpisodePage({ params }: PageProps) {
  const { id, episodeId } = await params;

  const comic = await getComicById(id);
  const comments = await getCommentsCount(episodeId);
  const likeStatus = await getLikeStatus(episodeId);

  if (!comic) {
    notFound();
  }

  const currentIndex = comic.episodes.findIndex(
    (episode) => episode.id === episodeId,
  );

  if (currentIndex === -1) {
    notFound();
  }

  const episode = comic.episodes[currentIndex];
  const previousEpisode =
    currentIndex > 0 ? comic.episodes[currentIndex - 1] : null;
  const nextEpisode =
    currentIndex < comic.episodes.length - 1
      ? comic.episodes[currentIndex + 1]
      : null;

  return (
    <EpisodeReader
      commentsCount={comments.count}
      comicId={comic.id}
      comicTitle={comic.title}
      episodeId={episode.id}
      episodeTitle={episode.title}
      episodeDescription={episode.description}
      episodeNumber={currentIndex + 1}
      pages={episode.images || []}
      previousEpisodeId={previousEpisode?.id}
      nextEpisodeId={nextEpisode?.id}
      initialLiked={likeStatus.liked}
      initialLikeCount={likeStatus.count}
      episodes={comic.episodes.map((ep) => ({
        id: ep.id,
        title: ep.title,
        description: ep.description,
        imageCount: ep.images?.length || 0,
      }))}
    />
  );
}
