'use server'

import { db } from '@/lib/db'
import { eq, and, desc, not } from 'drizzle-orm'
import { savedJobs, jobs, employerProfiles, profiles } from '@/lib/db/schema'
import { getUser } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'

/**
 * Fetches saved jobs for a specific user profile ID (uncached version) - Reverted name
 */
export async function getSavedJobsForProfile(profileId: string) { // Reverted name
  try {
    // Get saved jobs with job and employer details
    const results = await db()
      .select({
        savedJob: {
          id: savedJobs.jobId, // Use jobId as the ID since it's part of the primary key
          userId: savedJobs.userId,
          createdAt: savedJobs.createdAt,
          deleted: savedJobs.deleted
        },
        job: {
          id: jobs.id,
          title: jobs.title,
          workLocation: jobs.workLocation,
          jobType: jobs.jobType,
          experienceLevel: jobs.experienceLevel,
          publishedAt: jobs.publishedAt,
          expiresAt: jobs.expiresAt,
          status: jobs.status,
          salaryCurrency: jobs.salaryCurrency,
          salaryRangeMin: jobs.salaryRangeMin,
          salaryRangeMax: jobs.salaryRangeMax,
          salaryFrequency: jobs.salaryFrequency,
          salaryDisplayType: jobs.salaryDisplayType,
        },
        employer: {
          id: employerProfiles.id,
          companyName: employerProfiles.companyName,
          companyLogoUrl: employerProfiles.companyLogoUrl
        }
      })
      .from(savedJobs)
      .innerJoin(jobs, eq(savedJobs.jobId, jobs.id))
      .innerJoin(employerProfiles, eq(jobs.companyId, employerProfiles.id))
      .where(and(
        eq(savedJobs.userId, profileId), // Reverted to use profileId
        eq(savedJobs.deleted, false),
        not(eq(jobs.status, 'DELETED')),
        not(eq(jobs.status, 'EXPIRED')),
        not(eq(jobs.status, 'DRAFT'))
      ))
      .orderBy(desc(savedJobs.createdAt))

    return { data: results, error: null }
  } catch (error) {
    console.error('Error fetching saved jobs:', error)
    return { data: null, error: 'Failed to fetch your saved jobs' }
  }
}

/**
 * Cached version of saved jobs query
 */
const getSavedJobsCached = unstable_cache(
  async (profileId: string) => { // Reverted parameter name
    return getSavedJobsForProfile(profileId) // Reverted function call
  },
  ['saved-jobs'], // Reverted cache key
  {
    tags: ['saved-jobs'] // Tag remains the same
  }
)

/**
 * Gets all saved jobs for the current logged-in user
 * Main entry point that handles authentication
 */
export async function getSavedJobs() {
  const user = await getUser()

  if (!user) {
    // Throw error as per original logic, page should handle this boundary
    throw new Error('User not authenticated') 
  }

  try {
    // Restore logic to find user's profile first
    const userProfile = await db()
      .select({
        id: profiles.id
      })
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1)
      .then(res => res[0])
      
    if (!userProfile) {
      // If profile not found, return empty array (no saved jobs)
      return { data: [], error: null } 
    }
    
    // Use the cached function with the found profile ID
    return getSavedJobsCached(userProfile.id)
  } catch (error) {
    console.error('Error in getSavedJobs:', error)
    return { data: null, error: 'Failed to fetch your saved jobs' }
  }
}

/**
 * Checks if a job is saved for a specific profile ID (uncached version) - Reverted name
 */
export async function isJobSavedForProfile(jobId: string, profileId: string) { // Reverted name
  try {
    // Check if job is saved
    const result = await db()
      .select({ id: savedJobs.jobId })
      .from(savedJobs)
      .where(and(
        eq(savedJobs.jobId, jobId),
        eq(savedJobs.userId, profileId), // Reverted to use profileId
        eq(savedJobs.deleted, false)
      ))
      .limit(1)
      .then(res => res[0])

    return { isSaved: Boolean(result), error: null }
  } catch (error) {
    console.error('Error checking if job is saved:', error)
    return { isSaved: false, error: 'Failed to check if job is saved' }
  }
}

/**
 * Cached version of job saved check
 */
const isJobSavedCached = unstable_cache(
  async (jobId: string, profileId: string) => { // Reverted parameter name
    return isJobSavedForProfile(jobId, profileId) // Reverted function call
  },
  ['job-saved-check'], // Reverted cache key
  {
    tags: ['saved-jobs'] // Tag remains the same
  }
)

/**
 * Check if a job is saved by the current user
 * Main entry point that handles authentication
 */
export async function isJobSaved(jobId: string) {
  const user = await getUser()

  if (!user) {
    return { isSaved: false, error: 'User not authenticated' }
  }

  try {
    // Restore logic to find user's profile first
    const userProfile = await db()
      .select({
        id: profiles.id
      })
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1)
      .then(res => res[0])
      
    if (!userProfile) {
      // If profile doesn't exist, job cannot be saved for them
      return { isSaved: false, error: null } 
    }
    
    // Use the cached function with job ID and found profile ID
    return isJobSavedCached(jobId, userProfile.id)
  } catch (error) {
    console.error('Error in isJobSaved:', error)
    return { isSaved: false, error: 'Failed to check if job is saved' }
  }
} 