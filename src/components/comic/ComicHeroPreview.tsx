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
        setIsVisible(entry.isIntersecting && entry.intersectionRatio >= 0.35);
      },
      {
        threshold: [0, 0.2, 0.35, 0.6, 1],
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
      className="relative h-[72vh] min-h-[520px] w-full overflow-hidden bg-black sm:h-[78vh] sm:min-h-[640px] lg:h-[82vh]"
    >
      {thumbnail ? (
        <Image
          src={thumbnail}
          alt={title}
          fill
          priority
          className={`object-cover transition duration-500 ${
            isVisible && previewVideo ? "opacity-0" : "opacity-100"
          }`}
        />
      ) : (
        <div className="h-full w-full bg-[#9b7b47]" />
      )}

      {previewVideo ? (
        <video
          ref={videoRef}
          src={previewVideo}
          muted
          loop
          playsInline
          preload="metadata"
          className={`absolute inset-0 h-full w-full object-cover transition duration-500 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        />
      ) : null}

      <div className="absolute inset-0 bg-gradient-to-t from-[#071015] via-black/15 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#071015]/65 via-transparent to-[#071015]/65" />
    </div>
  );
}
