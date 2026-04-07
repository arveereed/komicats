import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import {
  toggleCommentDislike,
  toggleCommentLike,
} from "@/actions/comment-reaction.action";
import { MessageCircle, ThumbsDown, ThumbsUp } from "lucide-react";

type CommentActionsProps = {
  comicId: string;
  episodeId: string;
  commentId: string;
  replies: number;
  likes: number;
  dislikes: number;
  viewerLiked?: boolean;
  viewerDisliked?: boolean;
  isAdmin: boolean;
};

type OptimisticReactionState = {
  likes: number;
  dislikes: number;
  viewerLiked: boolean;
  viewerDisliked: boolean;
};

export default function CommentActions({
  comicId,
  episodeId,
  commentId,
  replies,
  likes,
  dislikes,
  viewerLiked = false,
  viewerDisliked = false,
  isAdmin,
}: CommentActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [optimisticReaction, updateOptimisticReaction] = useOptimistic<
    OptimisticReactionState,
    "like" | "dislike"
  >(
    {
      likes,
      dislikes,
      viewerLiked,
      viewerDisliked,
    },
    (state, action) => {
      if (action === "like") {
        if (state.viewerLiked) {
          return {
            ...state,
            likes: Math.max(0, state.likes - 1),
            viewerLiked: false,
          };
        }

        return {
          likes: state.likes + 1,
          dislikes: state.viewerDisliked
            ? Math.max(0, state.dislikes - 1)
            : state.dislikes,
          viewerLiked: true,
          viewerDisliked: false,
        };
      }

      if (state.viewerDisliked) {
        return {
          ...state,
          dislikes: Math.max(0, state.dislikes - 1),
          viewerDisliked: false,
        };
      }

      return {
        likes: state.viewerLiked ? Math.max(0, state.likes - 1) : state.likes,
        dislikes: state.dislikes + 1,
        viewerLiked: false,
        viewerDisliked: true,
      };
    },
  );

  async function handleLike() {
    startTransition(async () => {
      updateOptimisticReaction("like");

      const result = await toggleCommentLike(
        commentId,
        comicId,
        episodeId,
        isAdmin,
      );

      if (!result?.success) {
        router.refresh();
        return;
      }

      router.refresh();
    });
  }

  async function handleDislike() {
    startTransition(async () => {
      updateOptimisticReaction("dislike");

      const result = await toggleCommentDislike(
        commentId,
        comicId,
        episodeId,
        isAdmin,
      );

      if (!result?.success) {
        router.refresh();
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-white/75 sm:gap-5">
      <div className="flex items-center gap-1.5">
        <MessageCircle className="h-4 w-4 shrink-0" />
        <span>{replies}</span>
      </div>

      <button
        type="button"
        onClick={handleLike}
        disabled={isPending}
        className="flex items-center gap-1.5 transition hover:text-white disabled:opacity-50"
      >
        <ThumbsUp
          className={`h-4 w-4 shrink-0 ${
            optimisticReaction.viewerLiked ? "fill-current text-blue-400" : ""
          }`}
        />
        <span>{optimisticReaction.likes}</span>
      </button>

      <button
        type="button"
        onClick={handleDislike}
        disabled={isPending}
        className="flex items-center gap-1.5 transition hover:text-white disabled:opacity-50"
      >
        <ThumbsDown
          className={`h-4 w-4 shrink-0 ${
            optimisticReaction.viewerDisliked ? "fill-current text-red-400" : ""
          }`}
        />
        <span>{optimisticReaction.dislikes}</span>
      </button>
    </div>
  );
}
