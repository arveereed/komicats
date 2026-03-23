"use client";

import Image from "next/image";
import { Trash, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileListItemProps {
  profile: {
    id: string;
    name: string;
    image: string;
  };
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function ProfileListItem({
  profile,
  onDelete,
  isDeleting = false,
}: ProfileListItemProps) {
  return (
    <div className="flex items-center justify-between p-3 mb-2 rounded-lg bg-zinc-900/50 border border-transparent hover:border-zinc-800 transition-colors">
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 rounded overflow-hidden bg-zinc-800">
          <Image
            src={profile.image}
            alt={profile.name}
            fill
            unoptimized
            className="object-cover"
          />
        </div>
        <span className="font-medium text-zinc-200">{profile.name}</span>
      </div>

      <Button
        size="icon"
        variant="ghost"
        disabled={isDeleting}
        onClick={() => onDelete(profile.id)}
        className="hover:text-red-500 hover:bg-red-500/10 transition-colors"
      >
        {isDeleting ? (
          <Loader2 className="animate-spin w-4 h-4" />
        ) : (
          <Trash className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
}
