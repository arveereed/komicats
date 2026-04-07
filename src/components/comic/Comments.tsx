"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Send,
  ThumbsDown,
} from "lucide-react";
import { createComment, getComments } from "@/actions/comment.action";
import { useMemo, useOptimistic, useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

type CommentsPageProps = {
  comicId: string;
  episodeId: string;
  comments: Awaited<ReturnType<typeof getComments>>;
};

type ServerComment = NonNullable<
  CommentsPageProps["comments"]
>["comments"][number];

type OptimisticComment = ServerComment & {
  optimistic?: boolean;
};

function Watermark() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute left-1/2 top-[18%] h-[520px] w-[520px] -translate-x-1/2 rounded-full border-[48px] border-white/[0.035] blur-[1px]" />
      <div className="absolute left-1/2 top-[30%] h-[280px] w-[280px] -translate-x-1/2 rounded-full border-[42px] border-white/[0.03]" />
      <div className="absolute left-1/2 top-[50%] h-[220px] w-[220px] -translate-x-1/2 rounded-full border-[34px] border-white/[0.025]" />
      <div className="absolute left-1/2 top-[8%] h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_62%)]" />
    </div>
  );
}

type CommentItem = {
  id: number;
  username: string;
  date: string;
  body: string;
  replies: number;
  likes: number;
  dislikes: number;
};

function CommentActions({
  replies,
  likes,
  dislikes,
}: Pick<CommentItem, "replies" | "likes" | "dislikes">) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-white/75 sm:gap-5">
      <div className="flex items-center gap-1.5">
        <MessageCircle className="h-4 w-4 shrink-0" />
        <span>{replies}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <Heart className="h-4 w-4 shrink-0" />
        <span>{likes}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <ThumbsDown className="h-4 w-4 shrink-0" />
        <span>{dislikes}</span>
      </div>
    </div>
  );
}

export default function Comments({
  comicId,
  episodeId,
  comments,
}: CommentsPageProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  const { user: clerkUser } = useUser();
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const isAdmin =
    !!adminEmail && clerkUser?.emailAddresses[0]?.emailAddress === adminEmail;

  const backHref = isAdmin
    ? `/admin/comics/${comicId}/episode/${episodeId}`
    : `/profile/avatar/comics/${comicId}/episode/${episodeId}`;

  const baseComments = useMemo(
    () => (comments.success ? comments.comments : []),
    [comments],
  );

  const [optimisticComments, addOptimisticComment] = useOptimistic<
    OptimisticComment[],
    OptimisticComment
  >(baseComments, (state, newComment) => [newComment, ...state]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmed = content.trim();
    if (!trimmed) return;

    const optimisticComment: OptimisticComment = {
      id: `temp-${Date.now()}`,
      content: trimmed,
      episodeId,
      authorId: "optimistic-user",
      createdAt: new Date(),
      updatedAt: new Date(),
      author: {
        id: clerkUser?.id ?? "me",
        fullname: clerkUser?.fullName || "You",
        image: clerkUser?.imageUrl || null,
      },
      optimistic: true,
    };

    startTransition(async () => {
      addOptimisticComment(optimisticComment);
      setContent("");

      const result = await createComment(episodeId, trimmed, comicId, isAdmin);

      if (!result?.success) {
        setContent(trimmed);
      }

      router.refresh();
    });
  }

  return (
    <main className="relative h-[100dvh] overflow-hidden bg-gradient-to-b from-[#27484e] via-[#11262b] to-[#020507] text-white">
      <Watermark />

      <div className="relative z-10 flex h-full flex-col">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-[#29474d]/80 backdrop-blur-md">
          <div className="relative flex h-12 items-center px-3">
            <Link
              href={backHref}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white/95 transition hover:bg-white/10"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>

            <h1 className="absolute left-1/2 -translate-x-1/2 text-[15px] font-semibold tracking-tight">
              Comments ({optimisticComments.length})
            </h1>
          </div>
        </header>

        <section className="min-h-0 flex-1 overflow-y-auto pb-24">
          <div className="divide-y divide-white/10">
            {optimisticComments.map((comment) => (
              <article key={comment.id} className="px-4 py-4 sm:px-5 sm:py-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[clamp(0.95rem,0.85rem+0.35vw,1.05rem)] font-semibold tracking-[-0.01em] text-white/95">
                    {comment.author.fullname || "Unknown user"}
                  </div>

                  {comment.optimistic ? (
                    <span className="text-xs text-white/45">Sending...</span>
                  ) : null}
                </div>

                <div className="mt-1 text-[clamp(0.72rem,0.68rem+0.2vw,0.8rem)] font-medium tracking-[0.01em] text-white/50">
                  {formatDistanceToNow(new Date(comment.createdAt))} ago
                </div>

                <p className="mt-2.5 text-[clamp(0.92rem,0.84rem+0.3vw,1rem)] leading-[1.7] text-white/90">
                  {comment.content}
                </p>

                <CommentActions replies={12} likes={10} dislikes={2} />
              </article>
            ))}
          </div>
        </section>

        <div className="sticky bottom-0 z-20 border-t border-white/10 bg-[#1e3439]/90 backdrop-blur-md">
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 px-3 py-2.5"
          >
            <div className="flex-1">
              <label htmlFor="comment" className="sr-only">
                Leave a comment
              </label>
              <input
                id="comment"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                type="text"
                placeholder="Leave a comment"
                disabled={isPending}
                className="h-11 w-full rounded-full border border-white/10 bg-[#d5d9d8] px-4 text-[14px] text-slate-800 placeholder:text-slate-500 outline-none disabled:opacity-70"
              />
            </div>

            <button
              type="submit"
              disabled={isPending || !content.trim()}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-white/95 transition hover:bg-white/10 disabled:opacity-50"
              aria-label="Send comment"
            >
              <Send className="h-6 w-6" />
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
