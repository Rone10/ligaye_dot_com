'use server';

import { redirect } from 'next/navigation';
import { getUser } from '@/lib/supabase/server';
import { newTenderSchema, type NewTenderSchemaType } from './_utils/validation';
import { insertTender } from './_queries';

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