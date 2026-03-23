"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getProfiles() {
  const { userId } = await auth();
  if (!userId) return [];

  return await prisma.profile.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
}

export async function createProfile(name: string, image: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const profile = await prisma.profile.create({
    data: { name, image, userId },
  });

  revalidatePath("/select-profile"); // Adjust route as needed
  return profile;
}

export async function deleteProfile(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await prisma.profile.delete({
    where: { id, userId }, // Ensure user owns the profile
  });

  revalidatePath("/select-profile");
}
