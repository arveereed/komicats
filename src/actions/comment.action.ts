"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";

function getCommentsPath(comicId: string, episodeId: string, isAdmin: boolean) {
  return isAdmin
    ? `/admin/comics/${comicId}/episode/${episodeId}/comments`
    : `/profile/avatar/comics/${comicId}/episode/${episodeId}/comments`;
}

export async function createComment(
  episodeId: string,
  content: string,
  comicId: string,
  isAdmin = false,
) {
  try {
    const userId = await getDbUserId();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    if (!content.trim()) {
      throw new Error("Content is required");
    }

    const episode = await prisma.episode.findUnique({
      where: { id: episodeId },
      select: { id: true },
    });

    if (!episode) {
      throw new Error("Episode not found");
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        authorId: userId,
        episodeId,
      },
      include: {
        author: {
          select: {
            id: true,
            fullname: true,
            image: true,
          },
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                fullname: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        likes: {
          where: { userId },
          select: {
            id: true,
            commentId: true,
            userId: true,
            createdAt: true,
          },
        },
        dislikes: {
          where: { userId },
          select: {
            id: true,
            commentId: true,
            userId: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            likes: true,
            dislikes: true,
            replies: true,
          },
        },
      },
    });

    revalidatePath(getCommentsPath(comicId, episodeId, isAdmin));

    return { success: true, comment };
  } catch (error) {
    console.error("Failed to create comment:", error);
    return { success: false, error: "Failed to create comment" };
  }
}

export async function getComments(episodeId: string) {
  try {
    if (!episodeId) {
      throw new Error("Episode ID is required");
    }

    const userId = await getDbUserId();

    const comments = await prisma.comment.findMany({
      where: {
        episodeId,
      },
      include: {
        author: {
          select: {
            id: true,
            fullname: true,
            image: true,
          },
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                fullname: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        likes: userId
          ? {
              where: { userId },
              select: {
                id: true,
                commentId: true,
                userId: true,
                createdAt: true,
              },
            }
          : false,
        dislikes: userId
          ? {
              where: { userId },
              select: {
                id: true,
                commentId: true,
                userId: true,
                createdAt: true,
              },
            }
          : false,
        _count: {
          select: {
            likes: true,
            dislikes: true,
            replies: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const normalizedComments = comments.map((comment) => ({
      ...comment,
      viewerLiked: Array.isArray(comment.likes)
        ? comment.likes.length > 0
        : false,
      viewerDisliked: Array.isArray(comment.dislikes)
        ? comment.dislikes.length > 0
        : false,
    }));

    return {
      success: true,
      comments: normalizedComments,
    };
  } catch (error) {
    console.error("Failed to get comments:", error);
    return {
      success: false,
      error: "Failed to fetch comments",
      comments: [],
    };
  }
}

export async function getCommentsCount(episodeId: string) {
  try {
    if (!episodeId) {
      throw new Error("Episode ID is required");
    }

    const count = await prisma.comment.count({
      where: {
        episodeId,
      },
    });

    return {
      success: true,
      count,
    };
  } catch (error) {
    console.error("Failed to get comments count:", error);
    return {
      success: false,
      error: "Failed to fetch comments count",
      count: 0,
    };
  }
}
