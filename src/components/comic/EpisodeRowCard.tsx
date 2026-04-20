"use client";

import Image from "next/image";
import Link from "next/link";
import JSZip from "jszip";

type EpisodeRowCardProps = {
  href: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  pages: number;
  downloadImages: string[];
};

export function EpisodeRowCard({
  href,
  title,
  description,
  imageUrl,
  pages,
  downloadImages,
}: EpisodeRowCardProps) {
  const handleDownload = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!downloadImages.length) return;

    try {
      const zip = new JSZip();

      await Promise.all(
        downloadImages.map(async (url, index) => {
          const response = await fetch(url);

          if (!response.ok) {
            throw new Error(`Failed to fetch image ${index + 1}`);
          }

          const blob = await response.blob();

          const extension =
            blob.type.split("/")[1]?.split(";")[0] ||
            url.split(".").pop() ||
            "jpg";

          zip.file(
            `page-${String(index + 1).padStart(2, "0")}.${extension}`,
            blob,
          );
        }),
      );

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const objectUrl = URL.createObjectURL(zipBlob);

      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `${title}.zip`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("DOWNLOAD_EPISODE_IMAGES_ERROR", error);
    }
  };

  return (
    <Link href={href} className="block">
      <div className="group flex items-start gap-4 rounded-2xl p-2 transition hover:bg-white/5">
        <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-white/10 sm:h-28 sm:w-24">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover transition duration-300 group-hover:scale-105"
            />
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
            {description || "No description available."}
          </p>

          <div className="mt-2 flex items-center gap-3 text-sm text-white/55">
            <span>
              {pages} page{pages > 1 ? "s" : ""}
            </span>
          </div>
        </div>
        {/* 
        <button
          type="button"
          onClick={handleDownload}
          disabled={!downloadImages.length}
          aria-label={`Download ${title}`}
          className="ml-auto self-center inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Image src="/icons/dl.png" alt="Download" width={24} height={24} />
        </button> */}
      </div>
    </Link>
  );
}
