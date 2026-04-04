import ShopComponent from "@/components/ShopComponent";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function ShopPage() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect("/auth/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: {
      purchases: {
        where: { status: "PAID" },
        select: { totalCoins: true },
      },
      transactions: {
        where: { type: "DEBIT" },
        select: { amount: true },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const plans = await prisma.coinPlan.findMany({
    where: { isActive: true },
    include: {
      features: {
        orderBy: { order: "asc" },
      },
    },
    orderBy: { priceAmount: "asc" },
  });

  const purchased = user.purchases.reduce((sum, p) => sum + p.totalCoins, 0);
  const played = user.transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <ShopComponent
      stats={{
        coins: user.coins,
        purchased,
        played,
      }}
      plans={plans}
    />
  );
}
