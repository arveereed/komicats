"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function syncUserCoins() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: {
      id: true,
      clerkId: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const totals = await prisma.coinPurchase.aggregate({
    where: {
      userId: user.id,
      status: "PAID",
    },
    _sum: {
      totalCoins: true,
    },
  });

  const totalExpenses = await prisma.comicUnlock.aggregate({
    where: {
      userId: user.id,
    },
    _sum: {
      paidCoins: true,
    },
  });

  const totalPurchased = totals._sum.totalCoins ?? 0;
  const totalSpent = totalExpenses._sum.paidCoins ?? 0;
  const totalCoins = totalPurchased - totalSpent;

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
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
