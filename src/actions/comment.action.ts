"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";

export async function createComment(episodeId: string, content: string) {
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

    revalidatePath("/");
    return { success: true, comment };
  } catch (error) {
    console.error("Failed to create comment: ", error);
    return { success: false, error: "Failed to create comment" };
  }
}
