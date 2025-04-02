'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'
import { jobFormSchema } from './_utils/validation'
import { 
  getEmployerProfile, 
  insertNewJob 
} from './_queries'
import { db } from '@/lib/db'
import { profiles, employerProfiles } from '@/lib/db/schema'
import { jobStatusEnum } from '@/lib/db/schema'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'

// Helper to calculate expiresAt based on duration
function calculateExpiryDate(durationMonths: number): Date {
  const expiryDate = new Date()
  expiryDate.setMonth(expiryDate.getMonth() + durationMonths)
  return expiryDate
}

export async function createJobPosting(formData: z.infer<typeof jobFormSchema>) {
  try {
    // Validate form data
    const validatedData = jobFormSchema.parse(formData)
    
    // Get the current user
    const user = await getUser()
    if (!user) {
      return { error: 'You must be logged in to post a job' }
    }
    
    // Get employer profile for the user
    const result = await db()
      .select({
        employerProfileId: employerProfiles.id,
        profileId: profiles.id,
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
      .then(res => res[0])
    
    if (!result) {
      return { error: 'Employer profile not found. Please complete your profile first.' }
    }
    
    // Calculate expiry date based on duration
    const expiresAt = calculateExpiryDate(validatedData.jobDuration)
    
    // Determine initial job status based on payment method
    const initialStatus = validatedData.paymentMethod === 'cash' 
      ? jobStatusEnum.enumValues[1] // 'PENDING_PAYMENT'
      : jobStatusEnum.enumValues[0] // 'DRAFT'
    
    // Generate a simple slug
    const slug = `${validatedData.title.toLowerCase().replace(/\s+/g, '-')}-${uuidv4().slice(0, 8)}`
    
    // Extract data needed for job creation
    const jobData = {
      ...validatedData,
      companyId: result.employerProfileId,
      status: initialStatus,
      expiresAt,
      slug
    }
    
    // Remove payment-specific fields
    const { jobDuration, paymentMethod, skillIds, industryIds, ...jobDataToInsert } = jobData
    
    // Insert the job (and related records)
    const newJob = await insertNewJob(
      jobDataToInsert, 
      validatedData.skillIds, 
      validatedData.industryIds
    )
    
    // Handle payment method
    if (validatedData.paymentMethod === 'stripe') {
      // In a real app, we would create a Stripe payment session
      // Mock for demo purposes
      const stripePaymentUrl = `/employer/stripe-mock?jobId=${newJob.id}&amount=${validatedData.jobDuration * 100}`
      return { jobId: newJob.id, paymentUrl: stripePaymentUrl }
    } else {
      // Cash payment
      // In a real app, we might create a payment record with 'pending' status
      
      // Redirect to job listing with pending status
      revalidatePath('/employer/jobs')
      return { jobId: newJob.id, status: 'pending' }
    }
  } catch (error) {
    console.error('Error creating job posting:', error)
    if (error instanceof z.ZodError) {
      return { error: 'Invalid form data. Please check your entries.' }
    }
    return { error: 'Failed to create job posting. Please try again.' }
  }
} 