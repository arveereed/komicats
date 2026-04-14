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
import {
  createHeroAction,
  updateHeroAction,
  deleteHeroAction,
} from "@/actions/hero.action";
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

type HeroSection = {
  id: string;
  title: string;
  backgroundImage: string;
  imagePublicId: string;
  createdAt: Date;
  updatedAt: Date;
};

type Props = {
  posts: Post[];
  hero: HeroSection | null;
};

type PostFormState = {
  postId: string;
  title: string;
  date: string;
  image: string;
  imagePublicId: string;
};

type HeroFormState = {
  heroId: string;
  title: string;
  backgroundImage: string;
  imagePublicId: string;
};

const initialPostForm: PostFormState = {
  postId: "",
  title: "",
  date: "",
  image: "",
  imagePublicId: "",
};

const initialHeroForm: HeroFormState = {
  heroId: "",
  title: "",
  backgroundImage: "",
  imagePublicId: "",
};

export default function PostsCrud({ posts, hero }: Props) {
  const [postForm, setPostForm] = useState<PostFormState>(initialPostForm);
  const [heroForm, setHeroForm] = useState<HeroFormState>(
    hero
      ? {
          heroId: hero.id,
          title: hero.title,
          backgroundImage: hero.backgroundImage,
          imagePublicId: hero.imagePublicId,
        }
      : initialHeroForm,
  );

  const [isPending, startTransition] = useTransition();
  const [isUploadingPost, setIsUploadingPost] = useState(false);
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [postError, setPostError] = useState("");
  const [heroError, setHeroError] = useState("");
  const [postOpen, setPostOpen] = useState(false);
  const [heroOpen, setHeroOpen] = useState(false);

  const isEditingPost = !!postForm.postId;
  const isEditingHero = !!heroForm.heroId;
  const isBusy = isPending || isUploadingPost || isUploadingHero;

  function resetPostForm() {
    setPostForm(initialPostForm);
    setPostError("");
  }

  function resetHeroForm() {
    setHeroForm(
      hero
        ? {
            heroId: hero.id,
            title: hero.title,
            backgroundImage: hero.backgroundImage,
            imagePublicId: hero.imagePublicId,
          }
        : initialHeroForm,
    );
    setHeroError("");
  }

  function handleCreatePostOpen() {
    resetPostForm();
    setPostOpen(true);
  }

  function handleEditPost(post: Post) {
    setPostError("");
    setPostForm({
      postId: post.id,
      title: post.title,
      date: post.date,
      image: post.image,
      imagePublicId: post.imagePublicId,
    });
    setPostOpen(true);
  }

  function handleHeroOpen() {
    resetHeroForm();
    setHeroOpen(true);
  }

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

  async function handleHeroFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setHeroError("");
      setIsUploadingHero(true);

      const uploaded = await uploadImageClient(file);

      setHeroForm((prev) => ({
        ...prev,
        backgroundImage: uploaded.url,
        imagePublicId: uploaded.publicId,
      }));
    } catch (error) {
      setHeroError(
        error instanceof Error ? error.message : "Hero image upload failed",
      );
    } finally {
      setIsUploadingHero(false);
    }
  }

  function validatePostForm() {
    if (!postForm.title.trim()) return "Title is required";
    if (!postForm.date.trim()) return "Date is required";
    if (!postForm.image.trim()) return "Image is required";
    if (!postForm.imagePublicId.trim()) return "Image upload is incomplete";
    return "";
  }

  function validateHeroForm() {
    if (!heroForm.title.trim()) return "Hero title is required";
    if (!heroForm.backgroundImage.trim()) return "Background image is required";
    if (!heroForm.imagePublicId.trim()) return "Image upload is incomplete";
    return "";
  }

  function handlePostSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const validationError = validatePostForm();
    if (validationError) {
      setPostError(validationError);
      return;
    }

    setPostError("");

    const formData = new FormData();
    formData.append("postId", postForm.postId);
    formData.append("title", postForm.title);
    formData.append("date", postForm.date);
    formData.append("image", postForm.image);
    formData.append("imagePublicId", postForm.imagePublicId);

    startTransition(async () => {
      try {
        if (isEditingPost) {
          const result = await updatePostAction(formData);

          if (!result.ok) {
            setPostError(result.message ?? "Something went wrong");
            return;
          }
        } else {
          await createPostAction(formData);
        }

        resetPostForm();
        setPostOpen(false);
      } catch (error) {
        setPostError(
          error instanceof Error ? error.message : "Something went wrong",
        );
      }
    });
  }

  function handleHeroSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const validationError = validateHeroForm();
    if (validationError) {
      setHeroError(validationError);
      return;
    }

    setHeroError("");

    const formData = new FormData();
    formData.append("heroId", heroForm.heroId);
    formData.append("title", heroForm.title);
    formData.append("backgroundImage", heroForm.backgroundImage);
    formData.append("imagePublicId", heroForm.imagePublicId);

    startTransition(async () => {
      try {
        if (isEditingHero) {
          await updateHeroAction(formData);
        } else {
          await createHeroAction(formData);
        }

        setHeroOpen(false);
      } catch (error) {
        setHeroError(
          error instanceof Error ? error.message : "Something went wrong",
        );
      }
    });
  }

  function handleDeletePost(postId: string) {
    const formData = new FormData();
    formData.append("postId", postId);

    startTransition(async () => {
      try {
        await deletePostAction(formData);

        if (postForm.postId === postId) {
          resetPostForm();
          setPostOpen(false);
        }
      } catch (error) {
        setPostError(
          error instanceof Error ? error.message : "Failed to delete post",
        );
      }
    });
  }

  function handleDeleteHero(heroId: string) {
    const formData = new FormData();
    formData.append("heroId", heroId);

    startTransition(async () => {
      try {
        await deleteHeroAction(formData);
        setHeroOpen(false);
        setHeroForm(initialHeroForm);
      } catch (error) {
        setHeroError(
          error instanceof Error ? error.message : "Failed to delete hero",
        );
      }
    });
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <div className="mx-auto max-w-[1600px] px-4 py-4 lg:px-6">
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">
              CMS Preview
            </p>
            <h2 className="mt-1 text-lg font-semibold text-white">
              Posts Manager
            </h2>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Dialog
              open={heroOpen}
              onOpenChange={(nextOpen) => {
                if (!nextOpen && !isBusy) {
                  setHeroOpen(false);
                  resetHeroForm();
                  return;
                }
                setHeroOpen(nextOpen);
              }}
            >
              <DialogTrigger asChild>
                <button
                  type="button"
                  onClick={handleHeroOpen}
                  className="border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/20"
                >
                  {hero ? "Edit Hero" : "Create Hero"}
                </button>
              </DialogTrigger>

              <DialogContent className="w-[calc(100vw-1.5rem)] max-w-lg border-white/10 bg-neutral-950 p-0 text-white sm:w-full">
                <div className="flex max-h-[85vh] flex-col">
                  <DialogHeader className="shrink-0 border-b border-white/10 px-4 py-4 sm:px-6">
                    <DialogTitle>
                      {isEditingHero ? "Edit hero" : "Create hero"}
                    </DialogTitle>
                    <DialogDescription className="text-white/45">
                      Manage the homepage hero background and title.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="overflow-y-auto px-4 py-4 sm:px-6">
                    {heroError && (
                      <div className="mb-4 border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                        {heroError}
                      </div>
                    )}

                    <form onSubmit={handleHeroSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm text-white/60">
                          Hero title
                        </label>
                        <input
                          type="text"
                          value={heroForm.title}
                          onChange={(e) =>
                            setHeroForm((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          disabled={isBusy}
                          placeholder="Mistaken Idea Of Denouncing Pleasure"
                          className="w-full border border-white/10 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-white/20 focus:border-white/30 disabled:opacity-50"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm text-white/60">
                            Background image
                          </label>

                          {heroForm.backgroundImage && (
                            <button
                              type="button"
                              onClick={() =>
                                setHeroForm((prev) => ({
                                  ...prev,
                                  backgroundImage: "",
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

                        {!heroForm.backgroundImage ? (
                          <label className="group flex cursor-pointer flex-col items-center justify-center border border-dashed border-white/15 bg-white/[0.02] px-4 py-8 text-center transition hover:border-white/25 hover:bg-white/[0.04] sm:px-6 sm:py-10">
                            <div className="space-y-2">
                              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70">
                                +
                              </div>

                              <div>
                                <p className="text-sm font-medium text-white/85">
                                  {isUploadingHero
                                    ? "Uploading image..."
                                    : "Upload hero image"}
                                </p>
                                <p className="mt-1 text-xs text-white/35">
                                  PNG, JPG, WEBP
                                </p>
                              </div>
                            </div>

                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleHeroFileChange}
                              disabled={isBusy}
                              className="hidden"
                            />
                          </label>
                        ) : (
                          <div className="overflow-hidden border border-white/10 bg-white/[0.02]">
                            <div className="relative aspect-[16/10]">
                              <Image
                                src={heroForm.backgroundImage}
                                alt="Hero preview"
                                fill
                                className="object-cover"
                              />
                            </div>

                            <div className="flex flex-col gap-3 border-t border-white/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-sm font-medium text-white/85">
                                  Hero image uploaded
                                </p>
                                <p className="text-xs text-white/35">
                                  Ready to save
                                </p>
                              </div>

                              <label className="cursor-pointer border border-white/10 px-3 py-2 text-center text-xs font-medium text-white/80 transition hover:bg-white/5">
                                Replace
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleHeroFileChange}
                                  disabled={isBusy}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          </div>
                        )}

                        {isUploadingHero && (
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
                            {isUploadingHero
                              ? "Uploading..."
                              : isPending
                                ? "Saving..."
                                : isEditingHero
                                  ? "Save Hero"
                                  : "Create Hero"}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              resetHeroForm();
                              setHeroOpen(false);
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

            {hero && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    type="button"
                    disabled={isBusy}
                    className="border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-200 transition hover:bg-red-500/20 disabled:opacity-50"
                  >
                    Delete Hero
                  </button>
                </AlertDialogTrigger>

                <AlertDialogContent className="border-white/10 bg-neutral-950 text-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete hero?</AlertDialogTitle>
                    <AlertDialogDescription className="text-white/45">
                      This will remove the hero title and background image from
                      the homepage.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-white/10 bg-transparent text-white hover:bg-white/5 hover:text-white">
                      Cancel
                    </AlertDialogCancel>

                    <AlertDialogAction
                      onClick={() => handleDeleteHero(hero.id)}
                      className="bg-red-600 text-white hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            <Dialog
              open={postOpen}
              onOpenChange={(nextOpen) => {
                if (!nextOpen && !isBusy) {
                  setPostOpen(false);
                  resetPostForm();
                  return;
                }
                setPostOpen(nextOpen);
              }}
            >
              <DialogTrigger asChild>
                <button
                  type="button"
                  onClick={handleCreatePostOpen}
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

                    <form onSubmit={handlePostSubmit} className="space-y-4">
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
                          <label className="text-sm text-white/60">
                            Cover image
                          </label>

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
                              resetPostForm();
                              setPostOpen(false);
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
        </div>

        <div className="overflow-hidden rounded-[28px] border border-white/10">
          <main className="relative min-h-screen w-full overflow-hidden bg-black font-sans">
            <div className="absolute inset-0 z-0">
              <Image
                src={hero?.backgroundImage || "/landing.jpg"}
                alt="Hero Background"
                fill
                priority
                className="object-cover object-right lg:object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-orange-950/60 via-transparent to-transparent" />
            </div>

            <div className="relative z-10 flex min-h-screen flex-col justify-between px-6 py-12 lg:px-16">
              <div />

              <div className="flex w-full flex-col items-center justify-between lg:flex-row">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="max-w-2xl"
                >
                  <span className="bg-red-600 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                    Komicats
                  </span>
                  <h1 className="mt-4 text-5xl font-black uppercase leading-[0.9] tracking-tighter text-white drop-shadow-2xl md:text-7xl lg:text-8xl">
                    {hero?.title || "Mistaken Idea Of Denouncing Pleasure"}
                  </h1>
                </motion.div>
              </div>

              <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                          onClick={() => handleEditPost(post)}
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
                                onClick={() => handleDeletePost(post.id)}
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

            <div className="pointer-events-none absolute top-0 left-0 h-1/3 w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600/10 blur-[120px]" />
          </main>
        </div>
      </div>
    </div>
  );
}
