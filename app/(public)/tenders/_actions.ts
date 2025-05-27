'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { tenders } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

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

    // First, fetch the tender to verify ownership
    const tender = await database
      .select({
        id: tenders.id,
        userId: tenders.userId,
        title: tenders.title,
      })
      .from(tenders)
      .where(and(eq(tenders.id, tenderId), eq(tenders.deleted, false)))
      .limit(1);

    if (!tender.length) {
      return { success: false, error: 'Tender not found' };
    }

    // Check if user owns the tender
    if (tender[0].userId !== user.id) {
      return { success: false, error: 'Unauthorized: You can only delete your own tenders' };
    }

    // Perform soft delete
    await database
      .update(tenders)
      .set({
        deleted: true,
        updatedAt: new Date(),
      })
      .where(eq(tenders.id, tenderId));

    // Revalidate the tenders list page
    revalidatePath('/tenders');

    return { success: true };
  } catch (error) {
    console.error('Error deleting tender:', error);
    return { 
      success: false, 
      error: 'Failed to delete tender. Please try again.' 
    };
  }
} 