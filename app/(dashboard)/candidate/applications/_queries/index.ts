import { db } from '@/lib/db'
import { eq, and, desc } from 'drizzle-orm'
import { applications, jobs, employerProfiles, candidateProfiles, profiles } from '@/lib/db/schema'
import { unstable_cache } from 'next/cache'

// Cache tags for on-demand invalidation
export const APPLICATIONS_CACHE_TAGS = {
  candidateApplications: (userId: string) => `candidate-applications-${userId}`,
  application: (applicationId: string) => `application-${applicationId}`,
  applicationsCollection: 'applications-collection'
} as const

/**
 * Internal optimized function for getting candidate applications (no auth logic)
 */
async function getCandidateApplicationsInternal(userId: string) {
  try {
    // Single optimized query with joins to get all needed data
    const results = await db()
      .select({
        application: applications,
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
      .from(applications)
      .innerJoin(candidateProfiles, eq(applications.candidateProfileId, candidateProfiles.id))
      .innerJoin(profiles, eq(candidateProfiles.profileId, profiles.id))
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .innerJoin(employerProfiles, eq(jobs.companyId, employerProfiles.id))
      .where(and(
        eq(profiles.userId, userId),
        eq(applications.deleted, false),
        eq(candidateProfiles.deleted, false),
        eq(profiles.deleted, false)
      ))
      .orderBy(desc(applications.appliedAt))
    
    return { data: results, error: null }
  } catch (error) {
    console.error('Error fetching candidate applications:', error)
    throw new Error('Failed to fetch applications')
  }
}

/**
 * Cached version with on-demand invalidation
 */
export const getCandidateApplications = async (userId: string) => {
  const cachedFunction = unstable_cache(
    async () => getCandidateApplicationsInternal(userId),
    [`candidate-applications-${userId}`],
    {
      tags: [
        APPLICATIONS_CACHE_TAGS.candidateApplications(userId),
        APPLICATIONS_CACHE_TAGS.applicationsCollection
      ]
      // NO revalidate property = indefinite cache until tag invalidation
    }
  )
  
  return cachedFunction()
}

/**
 * Internal function for getting a specific application by ID (no auth logic)
 */
async function getApplicationByIdInternal(applicationId: string, userId: string) {
  try {
    const result = await db()
      .select({
        application: applications,
        job: {
          id: jobs.id,
          title: jobs.title,
          description: jobs.description,
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
          companyLogoUrl: employerProfiles.companyLogoUrl,
          companyWebsite: employerProfiles.website,
          companyDescription: employerProfiles.companyDescription
        }
      })
      .from(applications)
      .innerJoin(candidateProfiles, eq(applications.candidateProfileId, candidateProfiles.id))
      .innerJoin(profiles, eq(candidateProfiles.profileId, profiles.id))
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .innerJoin(employerProfiles, eq(jobs.companyId, employerProfiles.id))
      .where(and(
        eq(applications.id, applicationId),
        eq(profiles.userId, userId),
        eq(applications.deleted, false)
      ))
      .limit(1)
      .then(res => res[0])
    
    if (!result) {
      return { data: null, error: 'Application not found' }
    }
    
    return { data: result, error: null }
  } catch (error) {
    console.error('Error fetching application by ID:', error)
    throw new Error('Failed to fetch application details')
  }
}

/**
 * Cached version for getting a specific application
 */
export const getApplicationById = async (applicationId: string, userId: string) => {
  const cachedFunction = unstable_cache(
    async () => getApplicationByIdInternal(applicationId, userId),
    [`application-${applicationId}-${userId}`],
    {
      tags: [
        APPLICATIONS_CACHE_TAGS.application(applicationId),
        APPLICATIONS_CACHE_TAGS.candidateApplications(userId),
        APPLICATIONS_CACHE_TAGS.applicationsCollection
      ]
    }
  )
  
  return cachedFunction()
}

// Cache invalidation helpers - these need 'use server' since they're called from server actions
export async function invalidateCandidateApplications(userId: string) {
  'use server'
  const { revalidateTag } = await import('next/cache')
  
  await Promise.all([
    revalidateTag(APPLICATIONS_CACHE_TAGS.candidateApplications(userId)),
    revalidateTag(APPLICATIONS_CACHE_TAGS.applicationsCollection)
  ])
}

export async function invalidateApplication(applicationId: string, userId: string) {
  'use server'
  const { revalidateTag } = await import('next/cache')
  
  await Promise.all([
    revalidateTag(APPLICATIONS_CACHE_TAGS.application(applicationId)),
    revalidateTag(APPLICATIONS_CACHE_TAGS.candidateApplications(userId)),
    revalidateTag(APPLICATIONS_CACHE_TAGS.applicationsCollection)
  ])
}

export async function invalidateApplicationsCollection() {
  'use server'
  const { revalidateTag } = await import('next/cache')
  
  await revalidateTag(APPLICATIONS_CACHE_TAGS.applicationsCollection)
} 