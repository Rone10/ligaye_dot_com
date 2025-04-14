'use server'

import { db } from '@/lib/db'
import { eq, and, desc, isNull } from 'drizzle-orm'
import { applications, jobs, employerProfiles, candidateProfiles, profiles } from '@/lib/db/schema'
import { getUser } from '@/lib/supabase/server'

/**
 * Gets all applications for the current logged-in candidate
 */
export async function getCandidateApplications() {
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
      return { data: [], error: null }
    }
    
    // Get applications with job and employer details
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
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .innerJoin(employerProfiles, eq(jobs.companyId, employerProfiles.id))
      .where(and(
        eq(applications.candidateProfileId, candidateProfile.id),
        eq(applications.deleted, false)
      ))
      .orderBy(desc(applications.appliedAt))
    
    return { data: results, error: null }
  } catch (error) {
    console.error('Error fetching candidate applications:', error)
    return { data: null, error: 'Failed to fetch your applications' }
  }
} 