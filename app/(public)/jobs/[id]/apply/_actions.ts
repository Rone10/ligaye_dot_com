'use server'

import { revalidatePath, revalidateTag } from "next/cache"
import { getUser } from "@/lib/supabase/server"
import { createClient } from "@/lib/supabase/server"
import { applicationFormSchema, type ApplicationFormValues } from "./_utils/validation"
import { insertApplication, checkExistingApplication, getJobDetails } from "./_queries"
import { applicationStatusEnum } from "@/lib/db/schema"
import { v4 as uuidv4 } from "uuid"
import { Resend } from 'resend'
import { JobSuccessfullyAppliedEmail } from '@/emails/job-successfully-applied'
import { format } from 'date-fns'
import { formArcjet } from '@/lib/arcjet'
import { headers } from 'next/headers'
import { JOB_DETAIL_CACHE_TAGS } from '@/app/(dashboard)/employer/jobs/[id]/_utils/cache-tags'
import { APPLICANTS_CACHE_TAGS } from '@/app/(dashboard)/employer/jobs/applicants/_utils/cache-tags'
import { EMPLOYER_DASHBOARD_CACHE_TAGS } from '@/app/(dashboard)/employer/_utils/cache-tags'
import { 
  invalidateCandidateApplications as invalidateDashboardApplications,
  invalidateCandidateDashboard
} from '@/app/(dashboard)/candidate/_queries'
import {
  invalidateCandidateApplications as invalidateApplicationsList,
  invalidateApplicationsCollection
} from '@/app/(dashboard)/candidate/applications/_queries'

const resend = new Resend(process.env.RESEND_API_KEY)

interface ApplicationSubmissionParams {
  formData: ApplicationFormValues
  jobId: string
  candidateProfileId: string
  profileResumeUrl: string | null
  profileResumeFilename: string | null
}

export async function submitApplication({
  formData,
  jobId,
  candidateProfileId,
  profileResumeUrl,
  profileResumeFilename
}: ApplicationSubmissionParams) {
  try {
    // Bot protection and rate limiting
    const request = new Request(`https://ligaye.com/jobs/${jobId}/apply`, {
      headers: await headers(),
    });
    
    const decision = await formArcjet.protect(request);
    
    if (decision.isDenied()) {
      return { success: false, error: "Too many application attempts. Please try again later." };
    }
    
    // Validate user authentication
    const user = await getUser()
    if (!user) {
      return { success: false, error: "You must be logged in to apply" }
    }
    
    // Parse and validate form data
    const validatedData = applicationFormSchema.parse(formData)
    
    // Check if already applied
    const alreadyApplied = await checkExistingApplication(jobId, candidateProfileId)
    if (alreadyApplied) {
      return { success: false, error: "You have already applied for this job" }
    }
    
    // Initialize Supabase client for file uploads
    const supabase = await createClient()
    
    // Handle resume
    let resumeUrl = profileResumeUrl
    let resumeFilename = profileResumeFilename
    
    if (validatedData.resumeOption === "upload" && validatedData.resumeFile) {
      const file = validatedData.resumeFile
      const fileExt = file.name.split('.').pop()
      const fileName = `${uuidv4()}.${fileExt}`
      const filePath = `resumes/${candidateProfileId}/${jobId}/${fileName}`
      
      // Upload file to Supabase Storage
      const { data: resumeData, error: resumeError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file)
      
      if (resumeError) {
        console.log('Resume upload failed in submitApplication:', resumeError);
        return { success: false, error: "Failed to upload resume" }
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath)
      
      resumeUrl = publicUrl
      resumeFilename = file.name
    }
    
    // Handle cover letter
    let coverLetterUrl = null
    let coverLetterFilename = null
    let coverLetterText = null
    
    if (validatedData.coverLetterOption === "upload" && validatedData.coverLetterFile) {
      const file = validatedData.coverLetterFile
      const fileExt = file.name.split('.').pop()
      const fileName = `${uuidv4()}.${fileExt}`
      const filePath = `cover-letters/${candidateProfileId}/${jobId}/${fileName}`
      
      // Upload file to Supabase Storage
      const { data: clData, error: clError } = await supabase.storage
        .from('cover-letters')
        .upload(filePath, file)
      
      if (clError) {
        console.log('Cover letter upload failed in submitApplication:', clError);
        return { success: false, error: "Failed to upload cover letter" }
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('cover-letters')
        .getPublicUrl(filePath)
      
      coverLetterUrl = publicUrl
      coverLetterFilename = file.name
    } else if (validatedData.coverLetterOption === "text" && validatedData.coverLetterText) {
      coverLetterText = validatedData.coverLetterText
    }
    
    // Create application date
    const applicationDate = new Date()
    
    // Prepare application data
    const applicationData = {
      jobId,
      candidateProfileId,
      status: applicationStatusEnum.enumValues[0], // 'APPLIED'
      resumeUrl,
      resumeFilename,
      coverLetterUrl,
      coverLetterFilename,
      coverLetterText,
      appliedAt: applicationDate,
      updatedAt: applicationDate,
    }
    
    // Insert application record
    const result = await insertApplication(applicationData)
    
    let jobDetails: Awaited<ReturnType<typeof getJobDetails>> | null = null

    // If the application was successful, send confirmation email to the candidate
    if (result.success) {
      try {
        // Get job details and company name
        jobDetails = await getJobDetails(jobId)
        
        if (jobDetails && user.email) {
          // Format the application date
          const formattedDate = format(applicationDate, 'd MMMM yyyy')
          
          // Send the confirmation email to the candidate
          // console.log('user.user_metadata', user.user_metadata)
          const candidateFullName = user.user_metadata?.first_name + ' ' + user.user_metadata?.last_name
          const { error: emailError } = await resend.emails.send({
            from: 'Ligaye.com <no-reply@ligaye.com>',
            to: [user.email],
            subject: `Application Submitted: ${jobDetails.title}`,
            react: JobSuccessfullyAppliedEmail({
              candidateName: candidateFullName || 'Candidate',
              jobTitle: jobDetails.title,
              companyName: jobDetails.companyName || 'Unknown Company',
              applicationDate: formattedDate,
              dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/candidate/applications`,
              exploreMoreJobsUrl: `${process.env.NEXT_PUBLIC_APP_URL}/jobs`,
            }),
          })
          
          if (emailError) {
            console.error("Failed to send confirmation email:", emailError)
            // Don't return error here, as the application was successful
          }
        }
      } catch (emailError) {
        console.error("Error sending confirmation email:", emailError)
        // Application was still successful, so continue
      }
    }

    if (result.success) {
      const tagsToRevalidate: Array<Promise<void>> = [
        Promise.resolve(revalidateTag(JOB_DETAIL_CACHE_TAGS.jobApplications(jobId))),
        Promise.resolve(revalidateTag(JOB_DETAIL_CACHE_TAGS.jobApplicationStats(jobId))),
        Promise.resolve(revalidateTag(JOB_DETAIL_CACHE_TAGS.jobRecentApplications(jobId))),
        Promise.resolve(revalidateTag(JOB_DETAIL_CACHE_TAGS.allApplications)),
        Promise.resolve(revalidateTag(APPLICANTS_CACHE_TAGS.allApplications)),
        Promise.resolve(revalidateTag(APPLICANTS_CACHE_TAGS.applicationCounts)),
        Promise.resolve(revalidateTag(APPLICANTS_CACHE_TAGS.jobApplications(jobId))),
        Promise.resolve(revalidateTag(APPLICANTS_CACHE_TAGS.applicationsByStatus('APPLIED'))),
      ]

      if (jobDetails?.companyId) {
        tagsToRevalidate.push(
          Promise.resolve(revalidateTag(APPLICANTS_CACHE_TAGS.employerApplications(jobDetails.companyId))),
          Promise.resolve(revalidateTag(EMPLOYER_DASHBOARD_CACHE_TAGS.stats(jobDetails.companyId))),
          Promise.resolve(revalidateTag(EMPLOYER_DASHBOARD_CACHE_TAGS.recentApplications(jobDetails.companyId))),
        )
      }

      await Promise.all(tagsToRevalidate)

      // Ensure employer applicants page is re-rendered after cache invalidation
      revalidatePath('/employer/jobs/applicants')

      await Promise.all([
        invalidateApplicationsList(user.id),
        invalidateApplicationsCollection(),
        invalidateDashboardApplications(user.id),
        invalidateCandidateDashboard(user.id)
      ])
    }
    
    // Revalidate related paths
    revalidatePath(`/jobs/${jobId}`)
    revalidatePath('/applications')
    revalidatePath('/dashboard/applications')
    revalidatePath('/candidate/applications')
    
    return result
  } catch (error) {
    console.error("Application submission error:", error)
    return { success: false, error: "Failed to submit application" }
  }
} 