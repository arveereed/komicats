"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { uploadFileToCloudinary } from "./cloudinary.action";
import cloudinary from "@/lib/cloudinary";

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

  const profile = await prisma.profile.findFirst({
    where: { id, userId },
    select: {
      id: true,
      cloudinaryPublicId: true,
    },
  });

  if (!profile) {
    throw new Error("Profile not found");
  }

  const folderPath = `profiles/${userId}/${profile.id}`;

  try {
    if (profile.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(profile.cloudinaryPublicId, {
        resource_type: "image",
        invalidate: true,
      });
    }

    await cloudinary.api.delete_resources_by_prefix(folderPath, {
      resource_type: "image",
      type: "upload",
      invalidate: true,
    });

    try {
      await cloudinary.api.delete_folder(folderPath);
    } catch (folderError) {
      console.error("CLOUDINARY_DELETE_PROFILE_FOLDER_ERROR", folderError);
    }
  } catch (cloudinaryError) {
    console.error("CLOUDINARY_DELETE_PROFILE_ASSETS_ERROR", cloudinaryError);
  }

  await prisma.profile.delete({
    where: { id: profile.id },
  });

  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath("/profile/avatar");
  revalidatePath("/settings");
}

type UpdateProfileResult =
  | {
      success: true;
      message: string;
      profile: {
        id: string;
        name: string;
        image: string;
        cloudinaryPublicId: string | null;
      };
    }
  | {
      success: false;
      message: string;
    };

export async function updateProfile(
  formData: FormData,
): Promise<UpdateProfileResult> {
  const { userId } = await auth();

  if (!userId) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  try {
    const profileId = formData.get("profileId")?.toString().trim();
    const name = formData.get("name")?.toString().trim();
    const file = formData.get("image") as File | null;

    if (!profileId) {
      return {
        success: false,
        message: "Profile ID is required",
      };
    }

    if (!name) {
      return {
        success: false,
        message: "Profile name is required",
      };
    }

    const existingProfile = await prisma.profile.findFirst({
      where: {
        id: profileId,
        userId,
      },
      select: {
        id: true,
        name: true,
        image: true,
        cloudinaryPublicId: true,
        userId: true,
      },
    });

    if (!existingProfile) {
      return {
        success: false,
        message: "Profile not found",
      };
    }

    let nextImageUrl = existingProfile.image;
    let nextCloudinaryPublicId = existingProfile.cloudinaryPublicId;

    if (file && file.size > 0) {
      if (!file.type.startsWith("image/")) {
        return {
          success: false,
          message: "Only image files are allowed",
        };
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        return {
          success: false,
          message: "Image must be 5MB or less",
        };
      }

      if (existingProfile.cloudinaryPublicId) {
        try {
          await cloudinary.uploader.destroy(
            existingProfile.cloudinaryPublicId,
            {
              resource_type: "image",
              invalidate: true,
            },
          );
        } catch (deleteError) {
          console.error(
            "CLOUDINARY_DELETE_OLD_PROFILE_IMAGE_ERROR",
            deleteError,
          );
        }
      }

      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("folder", `profiles/${userId}/${profileId}`);

      const uploadResult = await uploadFileToCloudinary(uploadFormData);

      if (
        !uploadResult.success ||
        !uploadResult.url ||
        !uploadResult.publicId
      ) {
        return {
          success: false,
          message: uploadResult.message || "Failed to upload new image",
        };
      }

      nextImageUrl = uploadResult.url;
      nextCloudinaryPublicId = uploadResult.publicId;
    }

    const updatedProfile = await prisma.profile.update({
      where: {
        id: existingProfile.id,
      },
      data: {
        name,
        image: nextImageUrl,
        cloudinaryPublicId: nextCloudinaryPublicId,
      },
      select: {
        id: true,
        name: true,
        image: true,
        cloudinaryPublicId: true,
      },
    });

    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath("/profile/avatar");
    revalidatePath("/settings");

    return {
      success: true,
      message: "Profile updated successfully",
      profile: updatedProfile,
    };
  } catch (error) {
    console.error("UPDATE_PROFILE_ERROR", error);

    return {
      success: false,
      message: "Failed to update profile",
    };
  }
}
