"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
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

type Props = {
  comicId: string;
  comicTitle: string;
  action: (formData: FormData) => void;
};

export function DeleteComicDialog({ comicId, comicTitle, action }: Props) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          className="w-full rounded-2xl border border-red-500/20 bg-red-500/10 text-red-200 hover:bg-red-500/20 hover:text-red-100"
        >
          Delete
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md rounded-[28px] border border-white/10 bg-slate-950/95 text-white shadow-2xl backdrop-blur-xl">
        <AlertDialogHeader className="text-left">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 text-red-300">
            <AlertTriangle className="h-6 w-6" />
          </div>

          <AlertDialogTitle className="text-base sm:text-lg">
            Delete this comic?
          </AlertDialogTitle>

          <AlertDialogDescription className="text-sm leading-relaxed text-white/65">
            This action cannot be undone. This will permanently delete{" "}
            <span className="break-words font-medium text-white">
              {comicTitle}
            </span>
            .
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <AlertDialogCancel className="w-full rounded-2xl border border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white sm:w-auto">
            Cancel
          </AlertDialogCancel>

          <form action={action} className="w-full sm:w-auto">
            <input type="hidden" name="comicId" value={comicId} />

            <AlertDialogAction asChild>
              <Button
                type="submit"
                className="w-full rounded-2xl bg-red-500 text-white hover:bg-red-500/90 sm:w-auto"
              >
                Yes, delete
              </Button>
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
