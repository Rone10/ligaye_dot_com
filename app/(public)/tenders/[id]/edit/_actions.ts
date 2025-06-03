'use server';

import { getUser } from '@/lib/supabase/server';
import { updateTenderSchema, type UpdateTenderSchemaType } from './_utils/validation';
import { updateTender } from './_queries';
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