'use server';

import { getUser } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { tenders } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getUserProfile } from './_queries';

export async function deleteTenderAction(tenderId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Get current user
    const user = await getUser();
    if (!user) {
      return { success: false, error: 'Authentication required' };
    }

    

    const database = await db();

    // First, check if the tender exists and belongs to the user
    const existingTender = await database
      .select()
      .from(tenders)
      .where(and(
        eq(tenders.id, tenderId),
        eq(tenders.deleted, false)
      ))
      .limit(1);

    
      const profile = await getUserProfile(user?.id || '');
  // const isOwner = profile?.id === existingTender[0].userId;
  

    if (existingTender.length === 0) {
      return { success: false, error: 'Tender not found' };
    }

    if (existingTender[0].userId !== profile?.id) {
      return { success: false, error: 'Unauthorized to delete this tender' };
    }

    // Soft delete the tender
    await database
      .update(tenders)
      .set({ 
        deleted: true,
        status: 'DELETED',
        updatedAt: new Date()
      })
      .where(eq(tenders.id, tenderId));

    // Revalidate the tenders list page
    revalidatePath('/tenders');

    return { success: true };
  } catch (error) {
    console.error('Error deleting tender:', error);
    return { success: false, error: 'Failed to delete tender' };
  }
} 