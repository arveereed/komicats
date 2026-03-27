"use client";

import Image from "next/image";
import { Image as ImageIcon, X } from "lucide-react";
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
    <div className="space-y-3">
      <div className="relative h-64 w-full overflow-hidden rounded-lg border bg-muted">
        {imagePreview ? (
          <>
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="relative block h-full w-full cursor-zoom-in"
                >
                  <Image
                    src={imagePreview}
                    alt="Selected image preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </button>
              </DialogTrigger>

              <DialogContent className="w-[95vw] max-w-5xl border-none bg-transparent p-0 shadow-none">
                <DialogTitle className="sr-only">
                  Full size image preview
                </DialogTitle>

                <div className="relative flex max-h-[90vh] min-h-[300px] w-full items-center justify-center overflow-hidden rounded-lg bg-black/90 p-2 sm:p-4">
                  <DialogClose asChild>
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className="absolute right-3 top-3 z-50 rounded-full"
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
              className="absolute right-2 top-2 z-10 h-8 w-8 rounded-full"
              onClick={handleRemoveImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground">
            <ImageIcon className="mb-2 h-10 w-10" />
            <p className="text-sm">No image selected</p>
          </div>
        )}
      </div>

      <label className="inline-flex cursor-pointer items-center text-info transition-colors duration-200 hover:text-info-dark">
        <Label htmlFor={inputId} className="cursor-pointer">
          {label}
        </Label>
        <ImageIcon size={20} className="ml-2" />

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
