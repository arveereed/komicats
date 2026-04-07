"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";

export async function toggleCommentLike(
  commentId: string,
  comicId: string,
  episodeId: string,
  isAdmin = false,
) {
  try {
    const userId = await getDbUserId();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    if (!commentId) {
      return { success: false, error: "Comment ID is required" };
    }

    const existingLike = await prisma.commentLike.findUnique({
      where: {
        commentId_userId: {
          commentId,
          userId,
        },
      },
    });

    const existingDislike = await prisma.commentDislike.findUnique({
      where: {
        commentId_userId: {
          commentId,
          userId,
        },
      },
    });

    let liked = false;
    let disliked = false;

    if (existingLike) {
      await prisma.commentLike.delete({
        where: {
          commentId_userId: {
            commentId,
            userId,
          },
        },
      });

      liked = false;
    } else {
      if (existingDislike) {
        await prisma.commentDislike.delete({
          where: {
            commentId_userId: {
              commentId,
              userId,
            },
          },
        });
      }

      await prisma.commentLike.create({
        data: {
          commentId,
          userId,
        },
      });

      liked = true;
      disliked = false;
    }

    const [likes, dislikes] = await Promise.all([
      prisma.commentLike.count({
        where: { commentId },
      }),
      prisma.commentDislike.count({
        where: { commentId },
      }),
    ]);

    const path = isAdmin
      ? `/admin/comics/${comicId}/episode/${episodeId}/comments`
      : `/profile/avatar/comics/${comicId}/episode/${episodeId}/comments`;

    revalidatePath(path);

    return {
      success: true,
      liked,
      disliked,
      likes,
      dislikes,
    };
  } catch (error) {
    console.error("Failed to toggle comment like:", error);
    return { success: false, error: "Failed to toggle like" };
  }
}

export async function toggleCommentDislike(
  commentId: string,
  comicId: string,
  episodeId: string,
  isAdmin = false,
) {
  try {
    const userId = await getDbUserId();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    if (!commentId) {
      return { success: false, error: "Comment ID is required" };
    }

    const existingLike = await prisma.commentLike.findUnique({
      where: {
        commentId_userId: {
          commentId,
          userId,
        },
      },
    });

    const existingDislike = await prisma.commentDislike.findUnique({
      where: {
        commentId_userId: {
          commentId,
          userId,
        },
      },
    });

    let liked = false;
    let disliked = false;

    if (existingDislike) {
      await prisma.commentDislike.delete({
        where: {
          commentId_userId: {
            commentId,
            userId,
          },
        },
      });

      disliked = false;
    } else {
      if (existingLike) {
        await prisma.commentLike.delete({
          where: {
            commentId_userId: {
              commentId,
              userId,
            },
          },
        });
      }

      await prisma.commentDislike.create({
        data: {
          commentId,
          userId,
        },
      });

      liked = false;
      disliked = true;
    }

    const [likes, dislikes] = await Promise.all([
      prisma.commentLike.count({
        where: { commentId },
      }),
      prisma.commentDislike.count({
        where: { commentId },
      }),
    ]);

    const path = isAdmin
      ? `/admin/comics/${comicId}/episode/${episodeId}/comments`
      : `/profile/avatar/comics/${comicId}/episode/${episodeId}/comments`;

    revalidatePath(path);

    return {
      success: true,
      liked,
      disliked,
      likes,
      dislikes,
    };
  } catch (error) {
    console.error("Failed to toggle comment dislike:", error);
    return { success: false, error: "Failed to toggle dislike" };
  }
}
