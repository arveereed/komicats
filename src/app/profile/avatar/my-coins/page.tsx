import { syncUserCoins } from "@/actions/coin.action";
import MyCoinsComponent from "@/components/MyCoinsComponent";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function generateMetadata() {
  return {
    title: `Komicats | My Coins`,
    description: `Welcome to Komicats's profile.`,
  };
}

export default async function MyCoinsPage() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect("/auth/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: {
      id: true,
      coins: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  await syncUserCoins();

  const [plans, totalPurchasedCoins] = await Promise.all([
    prisma.coinPlan.findMany({
      where: { isActive: true },
      include: {
        features: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { priceAmount: "asc" },
    }),

    prisma.coinPurchase.count({
      where: {
        userId: user.id,
        status: "PAID",
      },
    }),
  ]);

  const coins = user.coins ?? 0;

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
      <MyCoinsComponent
        stats={{
          coins,
          purchased: totalPurchasedCoins,
          played: 0,
        }}
      />
    </div>
  );
}
