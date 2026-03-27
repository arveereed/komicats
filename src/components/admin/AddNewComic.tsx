"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useRef, useState } from "react";
import ImageUploadPreview from "./ImageUploadPreview";

type Episode = {
  episode: string;
  description: string;
};

export default function AddNewComic() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [episodes, setEpisodes] = useState<Episode[]>([
    { episode: "", description: "" },
  ]);

  const episodesEndRef = useRef<HTMLDivElement | null>(null);

  const addEpisode = () => {
    setEpisodes((prev) => [...prev, { episode: "", description: "" }]);
  };

  const removeEpisode = (index: number) => {
    setEpisodes((prev) => prev.filter((_, i) => i !== index));
  };

  const updateEpisode = (
    index: number,
    field: keyof Episode,
    value: string,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title,
      thumbnail,
      episodes,
    };

    console.log("New comic:", payload);

    setTitle("");
    setThumbnail("");
    setEpisodes([{ episode: "", description: "" }]);
    setOpen(false);
  };

  return (
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

          {/* <div className="space-y-2">
            <Label htmlFor="thumbnail">Thumbnail URL</Label>
            <Input
              id="thumbnail"
              placeholder="https://example.com/thumbnail.jpg"
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
            />
          </div> */}

          <ImageUploadPreview />

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
              </div>
            ))}

            <div ref={episodesEndRef} />
          </div>

          <DialogFooter>
            <Button type="submit">Save Comic</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
