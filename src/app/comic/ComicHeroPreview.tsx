"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type ComicHeroPreviewProps = {
  thumbnail: string | null;
  previewVideo: string | null;
  title: string;
};

export default function ComicHeroPreview({
  thumbnail,
  previewVideo,
  title,
}: ComicHeroPreviewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting && entry.intersectionRatio >= 0.4);
      },
      {
        threshold: [0, 0.25, 0.4, 0.75, 1],
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !previewVideo) return;

    if (isVisible) {
      const playPromise = video.play();
      if (playPromise) playPromise.catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [isVisible, previewVideo]);

  return (
    <div
      ref={containerRef}
      className="relative h-[320px] w-full overflow-hidden rounded-[28px] bg-white/5"
    >
      {thumbnail && (
        <Image
          src={thumbnail}
          alt={title}
          fill
          className={`object-cover transition duration-300 ${
            isVisible && previewVideo ? "opacity-0" : "opacity-100"
          }`}
        />
      )}

      {previewVideo && (
        <video
          ref={videoRef}
          src={previewVideo}
          muted
          loop
          playsInline
          preload="metadata"
          className={`absolute inset-0 h-full w-full object-cover transition duration-300 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
    </div>
  );
}
