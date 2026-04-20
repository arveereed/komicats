"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface PostCardProps {
  image: string;
  date: string;
  soon: string;
  title: string;
  index: number;
}

export default function PostCard({
  image,
  date,
  soon,
  title,
  index,
}: PostCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
      whileHover={{ y: -5, backgroundColor: "rgba(251, 191, 36, 0.2)" }}
      className="group relative flex items-center gap-4 overflow-hidden rounded-sm border border-white/5
                 bg-gradient-to-r from-orange-900/40 to-orange-800/20 p-4 backdrop-blur-md
                 transition-colors duration-300 cursor-pointer"
    >
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-white/70">
          <span className="text-orange-500">{soon?.trim() || "SOON"}</span>
          <span>•</span>
          <span>{date}</span>
        </div>

        <h3 className="line-clamp-2 text-xs font-black uppercase leading-tight tracking-tight text-white md:text-sm">
          {title}
        </h3>
      </div>
    </motion.div>
  );
}
