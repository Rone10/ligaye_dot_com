import { db } from "@/lib/db"
import { 
  jobs, 
  employerProfiles,
  candidateProfiles,
  profiles,
  applications,
  type NewApplication
} from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { ApplicationStatusUpdateInput } from "./_utils/validation"

// Get job and candidate data for application context
export async function getApplicationContextData(
  id: string, 
  userId: string
) {
  // Get job with company information
  const result = await db()
    .select({
      job: {
        id: jobs.id,
        title: jobs.title,
        applicationMethod: jobs.applicationMethod,
        resumeRequired: jobs.resumeRequired,
      },
      companyName: employerProfiles.companyName,
    })
    .from(jobs)
    .leftJoin(employerProfiles, eq(jobs.companyId, employerProfiles.id))
    .where(eq(jobs.id, id))
    .limit(1)
  
  const jobData = result[0]
  
  // Get candidate profile
  const candidateResult = await db()
    .select({
      id: candidateProfiles.id,
      resumeUrl: candidateProfiles.resumeUrl,
      resumeFilename: candidateProfiles.resumeFilename,
    })
    .from(candidateProfiles)
    .leftJoin(profiles, eq(candidateProfiles.profileId, profiles.id))
    .where(eq(profiles.userId, userId))
    .limit(1)
  
  const candidateProfile = candidateResult[0]
  
  // Check if user already applied
  let existingApplication = null
  if (jobData && candidateProfile) {
    const applicationResult = await db()
      .select({
        id: applications.id,
        status: applications.status,
      })
      .from(applications)
      .where(
        and(
          eq(applications.jobId, jobData.job.id),
          eq(applications.candidateProfileId, candidateProfile.id)
        )
      )
      .limit(1)
    
    existingApplication = applicationResult[0] || null
  }
  
  return {
    job: jobData ? {
      ...jobData.job,
      companyName: jobData.companyName,
    } : null,
    candidateProfile,
    existingApplication
  }
}

// Insert application
export async function insertApplication(applicationData: any) {
  try {
    await db().insert(applications).values(applicationData)
    return { success: true }
  } catch (error) {
    console.error("Error inserting application:", error)
    return { success: false, error: "Database error when submitting application" }
  }
}

// Check if a candidate has already applied to a job
export async function checkExistingApplication(jobId: string, candidateProfileId: string) {
  try {
    const result = await db()
      .select({ id: applications.id })
      .from(applications)
      .where(
        and(
          eq(applications.jobId, jobId),
          eq(applications.candidateProfileId, candidateProfileId),
          eq(applications.deleted, false)
        )
      )
      .limit(1)
    
    return result.length > 0
  } catch (error) {
    console.error("Error checking existing application:", error)
    throw error
  }
}

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

export async function getJobDetails(jobId: string) {
  try {
    const result = await db()
      .select({
        id: jobs.id,
        title: jobs.title,
        companyId: jobs.companyId,
        companyName: employerProfiles.companyName
      })
      .from(jobs)
      .leftJoin(employerProfiles, eq(jobs.companyId, employerProfiles.id))
      .where(eq(jobs.id, jobId))
      .limit(1)
    
    return result[0]
  } catch (error) {
    console.error("Error fetching job details:", error)
    return null
  }
} 