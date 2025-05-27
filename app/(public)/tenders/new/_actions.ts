'use server';

import { redirect } from 'next/navigation';
import { getUser } from '@/lib/supabase/server';
import { newTenderSchema, type NewTenderSchemaType } from './_utils/validation';
import { insertTender } from './_queries';
import { Tender } from '@/lib/db/schema';
import { toast } from 'sonner';

export async function createTenderAction(formData: NewTenderSchemaType): Promise<{
  success: boolean;
  tenderId?: string;
  error?: string;
}> {
  let tender: Tender | null = null;
  try {
   
    // Get current user from Supabase Auth
    const user = await getUser();
    if (!user) {
      return { success: false, error: 'Authentication required' };
    }

    // Validate form data
    const validatedData = newTenderSchema.parse(formData);

    // Insert tender into database (user.id is the Supabase Auth user ID)
    tender = await insertTender(validatedData, user.id);

    // Redirect to tender detail page on success

  } catch (error) {
    console.error('Error creating tender:', error);
    
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to create tender' };
  }
  // show toast notification
  toast.success('Tender created successfully');
  redirect(`/tenders/${tender.id}`);
} 