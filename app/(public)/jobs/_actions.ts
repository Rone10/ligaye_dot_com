'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { getUser } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { savedJobs, profiles } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { invalidateUserSavedJobsCache } from './_queries';

/**
 * Toggle saving/unsaving a job for the current user
 */
export async function toggleSaveJob(jobId: string) {
  // Get current authenticated user
  const user = await getUser();
  
  if (!user) {
    throw new Error('You must be logged in to save jobs');
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
    
    if (existingSave.length) {
      // Toggle the deleted state to effectively save/unsave
      const newDeletedState = !existingSave[0].deleted;
      
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
    }
    
    // OPTIMIZED: Smart cache invalidation using hierarchical tags
    await Promise.all([
      invalidateUserSavedJobsCache(user.id), // Invalidate user-specific cache
      revalidatePath('/jobs'), // Update jobs page
      revalidatePath('/candidate/saved-jobs'), // Update saved jobs page
      revalidateTag('saved-jobs-collection') // Invalidate saved jobs collection
    ]);
    
    return { success: true };
  } catch (error) {
    console.error('Error toggling job save:', error);
    throw new Error('Failed to save job');
  }
} 