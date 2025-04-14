'use server'

import { db } from '@/lib/db'
import { eq, and, desc, not } from 'drizzle-orm'
import { savedJobs, jobs, employerProfiles, profiles } from '@/lib/db/schema'
import { getUser } from '@/lib/supabase/server'

/**
 * Gets all saved jobs for the current logged-in user
 */
export async function getSavedJobs() {
  const user = await getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }
  
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
      .innerJoin(profiles, eq(savedJobs.userId, profiles.id))
      .where(and(
        eq(profiles.userId, user.id),
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
 * Check if a job is saved by the current user
 */
export async function isJobSaved(jobId: string) {
  const user = await getUser()
  
  if (!user) {
    return { isSaved: false, error: 'User not authenticated' }
  }
  
  try {
    // Find user's profile
    const userProfile = await db()
      .select({
        id: profiles.id
      })
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1)
      .then(res => res[0])
    
    if (!userProfile) {
      return { isSaved: false, error: null }
    }
    
    // Check if job is saved
    const result = await db()
      .select({ id: savedJobs.jobId })
      .from(savedJobs)
      .where(and(
        eq(savedJobs.jobId, jobId),
        eq(savedJobs.userId, userProfile.id),
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