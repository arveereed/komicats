"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createPayMongoCheckoutSession } from "@/lib/paymongo";
import prisma from "@/lib/prisma";

function makeReferenceNumber() {
  return `KMC-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function buyCoinsAction(formData: FormData) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect("/auth/sign-in");
  }

  const planId = String(formData.get("planId") || "");

  if (!planId) {
    throw new Error("Missing planId");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (!user) {
    throw new Error("User not found in database");
  }

  const plan = await prisma.coinPlan.findUnique({
    where: { id: planId },
  });

  if (!plan || !plan.isActive) {
    throw new Error("Invalid or inactive plan");
  }

  const referenceNumber = makeReferenceNumber();
  const totalCoins = plan.coins + plan.bonusCoins;

  const purchase = await prisma.coinPurchase.create({
    data: {
      userId: user.id,
      planId: plan.id,
      amount: plan.priceAmount,
      coins: plan.coins,
      bonusCoins: plan.bonusCoins,
      totalCoins,
      referenceNumber,
      status: "PENDING",
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    throw new Error("Missing NEXT_PUBLIC_APP_URL");
  }

  const checkout = await createPayMongoCheckoutSession({
    data: {
      attributes: {
        billing: {
          name: user.fullname,
          email: user.email,
        },
        cancel_url: `${appUrl}/shop?status=cancelled`,
        success_url: `${appUrl}/shop?status=success`,
        description: `${plan.name} - ${totalCoins} Komicats coins`,
        line_items: [
          {
            currency: "PHP",
            amount: plan.priceAmount,
            name: plan.name,
            quantity: 1,
            description: `${plan.coins} coins + ${plan.bonusCoins} bonus coins`,
          },
        ],
        payment_method_types: ["card", "gcash", "grab_pay", "paymaya"],
        reference_number: referenceNumber,
        send_email_receipt: true,
        show_description: true,
        show_line_items: true,
        metadata: {
          purchaseId: purchase.id,
          userId: user.id,
          clerkId: user.clerkId,
          planId: plan.id,
        },
      },
    },
  });

  await prisma.coinPurchase.update({
    where: { id: purchase.id },
    data: {
      paymongoCheckoutId: checkout.data.id,
    },
  });

  redirect(checkout.data.attributes.checkout_url);
}
