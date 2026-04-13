"use client";

import { ChevronUp, Plus, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
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
import { createComic } from "@/actions/comic.action";
import { uploadFileToCloudinary } from "@/actions/cloudinary.action";
import EpisodeImagesUpload from "./EpisodeImagesUpload";
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

const createInitialEpisodes = (): Episode[] => [
  { episode: "", description: "", images: [] },
];

export default function AddNewComic() {
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const [open, setOpen] = useState(false);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  const [previewVideo, setPreviewVideo] = useState<File | null>(null);
  const [uploadedPreviewVideo, setUploadedPreviewVideo] = useState<{
    url: string;
    publicId: string | null;
  } | null>(null);
  const [previewVideoPreviewUrl, setPreviewVideoPreviewUrl] = useState<
    string | null
  >(null);
  const [isUploadingPreviewVideo, setIsUploadingPreviewVideo] = useState(false);

  const [episodes, setEpisodes] = useState<Episode[]>(createInitialEpisodes());
  const [isUploadingPages, setIsUploadingPages] = useState(false);

  const episodesHeaderRef = useRef<HTMLDivElement | null>(null);
  const episodesEndRef = useRef<HTMLDivElement | null>(null);

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertOpen(true);
  };

  const addEpisode = () => {
    setEpisodes((prev) => [
      ...prev,
      { episode: "", description: "", images: [] },
    ]);
  };

  const scrollToEpisodesTop = () => {
    episodesHeaderRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
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

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setThumbnail(null);
    setPreviewVideo(null);
    setUploadedPreviewVideo(null);
    setPreviewVideoPreviewUrl(null);
    setEpisodes(createInitialEpisodes());
  };

  const hasUnsavedChanges = () => {
    if (title.trim()) return true;
    if (description.trim()) return true;
    if (thumbnail) return true;
    if (previewVideo) return true;
    if (uploadedPreviewVideo) return true;

    return episodes.some(
      (item) =>
        item.episode.trim() ||
        item.description.trim() ||
        item.images.length > 0,
    );
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

    const localPreviewUrl = URL.createObjectURL(file);
    setPreviewVideoPreviewUrl(localPreviewUrl);

    try {
      setIsUploadingPreviewVideo(true);

      const uploaded = await uploadPreviewVideoClient(file);

      setUploadedPreviewVideo({
        url: uploaded.url,
        publicId: uploaded.publicId,
      });
    } catch (error) {
      console.error(error);
      setPreviewVideo(null);
      setUploadedPreviewVideo(null);
      setPreviewVideoPreviewUrl(null);

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

  const removePreviewVideo = () => {
    setPreviewVideo(null);
    setUploadedPreviewVideo(null);
    setPreviewVideoPreviewUrl(null);
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

    if (!thumbnail) {
      showAlert(
        "Missing comic thumbnail",
        "Please upload a thumbnail image for your comic.",
      );
      return;
    }

    if (previewVideo && !uploadedPreviewVideo) {
      showAlert(
        "Preview video still uploading",
        "Please wait for the preview video upload to finish before saving.",
      );
      return;
    }

    if (isUploadingPreviewVideo) {
      showAlert(
        "Preview video still uploading",
        "Please wait for the preview video upload to finish before saving.",
      );
      return;
    }

    if (isUploadingPages) {
      showAlert(
        "Episode pages still uploading",
        "Please wait for the episode image upload to finish before saving.",
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

        const comicFolder = `comics/${comicSlug}-${Date.now()}`;

        const thumbnailUpload = await uploadSingleImage(
          thumbnail,
          `${comicFolder}/thumbnail`,
        );

        const uploadedEpisodes = episodes.map((item) => ({
          episode: item.episode.trim(),
          description: item.description.trim(),
          images: item.images,
        }));

        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("description", description.trim());
        formData.append("thumbnail", thumbnailUpload.url);
        formData.append("thumbnailPublicId", thumbnailUpload.publicId ?? "");
        formData.append("previewVideo", uploadedPreviewVideo?.url ?? "");
        formData.append(
          "previewVideoPublicId",
          uploadedPreviewVideo?.publicId ?? "",
        );
        formData.append("cloudinaryFolder", comicFolder);
        formData.append("episodes", JSON.stringify(uploadedEpisodes));

        const result = await createComic(formData);

        if (!result.success) {
          showAlert(
            "Unable to save comic",
            result.message || "Something went wrong while saving your comic.",
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

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button className="w-full rounded-2xl border border-white/10 bg-white/10 text-white hover:bg-white/20 sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add New Comic
          </Button>
        </DialogTrigger>

        <DialogContent className="w-[calc(100%-1rem)] max-h-[90vh] overflow-y-auto rounded-[28px] border border-white/10 bg-slate-950/95 p-4 text-white shadow-2xl backdrop-blur-xl sm:max-w-4xl sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg text-white sm:text-xl">
              Add New Comic
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
              <ImageUploadPreview
                label="Thumbnail"
                value={thumbnail}
                onChange={setThumbnail}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-white">
                Preview Video <span className="text-white/40">(Optional)</span>
              </Label>

              <div className="overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.03] shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl">
                {previewVideoPreviewUrl ? (
                  <div className="space-y-0">
                    <div className="relative h-52 w-full overflow-hidden bg-black sm:h-64">
                      <video
                        src={previewVideoPreviewUrl}
                        controls
                        className="h-full w-full object-cover"
                      />

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                      <Button
                        type="button"
                        size="icon"
                        className="absolute right-3 top-3 z-10 h-9 w-9 rounded-full border border-red-400/20 bg-red-500/90 text-white shadow-lg backdrop-blur-md hover:bg-red-500"
                        onClick={removePreviewVideo}
                      >
                        <X className="h-4 w-4" />
                      </Button>

                      {isUploadingPreviewVideo && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/55 backdrop-blur-sm">
                          <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-white shadow-xl">
                            Uploading preview video...
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-white/90">
                          Preview ready
                        </p>
                        <p className="text-xs text-white/50">
                          Users will see this as the comic preview video
                        </p>
                      </div>

                      <label htmlFor="preview-video-upload">
                        <span className="inline-flex cursor-pointer items-center rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:border-white/20 hover:bg-white/15">
                          Replace video
                        </span>
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="relative overflow-hidden px-6 py-10">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_45%)]" />

                    <div className="relative flex flex-col items-center justify-center text-center">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-inner">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-8 w-8 text-white/70"
                        >
                          <path d="M4 6.75A2.75 2.75 0 0 1 6.75 4h6.5A2.75 2.75 0 0 1 16 6.75v1.69l2.72-1.814A1.75 1.75 0 0 1 21 8.091v7.818a1.75 1.75 0 0 1-2.28 1.456L16 15.56v1.69A2.75 2.75 0 0 1 13.25 20h-6.5A2.75 2.75 0 0 1 4 17.25v-10.5Z" />
                        </svg>
                      </div>

                      <h4 className="text-sm font-semibold text-white">
                        Upload preview video
                      </h4>
                      <p className="mt-1 max-w-md text-xs leading-relaxed text-white/50">
                        Add a short teaser video that helps users preview the
                        comic before opening it.
                      </p>

                      <label
                        htmlFor="preview-video-upload"
                        className="mt-5 inline-flex cursor-pointer items-center rounded-2xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:border-white/20 hover:bg-white/15"
                      >
                        {isUploadingPreviewVideo
                          ? "Uploading..."
                          : "Choose video"}
                      </label>

                      <p className="mt-3 text-[11px] text-white/40">
                        Supports MP4, WEBM, and OGG
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <input
                id="preview-video-upload"
                type="file"
                accept="video/mp4,video/webm,video/ogg"
                onChange={handlePreviewVideoChange}
                disabled={isUploadingPreviewVideo}
                className="hidden"
              />

              <p className="px-1 text-xs text-white/45">
                {isUploadingPreviewVideo
                  ? "Uploading preview video..."
                  : "Upload a short preview video that plays on hover."}
              </p>
            </div>

            <div className="space-y-4">
              <div
                ref={episodesHeaderRef}
                className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <Label className="text-white/80">Episodes</Label>

                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
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
              </div>

              {episodes.map((item, index) => (
                <div
                  key={index}
                  className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-3 backdrop-blur-md sm:p-4"
                >
                  <div className="flex items-start justify-between gap-3">
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

                  {item.images.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-white/80">Uploaded Pages</Label>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {item.images.map((img, imgIndex) => (
                          <div
                            key={`${img.url}-${imgIndex}`}
                            className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                          >
                            <div className="relative h-28 w-full bg-white/5 sm:h-32">
                              <img
                                src={img.url}
                                alt={`Episode ${index + 1} page ${imgIndex + 1}`}
                                className="h-full w-full object-cover"
                              />

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
                              Uploaded page {imgIndex + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <EpisodeImagesUpload
                    label={`Episode ${index + 1} Pages`}
                    onChange={(files) =>
                      handleEpisodeImagesChange(index, files)
                    }
                    disabled={isUploadingPages}
                    isUploading={isUploadingPages}
                    hasImages={item.images.length > 0}
                  />
                </div>
              ))}

              <Button
                type="button"
                variant="ghost"
                onClick={scrollToEpisodesTop}
                className="w-full rounded-2xl border border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white sm:w-auto"
              >
                <ChevronUp className="mr-2 h-4 w-4" />
                Back to Top
              </Button>
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
                {isPending ? "Saving..." : "Save Comic"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={closeConfirmOpen} onOpenChange={setCloseConfirmOpen}>
        <AlertDialogContent className="w-[calc(100%-1rem)] rounded-[28px] border border-white/10 bg-slate-950/95 text-white shadow-2xl backdrop-blur-xl sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base text-white sm:text-lg">
              Discard this comic draft?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed text-white/65">
              Closing this form will remove the comic title, thumbnail, preview
              video, and all imported episode images that have not been saved
              yet.
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
            <AlertDialogTitle className="text-base text-white sm:text-lg">
              {alertTitle}
            </AlertDialogTitle>
            <AlertDialogDescription className="break-words text-sm leading-relaxed text-white/65">
              {alertMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex-col-reverse gap-2 sm:flex-row">
            <AlertDialogAction className="w-full bg-white text-black hover:bg-white/90 sm:w-auto">
              Okay
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
