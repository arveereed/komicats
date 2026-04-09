"use client";

import { useUser } from "@clerk/nextjs";
import { useSignIn } from "@clerk/nextjs/legacy";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import PostCard from "@/components/PostCard";
import InstallButton from "@/components/pwa/install-button";

const MOCK_POSTS = [
  {
    image: "/icons/post-1.jpg",
    date: "MAY 30, 2026",
    title: "Filipino-Comics-Filtered-Lenses",
  },
  {
    image: "/icons/post-2.jpg",
    date: "MAY 22, 2026",
    title: "Filipino-Comics-Patay-Kung-Patay",
  },
  {
    image: "/icons/post-3.jpg",
    date: "April 23, 22, 2026",
    title: "Filipino-Comics-PASIG-Unbound",
  },
];

export default function AnimeBlog() {
  const router = useRouter();
  const { isSignedIn, isLoaded: userLoaded } = useUser();
  const { isLoaded, signIn, setActive } = useSignIn();

  // Move the navigation logic here
  useEffect(() => {
    if (userLoaded && isSignedIn) {
      router.push("/profile/avatar");
    }
  }, [userLoaded, isSignedIn, router]);

  // Rest of your component logic...
  if (!userLoaded || !isLoaded) return <div>Loading...</div>;

  return (
    <main className="relative min-h-screen w-full bg-black overflow-hidden font-sans">
      {/* Background Hero Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/landing.jpg" // Replace with your actual anime illustration
          alt="Hero Background"
          fill
          priority
          className="object-cover object-right lg:object-center"
        />
        {/* Dramatic Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-orange-950/60 via-transparent to-transparent" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col min-h-screen px-6 lg:px-16 py-12 justify-between">
        {/* Top Spacer or Nav could go here */}
        <div />

        {/* Featured Section */}
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
              Mistaken Idea Of Denouncing Pleasure
            </h1>
            {/* <p className="mt-6 text-sm md:text-base font-bold text-white/80 tracking-wide uppercase">
              May 22, 2020 <span className="mx-2 opacity-30">•</span> 7 Comments
            </p> */}
          </motion.div>

          {/* Right Pager (Hidden on small mobile, visible on tablet+) */}
          {/* <div className="hidden md:block">
            <VerticalPager />
          </div> */}
        </div>

        {/* Bottom Post Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
          {MOCK_POSTS.map((post, idx) => (
            <PostCard key={idx} {...post} index={idx} />
          ))}
        </div>
      </div>
      <InstallButton />

      {/* Ambient Red Glow */}
      <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-red-600/10 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
    </main>
  );
}
