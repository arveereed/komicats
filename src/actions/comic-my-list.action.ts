"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function toggleComicMyList(
  comicId: string,
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

  const existing = await prisma.comicMyList.findUnique({
    where: {
      profileId_comicId: {
        profileId,
        comicId,
      },
    },
  });

  if (existing) {
    await prisma.comicMyList.delete({
      where: {
        profileId_comicId: {
          profileId,
          comicId,
        },
      },
    });
  } else {
    await prisma.comicMyList.create({
      data: {
        profileId,
        comicId,
      },
    });
  }

  if (pathToRevalidate) {
    revalidatePath(pathToRevalidate);
  }

  revalidatePath("/profile/avatar/my-list");

  return { success: true };
}
