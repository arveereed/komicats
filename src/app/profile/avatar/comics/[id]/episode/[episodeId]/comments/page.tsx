import Comments from "@/components/comic/Comments";

type CommentsPageProps = {
  params: Promise<{
    id: string;
    episodeId: string;
  }>;
};

export default async function CommentsPage({ params }: CommentsPageProps) {
  const { id, episodeId } = await params;

  return <Comments comicId={id} episodeId={episodeId} />;
}
