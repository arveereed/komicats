"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export type ComicReactionInput = "LIKE" | "DISLIKE";

export async function toggleComicReaction(
  comicId: string,
  type: ComicReactionInput,
  pathToRevalidate?: string,
) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: {
      activeProfileId: true,
    },
  });

  if (!user?.activeProfileId) {
    throw new Error("No active profile selected");
  }

  const profileId = user.activeProfileId;
  const oppositeType: ComicReactionInput = type === "LIKE" ? "DISLIKE" : "LIKE";

  const existing = await prisma.comicReaction.findUnique({
    where: {
      comicId_profileId_type: {
        comicId,
        profileId,
        type,
      },
    },
  });

  if (existing) {
    await prisma.comicReaction.delete({
      where: {
        comicId_profileId_type: {
          comicId,
          profileId,
          type,
        },
      },
    });
  } else {
    await prisma.$transaction([
      prisma.comicReaction.deleteMany({
        where: {
          comicId,
          profileId,
          type: oppositeType,
        },
      }),
      prisma.comicReaction.create({
        data: {
          comicId,
          profileId,
          type,
        },
      }),
    ]);
  }

  if (pathToRevalidate) {
    revalidatePath(pathToRevalidate);
  }

  return { success: true };
}
