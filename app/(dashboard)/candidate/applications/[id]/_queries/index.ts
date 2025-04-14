'use server'

import { db } from '@/lib/db'
import { eq, and } from 'drizzle-orm'
import { applications, jobs, employerProfiles, candidateProfiles, profiles } from '@/lib/db/schema'
import { getUser } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'

/**
 * Get application details for a specific application ID and candidate profile ID
 */
export async function getApplicationDetailsById(applicationId: string, candidateProfileId: string) {
  try {
    // Get application with job and employer details
    const result = await db()
      .select({
        application: applications,
        job: jobs,
        employer: employerProfiles
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .innerJoin(employerProfiles, eq(jobs.companyId, employerProfiles.id))
      .where(and(
        eq(applications.id, applicationId),
        eq(applications.candidateProfileId, candidateProfileId),
        eq(applications.deleted, false)
      ))
      .limit(1)
      .then(res => res[0])
    
    if (!result) {
      return { data: null, error: 'Application not found' }
    }
    
    return { data: result, error: null }
  } catch (error) {
    console.error('Error fetching application details:', error)
    return { data: null, error: 'Failed to fetch application details' }
  }
}

/**
 * Cached version of application details query
 */
const getApplicationDetailsCached = unstable_cache(
  async (applicationId: string, candidateProfileId: string) => {
    return getApplicationDetailsById(applicationId, candidateProfileId)
  },
  ['application-detail'],
  {
    tags: ['applications']
  }
)

/**
 * Main entry point for getting an application by ID
 * Handles user authentication and profile lookup before using the cached function
 */
export async function getApplicationById(applicationId: string) {
  const user = await getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }
  
  try {
    // First find the candidate profile ID for this user
    const candidateProfile = await db()
      .select({
        id: candidateProfiles.id
      })
      .from(candidateProfiles)
      .innerJoin(profiles, eq(candidateProfiles.profileId, profiles.id))
      .where(and(
        eq(profiles.userId, user.id),
        eq(candidateProfiles.deleted, false),
        eq(profiles.deleted, false)
      ))
      .limit(1)
      .then(res => res[0])
    
    if (!candidateProfile) {
      return { data: null, error: 'Candidate profile not found' }
    }
    
    // Use the cached function with both IDs
    return getApplicationDetailsCached(applicationId, candidateProfile.id)
  } catch (error) {
    console.error('Error in getApplicationById:', error)
    return { data: null, error: 'Failed to fetch application details' }
  }
} 