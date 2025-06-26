import { db } from '@/lib/db'
import { candidateProfiles, applications, savedJobs, profiles } from '@/lib/db/schema'
import { eq, and, count } from 'drizzle-orm'
import { unstable_cache } from 'next/cache'

// Cache tags for on-demand invalidation
export const CANDIDATE_CACHE_TAGS = {
  dashboard: (userId: string) => `candidate-dashboard-${userId}`,
  candidateProfile: (userId: string) => `candidate-profile-${userId}`,
  applications: (userId: string) => `candidate-applications-${userId}`,
  savedJobs: (userId: string) => `candidate-saved-jobs-${userId}`,
  candidateCollection: 'candidate-collection'
} as const

// Internal query function - no authentication logic inside
async function getCandidateDashboardDataInternal(userId: string) {
  try {
    // Single optimized query using relations and subqueries
    const profileResult = await db()
      .select({
        id: profiles.id,
        userId: profiles.userId,
        fullName: profiles.fullName,
      })
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1)

    if (!profileResult[0]) {
      return {
        profile: null,
        candidateProfile: null,
        applicationCount: 0,
        savedJobsCount: 0
      }
    }

    const profile = profileResult[0]

    // Parallel execution of remaining queries
    const [candidateProfileResult, applicationCountResult, savedJobsCountResult] = await Promise.all([
      // Get candidate profile
      db()
        .select({
          id: candidateProfiles.id,
          profileId: candidateProfiles.profileId,
          resumeUrl: candidateProfiles.resumeUrl,
          bio: candidateProfiles.bio,
        //   phone: candidateProfiles.phone,
          linkedinUrl: candidateProfiles.linkedinUrl,
          portfolioUrl: candidateProfiles.portfolioUrl,
        //   isAvailable: candidateProfiles.isAvailable,
        //   preferredJobType: candidateProfiles.preferredJobType,
        //   preferredSalaryMin: candidateProfiles.preferredSalaryMin,
        //   preferredSalaryMax: candidateProfiles.preferredSalaryMax,
          createdAt: candidateProfiles.createdAt,
          updatedAt: candidateProfiles.updatedAt
        })
        .from(candidateProfiles)
        .where(eq(candidateProfiles.profileId, profile.id))
        .limit(1),
      
      // Count applications efficiently
      db()
        .select({ count: count() })
        .from(applications)
        .innerJoin(candidateProfiles, eq(applications.candidateProfileId, candidateProfiles.id))
        .where(and(
          eq(candidateProfiles.profileId, profile.id),
          eq(applications.deleted, false)
        )),
      
      // Count saved jobs efficiently
      db()
        .select({ count: count() })
        .from(savedJobs)
        .where(and(
          eq(savedJobs.userId, profile.id),
          eq(savedJobs.deleted, false)
        ))
    ])

    return {
      profile,
      candidateProfile: candidateProfileResult[0] || null,
      applicationCount: applicationCountResult[0]?.count || 0,
      savedJobsCount: savedJobsCountResult[0]?.count || 0
    }
  } catch (error) {
    console.error('Error fetching candidate dashboard data:', error)
    throw new Error('Failed to fetch candidate dashboard data')
  }
}

// Public cached function
export const getCandidateDashboardData = async (userId: string) => {
  const cachedFunction = unstable_cache(
    async () => getCandidateDashboardDataInternal(userId),
    [`candidate-dashboard-${userId}`],
    {
      tags: [
        CANDIDATE_CACHE_TAGS.dashboard(userId),
        CANDIDATE_CACHE_TAGS.candidateProfile(userId),
        CANDIDATE_CACHE_TAGS.applications(userId),
        CANDIDATE_CACHE_TAGS.savedJobs(userId),
        CANDIDATE_CACHE_TAGS.candidateCollection
      ]
      // NO revalidate property = indefinite cache until tag invalidation
    }
  )
  
  return cachedFunction()
}

// Cache invalidation helpers - these need 'use server' since they're called from server actions
export async function invalidateCandidateDashboard(userId: string) {
  'use server'
  const { revalidateTag } = await import('next/cache')
  
  await Promise.all([
    revalidateTag(CANDIDATE_CACHE_TAGS.dashboard(userId)),
    revalidateTag(CANDIDATE_CACHE_TAGS.candidateCollection)
  ])
}

export async function invalidateCandidateProfile(userId: string) {
  'use server'
  const { revalidateTag } = await import('next/cache')
  
  await Promise.all([
    revalidateTag(CANDIDATE_CACHE_TAGS.candidateProfile(userId)),
    revalidateTag(CANDIDATE_CACHE_TAGS.dashboard(userId)),
    revalidateTag(CANDIDATE_CACHE_TAGS.candidateCollection)
  ])
}

export async function invalidateCandidateApplications(userId: string) {
  'use server'
  const { revalidateTag } = await import('next/cache')
  
  await Promise.all([
    revalidateTag(CANDIDATE_CACHE_TAGS.applications(userId)),
    revalidateTag(CANDIDATE_CACHE_TAGS.dashboard(userId)),
    revalidateTag(CANDIDATE_CACHE_TAGS.candidateCollection)
  ])
}

export async function invalidateCandidateSavedJobs(userId: string) {
  'use server'
  const { revalidateTag } = await import('next/cache')
  
  await Promise.all([
    revalidateTag(CANDIDATE_CACHE_TAGS.savedJobs(userId)),
    revalidateTag(CANDIDATE_CACHE_TAGS.dashboard(userId)),
    revalidateTag(CANDIDATE_CACHE_TAGS.candidateCollection)
  ])
} 