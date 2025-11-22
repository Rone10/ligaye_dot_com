'use server'

import { eq, and } from 'drizzle-orm'
import { db } from '@/lib/db'
import { applications, jobs, employerProfiles, profiles } from '@/lib/db/schema'
import { getUser } from '@/lib/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { ApplicationStatus } from '@/types/application'
import { cache } from 'react'
import { APPLICANTS_CACHE_TAGS } from './_utils/cache-tags'
import { JOB_DETAIL_CACHE_TAGS } from '@/app/(dashboard)/employer/jobs/[id]/_utils/cache-tags'
import { EMPLOYER_DASHBOARD_CACHE_TAGS } from '@/app/(dashboard)/employer/_utils/cache-tags'

/**
 * Helper to get employer profile ID - cached per request
 */
const getEmployerProfileIdCached = cache(async (userId: string) => {
  const result = await db()
    .select({
      employerProfileId: employerProfiles.id
    })
    .from(profiles)
    .innerJoin(
      employerProfiles,
      and(
        eq(profiles.id, employerProfiles.profileId),
        eq(employerProfiles.deleted, false)
      )
    )
    .where(and(
      eq(profiles.userId, userId),
      eq(profiles.deleted, false)
    ))
    .limit(1)
  
  return result[0]?.employerProfileId || null
})

// Update application status
export async function updateApplicationStatus(applicationId: string, status: ApplicationStatus) {
  try {
    const user = await getUser()
    if (!user) {
      return { error: 'Unauthorized' }
    }
    
    // Get employer profile ID using request-level cache
    const employerProfileId = await getEmployerProfileIdCached(user.id)
    
    if (!employerProfileId) {
      return { error: 'Employer profile not found' }
    }
    
    // Verify the application belongs to one of the employer's jobs and get job ID
    const applicationCheck = await db()
      .select({
        id: applications.id,
        jobId: applications.jobId,
        candidateProfileId: applications.candidateProfileId
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .where(and(
        eq(applications.id, applicationId),
        eq(jobs.companyId, employerProfileId),
        eq(applications.deleted, false)
      ))
      .limit(1)
    
    if (!applicationCheck.length) {
      return { error: 'Application not found or you do not have permission to update it' }
    }
    
    const { jobId, candidateProfileId } = applicationCheck[0]
    
    // Update application status
    await db()
      .update(applications)
      .set({ 
        status: status as any, 
        updatedAt: new Date() 
      })
      .where(eq(applications.id, applicationId))
    
    // Invalidate specific cache tags
    await Promise.all([
      revalidateTag(APPLICANTS_CACHE_TAGS.application(applicationId)),
      revalidateTag(APPLICANTS_CACHE_TAGS.applicationDetail(applicationId)),
      revalidateTag(APPLICANTS_CACHE_TAGS.allApplications),
      revalidateTag(APPLICANTS_CACHE_TAGS.applicationCounts),
      revalidateTag(APPLICANTS_CACHE_TAGS.employerApplications(employerProfileId)),
      revalidateTag(APPLICANTS_CACHE_TAGS.jobApplications(jobId)),
      revalidateTag(APPLICANTS_CACHE_TAGS.candidateApplications(candidateProfileId)),
      revalidateTag(APPLICANTS_CACHE_TAGS.applicationsByStatus(status)),
      revalidateTag(JOB_DETAIL_CACHE_TAGS.jobApplications(jobId)),
      revalidateTag(JOB_DETAIL_CACHE_TAGS.jobApplicationStats(jobId)),
      revalidateTag(JOB_DETAIL_CACHE_TAGS.jobRecentApplications(jobId)),
      revalidateTag(JOB_DETAIL_CACHE_TAGS.allApplications),
      revalidateTag(EMPLOYER_DASHBOARD_CACHE_TAGS.stats(employerProfileId)),
      revalidateTag(EMPLOYER_DASHBOARD_CACHE_TAGS.recentApplications(employerProfileId))
    ])
    
    // Also revalidate paths for immediate UI update
    revalidatePath('/employer/jobs/applicants')
    revalidatePath(`/employer/jobs/applicants/${applicationId}`)
    
    return { success: true }
  } catch (error) {
    console.error('Error updating application status:', error)
    return { error: 'Failed to update application status' }
  }
}

// Update application notes
export async function updateApplicationNotes(applicationId: string, notes: string) {
  try {
    const user = await getUser()
    if (!user) {
      return { error: 'Unauthorized' }
    }
    
    // Get employer profile ID using request-level cache
    const employerProfileId = await getEmployerProfileIdCached(user.id)
    
    if (!employerProfileId) {
      return { error: 'Employer profile not found' }
    }
    
    // Verify the application belongs to one of the employer's jobs
    const applicationCheck = await db()
      .select({
        id: applications.id
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .where(and(
        eq(applications.id, applicationId),
        eq(jobs.companyId, employerProfileId),
        eq(applications.deleted, false)
      ))
      .limit(1)
    
    if (!applicationCheck.length) {
      return { error: 'Application not found or you do not have permission to update it' }
    }
    
    // Update application notes
    await db()
      .update(applications)
      .set({ 
        notes, 
        updatedAt: new Date() 
      })
      .where(eq(applications.id, applicationId))
    
    // Invalidate specific cache tags for notes update
    await Promise.all([
      revalidateTag(APPLICANTS_CACHE_TAGS.application(applicationId)),
      revalidateTag(APPLICANTS_CACHE_TAGS.applicationDetail(applicationId))
    ])
    
    // Also revalidate path for immediate UI update
    revalidatePath(`/employer/jobs/applicants/${applicationId}`)
    
    return { success: true }
  } catch (error) {
    console.error('Error updating application notes:', error)
    return { error: 'Failed to update application notes' }
  }
}

// Schedule interview
export async function scheduleInterview(applicationId: string, interviewDate: Date) {
  try {
    const user = await getUser()
    if (!user) {
      return { error: 'Unauthorized' }
    }
    
    // Get employer profile ID using request-level cache
    const employerProfileId = await getEmployerProfileIdCached(user.id)
    
    if (!employerProfileId) {
      return { error: 'Employer profile not found' }
    }
    
    // Verify the application belongs to one of the employer's jobs and get details
    const applicationCheck = await db()
      .select({
        id: applications.id,
        status: applications.status,
        jobId: applications.jobId,
        candidateProfileId: applications.candidateProfileId
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .where(and(
        eq(applications.id, applicationId),
        eq(jobs.companyId, employerProfileId),
        eq(applications.deleted, false)
      ))
      .limit(1)
    
    if (!applicationCheck.length) {
      return { error: 'Application not found or you do not have permission to update it' }
    }
    
    const { jobId, candidateProfileId } = applicationCheck[0]
    
    // Update application with interview date and set status to INTERVIEW_SCHEDULED
    await db()
      .update(applications)
      .set({ 
        interviewDate, 
        status: 'INTERVIEW_SCHEDULED' as any,
        updatedAt: new Date() 
      })
      .where(eq(applications.id, applicationId))
    
    // Invalidate all relevant cache tags
    await Promise.all([
      revalidateTag(APPLICANTS_CACHE_TAGS.application(applicationId)),
      revalidateTag(APPLICANTS_CACHE_TAGS.applicationDetail(applicationId)),
      revalidateTag(APPLICANTS_CACHE_TAGS.allApplications),
      revalidateTag(APPLICANTS_CACHE_TAGS.applicationCounts),
      revalidateTag(APPLICANTS_CACHE_TAGS.employerApplications(employerProfileId)),
      revalidateTag(APPLICANTS_CACHE_TAGS.jobApplications(jobId)),
      revalidateTag(APPLICANTS_CACHE_TAGS.candidateApplications(candidateProfileId)),
      revalidateTag(APPLICANTS_CACHE_TAGS.applicationsByStatus('INTERVIEW_SCHEDULED')),
      revalidateTag(JOB_DETAIL_CACHE_TAGS.jobApplications(jobId)),
      revalidateTag(JOB_DETAIL_CACHE_TAGS.jobApplicationStats(jobId)),
      revalidateTag(JOB_DETAIL_CACHE_TAGS.jobRecentApplications(jobId)),
      revalidateTag(JOB_DETAIL_CACHE_TAGS.allApplications),
      revalidateTag(EMPLOYER_DASHBOARD_CACHE_TAGS.stats(employerProfileId)),
      revalidateTag(EMPLOYER_DASHBOARD_CACHE_TAGS.recentApplications(employerProfileId))
    ])
    
    // Also revalidate paths for immediate UI update
    revalidatePath('/employer/jobs/applicants')
    revalidatePath(`/employer/jobs/applicants/${applicationId}`)
    
    return { success: true }
  } catch (error) {
    console.error('Error scheduling interview:', error)
    return { error: 'Failed to schedule interview' }
  }
} 