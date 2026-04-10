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

export async function getActiveProfileId() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { activeProfileId: true },
  });

  return user?.activeProfileId ?? null;
}

export async function setActiveProfile(profileId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const profile = await prisma.profile.findFirst({
    where: {
      id: profileId,
      userId,
    },
    select: { id: true },
  });

  if (!profile) {
    throw new Error("Profile not found");
  }

  await prisma.user.update({
    where: { clerkId: userId },
    data: { activeProfileId: profileId },
  });

  revalidatePath("/");
  revalidatePath("/profile/avatar");
}

export async function clearActiveProfile() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await prisma.user.update({
    where: { clerkId: userId },
    data: { activeProfileId: null },
  });

  revalidatePath("/");
  revalidatePath("/profile/avatar");
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
