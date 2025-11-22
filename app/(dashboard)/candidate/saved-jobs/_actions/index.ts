'use server'

import { db } from '@/lib/db'
import { eq, and } from 'drizzle-orm'
import { savedJobs, profiles } from '@/lib/db/schema'
import { getUser } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { 
  invalidateSavedJobs, 
  invalidateJobSavedCheck,
  invalidateSavedJobsCollection 
} from '../_queries'
import { invalidateCandidateSavedJobs as invalidateDashboardSavedJobs } from '../../_queries'

/**
 * Save a job for the current logged-in user
 */
export async function saveJob(jobId: string) {
  const user = await getUser()
  
  if (!user) {
    return { success: false, error: 'User not authenticated' }
  }
  
  try {
    // Get user profile
    const userProfile = await db()
      .select({
        id: profiles.id
      })
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1)
      .then(res => res[0])
      
    if (!userProfile) {
      return { success: false, error: 'User profile not found' }
    }

    // Check if the job is already saved using the profile ID
    const existingSavedJob = await db()
      .select({ id: savedJobs.jobId })
      .from(savedJobs)
      .where(and(
        eq(savedJobs.jobId, jobId),
        eq(savedJobs.userId, userProfile.id)
      ))
      .limit(1)
      .then(res => res[0])
    
    if (existingSavedJob) {
      // If job was previously saved but marked as deleted, update it
      await db()
        .update(savedJobs)
        .set({ deleted: false })
        .where(and(
          eq(savedJobs.jobId, jobId),
          eq(savedJobs.userId, userProfile.id)
        ))
    } else {
      // Otherwise, create a new saved job entry using profile ID
      await db()
        .insert(savedJobs)
        .values({
          jobId,
          userId: userProfile.id,
          deleted: false
        })
    }
    
    // Use optimized cache invalidation
    await Promise.all([
      invalidateSavedJobs(user.id),
      invalidateJobSavedCheck(user.id, jobId),
      invalidateSavedJobsCollection(),
      invalidateDashboardSavedJobs(user.id)
    ])
    
    revalidatePath('/candidate/saved-jobs')
    
    return { success: true, error: null }
  } catch (error) {
    console.error('Error saving job:', error)
    return { success: false, error: 'Failed to save job' }
  }
}

/**
 * Unsave (remove) a job for the current logged-in user
 */
export async function unsaveJob(jobId: string) {
  const user = await getUser()
  
  if (!user) {
    return { success: false, error: 'User not authenticated' }
  }
  
  try {
    // Get user profile
    const userProfile = await db()
      .select({
        id: profiles.id
      })
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1)
      .then(res => res[0])
      
    if (!userProfile) {
      return { success: false, error: 'User profile not found' }
    }

    // Soft delete the saved job by setting deleted to true using profile ID
    await db()
      .update(savedJobs)
      .set({ deleted: true })
      .where(and(
        eq(savedJobs.jobId, jobId),
        eq(savedJobs.userId, userProfile.id)
      ))
    
    // Use optimized cache invalidation
    await Promise.all([
      invalidateSavedJobs(user.id),
      invalidateJobSavedCheck(user.id, jobId),
      invalidateSavedJobsCollection(),
      invalidateDashboardSavedJobs(user.id)
    ])
    
    revalidatePath('/candidate/saved-jobs')
    revalidatePath('/jobs')
    
    return { success: true, error: null }
  } catch (error) {
    console.error('Error unsaving job:', error)
    return { success: false, error: 'Failed to remove job from saved list' }
  }
} 