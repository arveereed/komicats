"use client";

import { Pencil, Plus, Trash2, X } from "lucide-react";
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
import EpisodeImagesUpload from "./EpisodeImagesUpload";
import { uploadFileToCloudinary } from "@/actions/cloudinary.action";
import { updateComic } from "@/actions/comic.action";

type ExistingImage = {
  imageUrl: string;
  publicId?: string | null;
};

type Episode = {
  episode: string;
  description: string;
  images: File[];
  existingImages: ExistingImage[];
};

type EditComicDialogProps = {
  comic: {
    id: string;
    title: string;
    description?: string | null;
    thumbnail: string | null;
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
        images: [],
        existingImages: ep.images.map((img) => ({
          imageUrl: img.imageUrl,
          publicId: img.publicId ?? null,
        })),
      }))
    : [{ episode: "", description: "", images: [], existingImages: [] }];

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
  const [episodes, setEpisodes] = useState<Episode[]>(
    buildInitialEpisodes(comic),
  );

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
    setEpisodes(buildInitialEpisodes(comic));
  };

  const addEpisode = () => {
    setEpisodes((prev) => [
      ...prev,
      { episode: "", description: "", images: [], existingImages: [] },
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
        item.existingImages.length + item.images.length === 0,
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

      if (
        invalidEpisode.existingImages.length + invalidEpisode.images.length ===
        0
      ) {
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

        if (thumbnail) {
          const thumbnailUpload = await uploadSingleImage(
            thumbnail,
            `${comicFolder}/thumbnail`,
          );
          thumbnailUrl = thumbnailUpload.url;
        }

        const uploadedEpisodes = await Promise.all(
          episodes.map(async (item, episodeIndex) => {
            const newImageUploads = await Promise.all(
              item.images.map((imageFile, imageIndex) =>
                uploadSingleImage(
                  imageFile,
                  `${comicFolder}/episodes/episode-${episodeIndex + 1}/pages/page-${imageIndex + 1}`,
                ),
              ),
            );

            return {
              episode: item.episode.trim(),
              description: item.description.trim(),
              images: [
                ...item.existingImages.map((img) => ({
                  url: img.imageUrl,
                  publicId: img.publicId ?? null,
                })),
                ...newImageUploads,
              ],
            };
          }),
        );

        const formData = new FormData();
        formData.append("comicId", comic.id);
        formData.append("title", title.trim());
        formData.append("description", description.trim());
        formData.append("thumbnail", thumbnailUrl || "");
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

  const removeExistingImage = (episodeIndex: number, imageIndex: number) => {
    setEpisodes((prev) =>
      prev.map((episode, i) =>
        i === episodeIndex
          ? {
              ...episode,
              existingImages: episode.existingImages.filter(
                (_, imgI) => imgI !== imageIndex,
              ),
            }
          : episode,
      ),
    );
  };

  const removeCurrentThumbnail = () => {
    setCurrentThumbnail(null);
    setThumbnail(null);
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

                  {item.existingImages.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-white/80">Current Pages</Label>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {item.existingImages.map((img, imgIndex) => (
                          <div
                            key={`${img.imageUrl}-${imgIndex}`}
                            className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                          >
                            <div className="relative h-28 w-full bg-white/5 sm:h-32">
                              <img
                                src={img.imageUrl}
                                alt={`Episode ${index + 1} page ${imgIndex + 1}`}
                                className="h-full w-full object-cover"
                              />

                              <Button
                                type="button"
                                size="icon"
                                className="absolute right-2 top-2 z-10 h-7 w-7 rounded-full border border-red-500/20 bg-red-500/90 text-white hover:bg-red-500"
                                onClick={() =>
                                  removeExistingImage(index, imgIndex)
                                }
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="border-t border-white/10 px-3 py-2 text-xs text-white/55">
                              Existing page {imgIndex + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <EpisodeImagesUpload
                    label={`Add More Pages to Episode ${index + 1}`}
                    value={item.images}
                    onChange={(files) => updateEpisode(index, "images", files)}
                  />
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
                disabled={isPending}
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
              className="w-full bg-white text-black hover:bg-white/90 sm:w-auto"
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
