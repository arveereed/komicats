"use server";

import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

async function ensureAdmin() {
  const clerkUser = await currentUser();
  const adminEmail = process.env.ADMIN_EMAIL;

  const isAdmin =
    !!adminEmail && clerkUser?.emailAddresses[0]?.emailAddress === adminEmail;

  if (!isAdmin) {
    throw new Error("Unauthorized");
  }
}

function parseFeatures(featuresText: string) {
  return featuresText
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parsePriceToCentavos(price: string) {
  const cleaned = price.replace(/[^0-9.]/g, "").trim();

  if (!cleaned) return 0;

  const parsed = Number(cleaned);
  if (Number.isNaN(parsed)) return 0;

  return Math.round(parsed * 100);
}

export async function createCoinPlan(
  prevState: { success: boolean; message: string },
  formData: FormData,
) {
  await ensureAdmin();

  try {
    const name = String(formData.get("name") || "").trim();
    const slug = String(formData.get("slug") || "").trim();
    const coins = Number(formData.get("coins") || 0);
    const bonusCoins = Number(formData.get("bonusCoins") || 0);
    const priceInput = String(formData.get("priceAmount") || "").trim();
    const isPopular = formData.get("isPopular") === "on";
    const isActive = formData.get("isActive") === "on";
    const featuresText = String(formData.get("features") || "").trim();

    const features = parseFeatures(featuresText);
    const priceAmount = parsePriceToCentavos(priceInput);

    if (!name) throw new Error("Name is required");
    if (!slug) throw new Error("Slug is required");
    if (coins < 0) throw new Error("Coins must be 0 or greater");
    if (bonusCoins < 0) throw new Error("Bonus coins must be 0 or greater");
    if (priceAmount <= 0) throw new Error("Price must be greater than 0");

    await prisma.coinPlan.create({
      data: {
        name,
        slug,
        coins,
        bonusCoins,
        priceAmount,
        isPopular,
        isActive,
        features: {
          create: features.map((label, index) => ({
            label,
            order: index,
          })),
        },
      },
    });

    revalidatePath("/admin");

    return {
      success: true,
      message: "Plan created successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to create plan.",
    };
  }
}

export async function updateCoinPlan(formData: FormData) {
  await ensureAdmin();

  const id = String(formData.get("id") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const slug = String(formData.get("slug") || "").trim();
  const coins = Number(formData.get("coins") || 0);
  const bonusCoins = Number(formData.get("bonusCoins") || 0);
  const priceInput = String(formData.get("priceAmount") || "").trim();
  const isPopular = formData.get("isPopular") === "on";
  const isActive = formData.get("isActive") === "on";
  const featuresText = String(formData.get("features") || "").trim();

  const features = parseFeatures(featuresText);
  const priceAmount = parsePriceToCentavos(priceInput);

  if (!id) throw new Error("Plan id is required");
  if (!name) throw new Error("Name is required");
  if (!slug) throw new Error("Slug is required");
  if (coins < 0) throw new Error("Coins must be 0 or greater");
  if (bonusCoins < 0) throw new Error("Bonus coins must be 0 or greater");
  if (priceAmount <= 0) throw new Error("Price must be greater than 0");

  await prisma.coinPlan.update({
    where: { id },
    data: {
      name,
      slug,
      coins,
      bonusCoins,
      priceAmount,
      isPopular,
      isActive,
      features: {
        deleteMany: {},
        create: features.map((label, index) => ({
          label,
          order: index,
        })),
      },
    },
  });

  revalidatePath("/admin");
}

export async function deleteCoinPlan(formData: FormData) {
  await ensureAdmin();

  const id = String(formData.get("id") || "").trim();

  if (!id) throw new Error("Plan id is required");

  await prisma.coinPlan.delete({
    where: { id },
  });

  revalidatePath("/admin");
}
