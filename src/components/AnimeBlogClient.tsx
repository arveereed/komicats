"use client";

import { useUser } from "@clerk/nextjs";
import { useSignIn } from "@clerk/nextjs/legacy";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import PostCard from "@/components/PostCard";
import InstallButton from "@/components/pwa/install-button";
import Loading from "./Loading";

type Post = {
  id: string;
  title: string;
  date: string;
  soon?: string;
  image: string;
  imagePublicId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

type HeroSection = {
  id: string;
  title: string;
  backgroundImage: string;
  imagePublicId: string;
  createdAt: Date;
  updatedAt: Date;
};

type Props = {
  posts: Post[];
  hero: HeroSection | null;
};

export default function AnimeBlogClient({ posts, hero }: Props) {
  const router = useRouter();
  const { isSignedIn, isLoaded: userLoaded } = useUser();
  const { isLoaded } = useSignIn();

  useEffect(() => {
    if (userLoaded && isSignedIn) {
      router.push("/profile/avatar");
    }
  }, [userLoaded, isSignedIn, router]);

  const isLoading = !userLoaded || !isLoaded;

  return (
    <>
      {isLoading ? (
        <main className="flex min-h-screen items-center justify-center bg-[#07141a] px-6">
          <Loading />
        </main>
      ) : (
        <main className="relative min-h-screen w-full overflow-hidden font-sans">
          <div className="absolute inset-0 z-0">
            <Image
              src={hero?.backgroundImage || "/landing.jpg"}
              alt="Hero Background"
              fill
              priority
              className="object-cover object-right opacity-75 lg:object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-orange-950/25 via-transparent to-transparent" />
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
                  <PostCard
                    key={post.id}
                    image={post.image}
                    date={post.date}
                    soon={post.soon ?? "SOON"}
                    title={post.title}
                    index={idx}
                  />
                ))
              ) : (
                <div className="col-span-full text-center text-white/70">
                  No posts yet.
                </div>
              )}
            </div>
          </div>

          <div className="pointer-events-none absolute left-0 top-0 h-1/3 w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600/10 blur-[120px]" />
        </main>
      )}

      <InstallButton />
    </>
  );
}
