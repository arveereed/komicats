"use client";

import { useEffect, useState, useTransition } from "react";
import { notFound, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

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

import HeroDialog from "@/components/admin/posts/HeroDialog";
import PostDialog from "@/components/admin/posts/PostDialog";
import DeleteHeroDialog from "@/components/admin/posts/DeleteHeroDialog";
import PostsHeroPreview from "@/components/admin/posts/PostsHeroPreview";

import type {
  Post,
  HeroSection,
  PostFormState,
  HeroFormState,
} from "@/components/admin/posts/types";
import {
  initialPostForm,
  initialHeroForm,
} from "@/components/admin/posts/types";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Props = {
  posts: Post[];
  hero: HeroSection | null;
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

  const { isSignedIn, isLoaded: userLoaded, user: clerkUser } = useUser();

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const router = useRouter();

  const isAdmin =
    !!adminEmail && clerkUser?.emailAddresses[0].emailAddress === adminEmail;
  const isGuest = !clerkUser && !isSignedIn;

  useEffect(() => {
    if (!userLoaded) return;

    if (isGuest) {
      router.replace("/auth/sign-in");
      return;
    }

    if (isAdmin) {
      router.replace("/admin/posts");
    } else {
      return notFound();
    }
  }, [userLoaded, isGuest, isAdmin, router]);

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
      soon: post.soon || "SOON",
      image: post.image,
      imagePublicId: post.imagePublicId,
    });
    setPostOpen(true);
  }

  function handleHeroOpen() {
    resetHeroForm();
    setHeroOpen(true);
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
    formData.append("soon", postForm.soon.trim() || "SOON");
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
        <Link
          href="/admin"
          className="inline-flex items-center  mb-4 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          <ArrowLeft className="size-4 mr-2" />
          Back to Admin
        </Link>

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
            <HeroDialog
              open={heroOpen}
              setOpen={setHeroOpen}
              heroForm={heroForm}
              setHeroForm={setHeroForm}
              heroError={heroError}
              setHeroError={setHeroError}
              isBusy={isBusy}
              isPending={isPending}
              isUploadingHero={isUploadingHero}
              setIsUploadingHero={setIsUploadingHero}
              isEditingHero={isEditingHero}
              heroExists={!!hero}
              onOpenForm={handleHeroOpen}
              onReset={resetHeroForm}
              onSubmit={handleHeroSubmit}
            />

            {hero && (
              <DeleteHeroDialog
                isBusy={isBusy}
                onDelete={() => handleDeleteHero(hero.id)}
              />
            )}

            <PostDialog
              open={postOpen}
              setOpen={setPostOpen}
              postForm={postForm}
              setPostForm={setPostForm}
              postError={postError}
              setPostError={setPostError}
              isBusy={isBusy}
              isPending={isPending}
              isUploadingPost={isUploadingPost}
              setIsUploadingPost={setIsUploadingPost}
              isEditingPost={isEditingPost}
              onCreateOpen={handleCreatePostOpen}
              onReset={resetPostForm}
              onSubmit={handlePostSubmit}
            />
          </div>
        </div>

        <PostsHeroPreview
          hero={hero}
          posts={posts}
          isBusy={isBusy}
          onEditPost={handleEditPost}
          onDeletePost={handleDeletePost}
        />
      </div>
    </div>
  );
}
