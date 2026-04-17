"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

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
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const isLocalImageSrc = useMemo(() => {
    if (!thumbnail) return false;

    return (
      thumbnail.startsWith("blob:") ||
      thumbnail.startsWith("data:") ||
      thumbnail.startsWith("file:")
    );
  }, [thumbnail]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting && entry.intersectionRatio >= 0.2);
      },
      {
        threshold: [0, 0.1, 0.2, 0.35, 0.6, 1],
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setVideoReady(false);
    setVideoError(false);
  }, [previewVideo]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !previewVideo || videoError) return;

    if (isVisible) {
      const playPromise = video.play();
      if (playPromise) {
        playPromise.catch(() => {});
      }
    } else {
      video.pause();
    }
  }, [isVisible, previewVideo, videoError]);

  const showVideo = !!previewVideo && !videoError && videoReady;
  const showThumbnail = !!thumbnail && !showVideo;

  return (
    <div
      ref={containerRef}
      className="relative h-[72vh] min-h-[520px] w-full overflow-hidden bg-black sm:h-[78vh] sm:min-h-[640px] lg:h-[82vh]"
    >
      {showThumbnail ? (
        isLocalImageSrc ? (
          <img
            src={thumbnail}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover transition duration-500 opacity-100"
          />
        ) : (
          <Image
            src={thumbnail}
            alt={title}
            fill
            priority
            className="object-cover transition duration-500 opacity-100"
            unoptimized
          />
        )
      ) : !thumbnail ? (
        <div className="h-full w-full bg-[#9b7b47]" />
      ) : null}

      {previewVideo && !videoError ? (
        <video
          ref={videoRef}
          src={previewVideo}
          muted
          loop
          playsInline
          preload="metadata"
          onCanPlay={() => setVideoReady(true)}
          onLoadedData={() => setVideoReady(true)}
          onError={() => {
            setVideoError(true);
            setVideoReady(false);
          }}
          className={`absolute inset-0 h-full w-full object-cover transition duration-500 ${
            showVideo ? "opacity-100" : "opacity-0"
          }`}
        />
      ) : null}

      <div className="absolute inset-0 bg-gradient-to-t from-[#071015] via-black/15 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#071015]/65 via-transparent to-[#071015]/65" />
    </div>
  );
}
