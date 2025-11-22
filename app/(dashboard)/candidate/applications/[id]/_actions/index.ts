'use server'

import { db } from '@/lib/db'
import { eq, and } from 'drizzle-orm'
import { applications, candidateProfiles, profiles, jobs } from '@/lib/db/schema'
import { getUser } from '@/lib/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import {
  invalidateCandidateApplications as invalidateDashboardApplications,
  invalidateCandidateDashboard
} from '@/app/(dashboard)/candidate/_queries'
import {
  invalidateCandidateApplications as invalidateApplicationsList,
  invalidateApplication
} from '@/app/(dashboard)/candidate/applications/_queries'
import { JOB_DETAIL_CACHE_TAGS } from '@/app/(dashboard)/employer/jobs/[id]/_utils/cache-tags'
import { APPLICANTS_CACHE_TAGS } from '@/app/(dashboard)/employer/jobs/applicants/_utils/cache-tags'
import { EMPLOYER_DASHBOARD_CACHE_TAGS } from '@/app/(dashboard)/employer/_utils/cache-tags'

/**
 * Withdraws a job application
 */
export async function withdrawApplication(applicationId: string) {
  const user = await getUser()
  
  if (!user) {
    return { success: false, error: 'User not authenticated' }
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
      return { success: false, error: 'Candidate profile not found' }
    }
    
    // Verify application exists and belongs to this candidate
    const applicationRecord = await db()
      .select({ 
        id: applications.id,
        jobId: applications.jobId,
        employerProfileId: jobs.companyId
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .where(and(
        eq(applications.id, applicationId),
        eq(applications.candidateProfileId, candidateProfile.id),
        eq(applications.deleted, false)
      ))
      .limit(1)
      .then(res => res[0])
    
    if (!applicationRecord) {
      return { success: false, error: 'Application not found' }
    }
    
    // Update application status to WITHDRAWN
    await db()
      .update(applications)
      .set({
        status: 'WITHDRAWN',
        updatedAt: new Date()
      })
      .where(eq(applications.id, applicationId))
    
    // Invalidate employer-side cache so counts are fresh after withdrawal
    const employerTags: Array<Promise<void>> = [
      Promise.resolve(revalidateTag(APPLICANTS_CACHE_TAGS.application(applicationId))),
      Promise.resolve(revalidateTag(APPLICANTS_CACHE_TAGS.applicationDetail(applicationId))),
      Promise.resolve(revalidateTag(APPLICANTS_CACHE_TAGS.allApplications)),
      Promise.resolve(revalidateTag(APPLICANTS_CACHE_TAGS.applicationCounts)),
      Promise.resolve(revalidateTag(APPLICANTS_CACHE_TAGS.jobApplications(applicationRecord.jobId))),
      Promise.resolve(revalidateTag(APPLICANTS_CACHE_TAGS.candidateApplications(candidateProfile.id))),
      Promise.resolve(revalidateTag(APPLICANTS_CACHE_TAGS.applicationsByStatus('WITHDRAWN'))),
      Promise.resolve(revalidateTag(JOB_DETAIL_CACHE_TAGS.jobApplications(applicationRecord.jobId))),
      Promise.resolve(revalidateTag(JOB_DETAIL_CACHE_TAGS.jobApplicationStats(applicationRecord.jobId))),
      Promise.resolve(revalidateTag(JOB_DETAIL_CACHE_TAGS.jobRecentApplications(applicationRecord.jobId))),
      Promise.resolve(revalidateTag(JOB_DETAIL_CACHE_TAGS.allApplications))
    ]

    if (applicationRecord.employerProfileId) {
      employerTags.push(
        Promise.resolve(revalidateTag(APPLICANTS_CACHE_TAGS.employerApplications(applicationRecord.employerProfileId))),
        Promise.resolve(revalidateTag(EMPLOYER_DASHBOARD_CACHE_TAGS.stats(applicationRecord.employerProfileId))),
        Promise.resolve(revalidateTag(EMPLOYER_DASHBOARD_CACHE_TAGS.recentApplications(applicationRecord.employerProfileId)))
      )
    }

    await Promise.all(employerTags)
    revalidatePath('/employer/jobs/applicants')
    revalidatePath(`/employer/jobs/applicants/${applicationId}`)
    
    // Revalidate the candidate applications pages and caches
    revalidatePath('/candidate/applications')
    revalidatePath(`/candidate/applications/${applicationId}`)
    await Promise.all([
      invalidateApplicationsList(user.id),
      invalidateApplication(applicationId, user.id),
      invalidateDashboardApplications(user.id),
      invalidateCandidateDashboard(user.id)
    ])
    
    return { success: true }
  } catch (error) {
    console.error('Error withdrawing application:', error)
    return { success: false, error: 'Failed to withdraw application' }
  }
} 