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
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const [plans, totalPurchasedCoins, totalPlayedCoins] = await Promise.all([
    prisma.coinPlan.findMany({
      where: { isActive: true },
      include: {
        features: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { priceAmount: "asc" },
    }),

    prisma.coinPurchase.aggregate({
      where: {
        userId: user.id,
      },
      _sum: {
        totalCoins: true,
      },
    }),

    prisma.coinTransaction.aggregate({
      where: {
        userId: user.id,
        type: "DEBIT",
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  const purchased = totalPurchasedCoins._sum.totalCoins ?? 0;
  const played = totalPlayedCoins._sum.amount ?? 0;

  await syncUserCoins();

  return (
    <ShopComponent
      stats={{
        coins: purchased,
        purchased,
        played,
      }}
      plans={plans}
      paymentStatus={params.status}
      referenceNumber={params.ref}
    />
  );
}
