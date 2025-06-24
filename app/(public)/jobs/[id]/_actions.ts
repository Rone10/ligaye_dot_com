'use server';

import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { savedJobs, profiles } from '@/lib/db/schema';
import { getUser } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { 
  invalidateUserSavedJobCache, 
  invalidateJobDetailCache 
} from './_queries';

/**
 * OPTIMIZED: Toggle the saved state of a job with single query and comprehensive cache invalidation
 */
export async function toggleSaveJob(jobId: string) {
  const user = await getUser();
  
  if (!user) {
    throw new Error('You must be logged in to save a job');
  }
  
  try {
    // OPTIMIZED: Single query to check existing save status with JOIN
    const existingSave = await db()
      .select({ 
        userId: savedJobs.userId,
        deleted: savedJobs.deleted 
      })
      .from(savedJobs)
      .innerJoin(profiles, eq(savedJobs.userId, profiles.id))
      .where(
        and(
          eq(profiles.userId, user.id),
          eq(savedJobs.jobId, jobId)
        )
      )
      .limit(1);
    
    let isSaved: boolean;
    
    if (existingSave.length) {
      // Toggle the deleted state to effectively save/unsave
      const newDeletedState = !existingSave[0].deleted;
      isSaved = !newDeletedState;
      
      await db()
        .update(savedJobs)
        .set({ 
          deleted: newDeletedState,
          // If undeleting, update timestamp
          ...(newDeletedState ? {} : { createdAt: new Date() })
        })
        .where(
          and(
            eq(savedJobs.userId, existingSave[0].userId),
            eq(savedJobs.jobId, jobId)
          )
        );
    } else {
      // Get profile ID for new save record
      const profileResult = await db()
        .select({ id: profiles.id })
        .from(profiles)
        .where(eq(profiles.userId, user.id))
        .limit(1);
        
      if (!profileResult.length) {
        throw new Error('User profile not found');
      }
      
      // Create new save record
      await db()
        .insert(savedJobs)
        .values({
          userId: profileResult[0].id,
          jobId: jobId,
          deleted: false,
          createdAt: new Date()
        });
      
      isSaved = true;
    }
    
    // OPTIMIZED: Comprehensive on-demand cache invalidation
    await Promise.all([
      invalidateUserSavedJobCache(user.id, jobId), // User-specific saved job cache
      invalidateJobDetailCache(jobId), // Job detail and related caches
      revalidatePath(`/jobs/${jobId}`), // Update job detail page
      revalidatePath('/jobs'), // Update jobs listing
      revalidatePath('/candidate/saved-jobs'), // Update saved jobs page
      revalidatePath('/employers'), // Update employers page
      revalidatePath('/tenders'), // Update tenders page
      revalidatePath('/admin/jobs'), // Update admin jobs page
      revalidatePath('/admin/payments') // Update admin payments page
    ]);
    
    return { success: true, isSaved };
  } catch (error) {
    console.error('Error toggling job save:', error);
    throw new Error('Failed to save job');
  }
} 