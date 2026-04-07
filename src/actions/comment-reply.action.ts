"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";

export async function getCommentReplies(commentId: string) {
  try {
    if (!commentId) {
      throw new Error("Comment ID is required");
    }

    const replies = await prisma.commentReply.findMany({
      where: {
        commentId,
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
        createdAt: "asc",
      },
    });

    return {
      success: true,
      replies,
    };
  } catch (error) {
    console.error("Failed to get comment replies:", error);
    return {
      success: false,
      error: "Failed to fetch replies",
      replies: [],
    };
  }
}

export async function createCommentReply(
  commentId: string,
  content: string,
  comicId: string,
  episodeId: string,
  isAdmin = false,
) {
  try {
    const userId = await getDbUserId();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    if (!content.trim()) {
      throw new Error("Reply content is required");
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true },
    });

    if (!comment) {
      throw new Error("Comment not found");
    }

    const reply = await prisma.commentReply.create({
      data: {
        content: content.trim(),
        commentId,
        authorId: userId,
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
    });

    const path = isAdmin
      ? `/admin/comics/${comicId}/episode/${episodeId}/comments`
      : `/profile/avatar/comics/${comicId}/episode/${episodeId}/comments`;

    revalidatePath(path);

    return {
      success: true,
      reply,
    };
  } catch (error) {
    console.error("Failed to create comment reply:", error);
    return {
      success: false,
      error: "Failed to create reply",
    };
  }
}
