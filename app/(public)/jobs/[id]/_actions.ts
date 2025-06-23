'use server';

import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { savedJobs, profiles } from '@/lib/db/schema';
import { getUser } from '@/lib/supabase/server';
import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Cache invalidation helper functions
 */
export async function revalidateJobCache(jobId: string) {
  revalidateTag(`job-${jobId}`);
  revalidateTag(`related-jobs-${jobId}`);
  revalidateTag(`job-applications-${jobId}`);
  revalidateTag(`job-saved-${jobId}`);
}

export async function revalidateUserCache(userId: string) {
  revalidateTag(`user-application-${userId}`);
  revalidateTag(`user-saved-jobs-${userId}`);
}

/**
 * Toggle the saved state of a job for the current user
 */
export async function toggleSaveJob(jobId: string) {
  const user = await getUser();
  
  if (!user) {
    throw new Error('You must be logged in to save a job');
  }
  
  // Get the profile ID for this user
  const profileResult = await db()
    .select({
      id: profiles.id,
    })
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);
  
  if (!profileResult.length) {
    throw new Error('User profile not found');
  }
  
  const profileId = profileResult[0].id;
  
  // Check if job is already saved
  const existingSave = await db()
    .select({ deleted: savedJobs.deleted })
    .from(savedJobs)
    .where(
      and(
        eq(savedJobs.userId, profileId),
        eq(savedJobs.jobId, jobId)
      )
    )
    .limit(1);
    
  try {
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
            eq(savedJobs.userId, profileId),
            eq(savedJobs.jobId, jobId)
          )
        );
    } else {
      // Create new save record
      await db()
        .insert(savedJobs)
        .values({
          userId: profileId,
          jobId: jobId,
          deleted: false,
          createdAt: new Date()
        });
    }
    
    // Invalidate relevant caches
    await Promise.all([
      revalidateUserCache(user.id),
      revalidateJobCache(jobId)
    ]);
    
    // Revalidate job detail page
    revalidatePath(`/jobs/${jobId}`);
    revalidateTag('saved-jobs')
    revalidatePath('/jobs')
    revalidatePath('/employers')
    revalidatePath('/tenders')
    revalidatePath('/admin/jobs')
    revalidatePath('/admin/payments')
    return { success: true, isSaved: existingSave.length ? !existingSave[0].deleted : true };
  } catch (error) {
    console.error('Error toggling job save:', error);
    throw new Error('Failed to save job');
  }
} 