import { db } from '@/lib/db/db';
import { 
  profiles, 
  employerProfiles, 
  jobs,
  applications,
  candidateProfiles
} from '@/lib/db/schema';
import { eq, and, count, desc, sql, gt } from 'drizzle-orm';

/**
 * Get the count of active jobs for an employer
 */
export async function getEmployerActiveJobsCount(companyId: string) {
  try {
    const result = await db()
      .select({ count: count() })
      .from(jobs)
      .where(
        and(
          eq(jobs.companyId, companyId),
          eq(jobs.isActive, true)
        )
      );
    
    return result[0]?.count || 0;
  } catch (error) {
    console.error('Error counting employer active jobs:', error);
    return 0;
  }
}

/**
 * Get the count of total applicants for an employer's jobs
 */
export async function getEmployerTotalApplicantsCount(companyId: string) {
  try {
    const result = await db()
      .select({ count: count() })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .where(eq(jobs.companyId, companyId));
    
    return result[0]?.count || 0;
  } catch (error) {
    console.error('Error counting employer total applicants:', error);
    return 0;
  }
}

/**
 * Get the count of pending applications for an employer's jobs
 */
export async function getEmployerPendingApplicationsCount(companyId: string) {
  try {
    const result = await db()
      .select({ count: count() })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .where(
        and(
          eq(jobs.companyId, companyId),
          eq(applications.status, 'PENDING')
        )
      );
    
    return result[0]?.count || 0;
  } catch (error) {
    console.error('Error counting employer pending applications:', error);
    return 0;
  }
}

/**
 * Get the active jobs for an employer
 */
export async function getEmployerActiveJobs(companyId: string, limit: number = 3) {
  try {
    const result = await db()
      .select({
        id: jobs.id,
        title: jobs.title,
        location: jobs.workLocation,
        jobType: jobs.jobType,
        expiresAt: jobs.expiresAt,
        createdAt: jobs.createdAt,
      })
      .from(jobs)
      .where(
        and(
          eq(jobs.companyId, companyId),
          eq(jobs.isActive, true)
        )
      )
      .orderBy(desc(jobs.createdAt))
      .limit(limit);
    
    // For each job, get the applicant count
    const jobsWithApplicants = await Promise.all(
      result.map(async (job) => {
        const applicantCount = await db()
          .select({ count: count() })
          .from(applications)
          .where(eq(applications.jobId, job.id));
        
        return {
          ...job,
          applicants: applicantCount[0]?.count || 0,
        };
      })
    );
    
    return jobsWithApplicants;
  } catch (error) {
    console.error('Error fetching employer active jobs:', error);
    return [];
  }
}

/**
 * Get the recent applicants for an employer's jobs
 */
export async function getEmployerRecentApplicants(companyId: string, limit: number = 3) {
  try {
    const result = await db()
      .select({
        id: applications.id,
        jobId: applications.jobId,
        candidateId: applications.candidateId,
        appliedAt: applications.appliedAt,
        jobTitle: jobs.title,
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .where(eq(jobs.companyId, companyId))
      .orderBy(desc(applications.appliedAt))
      .limit(limit);
    
    // For each application, get the candidate details
    const applicantsWithDetails = await Promise.all(
      result.map(async (application) => {
        const candidate = await db()
          .select({
            id: candidateProfiles.id,
            profileId: candidateProfiles.profileId,
          })
          .from(candidateProfiles)
          .where(eq(candidateProfiles.id, application.candidateId))
          .limit(1);
        
        if (!candidate[0]) {
          return null;
        }
        
        const profile = await db()
          .select({
            fullName: profiles.fullName,
            avatarUrl: profiles.avatarUrl,
          })
          .from(profiles)
          .where(eq(profiles.id, candidate[0].profileId))
          .limit(1);
        
        return {
          id: application.id,
          name: profile[0]?.fullName || 'Anonymous',
          position: application.jobTitle,
          avatar: profile[0]?.avatarUrl || 'https://via.placeholder.com/150',
          timeAgo: formatTimeAgo(application.appliedAt),
        };
      })
    );
    
    return applicantsWithDetails.filter(Boolean);
  } catch (error) {
    console.error('Error fetching employer recent applicants:', error);
    return [];
  }
}

/**
 * Get the profile completion percentage for an employer
 */
export async function getEmployerProfileCompletion(employerProfileId: string) {
  try {
    const employerProfile = await db()
      .select()
      .from(employerProfiles)
      .where(eq(employerProfiles.id, employerProfileId))
      .limit(1);
    
    if (!employerProfile[0]) {
      return 0;
    }
    
    // Define the fields that contribute to profile completion
    const fields = [
      employerProfile[0].companyName,
      employerProfile[0].companySize,
      employerProfile[0].industry,
      employerProfile[0].companyDescription,
      employerProfile[0].website,
      employerProfile[0].location,
    ];
    
    // Count the number of fields that are filled
    const filledFields = fields.filter(field => field !== null && field !== '').length;
    
    // Calculate the percentage
    return Math.round((filledFields / fields.length) * 100);
  } catch (error) {
    console.error('Error calculating employer profile completion:', error);
    return 0;
  }
}

/**
 * Helper function to format time ago
 */
function formatTimeAgo(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
} 