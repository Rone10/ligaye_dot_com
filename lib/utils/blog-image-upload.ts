import { createClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

export interface UploadBlogImageParams {
  file: File;
  bucket?: string;
}

export interface UploadBlogImageResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function uploadBlogImage({
  file,
  bucket = 'blog-images'
}: UploadBlogImageParams): Promise<UploadBlogImageResult> {
  try {
    // Validate file
    const validationResult = validateBlogImage(file);
    if (!validationResult.valid) {
      return { success: false, error: validationResult.error };
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const fileName = `${uuidv4()}.${fileExtension}`;

    // Upload to Supabase Storage
    const supabase = await createClient();
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Blog image upload error:', error);
      return { success: false, error: 'Failed to upload image' };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Blog image upload error:', error);
    return { success: false, error: 'Upload failed' };
  }
}

export async function deleteBlogImage(fileName: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.storage
      .from('blog-images')
      .remove([fileName]);

    if (error) {
      console.error('Blog image delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Blog image delete error:', error);
    return false;
  }
}

export function validateBlogImage(file: File): { valid: boolean; error?: string } {
  // File size validation (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { valid: false, error: 'Image size must be less than 5MB' };
  }

  // File type validation
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
  ];

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, WebP, and GIF images are allowed' };
  }

  return { valid: true };
}

export function extractFileNameFromUrl(url: string): string | null {
  try {
    // Extract filename from Supabase public URL
    const urlParts = url.split('/');
    return urlParts[urlParts.length - 1];
  } catch {
    return null;
  }
} 