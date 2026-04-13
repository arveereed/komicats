"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState, useTransition } from "react";
import PostCard from "@/components/PostCard";
import InstallButton from "@/components/pwa/install-button";
import {
  createPostAction,
  updatePostAction,
  deletePostAction,
} from "@/actions/post.action";
import { uploadImageClient } from "@/lib/uploadImageClient";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
    <div className="min-h-screen bg-black text-white font-sans">
      <div className="mx-auto max-w-[1600px] px-4 py-4 lg:px-6">
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">
              CMS Preview
            </p>
            <h2 className="mt-1 text-lg font-semibold text-white">
              Posts Manager
            </h2>
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
                className="border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/20"
              >
                New Post
              </button>
            </DialogTrigger>

            <DialogContent className="w-[calc(100vw-1.5rem)] max-w-lg border-white/10 bg-neutral-950 p-0 text-white sm:w-full">
              <div className="flex max-h-[85vh] flex-col">
                <DialogHeader className="shrink-0 border-b border-white/10 px-4 py-4 sm:px-6">
                  <DialogTitle>
                    {isEditing ? "Edit post" : "Create post"}
                  </DialogTitle>
                  <DialogDescription className="text-white/45">
                    {isEditing
                      ? "Update the details of your post."
                      : "Add a new post to your CMS."}
                  </DialogDescription>
                </DialogHeader>

                <div className="overflow-y-auto px-4 py-4 sm:px-6">
                  {errorMessage && (
                    <div className="mb-4 border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
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
                          setForm((prev) => ({
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
                        <label className="text-sm text-white/60">
                          Cover image
                        </label>

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
                        <label className="group flex cursor-pointer flex-col items-center justify-center border border-dashed border-white/15 bg-white/[0.02] px-4 py-8 text-center transition hover:border-white/25 hover:bg-white/[0.04] sm:px-6 sm:py-10">
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
                                PNG, JPG, WEBP
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

                    <div className="sticky bottom-0 -mx-4 border-t border-white/10 bg-neutral-950 px-4 pt-4 sm:-mx-6 sm:px-6">
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                          type="submit"
                          disabled={isBusy}
                          className="w-full bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:opacity-90 disabled:opacity-50 sm:w-auto"
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
        </div>

        <div className="overflow-hidden rounded-[28px] border border-white/10">
          <main className="relative min-h-screen w-full bg-black overflow-hidden font-sans">
            <div className="absolute inset-0 z-0">
              <Image
                src="/landing.jpg"
                alt="Hero Background"
                fill
                priority
                className="object-cover object-right lg:object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-orange-950/60 via-transparent to-transparent" />
            </div>

            <div className="relative z-10 flex flex-col min-h-screen px-6 lg:px-16 py-12 justify-between">
              <div />

              <div className="flex flex-col lg:flex-row justify-between items-center w-full">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="max-w-2xl"
                >
                  <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 tracking-widest uppercase">
                    Komicats
                  </span>
                  <h1 className="mt-4 text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter uppercase drop-shadow-2xl">
                    Mistaken Idea Of Denouncing Pleasure
                  </h1>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
                {posts.length > 0 ? (
                  posts.map((post, idx) => (
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
                          className="flex-1 border border-white/10 bg-black/20 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/5 disabled:opacity-50"
                        >
                          Edit
                        </button>

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
                                This action cannot be undone. The post and its
                                image will be permanently removed.
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
                  ))
                ) : (
                  <div className="col-span-full text-white/70">
                    No posts yet.
                  </div>
                )}
              </div>
            </div>

            <InstallButton />

            <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-red-600/10 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          </main>
        </div>
      </div>
    </div>
  );
}
