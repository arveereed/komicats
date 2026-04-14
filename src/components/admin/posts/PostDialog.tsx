"use client";

import Image from "next/image";
import { uploadImageClient } from "@/lib/uploadImageClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { PostFormState } from "./types";

type PostDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  postForm: PostFormState;
  setPostForm: React.Dispatch<React.SetStateAction<PostFormState>>;
  postError: string;
  setPostError: (value: string) => void;
  isBusy: boolean;
  isPending: boolean;
  isUploadingPost: boolean;
  setIsUploadingPost: (value: boolean) => void;
  isEditingPost: boolean;
  onCreateOpen: () => void;
  onReset: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export default function PostDialog({
  open,
  setOpen,
  postForm,
  setPostForm,
  postError,
  setPostError,
  isBusy,
  isPending,
  isUploadingPost,
  setIsUploadingPost,
  isEditingPost,
  onCreateOpen,
  onReset,
  onSubmit,
}: PostDialogProps) {
  async function handlePostFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setPostError("");
      setIsUploadingPost(true);

      const uploaded = await uploadImageClient(file);

      setPostForm((prev) => ({
        ...prev,
        image: uploaded.url,
        imagePublicId: uploaded.publicId,
      }));
    } catch (error) {
      setPostError(
        error instanceof Error ? error.message : "Image upload failed",
      );
    } finally {
      setIsUploadingPost(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isBusy) {
          setOpen(false);
          onReset();
          return;
        }
        setOpen(nextOpen);
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          onClick={onCreateOpen}
          className="border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/20"
        >
          New Post
        </button>
      </DialogTrigger>

      <DialogContent className="w-[calc(100vw-1.5rem)] max-w-lg border-white/10 bg-neutral-950 p-0 text-white sm:w-full">
        <div className="flex max-h-[85vh] flex-col">
          <DialogHeader className="shrink-0 border-b border-white/10 px-4 py-4 sm:px-6">
            <DialogTitle>
              {isEditingPost ? "Edit post" : "Create post"}
            </DialogTitle>
            <DialogDescription className="text-white/45">
              {isEditingPost
                ? "Update the details of your post."
                : "Add a new post to your CMS."}
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto px-4 py-4 sm:px-6">
            {postError && (
              <div className="mb-4 border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {postError}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-white/60">Title</label>
                <input
                  type="text"
                  value={postForm.title}
                  onChange={(e) =>
                    setPostForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  disabled={isBusy}
                  placeholder="Filipino-Comics-Filtered-Lenses"
                  className="w-full border border-white/10 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-white/20 focus:border-white/30 disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white/60">Date</label>
                <input
                  type="text"
                  value={postForm.date}
                  onChange={(e) =>
                    setPostForm((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                  disabled={isBusy}
                  placeholder="MAY 30, 2026"
                  className="w-full border border-white/10 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-white/20 focus:border-white/30 disabled:opacity-50"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-white/60">Cover image</label>

                  {postForm.image && (
                    <button
                      type="button"
                      onClick={() =>
                        setPostForm((prev) => ({
                          ...prev,
                          image: "",
                          imagePublicId: "",
                        }))
                      }
                      disabled={isBusy}
                      className="text-xs text-white/40 transition hover:text-white disabled:opacity-50"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {!postForm.image ? (
                  <label className="group flex cursor-pointer flex-col items-center justify-center border border-dashed border-white/15 bg-white/[0.02] px-4 py-8 text-center transition hover:border-white/25 hover:bg-white/[0.04] sm:px-6 sm:py-10">
                    <div className="space-y-2">
                      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70">
                        +
                      </div>

                      <div>
                        <p className="text-sm font-medium text-white/85">
                          {isUploadingPost
                            ? "Uploading image..."
                            : "Upload image"}
                        </p>
                        <p className="mt-1 text-xs text-white/35">
                          PNG, JPG, WEBP
                        </p>
                      </div>
                    </div>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePostFileChange}
                      disabled={isBusy}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="overflow-hidden border border-white/10 bg-white/[0.02]">
                    <div className="relative aspect-[16/10]">
                      <Image
                        src={postForm.image}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex flex-col gap-3 border-t border-white/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-medium text-white/85">
                          Image uploaded
                        </p>
                        <p className="text-xs text-white/35">
                          Ready to save with this post
                        </p>
                      </div>

                      <label className="cursor-pointer border border-white/10 px-3 py-2 text-center text-xs font-medium text-white/80 transition hover:bg-white/5">
                        Replace
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePostFileChange}
                          disabled={isBusy}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                )}

                {isUploadingPost && (
                  <div className="space-y-2">
                    <div className="h-1.5 w-full overflow-hidden bg-white/10">
                      <div className="h-full w-1/2 animate-pulse bg-white/70" />
                    </div>
                    <p className="text-xs text-white/40">
                      Uploading to Cloudinary...
                    </p>
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 -mx-4 border-t border-white/10 bg-neutral-950 px-4 pt-4 sm:-mx-6 sm:px-6">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    disabled={isBusy}
                    className="w-full bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:opacity-90 disabled:opacity-50 sm:w-auto"
                  >
                    {isUploadingPost
                      ? "Uploading..."
                      : isPending
                        ? "Saving..."
                        : isEditingPost
                          ? "Save"
                          : "Create"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onReset();
                      setOpen(false);
                    }}
                    disabled={isBusy}
                    className="w-full border border-white/10 px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/5 disabled:opacity-50 sm:w-auto"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
