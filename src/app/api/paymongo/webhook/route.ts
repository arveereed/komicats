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
          metadata?: Record<string, unknown>;
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
    const checkoutSessionId = payloadData?.id ?? null;
    const paymentId = payloadData?.attributes?.payment_id ?? null;
    const referenceNumber = payloadData?.attributes?.reference_number ?? null;
    const metadata = payloadData?.attributes?.metadata ?? {};

    if (eventType !== "checkout_session.payment.paid") {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const purchaseId =
      typeof metadata.purchaseId === "string" ? metadata.purchaseId : null;

    const purchase =
      (checkoutSessionId
        ? await prisma.coinPurchase.findUnique({
            where: { paymongoCheckoutId: checkoutSessionId },
          })
        : null) ||
      (referenceNumber
        ? await prisma.coinPurchase.findUnique({
            where: { referenceNumber },
          })
        : null) ||
      (purchaseId
        ? await prisma.coinPurchase.findUnique({
            where: { id: purchaseId },
          })
        : null);

    if (!purchase) {
      console.error("Purchase not found for webhook", {
        checkoutSessionId,
        referenceNumber,
        metadata,
      });

      return NextResponse.json(
        { received: true, error: "Purchase not found" },
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
      const freshPurchase = await tx.coinPurchase.findUnique({
        where: { id: purchase.id },
      });

      if (!freshPurchase) {
        throw new Error("Purchase not found during transaction");
      }

      if (freshPurchase.status === "PAID") {
        return;
      }

      if (freshPurchase.status !== "PENDING") {
        throw new Error(
          `Purchase is not payable anymore. Current status: ${freshPurchase.status}`,
        );
      }

      const updatedUser = await tx.user.update({
        where: { id: freshPurchase.userId },
        data: {
          coins: {
            increment: freshPurchase.totalCoins,
          },
        },
        select: {
          coins: true,
        },
      });

      await tx.coinPurchase.update({
        where: { id: freshPurchase.id },
        data: {
          status: "PAID",
          paymongoCheckoutId:
            checkoutSessionId ?? freshPurchase.paymongoCheckoutId,
          paymongoPaymentId: paymentId ?? freshPurchase.paymongoPaymentId,
        },
      });

      await tx.coinTransaction.create({
        data: {
          userId: freshPurchase.userId,
          purchaseId: freshPurchase.id,
          type: "CREDIT",
          amount: freshPurchase.totalCoins,
          balanceAfter: updatedUser.coins,
          description: `Purchased ${freshPurchase.planName}`,
        },
      });
    });

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("PayMongo webhook error:", error);

    return NextResponse.json(
      { received: true, error: "Webhook handler failed" },
      { status: 200 },
    );
  }
}
