"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { buyComicUnlock } from "@/actions/comic.action";

type LockedEpisodeCardProps = {
  comicId: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  pages?: number;
  priceCoins: number;
};

export function LockedEpisodeCard({
  comicId,
  title,
  description,
  imageUrl,
  pages = 0,
  priceCoins,
}: LockedEpisodeCardProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleBuy = () => {
    startTransition(async () => {
      const result = await buyComicUnlock({ comicId });

      if (!result.success) {
        toast.error(result.message || "Unable to unlock comic.");
        return;
      }

      toast.success(result.message || "Comic unlocked successfully.");
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button type="button" className="block w-full cursor-pointer text-left">
          <div className="group flex items-start gap-4 rounded-2xl p-2 transition hover:bg-white/5">
            <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-white/10 sm:h-28 sm:w-24">
              {imageUrl ? (
                <>
                  <Image
                    src={imageUrl}
                    alt={title}
                    fill
                    className="object-cover brightness-50 blur-[1px] transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 ring-1 ring-white/20">
                      <Lock className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-white/50">
                  No image
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 pt-1">
              <h3 className="line-clamp-1 text-xl font-semibold text-white">
                {title}
              </h3>

              <p className="mt-2 line-clamp-2 text-base leading-7 text-white/85">
                {description || "Unlock this episode by purchasing this comic."}
              </p>

              <div className="mt-2 flex items-center gap-3 text-sm text-white/55">
                <span>
                  {pages} page{pages > 1 ? "s" : ""}
                </span>

                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/80">
                  Locked
                </span>
              </div>
            </div>
          </div>
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent className="border-white/10 bg-[#13292f] text-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Unlock this comic?</AlertDialogTitle>
          <AlertDialogDescription className="text-white/70">
            Buy access to locked episodes for{" "}
            <span className="font-semibold text-white">{priceCoins} coins</span>
            .
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-xl bg-white/5 p-3 text-sm text-white/75">
          This will unlock all episodes for this comic.
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel className="border-white/10 bg-transparent text-white hover:bg-white/10 hover:text-white">
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              if (!isPending) handleBuy();
            }}
            className="bg-white hover:bg-white/90"
          >
            <span className="text-black">
              {isPending ? "Buying..." : `Buy for ${priceCoins} coins`}
            </span>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
