'use server'

import { eq, and } from 'drizzle-orm'
import { db } from '@/lib/db'
import { applications, jobs, employerProfiles, profiles } from '@/lib/db/schema'
import { getUser } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Update application status
export async function updateApplicationStatus(applicationId: string, status: string) {
  try {
    const user = await getUser()
    if (!user) {
      return { error: 'Unauthorized' }
    }
    
    // Get employer profile ID to verify ownership
    const employerResult = await db()
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
        eq(profiles.userId, user.id),
        eq(profiles.deleted, false)
      ))
      .limit(1)
    
    if (!employerResult.length) {
      return { error: 'Employer profile not found' }
    }
    
    const employerProfileId = employerResult[0].employerProfileId
    
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
    
    // Update application status
    await db()
      .update(applications)
      .set({ 
        status: status as any, 
        updatedAt: new Date() 
      })
      .where(eq(applications.id, applicationId))
    
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
    
    // Get employer profile ID to verify ownership
    const employerResult = await db()
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
        eq(profiles.userId, user.id),
        eq(profiles.deleted, false)
      ))
      .limit(1)
    
    if (!employerResult.length) {
      return { error: 'Employer profile not found' }
    }
    
    const employerProfileId = employerResult[0].employerProfileId
    
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
    
    // Get employer profile ID to verify ownership
    const employerResult = await db()
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
        eq(profiles.userId, user.id),
        eq(profiles.deleted, false)
      ))
      .limit(1)
    
    if (!employerResult.length) {
      return { error: 'Employer profile not found' }
    }
    
    const employerProfileId = employerResult[0].employerProfileId
    
    // Verify the application belongs to one of the employer's jobs
    const applicationCheck = await db()
      .select({
        id: applications.id,
        status: applications.status
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
    
    // Update application with interview date and set status to INTERVIEW_SCHEDULED if not already
    await db()
      .update(applications)
      .set({ 
        interviewDate, 
        status: 'INTERVIEW_SCHEDULED' as any,
        updatedAt: new Date() 
      })
      .where(eq(applications.id, applicationId))
    
    revalidatePath('/employer/jobs/applicants')
    revalidatePath(`/employer/jobs/applicants/${applicationId}`)
    
    return { success: true }
  } catch (error) {
    console.error('Error scheduling interview:', error)
    return { error: 'Failed to schedule interview' }
  }
} 