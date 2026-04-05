"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

type LockedEpisodeCardProps = {
  comicId: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  pages?: number;
};

export function LockedEpisodeCard({
  comicId,
  title,
  description,
  imageUrl,
  pages = 0,
}: LockedEpisodeCardProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push(`/profile/avatar/comics/${comicId}/buy`)}
      className="block w-full cursor-pointer text-left"
    >
      <div className="group flex items-start gap-4 rounded-2xl p-2 transition hover:bg-white/5">
        <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-white/10 sm:h-28 sm:w-24">
          {imageUrl ? (
            <>
              <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-cover brightness-50 blur-[1px] transition duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 ring-1 ring-white/20">
                  <Lock className="h-5 w-5 text-white" />
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-white/50">
              No image
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 pt-1">
          <h3 className="line-clamp-1 text-xl font-semibold text-white">
            {title}
          </h3>

          <p className="mt-2 line-clamp-2 text-base leading-7 text-white/85">
            {description || "Unlock this episode by purchasing this comic."}
          </p>

          <div className="mt-2 flex items-center gap-3 text-sm text-white/55">
            <span>
              {pages} page{pages > 1 ? "s" : ""}
            </span>

            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/80">
              Locked
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
