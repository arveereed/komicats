"use client";

import Image from "next/image";
import { Image as ImageIcon, Plus, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type EpisodeImagesUploadProps = {
  label?: string;
  value: File[];
  onChange: (files: File[]) => void;
};

export default function EpisodeImagesUpload({
  label = "Upload Images",
  value,
  onChange,
}: EpisodeImagesUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const previews = useMemo(
    () =>
      value.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      })),
    [value],
  );

  useEffect(() => {
    return () => {
      previews.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [previews]);

  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);

    if (files.length === 0) return;

    onChange([...value, ...files]);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Label htmlFor={inputId} className="text-white/80">
          {label}
        </Label>

        <label htmlFor={inputId}>
          <Button
            type="button"
            variant="ghost"
            asChild
            className="rounded-2xl border border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
          >
            <span className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              Add Pages
            </span>
          </Button>
        </label>
      </div>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleAddImages}
      />

      {value.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-white/50 backdrop-blur-md">
          <ImageIcon className="mb-2 h-8 w-8" />
          <p className="text-sm">No episode images selected</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {previews.map((item, index) => (
            <div
              key={`${item.file.name}-${index}`}
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
                        src={item.url}
                        alt={`Episode page ${index + 1}`}
                        fill
                        className="object-cover transition duration-300 hover:scale-105"
                        unoptimized
                      />
                    </button>
                  </DialogTrigger>

                  <DialogContent className="w-[95vw] max-w-6xl border-none bg-transparent p-0 shadow-none">
                    <DialogTitle className="sr-only">
                      Episode page {index + 1} full preview
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
                          src={item.url}
                          alt={`Episode page ${index + 1} full preview`}
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
                  onClick={() => handleRemove(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="border-t border-white/10 px-3 py-2 text-xs text-white/55">
                <div>Page {index + 1}</div>
                <div className="truncate">Filename: {item.file.name}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
