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

  if (!userLoaded || !isLoaded) return Loading();

  return (
    <main className="relative min-h-screen w-full overflow-hidden font-sans">
      <div className="absolute inset-0 z-0">
        <Image
          src={hero?.backgroundImage || "/landing.jpg"}
          alt="Hero Background"
          fill
          priority
          className="object-cover object-right lg:object-center opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-orange-950/25 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen px-6 lg:px-16 py-12 justify-between">
        <div />

        <div className="flex flex-col lg:flex-row justify-between items-center w-full">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 tracking-widest uppercase">
              Komicats
            </span>
            <h1 className="mt-4 text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter uppercase drop-shadow-2xl">
              {hero?.title || "Mistaken Idea Of Denouncing Pleasure"}
            </h1>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
          {posts.length > 0 ? (
            posts.map((post, idx) => (
              <PostCard
                key={post.id}
                image={post.image}
                date={post.date}
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

      <InstallButton />

      <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-red-600/10 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
    </main>
  );
}
