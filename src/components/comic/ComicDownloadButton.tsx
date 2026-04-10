"use client";

import JSZip from "jszip";
import Image from "next/image";

type ComicDownloadButtonProps = {
  comicTitle: string;
  episodes: {
    title: string;
    images: {
      imageUrl: string;
    }[];
  }[];
};

export function ComicDownloadButton({
  comicTitle,
  episodes,
}: ComicDownloadButtonProps) {
  const handleDownload = async () => {
    const downloadableEpisodes = episodes.filter(
      (episode) => episode.images.length > 0,
    );

    if (!downloadableEpisodes.length) return;

    try {
      const zip = new JSZip();

      await Promise.all(
        downloadableEpisodes.map(async (episode, episodeIndex) => {
          const safeEpisodeTitle =
            episode.title.replace(/[<>:"/\\|?*]+/g, "").trim() ||
            `Episode-${episodeIndex + 1}`;

          const episodeFolder = zip.folder(
            `${String(episodeIndex + 1).padStart(2, "0")}-${safeEpisodeTitle}`,
          );

          if (!episodeFolder) return;

          await Promise.all(
            episode.images.map(async (image, imageIndex) => {
              const response = await fetch(image.imageUrl);

              if (!response.ok) {
                throw new Error(
                  `Failed to fetch image ${imageIndex + 1} for ${episode.title}`,
                );
              }

              const blob = await response.blob();
              const extension =
                blob.type.split("/")[1]?.split(";")[0] ||
                image.imageUrl.split(".").pop() ||
                "jpg";

              episodeFolder.file(
                `page-${String(imageIndex + 1).padStart(2, "0")}.${extension}`,
                blob,
              );
            }),
          );
        }),
      );

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const objectUrl = URL.createObjectURL(zipBlob);

      const safeComicTitle =
        comicTitle.replace(/[<>:"/\\|?*]+/g, "").trim() || "comic";

      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `${safeComicTitle}.zip`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (error) {
      console.error("DOWNLOAD_COMIC_IMAGES_ERROR", error);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={!episodes.some((episode) => episode.images.length > 0)}
      className="flex h-12 w-full items-center justify-center gap-3 rounded-md bg-[#3a555d] text-base font-semibold text-white transition hover:bg-[#45636c] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Image src="/icons/dl.png" alt="Download" width={20} height={20} />
      <span>Download</span>
    </button>
  );
}
