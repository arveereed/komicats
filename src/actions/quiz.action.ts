"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";

export async function saveQuizGameResult(score: number, totalQuestions = 10) {
  const userId = await getDbUserId();

  if (!userId) {
    throw new Error("User not found");
  }

  const correctAnswers = Math.max(0, Math.min(score, totalQuestions));
  const rewardCoins = Math.min(correctAnswers, 10);

  const result = await prisma.$transaction(async (tx) => {
    const gameHistory = await tx.gameHistory.create({
      data: {
        userId,
        gameType: "QUIZ",
        totalQuestions,
        correctAnswers,
        rewardCoins,
      },
    });

    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        coins: {
          increment: rewardCoins,
        },
      },
      select: {
        id: true,
        coins: true,
      },
    });

    await tx.coinTransaction.create({
      data: {
        userId,
        type: "CREDIT",
        amount: rewardCoins,
        balanceAfter: updatedUser.coins,
        description: `Quiz reward: ${correctAnswers}/${totalQuestions}`,
      },
    });

    return {
      gameHistory,
      rewardCoins,
      balanceAfter: updatedUser.coins,
      correctAnswers,
      totalQuestions,
    };
  });

  revalidatePath("/profile/avatar/my-coins");

  return result;
}
