"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import PostCard from "@/components/PostCard";
import {
  createPostAction,
  updatePostAction,
  deletePostAction,
} from "@/actions/post.action";
import { uploadImageClient } from "@/lib/uploadImageClient";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
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

type Post = {
  id: string;
  title: string;
  date: string;
  image: string;
  imagePublicId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

type Props = {
  posts: Post[];
};

type FormState = {
  postId: string;
  title: string;
  date: string;
  image: string;
  imagePublicId: string;
};

const initialForm: FormState = {
  postId: "",
  title: "",
  date: "",
  image: "",
  imagePublicId: "",
};

export default function PostsCrud({ posts }: Props) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [open, setOpen] = useState(false);

  const isEditing = !!form.postId;
  const isBusy = isPending || isUploading;

  function resetForm() {
    setForm(initialForm);
    setErrorMessage("");
  }

  function handleCreateOpen() {
    resetForm();
    setOpen(true);
  }

  function handleEdit(post: Post) {
    setErrorMessage("");
    setForm({
      postId: post.id,
      title: post.title,
      date: post.date,
      image: post.image,
      imagePublicId: post.imagePublicId,
    });
    setOpen(true);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setErrorMessage("");
      setIsUploading(true);

      const uploaded = await uploadImageClient(file);

      setForm((prev) => ({
        ...prev,
        image: uploaded.url,
        imagePublicId: uploaded.publicId,
      }));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Image upload failed",
      );
    } finally {
      setIsUploading(false);
    }
  }

  function validateForm() {
    if (!form.title.trim()) return "Title is required";
    if (!form.date.trim()) return "Date is required";
    if (!form.image.trim()) return "Image is required";
    if (!form.imagePublicId.trim()) return "Image upload is incomplete";
    return "";
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage("");

    const formData = new FormData();
    formData.append("postId", form.postId);
    formData.append("title", form.title);
    formData.append("date", form.date);
    formData.append("image", form.image);
    formData.append("imagePublicId", form.imagePublicId);

    startTransition(async () => {
      try {
        if (isEditing) {
          await updatePostAction(formData);
        } else {
          await createPostAction(formData);
        }

        resetForm();
        setOpen(false);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Something went wrong",
        );
      }
    });
  }

  function handleDelete(postId: string) {
    setErrorMessage("");

    const formData = new FormData();
    formData.append("postId", postId);

    startTransition(async () => {
      try {
        await deletePostAction(formData);

        if (form.postId === postId) {
          resetForm();
          setOpen(false);
        }
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to delete post",
        );
      }
    });
  }

  return (
    <main className="min-h-screen text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Posts</h1>
            <p className="text-sm text-white/50">
              Create, edit, and manage your visual posts.
            </p>
          </div>

          <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
              if (!nextOpen && !isBusy) {
                setOpen(false);
                resetForm();
                return;
              }
              setOpen(nextOpen);
            }}
          >
            <DialogTrigger asChild>
              <button
                type="button"
                onClick={handleCreateOpen}
                className="bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:opacity-90"
              >
                New post
              </button>
            </DialogTrigger>

            <DialogContent className="border-white/10 bg-slate-950 text-white sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? "Edit post" : "Create post"}
                </DialogTitle>
                <DialogDescription className="text-white/45">
                  {isEditing
                    ? "Update the details of your post."
                    : "Add a new visual post to your collection."}
                </DialogDescription>
              </DialogHeader>

              {errorMessage && (
                <div className="border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-white/60">Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, title: e.target.value }))
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
                    value={form.date}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, date: e.target.value }))
                    }
                    disabled={isBusy}
                    placeholder="MAY 30, 2026"
                    className="w-full border border-white/10 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-white/20 focus:border-white/30 disabled:opacity-50"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-white/60">Cover image</label>

                    {form.image && (
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
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

                  {!form.image ? (
                    <label className="group flex cursor-pointer flex-col items-center justify-center border border-dashed border-white/15 bg-white/[0.02] px-6 py-10 text-center transition hover:border-white/25 hover:bg-white/[0.04]">
                      <div className="space-y-2">
                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70">
                          +
                        </div>

                        <div>
                          <p className="text-sm font-medium text-white/85">
                            {isUploading
                              ? "Uploading image..."
                              : "Upload image"}
                          </p>
                          <p className="mt-1 text-xs text-white/35">
                            PNG, JPG, WEBP up to your Cloudinary preset limit
                          </p>
                        </div>
                      </div>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={isBusy}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="overflow-hidden border border-white/10 bg-white/[0.02]">
                      <div className="relative aspect-[16/10]">
                        <Image
                          src={form.image}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex items-center justify-between border-t border-white/10 px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-white/85">
                            Image uploaded
                          </p>
                          <p className="text-xs text-white/35">
                            Ready to save with this post
                          </p>
                        </div>

                        <label className="cursor-pointer border border-white/10 px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-white/5">
                          Replace
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={isBusy}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  )}

                  {isUploading && (
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

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isBusy}
                    className="bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:opacity-90 disabled:opacity-50"
                  >
                    {isUploading
                      ? "Uploading..."
                      : isPending
                        ? "Saving..."
                        : isEditing
                          ? "Save"
                          : "Create"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setOpen(false);
                    }}
                    disabled={isBusy}
                    className="border border-white/10 px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/5 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {posts.length === 0 ? (
          <div className="border border-white/10 px-6 py-16 text-center">
            <h3 className="text-lg font-medium">No posts found</h3>
            <p className="mt-2 text-sm text-white/45">
              Create your first post to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post, idx) => (
              <div key={post.id} className="space-y-3">
                <PostCard
                  image={post.image}
                  date={post.date}
                  title={post.title}
                  index={idx}
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(post)}
                    disabled={isBusy}
                    className="flex-1 border border-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/5 disabled:opacity-50"
                  >
                    Edit
                  </button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        type="button"
                        disabled={isBusy}
                        className="flex-1 border border-red-500/20 px-4 py-2.5 text-sm font-medium text-red-200 transition hover:bg-red-500/10 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </AlertDialogTrigger>

                    <AlertDialogContent className="border-white/10 bg-neutral-950 text-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete post?</AlertDialogTitle>
                        <AlertDialogDescription className="text-white/45">
                          This action cannot be undone. The post and its
                          Cloudinary image will be permanently removed.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-white/10 bg-transparent text-white hover:bg-white/5 hover:text-white">
                          Cancel
                        </AlertDialogCancel>

                        <AlertDialogAction
                          onClick={() => handleDelete(post.id)}
                          className="bg-red-600 text-white hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
