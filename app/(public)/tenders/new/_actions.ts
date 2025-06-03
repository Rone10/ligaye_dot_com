'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getUser } from '@/lib/supabase/server';
import { newTenderSchema, type NewTenderSchemaType } from './_utils/validation';
import { insertTender, createTenderWithDocuments, saveTenderDocumentMetadata } from './_queries';
import { uploadTenderDocument } from '@/lib/utils/file-upload';

// Simple test action to verify Server Actions are working
export async function testAction(): Promise<{ success: boolean; message: string }> {
  return { success: true, message: 'Server Action is working!' };
}

export async function createTenderAction(formData: NewTenderSchemaType): Promise<{
  success: boolean;
  tenderId?: string;
  error?: string;
}> {
  try {
    // Get current user from Supabase Auth
    const user = await getUser();
    if (!user || user.user_metadata.role !== 'employer') {
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
    if (!user || user.user_metadata.role !== 'employer') {
      return { success: false, error: 'Authentication required' };
    }

    // Extract form data
    const rawData = Object.fromEntries(formData.entries());
    const files = formData.getAll('files') as File[];

    console.log('Raw form data:', rawData);
    console.log('Files:', files.length);

    // Parse and transform form data to match schema expectations
    const tenderData: Partial<NewTenderSchemaType> = {
      title: rawData.title as string,
      description: rawData.description as string,
      organizationName: rawData.organizationName as string,
      tenderType: rawData.tenderType as any,
      sectorId: rawData.sectorId ? (rawData.sectorId as string) : '',
      locationId: rawData.locationId ? (rawData.locationId as string) : '',
      budgetRange: rawData.budgetRange ? (rawData.budgetRange as string) : '',
      contactInformation: rawData.contactInformation ? (rawData.contactInformation as string) : '',
      externalLink: rawData.externalLink ? (rawData.externalLink as string) : '',
      documentsArePaid: rawData.documentsArePaid === 'true',
      documentPrice: rawData.documentPrice ? parseFloat(rawData.documentPrice as string) : undefined,
      documentCurrency: (rawData.documentCurrency as string) || 'GMD',
      agreeToCommissionTerms: rawData.agreeToCommissionTerms === 'true',
    };

    // Parse deadline if provided
    if (rawData.deadline && typeof rawData.deadline === 'string') {
      tenderData.deadline = new Date(rawData.deadline);
    }

    console.log('Parsed tender data:', tenderData);

    // Validate tender data
    const validatedData = newTenderSchema.parse(tenderData);
    console.log('Validated data:', validatedData);

    // Create tender first
    const tender = await createTenderWithDocuments({
      ...validatedData,
      userId: user.id,
    });

    if (!tender.success || !tender.tenderId) {
      console.error('Tender creation failed:', tender.error);
      return { success: false, error: tender.error || 'Failed to create tender' };
    }

    console.log('Tender created successfully:', tender.tenderId);

    // Upload documents if any
    if (files.length > 0) {
      console.log('Uploading files...');
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
        console.log('Document metadata saved');
      }
    }

    revalidatePath('/tenders');
    revalidatePath(`/tenders/${tender.tenderId}`);

    return { success: true, tenderId: tender.tenderId };
  } catch (error) {
    console.error('Create tender with documents error:', error);
    
    // Provide more detailed error information for debugging
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to create tender' };
  }
} 