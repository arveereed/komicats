"use client";

import Image from "next/image";
import { Image as ImageIcon, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Label } from "../ui/label";
import { Button } from "../ui/button";

export default function ImageUploadPreview() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (!selectedFile) {
      setImagePreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setImagePreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  return (
    <div>
      {imagePreview && (
        <div className="mt-4">
          <div className="relative h-64 w-full overflow-hidden rounded-lg border">
            <Image
              src={imagePreview}
              alt="Selected image"
              fill
              className="object-cover"
              unoptimized
            />

            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="absolute right-2 top-2 z-10 h-8 w-8 rounded-full"
              onClick={handleRemoveImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <div className="flex space-x-4">
          <label className="text-info hover:text-info-dark flex cursor-pointer items-center transition-colors duration-200">
            <Label htmlFor="thumbnail" className="cursor-pointer">
              Thumbnail
            </Label>
            <ImageIcon size={20} className="ml-2" />

            <input
              ref={inputRef}
              id="thumbnail"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
