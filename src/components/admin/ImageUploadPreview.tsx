"use client";

import Image from "next/image";
import { Image as ImageIcon, UploadCloud, X, Expand } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

type ImageUploadPreviewProps = {
  label?: string;
  value?: File | null;
  onChange?: (file: File | null) => void;
};

export default function ImageUploadPreview({
  label = "Upload Image",
  value = null,
  onChange,
}: ImageUploadPreviewProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputId = useId();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onChange?.(file);
  };

  const handleRemoveImage = () => {
    onChange?.(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (!value) {
      setImagePreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(value);
    setImagePreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [value]);

  return (
    <div className="space-y-4">
      <div className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.03] shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl">
        <div className="relative h-72 w-full">
          {imagePreview ? (
            <>
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="relative block h-full w-full cursor-zoom-in overflow-hidden"
                  >
                    <Image
                      src={imagePreview}
                      alt="Selected image preview"
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      unoptimized
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent opacity-100 transition-opacity duration-300" />

                    <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-md">
                      <Expand className="h-3.5 w-3.5" />
                      Click to preview
                    </div>
                  </button>
                </DialogTrigger>

                <DialogContent className="w-[95vw] max-w-6xl border-none bg-transparent p-0 shadow-none">
                  <DialogTitle className="sr-only">
                    Full size image preview
                  </DialogTitle>

                  <div className="relative flex max-h-[90vh] min-h-[320px] w-full items-center justify-center overflow-hidden rounded-[28px] border border-white/10 bg-black/90 p-2 sm:p-4">
                    <DialogClose asChild>
                      <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        className="absolute right-3 top-3 z-50 rounded-full border border-white/10 bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </DialogClose>

                    <div className="relative h-[70vh] w-full sm:h-[80vh]">
                      <Image
                        src={imagePreview}
                        alt="Full size preview"
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
                variant="destructive"
                className="absolute right-3 top-3 z-10 h-9 w-9 rounded-full border border-red-400/20 bg-red-500/90 text-white shadow-lg backdrop-blur-md hover:bg-red-500"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <div className="relative flex h-full w-full flex-col items-center justify-center px-6 text-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_45%)]" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-inner">
                <ImageIcon className="h-8 w-8 text-white/65" />
              </div>
              <p className="relative mt-4 text-sm font-medium text-white/85">
                No image selected
              </p>
              <p className="relative mt-1 text-xs text-white/45">
                Upload a thumbnail or cover image
              </p>
            </div>
          )}
        </div>
      </div>

      <label
        htmlFor={inputId}
        className="group inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:border-white/20 hover:bg-white/10"
      >
        <UploadCloud className="h-4 w-4 text-white/70 transition-transform duration-200 group-hover:-translate-y-0.5" />
        <Label htmlFor={inputId} className="cursor-pointer text-white">
          {label}
        </Label>

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
      </label>
    </div>
  );
}
