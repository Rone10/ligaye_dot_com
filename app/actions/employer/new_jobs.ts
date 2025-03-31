"use server"

import { db } from "@/lib/db"
import { getUser } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { insertJob } from "@/lib/db/queries/employer/new_jobs"
import { getProfileByUserId } from "@/lib/db/queries/profiles"
import { getEmployerProfileByProfileId } from "@/lib/db/queries/employer/company"

export type JobSubmissionResult = {
  success: boolean;
  message: string;
  jobId?: string;
  error?: string;
}

export async function createJob(formData: any): Promise<JobSubmissionResult> {
  try {
    // Check user authentication
    const user = await getUser()
    if (!user) {
      return {
        success: false,
        message: 'Unauthorized',
        error: 'You must be logged in to create a job'
      }
    }

    // Get profile ID from user ID
    const profile = await getProfileByUserId(user.id)
    if (!profile) {
      return {
        success: false,
        message: 'Profile not found',
        error: 'Unable to find your profile'
      }
    }

    // Get employer profile for the company ID
    const employerProfile = await getEmployerProfileByProfileId(profile.id)
    if (!employerProfile) {
      return {
        success: false,
        message: 'Employer profile not found',
        error: 'Unable to find your employer profile'
      }
    }

    const profileId = profile.id
    const companyId = employerProfile.id

    // Process location data if needed
    let jobData = { ...formData };
    
    // Ensure skillIds and industryIds are always arrays
    if (!Array.isArray(jobData.skillIds)) {
      jobData.skillIds = [];
    }
    
    if (!Array.isArray(jobData.industryIds)) {
      jobData.industryIds = [];
    }
    
    // Handle location - make sure we don't use a placeholder that would violate foreign key constraints
    if (!formData.locationId && formData.newLocation && formData.newLocation.city) {
      // For now, set locationId to null since we don't have a real location yet
      // In a real implementation, you would create the location first
      delete jobData.locationId; // Remove locationId so it defaults to null
    } else if (formData.locationId === '00000000-0000-0000-0000-000000000000') {
      // Remove invalid placeholder IDs
      delete jobData.locationId;
    }

    // Call the query function to insert the job with profileId and companyId
    const result = await insertJob(jobData, profileId, companyId);

    if (!result.success) {
      return {
        success: false,
        message: 'Failed to create job',
        error: result.error
      }
    }

    // Revalidate the jobs page to reflect the changes
    revalidatePath('/employer/jobs')

    return {
      success: true,
      message: 'Job created successfully',
      jobId: result.jobId
    }
    
  } catch (error) {
    console.error('Error creating job:', error)
    return {
      success: false,
      message: 'An error occurred while creating the job',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
