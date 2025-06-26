import { db } from '@/lib/db'
import { eq, and, desc, not } from 'drizzle-orm'
import { savedJobs, jobs, employerProfiles, profiles } from '@/lib/db/schema'
import { unstable_cache } from 'next/cache'

// Cache tags for on-demand invalidation
export const SAVED_JOBS_CACHE_TAGS = {
  savedJobs: (userId: string) => `saved-jobs-${userId}`,
  jobSavedCheck: (userId: string, jobId: string) => `job-saved-${userId}-${jobId}`,
  savedJobsCollection: 'saved-jobs-collection'
} as const

/**
 * Internal optimized function for getting saved jobs (no auth logic)
 */
async function getSavedJobsInternal(userId: string) {
  try {
    // Single optimized query with joins to get all needed data
    const results = await db()
      .select({
        savedJob: {
          id: savedJobs.jobId,
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
      .innerJoin(profiles, eq(savedJobs.userId, profiles.id))
      .innerJoin(jobs, eq(savedJobs.jobId, jobs.id))
      .innerJoin(employerProfiles, eq(jobs.companyId, employerProfiles.id))
      .where(and(
        eq(profiles.userId, userId),
        eq(savedJobs.deleted, false),
        not(eq(jobs.status, 'DELETED')),
        not(eq(jobs.status, 'EXPIRED')),
        not(eq(jobs.status, 'DRAFT'))
      ))
      .orderBy(desc(savedJobs.createdAt))

    return { data: results, error: null }
  } catch (error) {
    console.error('Error fetching saved jobs:', error)
    throw new Error('Failed to fetch saved jobs')
  }
}

/**
 * Cached version with on-demand invalidation
 */
export const getSavedJobs = async (userId: string) => {
  const cachedFunction = unstable_cache(
    async () => getSavedJobsInternal(userId),
    [`saved-jobs-${userId}`],
    {
      tags: [
        SAVED_JOBS_CACHE_TAGS.savedJobs(userId),
        SAVED_JOBS_CACHE_TAGS.savedJobsCollection
      ]
      // NO revalidate property = indefinite cache until tag invalidation
    }
  )
  
  return cachedFunction()
}

/**
 * Internal function for checking if a job is saved (no auth logic)
 */
async function isJobSavedInternal(jobId: string, userId: string) {
  try {
    // Single optimized query with join
    const result = await db()
      .select({ id: savedJobs.jobId })
      .from(savedJobs)
      .innerJoin(profiles, eq(savedJobs.userId, profiles.id))
      .where(and(
        eq(savedJobs.jobId, jobId),
        eq(profiles.userId, userId),
        eq(savedJobs.deleted, false)
      ))
      .limit(1)
      .then(res => res[0])

    return { isSaved: Boolean(result), error: null }
  } catch (error) {
    console.error('Error checking if job is saved:', error)
    throw new Error('Failed to check if job is saved')
  }
}

/**
 * Cached version for checking if a job is saved
 */
export const isJobSaved = async (jobId: string, userId: string) => {
  const cachedFunction = unstable_cache(
    async () => isJobSavedInternal(jobId, userId),
    [`job-saved-${userId}-${jobId}`],
    {
      tags: [
        SAVED_JOBS_CACHE_TAGS.jobSavedCheck(userId, jobId),
        SAVED_JOBS_CACHE_TAGS.savedJobs(userId),
        SAVED_JOBS_CACHE_TAGS.savedJobsCollection
      ]
    }
  )
  
  return cachedFunction()
}

// Cache invalidation helpers - these need 'use server' since they're called from server actions
export async function invalidateSavedJobs(userId: string) {
  'use server'
  const { revalidateTag } = await import('next/cache')
  
  await Promise.all([
    revalidateTag(SAVED_JOBS_CACHE_TAGS.savedJobs(userId)),
    revalidateTag(SAVED_JOBS_CACHE_TAGS.savedJobsCollection)
  ])
}

export async function invalidateJobSavedCheck(userId: string, jobId: string) {
  'use server'
  const { revalidateTag } = await import('next/cache')
  
  await Promise.all([
    revalidateTag(SAVED_JOBS_CACHE_TAGS.jobSavedCheck(userId, jobId)),
    revalidateTag(SAVED_JOBS_CACHE_TAGS.savedJobs(userId)),
    revalidateTag(SAVED_JOBS_CACHE_TAGS.savedJobsCollection)
  ])
}

export async function invalidateSavedJobsCollection() {
  'use server'
  const { revalidateTag } = await import('next/cache')
  
  await revalidateTag(SAVED_JOBS_CACHE_TAGS.savedJobsCollection)
} 