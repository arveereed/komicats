"use client";

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

type DeletePostDialogProps = {
  isBusy: boolean;
  onDelete: () => void;
};

export default function DeletePostDialog({
  isBusy,
  onDelete,
}: DeletePostDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          disabled={isBusy}
          className="flex-1 border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-200 transition hover:bg-red-500/20 disabled:opacity-50"
        >
          Delete
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent className="border-white/10 bg-neutral-950 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete post?</AlertDialogTitle>
          <AlertDialogDescription className="text-white/45">
            This action cannot be undone. The post and its image will be
            permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel className="border-white/10 bg-transparent text-white hover:bg-white/5 hover:text-white">
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={onDelete}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
