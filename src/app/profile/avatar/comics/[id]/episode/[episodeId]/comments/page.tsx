import { getComments } from "@/actions/comment.action";
import Comments from "@/app/comic/Comments";

type CommentsPageProps = {
  params: Promise<{
    id: string;
    episodeId: string;
  }>;
};

export default async function CommentsPage({ params }: CommentsPageProps) {
  const { id, episodeId } = await params;
  const comments = await getComments(episodeId);

  return <Comments comicId={id} episodeId={episodeId} comments={comments} />;
}
