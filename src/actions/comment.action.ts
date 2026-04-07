"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";

export async function createComment(
  episodeId: string,
  content: string,
  comicId: string,
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

    revalidatePath(
      `/profile/avatar/comics/${comicId}/episode/${episodeId}/comments`,
    );
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
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      comments,
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
