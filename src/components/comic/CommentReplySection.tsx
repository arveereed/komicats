"use client";

import { useOptimistic, useState, useTransition } from "react";
import { ChevronDown, ChevronUp, CornerDownRight, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { createCommentReply } from "@/actions/comment-reply.action";
import { useUser } from "@clerk/nextjs";

type ReplyItem = {
  id: string;
  content: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
  commentId: string;
  authorId: string;
  author: {
    id: string;
    fullname: string;
    image: string | null;
  };
};

type OptimisticReply = ReplyItem & {
  optimistic?: boolean;
};

type CommentReplySectionProps = {
  comicId: string;
  episodeId: string;
  commentId: string;
  replies: ReplyItem[];
};

export default function CommentReplySection({
  comicId,
  episodeId,
  commentId,
  replies,
}: CommentReplySectionProps) {
  const router = useRouter();
  const { user: clerkUser } = useUser();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const isAdmin =
    !!adminEmail && clerkUser?.emailAddresses[0]?.emailAddress === adminEmail;

  const [optimisticReplies, addOptimisticReply] = useOptimistic<
    OptimisticReply[],
    OptimisticReply
  >(replies, (state, newReply) => [...state, newReply]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmed = content.trim();
    if (!trimmed) return;

    const optimisticReply: OptimisticReply = {
      id: `temp-reply-${Date.now()}`,
      content: trimmed,
      createdAt: new Date(),
      updatedAt: new Date(),
      commentId,
      authorId: clerkUser?.id ?? "me",
      author: {
        id: clerkUser?.id ?? "me",
        fullname: clerkUser?.fullName || "You",
        image: clerkUser?.imageUrl || null,
      },
      optimistic: true,
    };

    startTransition(async () => {
      addOptimisticReply(optimisticReply);
      setContent("");
      setOpen(true);

      const result = await createCommentReply(
        commentId,
        trimmed,
        comicId,
        episodeId,
        isAdmin,
      );

      if (!result?.success) {
        setContent(trimmed);
      }

      router.refresh();
    });
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
      >
        <CornerDownRight className="h-4 w-4" />
        <span>
          {optimisticReplies.length}{" "}
          {optimisticReplies.length === 1 ? "reply" : "replies"}
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {open ? (
        <div className="mt-3 space-y-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 sm:p-4">
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <div className="flex-1">
              <label htmlFor={`reply-${commentId}`} className="sr-only">
                Write a reply
              </label>
              <textarea
                id={`reply-${commentId}`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={2}
                placeholder="Write a reply..."
                disabled={isPending}
                className="min-h-[80px] w-full resize-none rounded-2xl border border-white/10 bg-[#d5d9d8] px-4 py-3 text-sm text-slate-800 placeholder:text-slate-500 outline-none disabled:opacity-70"
              />
            </div>

            <button
              type="submit"
              disabled={isPending || !content.trim()}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white/95 transition hover:bg-white/10 disabled:opacity-50"
              aria-label="Send reply"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>

          <div className="space-y-3">
            {optimisticReplies.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/50">
                No replies yet.
              </div>
            ) : (
              optimisticReplies.map((reply) => (
                <article
                  key={reply.id}
                  className="rounded-2xl border border-white/8 bg-black/10 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-white/95">
                        {reply.author.fullname || "Unknown user"}
                      </div>
                      <div className="mt-0.5 text-xs text-white/45">
                        {formatDistanceToNow(new Date(reply.createdAt))} ago
                      </div>
                    </div>

                    {reply.optimistic ? (
                      <span className="text-xs text-white/40">Sending...</span>
                    ) : null}
                  </div>

                  <p className="mt-2 text-sm leading-6 text-white/88">
                    {reply.content}
                  </p>
                </article>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
