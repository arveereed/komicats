import { Loader2 } from "lucide-react";
import React from "react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#07141a]/60 backdrop-blur-md">
      {/* Outer Glow Ring */}
      <div className="relative flex items-center justify-center">
        <div className="absolute h-20 w-20 animate-pulse rounded-full bg-cyan-500/20 blur-2xl" />

        {/* The Spinner */}
        <Loader2
          className="size-12 animate-spin text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"
          strokeWidth={1.5}
        />
      </div>

      {/* Subtle Text */}
      <p className="mt-4 text-sm font-medium tracking-widest text-cyan-100/60 uppercase animate-pulse">
        Loading Komicats
      </p>
    </div>
  );
}
