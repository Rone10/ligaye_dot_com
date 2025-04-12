'use server';

import { revalidatePath } from 'next/cache';
import { getUser } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { savedJobs, profiles } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Toggle saving/unsaving a job for the current user
 */
export async function toggleSaveJob(jobId: string) {
  // Get current authenticated user
  const user = await getUser();
  
  if (!user) {
    throw new Error('You must be logged in to save jobs');
  }
  
  // Get profile ID from user ID
  const profileResult = await db()
    .select({ id: profiles.id })
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
    
    // Revalidate jobs page to show updated save state
    revalidatePath('/jobs');
    return { success: true };
  } catch (error) {
    console.error('Error toggling job save:', error);
    throw new Error('Failed to save job');
  }
} 