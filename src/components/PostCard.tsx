"use client";
import Image from "next/image";
import { motion } from "framer-motion";

interface PostCardProps {
  image: string;
  date: string;
  title: string;
  index: number;
}

export default function PostCard({ image, date, title, index }: PostCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
      whileHover={{ y: -5, backgroundColor: "rgba(251, 191, 36, 0.2)" }}
      className="group relative flex items-center gap-4 p-4 rounded-sm cursor-pointer overflow-hidden
                 bg-gradient-to-r from-orange-900/40 to-orange-800/20 backdrop-blur-md 
                 border border-white/5 transition-colors duration-300"
    >
      <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-[10px] tracking-widest text-white/70 font-bold">
          <span className="text-orange-500">SOON</span>
          <span>•</span>
          <span>{date}</span>
        </div>
        <h3 className="text-xs md:text-sm font-black leading-tight text-white tracking-tight uppercase line-clamp-2">
          {title}
        </h3>
      </div>
    </motion.div>
  );
}
