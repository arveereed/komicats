type UploadImageResult = {
  secure_url: string;
  public_id: string;
};

export async function uploadImageClient(file: File) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_IMAGE_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Missing Cloudinary image upload environment variables.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Please upload a valid image file.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const data = (await response.json()) as
    | UploadImageResult
    | { error?: { message?: string } };

  if (!response.ok || !("secure_url" in data) || !("public_id" in data)) {
    throw new Error(
      ("error" in data && data.error?.message) || "Image upload failed.",
    );
  }

  return {
    url: data.secure_url,
    publicId: data.public_id,
  };
}
