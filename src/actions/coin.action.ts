"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { getDbUserId } from "./user.action";

export async function syncUserCoins() {
  const userId = await getDbUserId();

  if (!userId) {
    throw new Error("User not found");
  }

  const totalCoinPurchases = await prisma.coinPurchase.aggregate({
    where: {
      userId: userId,
      status: "PAID",
    },
    _sum: {
      totalCoins: true,
    },
  });

  const totalPlayed = await prisma.gameHistory.aggregate({
    where: { userId },
    _sum: { rewardCoins: true },
  });

  const totalExpenses = await prisma.comicUnlock.aggregate({
    where: {
      userId: userId,
    },
    _sum: {
      paidCoins: true,
    },
  });

  const totalPurchased = totalCoinPurchases._sum.totalCoins ?? 0;
  const totalGamesPlayed = totalPlayed._sum.rewardCoins ?? 0;
  const totalCoinsEarned = totalPurchased + totalGamesPlayed;

  const totalSpent = totalExpenses._sum.paidCoins ?? 0;
  const totalCoins = totalCoinsEarned - totalSpent;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      coins: totalCoins,
    },
    select: {
      id: true,
      coins: true,
    },
  });

  return updatedUser;
}
