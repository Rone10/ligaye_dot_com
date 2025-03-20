'use server'

import { db } from '@/lib/db/db';
import { 
  profiles, 
  candidateProfiles,
  applications,
  savedJobs,
  jobs,
  employerProfiles
} from '@/lib/db/schema';
import { eq, and, count, desc, sql, gt } from 'drizzle-orm';
import { getCandidateProfileByUserId } from './profile';

/**
 * Get dashboard statistics for a candidate
 */
export async function getDashboardStats(userId: string) {
  // Get application counts by status
  const applicationStats = await db()
    .select({
      status: applications.status,
      count: sql`count(*)::int`
    })
    .from(applications)
    .where(eq(applications.candidateId, userId))
    .groupBy(applications.status);
  
  // Get count of saved jobs
  const savedJobsCount = await db()
    .select({
      count: sql`count(*)::int`
    })
    .from(savedJobs)
    .where(eq(savedJobs.userId, userId));
  
  // Get count of applications in the last 7 days
  const recentApplications = await db()
    .select({
      count: sql`count(*)::int`
    })
    .from(applications)
    .where(
      and(
        eq(applications.candidateId, userId),
        gt(applications.appliedAt, sql`NOW() - INTERVAL '7 days'`)
      )
    );
  
  return {
    applicationStats,
    savedJobsCount: savedJobsCount[0]?.count || 0,
    recentApplications: recentApplications[0]?.count || 0
  };
}

/**
 * Get recommended jobs for a candidate based on their profile
 */
export async function getRecommendedJobs(userId: string, limit = 5) {
  // Get candidate's profile to extract skills and experience level
  const candidateProfile = await getCandidateProfileByUserId(userId);
  
  if (!candidateProfile?.candidateProfile) {
    return [];
  }
  
  // In a real implementation, we would use skills and experience level to find matching jobs
  // For this implementation, we'll just return recent jobs
  return await db()
    .select({
      job: jobs,
      employer: employerProfiles
    })
    .from(jobs)
    .innerJoin(employerProfiles, eq(jobs.companyId, employerProfiles.id))
    .orderBy(desc(jobs.createdAt))
    .limit(limit);
}