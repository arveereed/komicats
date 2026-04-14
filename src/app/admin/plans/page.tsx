import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import CoinPlan from "./coin-plan";

export default async function AdminPlansPage() {
  const clerkUser = await currentUser();
  const adminEmail = process.env.ADMIN_EMAIL;
  const isAdmin =
    !!adminEmail && clerkUser?.emailAddresses[0]?.emailAddress === adminEmail;

  if (!isAdmin) {
    return notFound();
  }

  const plans = await prisma.coinPlan.findMany({
    include: {
      features: {
        orderBy: {
          order: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return <CoinPlan plans={plans} />;
}
