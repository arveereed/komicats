"use client";

import { Image as ImageIcon, Plus } from "lucide-react";
import { useId, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type EpisodeImagesUploadProps = {
  label?: string;
  onChange: (files: File[]) => void;
  disabled?: boolean;
  isUploading?: boolean;
  hasImages?: boolean;
};

export default function EpisodeImagesUpload({
  label = "Upload Images",
  onChange,
  disabled = false,
  isUploading = false,
  hasImages = false,
}: EpisodeImagesUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    onChange(files);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
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
            disabled={disabled}
            className="rounded-2xl border border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white disabled:opacity-60"
          >
            <span className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              {isUploading ? "Uploading..." : "Add Pages"}
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
        disabled={disabled}
      />

      {!hasImages ? (
        <div className="flex h-40 flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-white/50 backdrop-blur-md">
          <ImageIcon className="mb-2 h-8 w-8" />
          <p className="text-sm">
            {isUploading
              ? "Uploading pages..."
              : "No episode images uploaded yet"}
          </p>
        </div>
      ) : null}
    </div>
  );
}
