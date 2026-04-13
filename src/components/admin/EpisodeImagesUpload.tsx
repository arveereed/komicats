"use client";

import { Image as ImageIcon, Plus, Sparkles } from "lucide-react";
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
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.03] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Label
            htmlFor={inputId}
            className="text-sm font-medium tracking-tight text-white"
          >
            {label}
          </Label>
          <p className="text-xs text-white/50">
            Add multiple page images for this episode
          </p>
        </div>

        <label htmlFor={inputId}>
          <Button
            type="button"
            variant="ghost"
            asChild
            disabled={disabled}
            className="h-11 rounded-2xl border border-white/10 bg-white/10 px-4 text-white shadow-sm transition-all duration-200 hover:border-white/20 hover:bg-white/15 hover:text-white disabled:opacity-60"
          >
            <span className="cursor-pointer">
              {isUploading ? (
                <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
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
        <div className="group relative overflow-hidden rounded-[28px] border border-dashed border-white/12 bg-gradient-to-br from-white/[0.06] via-white/[0.04] to-transparent px-6 py-12 text-center backdrop-blur-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_45%)] opacity-70" />
          <div className="relative flex flex-col items-center justify-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-inner">
              <ImageIcon className="h-7 w-7 text-white/70" />
            </div>

            <p className="text-sm font-medium text-white/85">
              {isUploading
                ? "Uploading pages..."
                : "No episode images uploaded yet"}
            </p>

            <p className="mt-1 text-xs text-white/45">
              PNG, JPG, WEBP and other image files supported
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
