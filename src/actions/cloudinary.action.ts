"use server";

import cloudinary from "@/lib/cloudinary";
import { auth } from "@clerk/nextjs/server";

export async function uploadFileToCloudinary(formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    return {
      success: false,
      message: "Unauthorized",
      url: null,
    };
  }

  try {
    const file = formData.get("file") as File | null;
    const folder = formData.get("folder")?.toString() || "uploads";

    if (!file || file.size === 0) {
      return {
        success: false,
        message: "No file provided",
        url: null,
      };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<{
      secure_url: string;
    }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            resource_type: "image",
          },
          (error, result) => {
            if (error || !result) {
              reject(error || new Error("Upload failed"));
              return;
            }

            resolve({
              secure_url: result.secure_url,
            });
          },
        )
        .end(buffer);
    });

    return {
      success: true,
      message: "Image uploaded successfully",
      url: result.secure_url,
    };
  } catch (error) {
    console.error("UPLOAD_IMAGE_ERROR", error);

    return {
      success: false,
      message: "Failed to upload image",
      url: null,
    };
  }
}
