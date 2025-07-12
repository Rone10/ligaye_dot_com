'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { getUser, getCachedUser } from '@/lib/supabase/server'
import { jobFormSchema } from './_utils/validation'
import { 
  getEmployerProfile, 
  insertNewJob,
  calculateExpiryDate,
  getAllSkills,
  getAllIndustries,
  getAllLocations
} from './_queries'
import { CACHE_TAGS } from './_utils/cache-tags'
import { db } from '@/lib/db'
import { profiles, employerProfiles, jobStatusEnum, payments, jobs } from '@/lib/db/schema'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { createStripeCheckoutSession } from '@/lib/stripe/stripe-actions'
import { recordCouponRedemption } from './_queries/coupon'
import { validateCouponForJobPosting as validateCouponInternal } from './_queries/coupon'
import { getActivePricing, calculateTotalPrice, getDefaultPricing } from '@/lib/utils/pricing'
import { inngest } from '@/inngest/client'
import { paymentArcjet } from '@/lib/arcjet'
import { headers } from 'next/headers'

// Server action for coupon validation (to be used by client components)
export async function validateCoupon(couponCode: string, originalAmount: number) {
  try {
    return await validateCouponInternal(couponCode, originalAmount)
  } catch (error) {
    console.error('Error in validateCoupon action:', error)
    return {
      valid: false,
      error: 'Failed to validate coupon'
    }
  }
}

export async function createJobPosting(formData: z.infer<typeof jobFormSchema> & { coupon?: { couponId: string; code: string; discountAmount: number; finalAmount: number } | null }) {
  const user = await getCachedUser()
  if (!user) {
    return { error: 'You must be logged in to post a job' }
  }
  
  // Payment protection for job posting
  const request = new Request('https://ligaye.com/employer/jobs/new', {
    headers: await headers(),
  });
  
  const decision = await paymentArcjet.protect(request);
  
  if (decision.isDenied()) {
    return { 
      error: 'Too many job posting attempts. Please try again later.' 
    };
  }
  
  try {
    // Extract coupon data before validation
    const { coupon, ...jobData } = formData
    
    // Validate form data
    const validatedData = jobFormSchema.parse(jobData)
    
    // Log payment info for debugging
    console.log('[Action Debug] Payment Method:', validatedData.paymentMethod);
    console.log('[Action Debug] Job Duration:', validatedData.jobDuration);
    
    // Get the current user
    // const user = await getUser()
  
    
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
    
    // Get active pricing configuration
    const pricingConfig = await getActivePricing()
    const pricePerMonth = pricingConfig?.pricePerMonth || getDefaultPricing().pricePerMonth
    
    // Calculate payment amount with coupon
    const baseAmount = calculateTotalPrice(pricePerMonth, validatedData.jobDuration)
    const paymentAmount = coupon ? coupon.finalAmount : baseAmount
    const discountAmount = coupon ? coupon.discountAmount : 0
    
    console.log('[Action Debug] Base amount (cents):', baseAmount);
    console.log('[Action Debug] Discount amount (cents):', discountAmount);
    console.log('[Action Debug] Final paymentAmount (cents):', paymentAmount);
    console.log('[Action Debug] Coupon applied:', coupon ? coupon.code : 'none');
    
    // Invalidate caches related to jobs with specific tags
    await Promise.all([
      // Core job caches
      revalidateTag(CACHE_TAGS.jobs),
      revalidateTag(CACHE_TAGS.employerJobs),
      revalidateTag('public-jobs'),
      revalidateTag('filtered-jobs'),
      
      // Employer-specific caches
      revalidateTag('employer-dashboard'),
      revalidateTag('employer-dashboard-stats'),
      revalidateTag('employer-recent-jobs'),
      revalidateTag(`employer-jobs-${result.employerProfileId}`),
      
      // Public job listing caches
      revalidateTag('job-filters'),
      revalidateTag('locations-for-filters'),
      revalidateTag('industries-for-filters'),
      revalidateTag('saved-jobs'),
      revalidateTag('user-data'),
      
      // Job-specific cache
      revalidateTag(`job-${newJob.id}`)
    ])
    
    // Revalidate paths that show job listings
    revalidatePath('/employer/jobs')
    revalidatePath('/jobs')
    revalidatePath('/employer')
    
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
        currency: 'GMD',
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
          currency: 'GMD',
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
        currency: 'GMD',
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

// Server action to fetch context data for AI generation
export async function fetchAIContextData() {
  try {
    const user = await getCachedUser()
    if (!user) {
      return { 
        success: false, 
        error: 'You must be logged in' 
      }
    }
    
    const [skills, industries, locations, employerProfile] = await Promise.all([
      getAllSkills(),
      getAllIndustries(),
      getAllLocations(),
      getEmployerProfile(user.id)
    ])
    
    return {
      success: true,
      data: {
        skills,
        industries,
        locations,
        employerProfile: employerProfile ? {
          companyName: employerProfile.companyName || '',
          industryId: employerProfile.industryId || undefined
        } : null
      }
    }
  } catch (error) {
    console.error('Error fetching AI context data:', error)
    return {
      success: false,
      error: 'Failed to fetch context data'
    }
  }
}

// Server action to generate job description using AI
export async function generateJobDescription(jobDetails: {
  title: string
  location: string
  experienceLevel: string
  workLocation: string
  jobType: string
  industries: string[]
  skills: string[]
  numberOfOpenings: number
  companyName: string
  companyIndustry: string
  jobLanguage: string
  benefits: string[]
  supplementalPay: string[]
  educationRequirements: string
  experienceRequirements: string
  requestId?: string
}) {
  try {
    const user = await getCachedUser()
    if (!user) {
      return { 
        success: false, 
        error: 'You must be logged in to use AI features' 
      }
    }

    // Generate a unique request ID to track this generation
    const requestId = jobDetails.requestId || uuidv4()

    // Send event to Inngest with all the job details
    const { ids } = await inngest.send({
      name: "job.description.generate",
      data: {
        ...jobDetails,
        requestId,
      },
    })

    console.log('Inngest event sent with IDs:', ids)

    // For development: directly call the Gemini API
    // This is a temporary solution until proper async handling is implemented
    try {
      // Import Gemini SDK
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      
      // Initialize Gemini
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      
      // Build the prompt
      const prompt = `You are an expert HR professional creating job descriptions for the Gambian market.

Generate a compelling job description for:

Job Title: ${jobDetails.title}
Company: ${jobDetails.companyName || 'Our company'}
Location: ${jobDetails.location || 'The Gambia'} (${jobDetails.workLocation})
Experience Level: ${jobDetails.experienceLevel || 'Not specified'}
Job Type: ${jobDetails.jobType}
Number of Openings: ${jobDetails.numberOfOpenings || 1}
Industries: ${jobDetails.industries?.join(', ') || jobDetails.companyIndustry || 'Not specified'}
Key Skills: ${jobDetails.skills?.join(', ') || 'To be determined'}
Language: ${jobDetails.jobLanguage || 'English'}
${jobDetails.benefits?.length ? `Benefits: ${jobDetails.benefits.join(', ')}` : ''}
${jobDetails.supplementalPay?.length ? `Supplemental Pay: ${jobDetails.supplementalPay.join(', ')}` : ''}
${jobDetails.educationRequirements ? `Education Requirements: ${jobDetails.educationRequirements}` : ''}
${jobDetails.experienceRequirements ? `Experience Requirements: ${jobDetails.experienceRequirements}` : ''}

Create a job description with:
1. An engaging overview of the role
2. 5-8 key responsibilities specific to ${jobDetails.title}
3. What the company offers (benefits, growth)
4. Why someone should join
5. Tailored for the ${jobDetails.location || 'Gambian'} market

IMPORTANT: Format your response as HTML with:
- <h3> for section headings
- <p> for paragraphs  
- <ul> and <li> for bullet points
- Do NOT use markdown formatting`
      
      // Generate content
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      console.log('Gemini API response received:', text.substring(0, 200) + '...')
      
      // Clean up the response if needed
      let cleanedText = text
      // Remove any markdown formatting that might slip through
      cleanedText = cleanedText.replace(/^#+\s/gm, '') // Remove markdown headers
      cleanedText = cleanedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Convert bold
      cleanedText = cleanedText.replace(/\*(.*?)\*/g, '<em>$1</em>') // Convert italic
      
      // Ensure proper HTML structure if not present
      if (!cleanedText.includes('<h3>') && !cleanedText.includes('<p>')) {
        // Basic formatting if AI didn't follow HTML instructions
        const sections = cleanedText.split('\n\n')
        cleanedText = sections.map((section, index) => {
          if (index === 0 || section.match(/^(About|Key|What|Why|Requirements|Responsibilities)/i)) {
            const lines = section.split('\n')
            const heading = lines[0]
            const content = lines.slice(1).join('\n')
            return `<h3>${heading}</h3>\n<p>${content}</p>`
          }
          if (section.includes('\n-') || section.includes('\n•')) {
            const items = section.split('\n').filter(item => item.trim())
            const listItems = items.map(item => 
              `<li>${item.replace(/^[-•*]\s*/, '').trim()}</li>`
            ).join('\n')
            return `<ul>\n${listItems}\n</ul>`
          }
          return `<p>${section}</p>`
        }).join('\n\n')
      }
      
      return {
        success: true,
        description: cleanedText,
        message: 'AI-generated job description ready!'
      }
      
    } catch (aiError) {
      console.error('Direct Gemini API error:', aiError)
      // Fallback to Inngest result if direct API fails
      return {
        success: false,
        error: 'AI generation failed. Please check your API key and try again.'
      }
    }

  } catch (error) {
    console.error('Error generating job description:', error)
    return {
      success: false,
      error: 'Failed to generate description. Please try again.'
    }
  }
} 

