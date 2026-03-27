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

type Episode = {
  episode: string;
  description: string;
  image: File | null;
};

export default function AddNewComic() {
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertOpen(true);
  };

  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([
    { episode: "", description: "", image: null },
  ]);

  const episodesEndRef = useRef<HTMLDivElement | null>(null);

  const addEpisode = () => {
    setEpisodes((prev) => [
      ...prev,
      { episode: "", description: "", image: null },
    ]);
  };

  const removeEpisode = (index: number) => {
    setEpisodes((prev) => prev.filter((_, i) => i !== index));
  };

  const updateEpisode = (
    index: number,
    field: keyof Episode,
    value: string | File | null,
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
    setThumbnail(null);
    setEpisodes([{ episode: "", description: "", image: null }]);
  };

  const uploadSingleImage = async (file: File, folder: string) => {
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("folder", folder);

    const result = await uploadFileToCloudinary(uploadFormData);

    if (!result.success || !result.url) {
      throw new Error(result.message || "Image upload failed");
    }

    return result.url;
  };

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
      (item) => !item.episode.trim() || !item.description.trim() || !item.image,
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

      if (!invalidEpisode.image) {
        showAlert(
          `Episode ${episodeNumber} is incomplete`,
          `Please upload an image for Episode ${episodeNumber}.`,
        );
        return;
      }
    }

    startTransition(async () => {
      try {
        const thumbnailUrl = await uploadSingleImage(
          thumbnail,
          "comics/thumbnails",
        );

        const uploadedEpisodes = await Promise.all(
          episodes.map(async (item) => {
            const imageUrl = await uploadSingleImage(
              item.image as File,
              "comics/episodes",
            );

            return {
              episode: item.episode.trim(),
              description: item.description.trim(),
              image: imageUrl,
            };
          }),
        );

        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("thumbnail", thumbnailUrl);
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
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Comic
          </Button>
        </DialogTrigger>

        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Comic</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Comic Title</Label>
              <Input
                id="title"
                placeholder="Enter comic title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Comic Thumbnail</Label>
              <ImageUploadPreview
                label="Thumbnail"
                value={thumbnail}
                onChange={setThumbnail}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Episodes</Label>
                <Button type="button" variant="outline" onClick={addEpisode}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Episode
                </Button>
              </div>

              {episodes.map((item, index) => (
                <div key={index} className="space-y-3 rounded-xl border p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Episode {index + 1}</p>

                    {episodes.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeEpisode(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`episode-${index}`}>Episode Title</Label>
                    <Input
                      id={`episode-${index}`}
                      placeholder="e.g. You Failed"
                      value={item.episode}
                      onChange={(e) =>
                        updateEpisode(index, "episode", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`description-${index}`}>Description</Label>
                    <Textarea
                      id={`description-${index}`}
                      placeholder="Enter episode description"
                      value={item.description}
                      onChange={(e) =>
                        updateEpisode(index, "description", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Episode Image</Label>
                    <ImageUploadPreview
                      label={`Episode ${index + 1} Image`}
                      value={item.image}
                      onChange={(file) => updateEpisode(index, "image", file)}
                    />
                  </div>
                </div>
              ))}

              <div ref={episodesEndRef} />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save Comic"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertTitle}</AlertDialogTitle>
            <AlertDialogDescription>{alertMessage}</AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogAction>Okay</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
