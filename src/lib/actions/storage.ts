"use server";

import { createClient } from "@/lib/supabase/server";

const BUCKET = "menu-images";

/**
 * Upload an image to Supabase Storage and return the public URL.
 * Images are stored in the "menu-images" bucket.
 */
export async function uploadMenuImage(formData: FormData): Promise<{
  url?: string;
  error?: string;
}> {
  const supabase = await createClient();
  const file = formData.get("file") as File;

  if (!file || file.size === 0) {
    return { error: "No file provided" };
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return { error: "Only JPEG, PNG, and WebP images are allowed" };
  }

  // Limit to 2MB
  if (file.size > 2 * 1024 * 1024) {
    return { error: "Image must be under 2MB" };
  }

  // Generate unique filename
  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const filePath = `items/${fileName}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) return { error: error.message };

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(filePath);

  return { url: urlData.publicUrl };
}

/**
 * Delete an image from Supabase Storage
 */
export async function deleteMenuImage(imageUrl: string) {
  const supabase = await createClient();

  // Extract path from URL
  const urlParts = imageUrl.split(`/storage/v1/object/public/${BUCKET}/`);
  if (urlParts.length < 2) return;

  const filePath = urlParts[1];
  await supabase.storage.from(BUCKET).remove([filePath]);
}
