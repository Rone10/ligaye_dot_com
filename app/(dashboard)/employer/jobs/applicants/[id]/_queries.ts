'use server'

import { db } from "@/lib/db"
import { applications, jobs, employerProfiles, candidateProfiles, profiles } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { ApplicationStatusUpdateInput } from "./_utils/validation"
import { createClient } from "@/lib/supabase/server"
import { getUserById } from "@/lib/supabase/admin"
import { unstable_cache } from 'next/cache'
import { APPLICANT_DETAIL_CACHE_TAGS } from './_utils/cache-tags'
import { APPLICANTS_CACHE_TAGS } from '../_utils/cache-tags'
// Internal function to get application details (no auth check)
async function getApplicationDetailsInternal(applicationId: string) {
  // Get the application and join with profiles to get userId
  const result = await db()
    .select({
      id: applications.id,
      status: applications.status,
      jobId: applications.jobId,
      jobTitle: jobs.title,
      companyId: jobs.companyId,
      companyName: employerProfiles.companyName,
      companyLocation: employerProfiles.hqAddressDisplay,
      candidateProfileId: applications.candidateProfileId,
      candidateName: profiles.fullName,
      candidateUserId: profiles.userId,
    })
    .from(applications)
    .leftJoin(jobs, eq(applications.jobId, jobs.id))
    .leftJoin(employerProfiles, eq(jobs.companyId, employerProfiles.id))
    .leftJoin(candidateProfiles, eq(applications.candidateProfileId, candidateProfiles.id))
    .leftJoin(profiles, eq(candidateProfiles.profileId, profiles.id))
    .where(eq(applications.id, applicationId))
    .limit(1)

  if (result.length === 0) {
    return null
  }

  return result[0]
}

// Internal function to get candidate email (cached separately)
async function getCandidateEmailInternal(userId: string) {
  const data = await getUserById(userId)
  if (data) {
    return data.user_metadata.email || null
  }
  return null
}

// Get detailed application information including candidate email
export async function getApplicationDetails(applicationId: string) {
  try {
    // Cache the application details
    const cachedApplicationDetails = unstable_cache(
      async () => getApplicationDetailsInternal(applicationId),
      [`application-details-${applicationId}`],
      {
        tags: [
          APPLICANT_DETAIL_CACHE_TAGS.application(applicationId),
          APPLICANT_DETAIL_CACHE_TAGS.applicationDetail(applicationId),
          APPLICANTS_CACHE_TAGS.allApplications
        ]
      }
    )
    
    const applicationData = await cachedApplicationDetails()
    
    if (!applicationData) {
      return null
    }
    
    // Get the candidate's email separately (can be cached)
    let candidateEmail: string | undefined;
    
    if (applicationData.candidateUserId) {
      // Cache the email fetch as well
      const cachedEmailFetch = unstable_cache(
        async () => getCandidateEmailInternal(applicationData.candidateUserId!),
        [`candidate-email-${applicationData.candidateUserId}`],
        {
          tags: [
            APPLICANT_DETAIL_CACHE_TAGS.applicationEmail(applicationId),
            APPLICANTS_CACHE_TAGS.allApplications
          ]
        }
      )
      
      const email = await cachedEmailFetch()
      candidateEmail = email || undefined
    }
    
    // If we couldn't get the email for some reason, use a fallback
    if (!candidateEmail) {
      console.warn(`Could not retrieve email for user ID: ${applicationData.candidateUserId}`)
      // In a development environment, you might want to use a test email that won't trigger validation errors
      candidateEmail = process.env.NODE_ENV === 'development' 
        ? `candidate-test@resend-test.com` 
        : undefined
    }
    
    return {
      ...applicationData,
      candidateEmail
    }
  } catch (error) {
    console.error("Error fetching application details:", error)
    return null
  }
}

// Update application status
export async function updateApplicationStatus(applicationId: string, data: ApplicationStatusUpdateInput) {
  try {
    // Parse date string to Date object if it exists, or null if not
    let interviewDate: Date | null = null;
    if (data.interviewDate && typeof data.interviewDate === 'string') {
      interviewDate = new Date(data.interviewDate);
    }
    
    await db()
      .update(applications)
      .set({
        status: data.status,
        interviewDate,
        notes: data.notes,
        updatedAt: new Date()
      })
      .where(eq(applications.id, applicationId))
    
    return { success: true }
  } catch (error) {
    console.error("Error updating application status:", error)
    return { success: false, error: "Failed to update application status" }
  }
} 