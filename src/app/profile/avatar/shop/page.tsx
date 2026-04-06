import { syncUserCoins } from "@/actions/coin.action";
import ShopComponent from "@/components/ShopComponent";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

type ShopPageProps = {
  searchParams: Promise<{
    status?: string;
    ref?: string;
  }>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect("/auth/sign-in");
  }

  const params = await searchParams;

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

  const [plans, totalPurchasedCoins, coins] = await Promise.all([
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

    await prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        coins: true,
      },
    }),
  ]);

  return (
    <ShopComponent
      stats={{
        coins: coins?.coins ?? 0,
        purchased: totalPurchasedCoins,
        played: 0,
      }}
      plans={plans}
      paymentStatus={params.status}
      referenceNumber={params.ref}
    />
  );
}
