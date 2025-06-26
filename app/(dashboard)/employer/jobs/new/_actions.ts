'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'
import { jobFormSchema } from './_utils/validation'
import { 
  getEmployerProfile, 
  insertNewJob,
  calculateExpiryDate
} from './_queries'
import { db } from '@/lib/db'
import { profiles, employerProfiles, jobStatusEnum, payments, jobs } from '@/lib/db/schema'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { createStripeCheckoutSession } from '@/lib/stripe/stripe-actions'
import { recordCouponRedemption } from './_queries/coupon'

export async function createJobPosting(formData: z.infer<typeof jobFormSchema> & { coupon?: { couponId: string; code: string; discountAmount: number; finalAmount: number } | null }) {
  try {
    // Extract coupon data before validation
    const { coupon, ...jobData } = formData
    
    // Validate form data
    const validatedData = jobFormSchema.parse(jobData)
    
    // Log payment info for debugging
    console.log('[Action Debug] Payment Method:', validatedData.paymentMethod);
    console.log('[Action Debug] Job Duration:', validatedData.jobDuration);
    
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
    console.log('[Action Debug] Job Duration:', validatedData.jobDuration);
    const expiresAt = await calculateExpiryDate(validatedData.jobDuration)
    console.log('[Action Debug] Calculated expiresAt:', expiresAt);
    
    // Determine initial job status based on payment method
    const initialStatus = validatedData.paymentMethod === 'cash' 
      ? jobStatusEnum.enumValues[1] // 'PENDING_PAYMENT'
      : jobStatusEnum.enumValues[0] // 'DRAFT'
    
    console.log('[Action Debug] Initial job status:', initialStatus);
    
    // Generate a simple slug
    const slug = `${validatedData.title.toLowerCase().replace(/\s+/g, '-')}-${uuidv4().slice(0, 8)}`
    
    // Extract data needed for job creation
    const jobDataWithMeta = {
      ...validatedData,
      companyId: result.employerProfileId,
      status: initialStatus,
      expiresAt,
      slug
    }
    
    // Remove payment-specific fields and convert array fields to strings
    const { 
      jobDuration, 
      paymentMethod, 
      skillIds, 
      industryIds, 
      educationRequirements, 
      experienceRequirements,
      educationRequirementsRichText,
      experienceRequirementsRichText,
      ...baseJobData 
    } = jobDataWithMeta
    
    // Log the rich text fields for debugging
    console.log('[Action Debug] Education Rich Text Length:', educationRequirementsRichText?.length || 0);
    console.log('[Action Debug] Experience Rich Text Length:', experienceRequirementsRichText?.length || 0);
    
    // Use rich text fields for the database
    const jobDataToInsert = {
      ...baseJobData,
      educationRequirements: educationRequirementsRichText || '',
      experienceRequirements: experienceRequirementsRichText || ''
    };
    
    // Insert the job (and related records)
    const newJob = await insertNewJob(
      jobDataToInsert, 
      validatedData.skillIds, 
      validatedData.industryIds
    )
    
    console.log('[Action Debug] New job created with ID:', newJob.id);
    
    // Calculate payment amount with coupon
    const baseAmount = validatedData.jobDuration * 5000 // $50 in cents per month
    const paymentAmount = coupon ? coupon.finalAmount : baseAmount
    const discountAmount = coupon ? coupon.discountAmount : 0
    
    console.log('[Action Debug] Base amount (cents):', baseAmount);
    console.log('[Action Debug] Discount amount (cents):', discountAmount);
    console.log('[Action Debug] Final paymentAmount (cents):', paymentAmount);
    console.log('[Action Debug] Coupon applied:', coupon ? coupon.code : 'none');
    
    // Invalidate caches related to jobs
    revalidateTag('jobs')
    revalidateTag('employer-jobs')
    revalidateTag('public-jobs')
    revalidateTag('filtered-jobs') // Invalidate cached job listings for public jobs page
    // Invalidate reference data caches if they might be affected
    revalidateTag('locations')
    revalidateTag('skills') 
    revalidateTag('industries')
    // Invalidate employer dashboard caches
    revalidateTag('employer-dashboard')
    revalidateTag('employer-dashboard-stats')
    revalidateTag('employer-recent-jobs')
    // Invalidate public job listing caches
    revalidateTag('job-filters')
    revalidateTag('locations-for-filters')
    revalidateTag('industries-for-filters')
    revalidateTag('saved-jobs') // Invalidate saved jobs cache to ensure accuracy
    revalidateTag('user-data') // Invalidate user data cache that might reference jobs
    // Revalidate paths that show job listings
    revalidatePath('/employer/jobs')
    revalidatePath('/jobs')
    revalidatePath('/employer') // Also revalidate the employer dashboard path
    
    // Check if coupon covers full amount (payment is free)
    if (paymentAmount === 0 && coupon) {
      console.log('[Action Debug] Coupon covers full amount - publishing job immediately');
      
      // Update job status to ACTIVE since payment is covered
      await db()
        .update(jobs)
        .set({ status: 'ACTIVE' })
        .where(eq(jobs.id, newJob.id));
      
      // Create a payment record with completed status
      const [paymentRecord] = await db().insert(payments).values({
        jobId: newJob.id,
        employerProfileId: result.employerProfileId,
        amount: 0, // Payment amount is 0 after coupon
        currency: 'USD',
        method: validatedData.paymentMethod, // Keep the original payment method choice
        status: 'completed', // Mark as completed since coupon covers full amount
        transactionId: `COUPON_${coupon.code}_${Date.now()}`,
        couponId: coupon.couponId,
        metadata: JSON.stringify({
          jobTitle: validatedData.title,
          duration: validatedData.jobDuration,
          createdBy: user.id,
          baseAmount: baseAmount,
          discountAmount: discountAmount,
          couponCode: coupon.code,
          fullyCoveredByCoupon: true
        }),
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning()
      
      // Record coupon redemption
      if (paymentRecord) {
        await recordCouponRedemption(
          coupon.couponId,
          result.profileId,
          paymentRecord.id,
          newJob.id,
          baseAmount,
          discountAmount,
          0 // Final amount is 0
        )
      }
      
      // Return success with published status
      return { 
        success: true,
        jobId: newJob.id, 
        status: 'ACTIVE',
        fullyCoveredByCoupon: true,
        message: 'Job posted successfully! The coupon covered the full cost.'
      }
    }
    
    // Handle payment method
    if (validatedData.paymentMethod === 'stripe') {
      try {
        // Create a Stripe checkout session
        console.log('[Action Debug] Creating Stripe checkout session...');
        const stripeResult = await createStripeCheckoutSession({
          jobId: newJob.id,
          employerProfileId: result.employerProfileId,
          paymentAmount,
          currency: 'USD',
          jobTitle: validatedData.title,
          jobDuration: validatedData.jobDuration,
          userId: user.id,
          couponId: coupon?.couponId,
          couponCode: coupon?.code,
          baseAmount: baseAmount,
          discountAmount: discountAmount
        });
        
        const sessionUrl = stripeResult.sessionUrl;
        const sessionId = stripeResult.sessionId || '';
        
        console.log('[Action Debug] Stripe session URL created:', sessionUrl ? 'URL received' : 'NO URL RECEIVED');
        console.log('[Action Debug] Session ID:', sessionId);
        console.log('[Action Debug] Actual URL (partial for security):', sessionUrl ? `${sessionUrl.substring(0, 30)}...` : 'none');
        
        // Create a specific response object for Stripe payments with a job ID and direct URL
        const stripeResponse = {
          success: true,
          jobId: newJob.id,
          paymentUrl: sessionUrl,
          paymentMethod: 'stripe'
        };
        
        console.log('[Action Debug] Final response object:', JSON.stringify(stripeResponse, null, 2));
        
        // Return the response with URL
        return stripeResponse;
      } catch (stripeError) {
        console.error('[Action Debug] Entered CATCH block for Stripe session creation.');
        console.error('[Action Debug] Error creating Stripe checkout session:', stripeError);
        
        // Log structure of the error if possible
        if (stripeError instanceof Error) {
          console.error('[Action Debug] Stripe Error Name:', stripeError.name);
          console.error('[Action Debug] Stripe Error Message:', stripeError.message);
          console.error('[Action Debug] Stripe Error Stack:', stripeError.stack);
        }
        
        // If Stripe session creation fails, default to DRAFT status
        await db()
          .update(jobs)
          .set({ status: 'DRAFT' })
          .where(eq(jobs.id, newJob.id));
          
        return { error: 'Failed to create payment session. Your job has been saved as a draft.' };
      }
    } else {
      // Cash payment - create a payment record with 'pending' status (unless fully covered by coupon)
      const paymentStatus = paymentAmount === 0 ? 'completed' : 'pending'
      const jobFinalStatus = paymentAmount === 0 ? 'ACTIVE' : 'PENDING_PAYMENT'
      
      // Update job status if fully covered by coupon
      if (paymentAmount === 0) {
        await db()
          .update(jobs)
          .set({ status: 'ACTIVE' })
          .where(eq(jobs.id, newJob.id));
      }
      
      const [paymentRecord] = await db().insert(payments).values({
        jobId: newJob.id,
        employerProfileId: result.employerProfileId,
        amount: paymentAmount,
        currency: 'USD',
        method: 'cash',
        status: paymentStatus,
        transactionId: paymentAmount === 0 ? `COUPON_${coupon?.code}_${Date.now()}` : null,
        couponId: coupon?.couponId || null,
        metadata: JSON.stringify({
          jobTitle: validatedData.title,
          duration: validatedData.jobDuration,
          createdBy: user.id,
          baseAmount: baseAmount,
          discountAmount: discountAmount,
          couponCode: coupon?.code || null,
          fullyCoveredByCoupon: paymentAmount === 0
        }),
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning()
      
      // Record coupon redemption if coupon was used
      if (coupon && paymentRecord) {
        await recordCouponRedemption(
          coupon.couponId,
          result.profileId,
          paymentRecord.id,
          newJob.id,
          baseAmount,
          discountAmount,
          paymentAmount
        )
      }
      
      // Return appropriate response based on whether coupon covered full amount
      if (paymentAmount === 0) {
        return { 
          success: true,
          jobId: newJob.id, 
          status: 'ACTIVE',
          fullyCoveredByCoupon: true,
          message: 'Job posted successfully! The coupon covered the full cost.'
        }
      }
      
      // Redirect to job listing with pending status
      return { jobId: newJob.id, status: 'PENDING_PAYMENT' }
    }
  } catch (error) {
    console.error('[Action Debug] Error creating job posting:', error)
    if (error instanceof z.ZodError) {
      console.error('[Action Debug] ZodError details:', JSON.stringify(error.format(), null, 2));
      return { error: 'Invalid form data. Please check your entries.' }
    }
    return { error: 'Failed to create job posting. Please try again.' }
  }
} 