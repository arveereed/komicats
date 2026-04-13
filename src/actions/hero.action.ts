"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { deleteCloudinaryImage } from "./post.action";

function getString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function createHeroAction(formData: FormData) {
  const title = getString(formData.get("title"));
  const backgroundImage = getString(formData.get("backgroundImage"));
  const imagePublicId = getString(formData.get("imagePublicId"));

  if (!title) {
    throw new Error("Title is required");
  }

  if (!backgroundImage) {
    throw new Error("Background image is required");
  }

  if (!imagePublicId) {
    throw new Error("Image public ID is required");
  }

  try {
    await prisma.heroSection.create({
      data: {
        title,
        backgroundImage,
        imagePublicId,
      },
    });
  } catch (error) {
    try {
      await deleteCloudinaryImage(imagePublicId);
    } catch (cleanupError) {
      console.error("Failed to clean up uploaded hero image:", cleanupError);
    }
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/admin/posts");
}

export async function updateHeroAction(formData: FormData) {
  const heroId = getString(formData.get("heroId"));
  const title = getString(formData.get("title"));
  const backgroundImage = getString(formData.get("backgroundImage"));
  const imagePublicId = getString(formData.get("imagePublicId"));

  if (!heroId) {
    throw new Error("Hero ID is required");
  }

  if (!title) {
    throw new Error("Title is required");
  }

  if (!backgroundImage) {
    throw new Error("Background image is required");
  }

  if (!imagePublicId) {
    throw new Error("Image public ID is required");
  }

  const existingHero = await prisma.heroSection.findUnique({
    where: {
      id: heroId,
    },
  });

  if (!existingHero) {
    throw new Error("Hero section not found");
  }

  const imageChanged = existingHero.imagePublicId !== imagePublicId;

  await prisma.heroSection.update({
    where: {
      id: heroId,
    },
    data: {
      title,
      backgroundImage,
      imagePublicId,
    },
  });

  if (imageChanged && existingHero.imagePublicId) {
    try {
      await deleteCloudinaryImage(existingHero.imagePublicId);
    } catch (error) {
      console.error("Failed to delete old hero image:", error);
    }
  }

  revalidatePath("/");
  revalidatePath("/admin/posts");
}

export async function deleteHeroAction(formData: FormData) {
  const heroId = getString(formData.get("heroId"));

  if (!heroId) {
    throw new Error("Hero ID is required");
  }

  const existingHero = await prisma.heroSection.findUnique({
    where: {
      id: heroId,
    },
  });

  if (!existingHero) {
    throw new Error("Hero section not found");
  }

  await prisma.heroSection.delete({
    where: {
      id: heroId,
    },
  });

  if (existingHero.imagePublicId) {
    try {
      await deleteCloudinaryImage(existingHero.imagePublicId);
    } catch (error) {
      console.error("Failed to delete hero Cloudinary image:", error);
    }
  }

  revalidatePath("/");
  revalidatePath("/admin/posts");
}
