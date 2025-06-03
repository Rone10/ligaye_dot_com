'use server';

import { getUser } from '@/lib/supabase/server';
import { updateTenderSchema, type UpdateTenderSchemaType } from './_utils/validation';
import { updateTender, saveTenderDocumentMetadata, deleteTenderDocument, getTenderByIdForEdit } from './_queries';
import { uploadTenderDocument } from '@/lib/utils/file-upload';
import { revalidatePath } from 'next/cache';

export async function updateTenderAction(tenderId: string, formData: UpdateTenderSchemaType): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Get current user
    const user = await getUser();
    if (!user || user.user_metadata.role !== 'employer') {
      return { success: false, error: 'Authentication required' };
    }

    // Validate form data
    const validatedData = updateTenderSchema.parse({
      ...formData,
      id: tenderId,
    });

    // Update the tender
    const updatedTender = await updateTender(tenderId, validatedData, user.id);

    if (!updatedTender) {
      return { success: false, error: 'Failed to update tender or unauthorized' };
    }

    // Revalidate relevant paths
    revalidatePath('/tenders');
    revalidatePath(`/tenders/${tenderId}`);
    revalidatePath(`/tenders/${tenderId}/edit`);

    return { success: true };
  } catch (error) {
    console.error('Update tender action error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('not found') || error.message.includes('unauthorized')) {
        return { success: false, error: 'Tender not found or you do not have permission to edit it' };
      }
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'An unexpected error occurred while updating the tender' };
  }
}

export async function updateTenderWithDocumentsAction(
  tenderId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get authenticated user
    const user = await getUser();
    if (!user || user.user_metadata.role !== 'employer') {
      return { success: false, error: 'Authentication required' };
    }

    // Extract form data
    const rawData = Object.fromEntries(formData.entries());
    const files = formData.getAll('files') as File[];

    // Parse and transform form data to match schema expectations
    const tenderData: Partial<UpdateTenderSchemaType> = {
      id: tenderId,
      title: rawData.title as string,
      description: rawData.description as string,
      organizationName: rawData.organizationName as string,
      tenderType: rawData.tenderType as any,
      sectorId: rawData.sectorId ? (rawData.sectorId as string) : '',
      locationId: rawData.locationId ? (rawData.locationId as string) : '',
      budgetRange: rawData.budgetRange ? (rawData.budgetRange as string) : '',
      contactInformation: rawData.contactInformation ? (rawData.contactInformation as string) : '',
      externalLink: rawData.externalLink ? (rawData.externalLink as string) : '',
      status: rawData.status as any,
      documentsArePaid: rawData.documentsArePaid === 'true',
      documentPrice: rawData.documentPrice ? parseFloat(rawData.documentPrice as string) : undefined,
      documentCurrency: (rawData.documentCurrency as string) || 'GMD',
      agreeToCommissionTerms: rawData.agreeToCommissionTerms === 'true',
    };

    // Parse deadline if provided
    if (rawData.deadline && typeof rawData.deadline === 'string') {
      tenderData.deadline = new Date(rawData.deadline);
    }

    // Validate tender data
    const validatedData = updateTenderSchema.parse(tenderData);

    // Update the tender first
    const updatedTender = await updateTender(tenderId, validatedData, user.id);

    if (!updatedTender) {
      return { success: false, error: 'Failed to update tender or unauthorized' };
    }

    // Upload new documents if any
    if (files.length > 0) {
      const uploadResults = await Promise.allSettled(
        files.map(file => uploadTenderDocument({
          file,
          tenderId
        }))
      );

      // Check for upload failures
      const failedUploads = uploadResults.filter(result => 
        result.status === 'rejected' || !result.value.success
      );

      if (failedUploads.length > 0) {
        console.warn(`${failedUploads.length} file uploads failed`);
        // Continue anyway - tender is updated, some files may have uploaded
      }

      // Save successful uploads to database
      const successfulUploads = uploadResults
        .filter((result): result is PromiseFulfilledResult<any> => 
          result.status === 'fulfilled' && result.value.success
        )
        .map((result, index) => ({
          tenderId,
          storagePath: result.value.storagePath!,
          originalFilename: files[index].name,
          fileSize: files[index].size,
          mimeType: files[index].type,
        }));

      if (successfulUploads.length > 0) {
        await saveTenderDocumentMetadata(successfulUploads);
      }
    }

    // Revalidate relevant paths
    revalidatePath('/tenders');
    revalidatePath(`/tenders/${tenderId}`);
    revalidatePath(`/tenders/${tenderId}/edit`);

    return { success: true };
  } catch (error) {
    console.error('Update tender with documents error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('not found') || error.message.includes('unauthorized')) {
        return { success: false, error: 'Tender not found or you do not have permission to edit it' };
      }
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'An unexpected error occurred while updating the tender' };
  }
}

export async function deleteTenderDocumentAction(
  tenderId: string,
  documentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current user
    const user = await getUser();
    if (!user || user.user_metadata.role !== 'employer') {
      return { success: false, error: 'Authentication required' };
    }

    // Verify tender ownership first
    const tender = await getTenderByIdForEdit(tenderId, user.id);
    if (!tender) {
      return { success: false, error: 'Tender not found or unauthorized' };
    }

    // Delete the document
    const success = await deleteTenderDocument(documentId);
    
    if (!success) {
      return { success: false, error: 'Failed to delete document' };
    }

    // Revalidate relevant paths
    revalidatePath('/tenders');
    revalidatePath(`/tenders/${tenderId}`);
    revalidatePath(`/tenders/${tenderId}/edit`);

    return { success: true };
  } catch (error) {
    console.error('Delete document action error:', error);
    return { success: false, error: 'An unexpected error occurred while deleting the document' };
  }
} 