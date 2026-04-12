"use client";

import { Plus, Trash2 } from "lucide-react";
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

type Episode = {
  episode: string;
  description: string;
  images: File[];
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
  const [episodes, setEpisodes] = useState<Episode[]>(createInitialEpisodes());

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
    setEpisodes(createInitialEpisodes());
  };

  const hasUnsavedChanges = () => {
    if (title.trim()) return true;
    if (description.trim()) return true;
    if (thumbnail) return true;

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

        const uploadedEpisodes = await Promise.all(
          episodes.map(async (item, episodeIndex) => {
            const imageUploads = await Promise.all(
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
              images: imageUploads,
            };
          }),
        );

        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("description", description.trim());
        formData.append("thumbnail", thumbnailUpload.url);
        formData.append("thumbnailPublicId", thumbnailUpload.publicId ?? "");
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

                  <EpisodeImagesUpload
                    label={`Episode ${index + 1} Pages`}
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
              Closing this form will remove the comic title, thumbnail, and all
              imported episode images that have not been saved yet.
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
