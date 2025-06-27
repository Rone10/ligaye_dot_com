'use server'

import { revalidatePath, revalidateTag } from "next/cache"
import { getUser } from "@/lib/supabase/server"
import { applicationStatusUpdateSchema, type ApplicationStatusUpdateInput } from "./_utils/validation"
import { updateApplicationStatus, getApplicationDetails } from "./_queries"
import { Resend } from 'resend'
import { ApplicationStatusUpdatedEmail } from '@/emails/application-status-updated'
import { format } from 'date-fns'
import { APPLICANT_DETAIL_CACHE_TAGS } from './_utils/cache-tags'
import { APPLICANTS_CACHE_TAGS } from '../_utils/cache-tags'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function updateStatus(
  applicationId: string,
  formData: ApplicationStatusUpdateInput
) {
  try {
    // Validate user authentication
    const user = await getUser()
    if (!user) {
      return { success: false, error: "You must be logged in to update application status" }
    }

    // Ensure the user is an employer or admin
    if (user.user_metadata?.role !== 'employer' && user.user_metadata?.role !== 'admin') {
      return { success: false, error: "You don't have permission to update application status" }
    }
    
    // Parse and validate form data
    const validatedData = applicationStatusUpdateSchema.parse(formData)
    
    // Update application status
    const result = await updateApplicationStatus(applicationId, validatedData)
    
    if (result.success) {
      try {
        // Get application details including candidate email
        const applicationDetails = await getApplicationDetails(applicationId)
        
        if (applicationDetails && applicationDetails.candidateEmail) {
          // Format interview date if provided
          let formattedInterviewDate: string | undefined = undefined
          if (validatedData.interviewDate) {
            formattedInterviewDate = format(new Date(validatedData.interviewDate), 'd MMMM yyyy h:mm a')
          } else {
            formattedInterviewDate = "Not scheduled"
          }
          
          // Ensure we have valid strings for required fields, provide fallbacks for null values
          const candidateName = applicationDetails.candidateName || 'Applicant'
          const jobTitle = applicationDetails.jobTitle || 'the position'
          const companyName = applicationDetails.companyName || 'the company'
          const companyLocation = applicationDetails.companyLocation || undefined
          
        //   // Determine email recipient - use the candidate email or a test email for development
        //   const recipient = process.env.NODE_ENV === 'development' && !applicationDetails.candidateEmail.includes('@resend-test.com')
        //     ? 'delivered@resend.dev'  // Resend's test email that works in all environments
        //     : applicationDetails.candidateEmail

          const recipient = applicationDetails.candidateEmail
          
          // Send email notification to candidate
          const { error: emailError } = await resend.emails.send({
            from: 'Ligaye.com <no-reply@ligaye.com>',
            to: [recipient],
            subject: `Application Status Update: ${jobTitle}`,
            react: ApplicationStatusUpdatedEmail({
              candidateName,
              jobTitle,
              companyName,
              newStatus: validatedData.status as any, // Type cast to satisfy the email template
              interviewDate: formattedInterviewDate,
              interviewLocation: companyLocation,
              additionalNotes: validatedData.notes || undefined,
              dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/candidate/applications`
            }),
          })
          
          if (emailError) {
            console.error("Failed to send status update email:", emailError)
            // Continue since the status was updated successfully
          }
        } else {
          console.warn("Could not send email: Candidate email not found")
        }
      } catch (emailError) {
        console.error("Error sending status update email:", emailError)
        // Continue since the status was updated successfully
      }
      
      // Invalidate all relevant cache tags
      await Promise.all([
        // Detail page specific tags
        revalidateTag(APPLICANT_DETAIL_CACHE_TAGS.application(applicationId)),
        revalidateTag(APPLICANT_DETAIL_CACHE_TAGS.applicationDetail(applicationId)),
        revalidateTag(APPLICANT_DETAIL_CACHE_TAGS.applicationStatus(applicationId)),
        
        // List page tags
        revalidateTag(APPLICANTS_CACHE_TAGS.allApplications),
        revalidateTag(APPLICANTS_CACHE_TAGS.applicationCounts),
        revalidateTag(APPLICANTS_CACHE_TAGS.application(applicationId)),
        revalidateTag(APPLICANTS_CACHE_TAGS.applicationDetail(applicationId)),
        revalidateTag(APPLICANTS_CACHE_TAGS.applicationsByStatus(validatedData.status)),
        
        // Interview specific tags if interview scheduled
        ...(validatedData.status === 'INTERVIEW_SCHEDULED' ? [
          revalidateTag(APPLICANT_DETAIL_CACHE_TAGS.applicationInterview(applicationId))
        ] : [])
      ])
      
      // Also revalidate paths for immediate UI update
      revalidatePath(`/employer/jobs/applicants/${applicationId}`)
      revalidatePath('/employer/jobs/applicants')
    }
    
    return result
  } catch (error) {
    console.error("Status update error:", error)
    return { success: false, error: "Failed to update application status" }
  }
} 