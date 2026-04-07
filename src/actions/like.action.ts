"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";

export async function toggleLike(
  episodeId: string,
  comicId: string,
  isAdmin = false,
) {
  try {
    const userId = await getDbUserId();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    if (!episodeId) {
      return { success: false, error: "Episode ID is required" };
    }

    const episode = await prisma.episode.findUnique({
      where: { id: episodeId },
      select: { id: true },
    });

    if (!episode) {
      return { success: false, error: "Episode not found" };
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_episodeId: {
          userId,
          episodeId,
        },
      },
    });

    let liked: boolean;

    if (existingLike) {
      await prisma.like.delete({
        where: {
          userId_episodeId: {
            userId,
            episodeId,
          },
        },
      });

      liked = false;
    } else {
      await prisma.like.create({
        data: {
          userId,
          episodeId,
        },
      });

      liked = true;
    }

    const count = await prisma.like.count({
      where: {
        episodeId,
      },
    });

    const readerPath = isAdmin
      ? `/admin/comics/${comicId}/episode/${episodeId}`
      : `/profile/avatar/comics/${comicId}/episode/${episodeId}`;

    revalidatePath(readerPath);

    return {
      success: true,
      liked,
      count,
    };
  } catch (error) {
    console.error("Failed to toggle like:", error);
    return {
      success: false,
      error: "Failed to toggle like",
    };
  }
}

export async function getLikeStatus(episodeId: string) {
  try {
    const userId = await getDbUserId();

    if (!episodeId) {
      return {
        success: false,
        error: "Episode ID is required",
        liked: false,
        count: 0,
      };
    }

    const [count, existingLike] = await Promise.all([
      prisma.like.count({
        where: { episodeId },
      }),
      userId
        ? prisma.like.findUnique({
            where: {
              userId_episodeId: {
                userId,
                episodeId,
              },
            },
          })
        : null,
    ]);

    return {
      success: true,
      liked: !!existingLike,
      count,
    };
  } catch (error) {
    console.error("Failed to get like status:", error);
    return {
      success: false,
      error: "Failed to get like status",
      liked: false,
      count: 0,
    };
  }
}
