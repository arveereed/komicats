"use client";

import { useOptimistic, useTransition } from "react";
import { Plus, Check, ThumbsUp, ThumbsDown } from "lucide-react";
import { toggleComicReaction } from "@/actions/comic-reaction.action";
import { toggleComicMyList } from "@/actions/comic-my-list.action";

type Props = {
  comicId: string;
  pathname: string;
  initialIsInMyList: boolean;
  initialIsLiked: boolean;
  initialIsDisliked: boolean;
};

type State = {
  isInMyList: boolean;
  isLiked: boolean;
  isDisliked: boolean;
};

type ActionType = "MY_LIST" | "LIKE" | "DISLIKE";

export function ComicReactionButtons({
  comicId,
  pathname,
  initialIsInMyList,
  initialIsLiked,
  initialIsDisliked,
}: Props) {
  const [isPending, startTransition] = useTransition();

  const [state, setOptimisticState] = useOptimistic<State, ActionType>(
    {
      isInMyList: initialIsInMyList,
      isLiked: initialIsLiked,
      isDisliked: initialIsDisliked,
    },
    (currentState, action) => {
      if (action === "MY_LIST") {
        return {
          ...currentState,
          isInMyList: !currentState.isInMyList,
        };
      }

      if (action === "LIKE") {
        const nextLiked = !currentState.isLiked;

        return {
          ...currentState,
          isLiked: nextLiked,
          isDisliked: nextLiked ? false : currentState.isDisliked,
        };
      }

      const nextDisliked = !currentState.isDisliked;

      return {
        ...currentState,
        isDisliked: nextDisliked,
        isLiked: nextDisliked ? false : currentState.isLiked,
      };
    },
  );

  const onReact = (type: ActionType) => {
    startTransition(async () => {
      setOptimisticState(type);

      try {
        if (type === "MY_LIST") {
          await toggleComicMyList(comicId, pathname);
          return;
        }

        await toggleComicReaction(comicId, type, pathname);
      } catch (error) {
        console.error("Failed to toggle comic action:", error);
      }
    });
  };

  return (
    <div className="mt-4 flex items-center justify-around">
      <button
        type="button"
        onClick={() => onReact("MY_LIST")}
        className={`flex flex-col items-center gap-1 transition ${
          state.isInMyList ? "text-white" : "text-white/80 hover:text-white"
        } ${isPending ? "opacity-80" : ""}`}
      >
        {state.isInMyList ? (
          <Check className="size-8" />
        ) : (
          <Plus className="size-8" />
        )}
        <span className="text-[11px] sm:text-xs">My List</span>
      </button>

      <button
        type="button"
        onClick={() => onReact("LIKE")}
        className={`flex flex-col items-center gap-1 transition ${
          state.isLiked ? "text-green-400" : "text-white/80 hover:text-white"
        } ${isPending ? "opacity-80" : ""}`}
      >
        <ThumbsUp className={`size-6 ${state.isLiked ? "fill-current" : ""}`} />
        <span className="text-[11px] sm:text-xs">Like</span>
      </button>

      <button
        type="button"
        onClick={() => onReact("DISLIKE")}
        className={`flex flex-col items-center gap-1 transition ${
          state.isDisliked ? "text-red-400" : "text-white/80 hover:text-white"
        } ${isPending ? "opacity-80" : ""}`}
      >
        <ThumbsDown
          className={`size-6 ${state.isDisliked ? "fill-current" : ""}`}
        />
        <span className="text-[11px] sm:text-xs">Dislike</span>
      </button>
    </div>
  );
}
