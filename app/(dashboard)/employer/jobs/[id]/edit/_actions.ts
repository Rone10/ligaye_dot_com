'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'
import { jobFormSchema } from './_utils/validation'
import { 
  getEmployerProfile, 
  updateJob,
  checkJobOwnership
} from './_queries'
import { z } from 'zod'

export async function updateJobPosting(jobId: string, formData: z.infer<typeof jobFormSchema>) {
  try {
    // Validate form data
    const validatedData = jobFormSchema.parse(formData)
    
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
      return { error: 'You do not have permission to edit this job' }
    }
    
    // Extract data needed for job update
    const { skillIds, industryIds, ...jobDataToUpdate } = validatedData
    
    // Prepare data for update, correctly mapping rich text fields to database field names
    const dataToUpdate = {
      ...jobDataToUpdate,
      educationRequirements: validatedData.educationRequirementsRichText,
      experienceRequirements: validatedData.experienceRequirementsRichText,
    };

    // Update the job (and related records)
    await updateJob(
      jobId, 
      dataToUpdate, 
      validatedData.skillIds, 
      validatedData.industryIds
    )
    
    // Revalidate the paths
    revalidatePath(`/employer/jobs/${jobId}`)
    revalidatePath('/employer/jobs')
    
    // Revalidate cache tags
    revalidateTag('job-detail')
    revalidateTag('job-applications')
    
    // Return success
    return { success: true, jobId }
  } catch (error) {
    console.error('Error updating job posting:', error)
    if (error instanceof z.ZodError) {
      return { error: 'Invalid form data. Please check your entries.' }
    }
    return { error: 'Failed to update job posting. Please try again.' }
  }
} 