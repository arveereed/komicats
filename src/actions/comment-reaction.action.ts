"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";

function getCommentsPath(comicId: string, episodeId: string, isAdmin: boolean) {
  return isAdmin
    ? `/admin/comics/${comicId}/episode/${episodeId}/comments`
    : `/profile/avatar/comics/${comicId}/episode/${episodeId}/comments`;
}

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

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        authorId: true,
      },
    });

    if (!comment) {
      return { success: false, error: "Comment not found" };
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
      await prisma.$transaction(async (tx) => {
        if (existingDislike) {
          await tx.commentDislike.delete({
            where: {
              commentId_userId: {
                commentId,
                userId,
              },
            },
          });
        }

        await tx.commentLike.create({
          data: {
            commentId,
            userId,
          },
        });

        if (comment.authorId !== userId) {
          await tx.notification.create({
            data: {
              userId: comment.authorId,
              creatorId: userId,
              type: "COMMENT_LIKE",
              comicId,
              episodeId,
              commentId,
            },
          });
        }
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

    revalidatePath(getCommentsPath(comicId, episodeId, isAdmin));

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

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        authorId: true,
      },
    });

    if (!comment) {
      return { success: false, error: "Comment not found" };
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
      await prisma.$transaction(async (tx) => {
        if (existingLike) {
          await tx.commentLike.delete({
            where: {
              commentId_userId: {
                commentId,
                userId,
              },
            },
          });
        }

        await tx.commentDislike.create({
          data: {
            commentId,
            userId,
          },
        });

        if (comment.authorId !== userId) {
          await tx.notification.create({
            data: {
              userId: comment.authorId,
              creatorId: userId,
              type: "COMMENT_DISLIKE",
              comicId,
              episodeId,
              commentId,
            },
          });
        }
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

    revalidatePath(getCommentsPath(comicId, episodeId, isAdmin));

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
