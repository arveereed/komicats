"use client";

import Image from "next/image";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ImageUploadPreview from "./ImageUploadPreview";
import EpisodeImagesUpload from "./EpisodeImagesUpload";
import { updateComic } from "@/actions/comic.action";
import { uploadFileToCloudinary } from "@/actions/cloudinary.action";
import { uploadPreviewVideoClient } from "@/lib/uploadPreviewVideoClient";
import { uploadImageClient } from "@/lib/uploadImageClient";

type UploadedImage = {
  url: string;
  publicId: string | null;
};

type Episode = {
  episode: string;
  description: string;
  images: UploadedImage[];
};

type EditComicDialogProps = {
  comic: {
    id: string;
    title: string;
    description?: string | null;
    thumbnail: string | null;
    thumbnailPublicId?: string | null;
    previewVideo?: string | null;
    previewVideoPublicId?: string | null;
    cloudinaryFolder?: string | null;
    episodes: {
      id: string;
      title: string;
      description: string;
      images: {
        id: string;
        imageUrl: string;
        publicId?: string | null;
      }[];
    }[];
  };
};

const buildInitialEpisodes = (
  comic: EditComicDialogProps["comic"],
): Episode[] =>
  comic.episodes.length > 0
    ? comic.episodes.map((ep) => ({
        episode: ep.title,
        description: ep.description,
        images: ep.images.map((img) => ({
          url: img.imageUrl,
          publicId: img.publicId ?? null,
        })),
      }))
    : [{ episode: "", description: "", images: [] }];

export default function EditComicDialog({ comic }: EditComicDialogProps) {
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const [open, setOpen] = useState(false);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(comic.title);
  const [description, setDescription] = useState(comic.description ?? "");

  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [currentThumbnail, setCurrentThumbnail] = useState<string | null>(
    comic.thumbnail,
  );

  const [previewVideo, setPreviewVideo] = useState<File | null>(null);
  const [currentPreviewVideo, setCurrentPreviewVideo] = useState<string | null>(
    comic.previewVideo ?? null,
  );
  const [uploadedPreviewVideo, setUploadedPreviewVideo] = useState<{
    url: string;
    publicId: string | null;
  } | null>(
    comic.previewVideo
      ? {
          url: comic.previewVideo,
          publicId: comic.previewVideoPublicId ?? null,
        }
      : null,
  );
  const [isUploadingPreviewVideo, setIsUploadingPreviewVideo] = useState(false);

  const [episodes, setEpisodes] = useState<Episode[]>(
    buildInitialEpisodes(comic),
  );
  const [isUploadingPages, setIsUploadingPages] = useState(false);

  const episodesEndRef = useRef<HTMLDivElement | null>(null);

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertOpen(true);
  };

  const resetForm = () => {
    setTitle(comic.title);
    setDescription(comic.description ?? "");
    setThumbnail(null);
    setCurrentThumbnail(comic.thumbnail);
    setPreviewVideo(null);
    setCurrentPreviewVideo(comic.previewVideo ?? null);
    setUploadedPreviewVideo(
      comic.previewVideo
        ? {
            url: comic.previewVideo,
            publicId: comic.previewVideoPublicId ?? null,
          }
        : null,
    );
    setEpisodes(buildInitialEpisodes(comic));
  };

  const addEpisode = () => {
    setEpisodes((prev) => [
      ...prev,
      { episode: "", description: "", images: [] },
    ]);
  };

  const removeEpisode = (index: number) => {
    setEpisodes((prev) => prev.filter((_, i) => i !== index));
  };

  const updateEpisode = <K extends keyof Episode>(
    index: number,
    field: K,
    value: Episode[K],
  ) => {
    setEpisodes((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  useEffect(() => {
    episodesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [episodes.length]);

  const hasUnsavedChanges = () => {
    if (title.trim() !== comic.title) return true;
    if (description.trim() !== (comic.description ?? "").trim()) return true;
    if (thumbnail) return true;
    if (currentThumbnail !== comic.thumbnail) return true;
    if (previewVideo) return true;
    if (currentPreviewVideo !== (comic.previewVideo ?? null)) return true;

    const initialEpisodes = buildInitialEpisodes(comic);
    return JSON.stringify(episodes) !== JSON.stringify(initialEpisodes);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (isPending) return;

    if (nextOpen) {
      setOpen(true);
      return;
    }

    if (hasUnsavedChanges()) {
      setCloseConfirmOpen(true);
      return;
    }

    resetForm();
    setOpen(false);
  };

  const confirmCloseDialog = () => {
    resetForm();
    setCloseConfirmOpen(false);
    setOpen(false);
  };

  const uploadSingleImage = async (file: File, folder: string) => {
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("folder", folder);

    const result = await uploadFileToCloudinary(uploadFormData);

    if (!result.success || !result.url) {
      throw new Error(result.message || "Image upload failed");
    }

    return {
      url: result.url,
      publicId: result.publicId ?? null,
    };
  };

  const handlePreviewVideoChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0] ?? null;
    setPreviewVideo(file);

    if (!file) return;

    if (!file.type.startsWith("video/")) {
      showAlert(
        "Invalid preview video",
        "Please upload a valid video file for the preview.",
      );
      setPreviewVideo(null);
      return;
    }

    try {
      setIsUploadingPreviewVideo(true);

      const uploaded = await uploadPreviewVideoClient(file);

      setUploadedPreviewVideo({
        url: uploaded.url,
        publicId: uploaded.publicId,
      });

      setCurrentPreviewVideo(uploaded.url);
    } catch (error) {
      console.error(error);
      setPreviewVideo(null);
      setUploadedPreviewVideo(null);

      showAlert(
        "Preview video upload failed",
        error instanceof Error
          ? error.message
          : "Unable to upload preview video.",
      );
    } finally {
      setIsUploadingPreviewVideo(false);
      e.target.value = "";
    }
  };

  const handleEpisodeImagesChange = async (
    episodeIndex: number,
    files: File[],
  ) => {
    if (!files.length) return;

    try {
      setIsUploadingPages(true);

      const uploaded = await Promise.all(
        files.map((file) => uploadImageClient(file)),
      );

      setEpisodes((prev) =>
        prev.map((item, i) =>
          i === episodeIndex
            ? {
                ...item,
                images: [...item.images, ...uploaded],
              }
            : item,
        ),
      );
    } catch (error) {
      console.error(error);
      showAlert(
        "Episode image upload failed",
        error instanceof Error
          ? error.message
          : "Unable to upload episode images.",
      );
    } finally {
      setIsUploadingPages(false);
    }
  };

  const toCloudinarySlug = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/['"]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showAlert("Missing comic title", "Please enter a title for your comic.");
      return;
    }

    if (!currentThumbnail && !thumbnail) {
      showAlert(
        "Missing comic thumbnail",
        "Please upload a thumbnail image for your comic.",
      );
      return;
    }

    if (isUploadingPreviewVideo) {
      showAlert(
        "Preview video still uploading",
        "Please wait for the preview video upload to finish before updating the comic.",
      );
      return;
    }

    if (isUploadingPages) {
      showAlert(
        "Episode pages still uploading",
        "Please wait for the episode image upload to finish before updating the comic.",
      );
      return;
    }

    if (episodes.length === 0) {
      showAlert(
        "No episodes added",
        "Please add at least one episode before saving.",
      );
      return;
    }

    const invalidEpisodeIndex = episodes.findIndex(
      (item) =>
        !item.episode.trim() ||
        !item.description.trim() ||
        item.images.length === 0,
    );

    if (invalidEpisodeIndex !== -1) {
      const episodeNumber = invalidEpisodeIndex + 1;
      const invalidEpisode = episodes[invalidEpisodeIndex];

      if (!invalidEpisode.episode.trim()) {
        showAlert(
          `Episode ${episodeNumber} is incomplete`,
          `Please enter a title for Episode ${episodeNumber}.`,
        );
        return;
      }

      if (!invalidEpisode.description.trim()) {
        showAlert(
          `Episode ${episodeNumber} is incomplete`,
          `Please enter a description for Episode ${episodeNumber}.`,
        );
        return;
      }

      if (invalidEpisode.images.length === 0) {
        showAlert(
          `Episode ${episodeNumber} is incomplete`,
          `Please upload at least one image for Episode ${episodeNumber}.`,
        );
        return;
      }
    }

    startTransition(async () => {
      try {
        const comicSlug = toCloudinarySlug(title);

        if (!comicSlug) {
          showAlert("Invalid comic title", "Please enter a valid comic title.");
          return;
        }

        const comicFolder =
          comic.cloudinaryFolder || `comics/${comicSlug}-${comic.id}`;

        let thumbnailUrl = currentThumbnail;
        let previewVideoUrl =
          uploadedPreviewVideo?.url ?? currentPreviewVideo ?? "";
        let previewVideoPublicId =
          uploadedPreviewVideo?.publicId ?? comic.previewVideoPublicId ?? "";

        if (thumbnail) {
          const thumbnailUpload = await uploadSingleImage(
            thumbnail,
            `${comicFolder}/thumbnail`,
          );
          thumbnailUrl = thumbnailUpload.url;
        }

        if (!currentPreviewVideo && !uploadedPreviewVideo) {
          previewVideoUrl = "";
          previewVideoPublicId = "";
        }

        const uploadedEpisodes = episodes.map((item) => ({
          episode: item.episode.trim(),
          description: item.description.trim(),
          images: item.images,
        }));

        const formData = new FormData();
        formData.append("comicId", comic.id);
        formData.append("title", title.trim());
        formData.append("description", description.trim());
        formData.append("thumbnail", thumbnailUrl || "");
        formData.append("previewVideo", previewVideoUrl || "");
        formData.append(
          "previewVideoPublicId",
          typeof previewVideoPublicId === "string" ? previewVideoPublicId : "",
        );
        formData.append("cloudinaryFolder", comicFolder);
        formData.append("episodes", JSON.stringify(uploadedEpisodes));

        const result = await updateComic(formData);

        if (!result.success) {
          showAlert(
            "Unable to update comic",
            result.message || "Something went wrong while updating your comic.",
          );
          return;
        }

        resetForm();
        setOpen(false);
      } catch (error) {
        console.error(error);

        showAlert(
          "Something went wrong",
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again.",
        );
      }
    });
  };

  const removeEpisodeImage = (episodeIndex: number, imageIndex: number) => {
    setEpisodes((prev) =>
      prev.map((episode, i) =>
        i === episodeIndex
          ? {
              ...episode,
              images: episode.images.filter((_, imgI) => imgI !== imageIndex),
            }
          : episode,
      ),
    );
  };

  const removeCurrentThumbnail = () => {
    setCurrentThumbnail(null);
    setThumbnail(null);
  };

  const removeCurrentPreviewVideo = () => {
    setCurrentPreviewVideo(null);
    setPreviewVideo(null);
    setUploadedPreviewVideo(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="w-full rounded-2xl border border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </DialogTrigger>

        <DialogContent className="w-[calc(100%-1rem)] max-h-[90vh] overflow-y-auto rounded-[28px] border border-white/10 bg-slate-950/95 p-4 text-white shadow-2xl backdrop-blur-xl sm:max-w-4xl sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg text-white sm:text-xl">
              Edit Comic
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white/80">
                Comic Title
              </Label>
              <Input
                id="title"
                placeholder="Enter comic title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-white/10 bg-white/5 text-white placeholder:text-white/35 focus-visible:ring-white/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comic-description" className="text-white/80">
                Comic Description
              </Label>
              <Textarea
                id="comic-description"
                placeholder="Enter comic description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px] border-white/10 bg-white/5 text-white placeholder:text-white/35 focus-visible:ring-white/20"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/80">Comic Thumbnail</Label>

              {currentThumbnail && !thumbnail ? (
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                  <div className="relative h-40 w-full bg-white/5 sm:h-48">
                    <img
                      src={currentThumbnail}
                      alt={title}
                      className="h-full w-full object-cover"
                    />

                    <Button
                      type="button"
                      size="icon"
                      className="absolute right-2 top-2 z-10 h-8 w-8 rounded-full border border-red-500/20 bg-red-500/90 text-white hover:bg-red-500"
                      onClick={removeCurrentThumbnail}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : null}

              <ImageUploadPreview
                label={
                  currentThumbnail ? "Replace thumbnail" : "Upload thumbnail"
                }
                value={thumbnail}
                onChange={setThumbnail}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/80">
                Preview Video <span className="text-white/40">(Optional)</span>
              </Label>

              {currentPreviewVideo ? (
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                  <div className="relative h-40 w-full bg-white/5 sm:h-48">
                    <video
                      src={currentPreviewVideo}
                      controls
                      className="h-full w-full object-cover"
                    />

                    <Button
                      type="button"
                      size="icon"
                      className="absolute right-2 top-2 z-10 h-8 w-8 rounded-full border border-red-500/20 bg-red-500/90 text-white hover:bg-red-500"
                      onClick={removeCurrentPreviewVideo}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : null}

              <Input
                type="file"
                accept="video/mp4,video/webm,video/ogg"
                onChange={handlePreviewVideoChange}
                disabled={isUploadingPreviewVideo}
                className="border-white/10 bg-white/5 text-white file:mr-4 file:rounded-xl file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:text-black hover:file:bg-white/90 disabled:opacity-60"
              />

              <p className="text-xs text-white/45">
                {isUploadingPreviewVideo
                  ? "Uploading preview video..."
                  : "Upload a short preview video that plays on hover and on the hero section when visible."}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Label className="text-white/80">Episodes</Label>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={addEpisode}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white sm:w-auto"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Episode
                </Button>
              </div>

              {episodes.map((item, index) => (
                <div
                  key={index}
                  className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-3 backdrop-blur-md sm:p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-white/85">
                      Episode {index + 1}
                    </p>

                    {episodes.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeEpisode(index)}
                        className="shrink-0 rounded-full text-white/70 hover:bg-white/10 hover:text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor={`episode-${index}`}
                      className="text-white/80"
                    >
                      Episode Title
                    </Label>
                    <Input
                      id={`episode-${index}`}
                      placeholder="e.g. Episode 1"
                      value={item.episode}
                      onChange={(e) =>
                        updateEpisode(index, "episode", e.target.value)
                      }
                      className="border-white/10 bg-white/5 text-white placeholder:text-white/35 focus-visible:ring-white/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor={`description-${index}`}
                      className="text-white/80"
                    >
                      Description
                    </Label>
                    <Textarea
                      id={`description-${index}`}
                      placeholder="Enter episode description"
                      value={item.description}
                      onChange={(e) =>
                        updateEpisode(index, "description", e.target.value)
                      }
                      className="min-h-[100px] border-white/10 bg-white/5 text-white placeholder:text-white/35 focus-visible:ring-white/20"
                    />
                  </div>

                  <EpisodeImagesUpload
                    label={`Add More Pages to Episode ${index + 1}`}
                    onChange={(files) =>
                      handleEpisodeImagesChange(index, files)
                    }
                    disabled={isUploadingPages}
                    isUploading={isUploadingPages}
                    hasImages={item.images.length > 0}
                  />

                  {item.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      {item.images.map((img, imgIndex) => (
                        <div
                          key={`${img.url}-${imgIndex}`}
                          className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-md"
                        >
                          <div className="relative h-40 w-full bg-white/5">
                            <Dialog>
                              <DialogTrigger asChild>
                                <button
                                  type="button"
                                  className="relative block h-full w-full cursor-zoom-in"
                                >
                                  <Image
                                    src={img.url}
                                    alt={`Episode ${index + 1} page ${imgIndex + 1}`}
                                    fill
                                    className="object-cover transition duration-300 hover:scale-105"
                                    unoptimized
                                  />
                                </button>
                              </DialogTrigger>

                              <DialogContent className="w-[95vw] max-w-6xl border-none bg-transparent p-0 shadow-none">
                                <DialogTitle className="sr-only">
                                  Episode {index + 1} page {imgIndex + 1} full
                                  preview
                                </DialogTitle>

                                <div className="relative flex max-h-[90vh] min-h-[300px] w-full items-center justify-center overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/95 p-2 shadow-2xl backdrop-blur-xl sm:p-4">
                                  <DialogClose asChild>
                                    <Button
                                      type="button"
                                      size="icon"
                                      className="absolute right-3 top-3 z-50 rounded-full border border-white/10 bg-white/10 text-white hover:bg-white/20"
                                    >
                                      <X className="h-5 w-5" />
                                    </Button>
                                  </DialogClose>

                                  <div className="relative h-[75vh] w-full">
                                    <Image
                                      src={img.url}
                                      alt={`Episode ${index + 1} page ${imgIndex + 1} full preview`}
                                      fill
                                      className="object-contain"
                                      unoptimized
                                    />
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>

                            <Button
                              type="button"
                              size="icon"
                              className="absolute right-2 top-2 z-10 h-7 w-7 rounded-full border border-red-500/20 bg-red-500/90 text-white hover:bg-red-500"
                              onClick={() =>
                                removeEpisodeImage(index, imgIndex)
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="border-t border-white/10 px-3 py-2 text-xs text-white/55">
                            <div>Page {imgIndex + 1}</div>
                            <div className="truncate">
                              URL: {img.url.split("/").pop()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div ref={episodesEndRef} />
            </div>

            <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
                className="w-full rounded-2xl border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white sm:w-auto"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={
                  isPending || isUploadingPreviewVideo || isUploadingPages
                }
                className="w-full rounded-2xl bg-white text-black hover:bg-white/90 sm:w-auto"
              >
                {isPending ? "Updating..." : "Update Comic"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={closeConfirmOpen} onOpenChange={setCloseConfirmOpen}>
        <AlertDialogContent className="w-[calc(100%-1rem)] rounded-[28px] border border-white/10 bg-slate-950/95 text-white shadow-2xl backdrop-blur-xl sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Discard your changes?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/65">
              Closing this form will remove all unsaved changes.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex-col-reverse gap-2 sm:flex-row">
            <AlertDialogCancel
              disabled={isPending}
              className="w-full border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white sm:w-auto"
            >
              Keep editing
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCloseDialog}
              disabled={isPending}
              className="w-full bg-white/50 text-black hover:bg-white/30 sm:w-auto"
            >
              Discard and close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent className="w-[calc(100%-1rem)] rounded-[28px] border border-white/10 bg-slate-950/95 text-white shadow-2xl backdrop-blur-xl sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              {alertTitle}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/65">
              {alertMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogAction className="w-full bg-white text-black hover:bg-white/90 sm:w-auto">
              Okay
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
