'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getUser } from '@/lib/supabase/server';
import { newTenderSchema, type NewTenderSchemaType } from './_utils/validation';
import { insertTender, createTenderWithDocuments, saveTenderDocumentMetadata } from './_queries';
import { uploadTenderDocument } from '@/lib/utils/file-upload';

export async function createTenderAction(formData: NewTenderSchemaType): Promise<{
  success: boolean;
  tenderId?: string;
  error?: string;
}> {
  try {
    // Get current user from Supabase Auth
    const user = await getUser();
    if (!user) {
      return { success: false, error: 'Authentication required' };
    }

    // Validate form data
    const validatedData = newTenderSchema.parse(formData);

    // Insert tender into database (user.id is the Supabase Auth user ID)
    const tender = await insertTender(validatedData, user.id);

    // Return success with tender ID for client-side handling
    return { success: true, tenderId: tender.id };

  } catch (error) {
    console.error('Error creating tender:', error);
    
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to create tender' };
  }
}

export async function createTenderWithDocumentsAction(
  formData: FormData
): Promise<{ success: boolean; tenderId?: string; error?: string }> {
  try {
    // Get authenticated user
    const user = await getUser();
    if (!user) {
      return { success: false, error: 'Authentication required' };
    }

    // Extract form data
    const tenderData = Object.fromEntries(formData.entries());
    const files = formData.getAll('files') as File[];

    // Parse deadline if provided
    let deadline: Date | undefined;
    if (tenderData.deadline && typeof tenderData.deadline === 'string') {
      deadline = new Date(tenderData.deadline);
    }

    // Validate tender data
    const validatedData = newTenderSchema.parse({
      ...tenderData,
      deadline,
      documentsArePaid: tenderData.documentsArePaid === 'true',
      documentPrice: tenderData.documentPrice ? parseFloat(tenderData.documentPrice as string) : undefined,
    });

    // Create tender first
    const tender = await createTenderWithDocuments({
      ...validatedData,
      userId: user.id,
    });

    if (!tender.success || !tender.tenderId) {
      return { success: false, error: tender.error || 'Failed to create tender' };
    }

    // Upload documents if any
    if (files.length > 0) {
      const uploadResults = await Promise.allSettled(
        files.map(file => uploadTenderDocument({
          file,
          tenderId: tender.tenderId!
        }))
      );

      // Check for upload failures
      const failedUploads = uploadResults.filter(result => 
        result.status === 'rejected' || !result.value.success
      );

      if (failedUploads.length > 0) {
        console.warn(`${failedUploads.length} file uploads failed`);
        // Continue anyway - tender is created, some files may have uploaded
      }

      // Save successful uploads to database
      const successfulUploads = uploadResults
        .filter((result): result is PromiseFulfilledResult<any> => 
          result.status === 'fulfilled' && result.value.success
        )
        .map((result, index) => ({
          tenderId: tender.tenderId!,
          storagePath: result.value.storagePath!,
          originalFilename: files[index].name,
          fileSize: files[index].size,
          mimeType: files[index].type,
        }));

      if (successfulUploads.length > 0) {
        await saveTenderDocumentMetadata(successfulUploads);
      }
    }

    revalidatePath('/tenders');
    revalidatePath(`/tenders/${tender.tenderId}`);

    return { success: true, tenderId: tender.tenderId };
  } catch (error) {
    console.error('Create tender with documents error:', error);
    return { success: false, error: 'Failed to create tender' };
  }
} 