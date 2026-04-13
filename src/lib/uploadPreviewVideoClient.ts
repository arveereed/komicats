type UploadPreviewVideoResult = {
  secure_url: string;
  public_id: string;
};

export async function uploadPreviewVideoClient(file: File) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_VIDEO_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Missing Cloudinary upload environment variables.");
  }

  if (!file) {
    throw new Error("No file selected.");
  }

  if (!file.type.startsWith("video/")) {
    throw new Error("Please upload a valid video file.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const data = (await response.json()) as
    | UploadPreviewVideoResult
    | { error?: { message?: string } };

  if (!response.ok || !("secure_url" in data) || !("public_id" in data)) {
    throw new Error(
      ("error" in data && data.error?.message) || "Video upload failed.",
    );
  }

  return {
    url: data.secure_url,
    publicId: data.public_id,
  };
}
