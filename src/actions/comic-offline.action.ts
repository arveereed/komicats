"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

async function getCurrentUser() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: {
      id: true,
      activeProfileId: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

export async function registerComicOfflineDownload(input: {
  comicId: string;
  title: string;
  coverImage?: string | null;
  totalPages: number;
}) {
  const user = await getCurrentUser();

  return prisma.comicOfflineDownload.upsert({
    where: {
      userId_comicId: {
        userId: user.id,
        comicId: input.comicId,
      },
    },
    create: {
      userId: user.id,
      profileId: user.activeProfileId ?? null,
      comicId: input.comicId,
      title: input.title,
      coverImage: input.coverImage ?? null,
      totalPages: input.totalPages,
      cachedPages: 0,
      status: "QUEUED",
    },
    update: {
      title: input.title,
      coverImage: input.coverImage ?? null,
      totalPages: input.totalPages,
      cachedPages: 0,
      status: "QUEUED",
      downloadedAt: null,
    },
  });
}

export async function syncComicOfflineProgress(input: {
  comicId: string;
  cachedPages: number;
  totalPages: number;
  status: "DOWNLOADING" | "COMPLETED" | "FAILED";
}) {
  const user = await getCurrentUser();

  return prisma.comicOfflineDownload.update({
    where: {
      userId_comicId: {
        userId: user.id,
        comicId: input.comicId,
      },
    },
    data: {
      cachedPages: input.cachedPages,
      totalPages: input.totalPages,
      status: input.status,
      downloadedAt: input.status === "COMPLETED" ? new Date() : undefined,
    },
  });
}

export async function removeComicOfflineDownload(comicId: string) {
  const user = await getCurrentUser();

  await prisma.comicOfflineDownload.deleteMany({
    where: {
      userId: user.id,
      comicId,
    },
  });

  return { success: true };
}

export async function getMyOfflineDownloads() {
  const user = await getCurrentUser();

  return prisma.comicOfflineDownload.findMany({
    where: {
      userId: user.id,
      status: {
        in: ["DOWNLOADING", "COMPLETED"],
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}
