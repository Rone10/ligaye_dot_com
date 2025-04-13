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
export async function insertApplication(data: NewApplication) {
  try {
    const result = await db()
      .insert(applications)
      .values(data)
      .returning({ id: applications.id })
    
    return { success: true, data: result[0] }
  } catch (error: any) {
    // Handle unique constraint violation
    if (error.code === '23505') { // PostgreSQL unique violation
      return { 
        success: false, 
        error: 'You have already applied for this job' 
      }
    }
    
    return { 
      success: false, 
      error: 'Failed to submit application' 
    }
  }
}

// Check if a candidate has already applied to a job
export async function checkExistingApplication(
  jobId: string, 
  candidateProfileId: string
) {
  const result = await db()
    .select({ id: applications.id })
    .from(applications)
    .where(
      and(
        eq(applications.jobId, jobId),
        eq(applications.candidateProfileId, candidateProfileId)
      )
    )
    .limit(1)
  
  return result.length > 0
} 