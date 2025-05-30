import { supabaseAdmin } from '@/lib/supabase/admin';
import { v4 as uuidv4 } from 'uuid';

export interface UploadFileParams {
  file: File;
  tenderId: string;
  bucket?: string;
}

export interface UploadResult {
  success: boolean;
  storagePath?: string;
  error?: string;
}

export async function uploadTenderDocument({
  file,
  tenderId,
  bucket = 'tender-documents'
}: UploadFileParams): Promise<UploadResult> {
  try {
    // Validate file
    const validationResult = validateFile(file);
    if (!validationResult.valid) {
      return { success: false, error: validationResult.error };
    }

    // Generate unique storage path
    const documentId = uuidv4();
    const fileExtension = file.name.split('.').pop();
    const storagePath = `${tenderId}/${documentId}-${file.name}`;

    // Check if admin client is available
    if (!supabaseAdmin) {
      return { success: false, error: 'Storage service unavailable' };
    }

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Storage upload error:', error);
      return { success: false, error: 'Failed to upload file' };
    }

    return { success: true, storagePath };
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, error: 'Upload failed' };
  }
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  // File size validation (50MB max)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 50MB' };
  }

  // File type validation
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/zip'
  ];

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not supported' };
  }

  return { valid: true };
}

export async function deleteTenderDocument(storagePath: string): Promise<boolean> {
  try {
    // Check if admin client is available
    if (!supabaseAdmin) {
      console.error('Storage service unavailable for deletion');
      return false;
    }

    const { error } = await supabaseAdmin.storage
      .from('tender-documents')
      .remove([storagePath]);

    if (error) {
      console.error('Storage delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
}

export async function generateSignedUrl(storagePath: string, expiresIn: number = 900): Promise<string | null> {
  try {
    // Check if admin client is available
    if (!supabaseAdmin) {
      console.error('Storage service unavailable for signed URL generation');
      return null;
    }

    const { data, error } = await supabaseAdmin.storage
      .from('tender-documents')
      .createSignedUrl(storagePath, expiresIn);

    if (error) {
      console.error('Signed URL error:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Signed URL generation error:', error);
    return null;
  }
} 