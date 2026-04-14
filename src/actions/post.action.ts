"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import cloudinary from "@/lib/cloudinary";

function getString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function createPostAction(formData: FormData) {
  const dbUserId = await getDbUserId();

  if (!dbUserId) {
    throw new Error("Unauthorized");
  }

  const title = getString(formData.get("title"));
  const date = getString(formData.get("date"));
  const image = getString(formData.get("image"));
  const imagePublicId = getString(formData.get("imagePublicId"));

  if (!title) {
    throw new Error("Title is required");
  }

  if (!date) {
    throw new Error("Date is required");
  }

  if (!image) {
    throw new Error("Image is required");
  }

  if (!imagePublicId) {
    throw new Error("Image public ID is required");
  }

  await prisma.post.create({
    data: {
      title,
      date,
      image,
      imagePublicId,
      userId: dbUserId,
    },
  });

  revalidatePath("/posts");
}

export async function updatePostAction(formData: FormData) {
  try {
    const dbUserId = await getDbUserId();

    if (!dbUserId) {
      return { ok: false, message: "You must be signed in." };
    }

    const postId = getString(formData.get("postId"));
    const title = getString(formData.get("title"));
    const date = getString(formData.get("date"));
    const image = getString(formData.get("image"));
    const imagePublicId = getString(formData.get("imagePublicId"));

    if (!postId) return { ok: false, message: "Post ID is required." };
    if (!title) return { ok: false, message: "Title is required." };
    if (!date) return { ok: false, message: "Date is required." };
    if (!image) return { ok: false, message: "Image is required." };
    if (!imagePublicId) {
      return { ok: false, message: "Image upload is incomplete." };
    }

    const existingPost = await prisma.post.findFirst({
      where: {
        id: postId,
        userId: dbUserId,
      },
    });

    if (!existingPost) {
      return { ok: false, message: "Post not found." };
    }

    await prisma.post.update({
      where: { id: postId },
      data: {
        title,
        date,
        image,
        imagePublicId,
      },
    });

    revalidatePath("/admin/posts");
    revalidatePath("/");

    return { ok: true };
  } catch (error) {
    console.error("[UPDATE_POST_ACTION]", error);
    return { ok: false, message: "Failed to update post." };
  }
}

export async function deletePostAction(formData: FormData) {
  const dbUserId = await getDbUserId();

  if (!dbUserId) {
    throw new Error("Unauthorized");
  }

  const postId = getString(formData.get("postId"));

  if (!postId) {
    throw new Error("Post ID is required");
  }

  const existingPost = await prisma.post.findFirst({
    where: {
      id: postId,
      userId: dbUserId,
    },
  });

  if (!existingPost) {
    throw new Error("Post not found");
  }

  await prisma.post.delete({
    where: {
      id: postId,
    },
  });

  if (existingPost.imagePublicId) {
    try {
      await deleteCloudinaryImage(existingPost.imagePublicId);
    } catch (error) {
      console.error("Failed to delete Cloudinary image:", error);
    }
  }

  revalidatePath("/posts");
}

export async function deleteCloudinaryImage(publicId: string) {
  if (!publicId) return;

  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
  });

  return result;
}
