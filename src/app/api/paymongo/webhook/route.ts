import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

type PayMongoWebhookEvent = {
  data?: {
    id?: string;
    attributes?: {
      type?: string;
      data?: {
        id?: string;
        attributes?: {
          payment_id?: string;
          reference_number?: string;
          metadata?: Record<string, string>;
        };
      };
    };
  };
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PayMongoWebhookEvent;

    const eventType = body?.data?.attributes?.type;
    const payloadData = body?.data?.attributes?.data;
    const checkoutSessionId = payloadData?.id;
    const paymentId = payloadData?.attributes?.payment_id;
    const referenceNumber = payloadData?.attributes?.reference_number;
    const metadata = payloadData?.attributes?.metadata ?? {};

    if (eventType !== "checkout_session.payment.paid") {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const purchase =
      (checkoutSessionId
        ? await prisma.coinPurchase.findUnique({
            where: { paymongoCheckoutId: checkoutSessionId },
            include: { user: true },
          })
        : null) ||
      (referenceNumber
        ? await prisma.coinPurchase.findUnique({
            where: { referenceNumber },
            include: { user: true },
          })
        : null) ||
      (metadata.purchaseId
        ? await prisma.coinPurchase.findUnique({
            where: { id: metadata.purchaseId },
            include: { user: true },
          })
        : null);

    if (!purchase) {
      console.error("Purchase not found for webhook", {
        checkoutSessionId,
        referenceNumber,
        metadata,
      });
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 200 },
      );
    }

    if (purchase.status === "PAID") {
      return NextResponse.json(
        { received: true, duplicate: true },
        { status: 200 },
      );
    }

    await prisma.$transaction(async (tx) => {
      const freshUser = await tx.user.findUnique({
        where: { id: purchase.userId },
      });

      if (!freshUser) throw new Error("User not found");

      const newBalance = freshUser.coins + purchase.totalCoins;

      await tx.coinPurchase.update({
        where: { id: purchase.id },
        data: {
          status: "PAID",
          paymongoPaymentId: paymentId ?? purchase.paymongoPaymentId,
        },
      });

      await tx.user.update({
        where: { id: purchase.userId },
        data: {
          coins: {
            increment: purchase.totalCoins,
          },
        },
      });

      await tx.coinTransaction.create({
        data: {
          userId: purchase.userId,
          purchaseId: purchase.id,
          type: "CREDIT",
          amount: purchase.totalCoins,
          balanceAfter: newBalance,
          description: `Purchased ${purchase.totalCoins} coins via PayMongo`,
        },
      });
    });

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("PayMongo webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 200 },
    );
  }
}
