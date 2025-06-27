'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'
import { 
  getEmployerProfile, 
  checkJobOwnership
} from './_queries'
import { db } from '@/lib/db'
import { jobs } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { JOB_DETAIL_CACHE_TAGS } from './_utils/cache-tags'

// Update job status (e.g., mark as filled or expired)
export async function updateJobStatus(jobId: string, status: 'ACTIVE' | 'EXPIRED' | 'FILLED' | 'DRAFT' | 'DELETED') {
  try {
    // Get the current user
    const user = await getUser()
    if (!user) {
      return { error: 'You must be logged in to update a job' }
    }
    
    // Get employer profile for the user
    const employerProfile = await getEmployerProfile(user.id)
    
    if (!employerProfile) {
      return { error: 'Employer profile not found. Please complete your profile first.' }
    }
    
    // Verify that the job belongs to this employer
    const isOwner = await checkJobOwnership(jobId, employerProfile.id)
    
    if (!isOwner) {
      return { error: 'You do not have permission to update this job' }
    }
    
    // Update the job status
    await db()
      .update(jobs)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(eq(jobs.id, jobId))
    
    // Invalidate specific cache tags
    await Promise.all([
      revalidateTag(JOB_DETAIL_CACHE_TAGS.job(jobId)),
      revalidateTag(JOB_DETAIL_CACHE_TAGS.jobDetail(jobId)),
      revalidateTag(JOB_DETAIL_CACHE_TAGS.employerJobs(employerProfile.id)),
      revalidateTag(JOB_DETAIL_CACHE_TAGS.allJobs),
      // Also invalidate application-related caches if job is marked as filled or deleted
      ...(status === 'FILLED' || status === 'DELETED' ? [
        revalidateTag(JOB_DETAIL_CACHE_TAGS.jobApplications(jobId)),
        revalidateTag(JOB_DETAIL_CACHE_TAGS.jobApplicationStats(jobId))
      ] : [])
    ])
    
    // Also revalidate paths for immediate UI update
    revalidatePath(`/employer/jobs/${jobId}`)
    revalidatePath('/employer/jobs')
    
    return { success: true }
  } catch (error) {
    console.error('Error updating job status:', error)
    return { error: 'Failed to update job status. Please try again.' }
  }
} 