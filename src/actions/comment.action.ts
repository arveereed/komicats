"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";

export async function createComment(
  episodeId: string,
  content: string,
  comicId: string,
  isAdmin: boolean,
) {
  try {
    const userId = await getDbUserId();

    if (!userId) return;
    if (!content) throw new Error("Content is required");

    const episode = await prisma.episode.findUnique({
      where: { id: episodeId },
    });

    if (!episode) throw new Error("Episode not found");

    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: userId,
        episodeId,
      },
    });

    const readerPath = isAdmin
      ? `/admin/comics/${comicId}/episode/${episodeId}/comments`
      : `/profile/avatar/comics/${comicId}/episode/${episodeId}/comments`;

    revalidatePath(readerPath);
    return { success: true, comment };
  } catch (error) {
    console.error("Failed to create comment: ", error);
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
        _count: {
          select: {
            likes: true,
            dislikes: true,
            replies: true,
          },
        },
        likes: userId
          ? {
              where: { userId },
              select: { id: true },
            }
          : false,
        dislikes: userId
          ? {
              where: { userId },
              select: { id: true },
            }
          : false,
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
