"use client";

import Image from "next/image";
import Link from "next/link";
import { BookOpen, CalendarDays, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { deleteComic } from "@/actions/comic.action";
import EditComicDialog from "../../components/admin/EditComicDialog";
import { DeleteComicDialog } from "../../components/admin/DeleteComic";

type ComicPreviewCardProps = {
  comic: {
    id: string;
    title: string;
    thumbnail: string | null;
    previewVideo?: string | null;
    createdAt: Date | string;
    episodes: { id: string }[];
    user: {
      fullname: string | null;
      email: string;
    };
  };
};

export default function ComicPreviewCard({ comic }: ComicPreviewCardProps) {
  const [hovered, setHovered] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (hovered && comic.previewVideo) {
      setCanPlay(true);
      const playPromise = video.play();
      if (playPromise) {
        playPromise.catch(() => {});
      }
    } else {
      video.pause();
      video.currentTime = 0;
      setCanPlay(false);
    }
  }, [hovered, comic.previewVideo]);

  return (
    <div
      className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/[0.07]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={`/admin/comics/${comic.id}`} className="block">
        <div className="relative h-56 w-full overflow-hidden bg-white/5">
          {comic.thumbnail ? (
            <>
              <Image
                src={comic.thumbnail}
                alt={comic.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                className={`object-cover transition duration-500 ${
                  hovered && comic.previewVideo
                    ? "opacity-0"
                    : "opacity-100 hover:scale-105"
                }`}
              />

              {comic.previewVideo && (
                <video
                  ref={videoRef}
                  src={comic.previewVideo}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className={`absolute inset-0 h-full w-full object-cover transition duration-300 ${
                    canPlay ? "opacity-100" : "opacity-0"
                  }`}
                />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-white/40">
              No thumbnail
            </div>
          )}

          <div className="absolute bottom-4 left-4 right-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-md">
              <BookOpen className="h-3.5 w-3.5" />
              {comic.episodes.length} episode
              {comic.episodes.length > 1 ? "s" : ""}
            </div>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div>
            <h3 className="line-clamp-1 text-xl font-semibold text-white">
              {comic.title}
            </h3>
            <p className="mt-1 text-sm text-white/50">
              Open comic details and manage episodes
            </p>
          </div>

          <div className="space-y-3 text-sm text-white/65">
            <div className="flex items-center gap-2">
              <UserRound className="h-4 w-4 text-white/40" />
              <span>{comic.user.fullname || comic.user.email}</span>
            </div>

            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-white/40" />
              <span>
                {new Date(comic.createdAt).toLocaleDateString("en-PH", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </Link>

      <div className="border-t border-white/10 p-4">
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-2xl bg-white/5 p-1">
            <EditComicDialog comic={comic as never} />
          </div>

          <div className="rounded-2xl bg-white/5 p-1">
            <DeleteComicDialog
              comicId={comic.id}
              comicTitle={comic.title}
              action={deleteComic.bind(null, comic.id)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
