"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import PostCard from "@/components/PostCard";
import type { HeroSection, Post } from "./types";
import DeletePostDialog from "./DeletePostDialog";

type PostsHeroPreviewProps = {
  hero: HeroSection | null;
  posts: Post[];
  isBusy: boolean;
  onEditPost: (post: Post) => void;
  onDeletePost: (postId: string) => void;
};

export default function PostsHeroPreview({
  hero,
  posts,
  isBusy,
  onEditPost,
  onDeletePost,
}: PostsHeroPreviewProps) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-white/10">
      <main className="relative min-h-screen w-full overflow-hidden bg-black font-sans">
        <div className="absolute inset-0 z-0">
          <Image
            src={hero?.backgroundImage || "/landing.jpg"}
            alt="Hero Background"
            fill
            priority
            className="object-cover object-right lg:object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-orange-950/60 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 flex min-h-screen flex-col justify-between px-6 py-12 lg:px-16">
          <div />

          <div className="flex w-full flex-col items-center justify-between lg:flex-row">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-2xl"
            >
              <span className="bg-red-600 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                Komicats
              </span>

              <h1 className="mt-4 text-5xl font-black uppercase leading-[0.9] tracking-tighter text-white drop-shadow-2xl md:text-7xl lg:text-8xl">
                {hero?.title || "Mistaken Idea Of Denouncing Pleasure"}
              </h1>
            </motion.div>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {posts.length > 0 ? (
              posts.map((post, idx) => (
                <div key={post.id} className="space-y-3">
                  <PostCard
                    image={post.image}
                    date={post.date}
                    soon={post.soon}
                    title={post.title}
                    index={idx}
                  />

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onEditPost(post)}
                      disabled={isBusy}
                      className="flex-1 border border-white/10 bg-black/20 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/5 disabled:opacity-50"
                    >
                      Edit
                    </button>

                    <DeletePostDialog
                      isBusy={isBusy}
                      onDelete={() => onDeletePost(post.id)}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-white/70">No posts yet.</div>
            )}
          </div>
        </div>

        <div className="pointer-events-none absolute top-0 left-0 h-1/3 w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600/10 blur-[120px]" />
      </main>
    </div>
  );
}
