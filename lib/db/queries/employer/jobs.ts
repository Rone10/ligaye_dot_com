import { and, count, desc, eq, gt, sql } from 'drizzle-orm';
import { db } from '@/lib/db/db';
import { applications, jobs, locations, profiles, employerProfiles, NewJob } from '@/lib/db/schema';
import { getUser } from '@/lib/supabase/server';

// Get job stats for an employer
export async function getJobStats(userId: string) {
  const totalJobsQuery = db()
    .select({ count: count() })
    .from(jobs)
    .where(
      and(
        eq(jobs.employerId, userId),
        eq(jobs.deleted, false)
      )
    );

  const activeJobsQuery = db()
    .select({ count: count() })
    .from(jobs)
    .where(
      and(
        eq(jobs.employerId, userId),
        eq(jobs.isActive, true),
        eq(jobs.deleted, false)
      )
    );

  const totalApplicationsQuery = db()
    .select({ count: count() })
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .where(
      and(
        eq(jobs.employerId, userId),
        eq(applications.deleted, false),
        eq(jobs.deleted, false)
      )
    );

  const jobsExpiringSoonQuery = db()
    .select({ count: count() })
    .from(jobs)
    .where(
      and(
        eq(jobs.employerId, userId),
        eq(jobs.isActive, true),
        eq(jobs.deleted, false),
        gt(jobs.expiresAt, new Date()),
        sql`${jobs.expiresAt} - CURRENT_TIMESTAMP < INTERVAL '7 days'`
      )
    );

  const [totalResult, activeResult, applicationsResult, expiringSoonResult] = await Promise.all([
    totalJobsQuery,
    activeJobsQuery,
    totalApplicationsQuery,
    jobsExpiringSoonQuery,
  ]);

  return {
    total: totalResult[0]?.count || 0,
    active: activeResult[0]?.count || 0,
    applications: applicationsResult[0]?.count || 0,
    expiringSoon: expiringSoonResult[0]?.count || 0,
  };
}

// Get all jobs for an employer
export async function getJobs(userId: string) {
  return db()
    .select({
      id: jobs.id,
      title: jobs.title,
      jobType: jobs.jobType,
      workLocation: jobs.workLocation,
      salaryRangeMin: jobs.salaryRangeMin,
      salaryRangeMax: jobs.salaryRangeMax,
      salaryCurrency: jobs.salaryCurrency,
      salaryFrequency: jobs.salaryFrequency,
      experienceLevel: jobs.experienceLevel,
      isActive: jobs.isActive,
      expiresAt: jobs.expiresAt,
      createdAt: jobs.createdAt,
      // Count of applications for this job
      applicantCount: sql<number>`(
        SELECT COUNT(*)
        FROM ${applications}
        WHERE ${applications.jobId} = ${jobs.id}
        AND ${applications.deleted} = false
      )`,
      // Location name
      locationName: sql<string>`(
        SELECT ${locations.town}
        FROM ${locations}
        WHERE ${locations.id} = ${jobs.locationId}
      )`,
    })
    .from(jobs)
    .where(
      and(
        eq(jobs.employerId, userId),
        eq(jobs.deleted, false)
      )
    )
    .orderBy(desc(jobs.createdAt));
}

// Get all job locations for filtering
export async function getJobLocations(userId: string) {
  const result = await db()
    .select({
      locationName: sql<string>`(
        SELECT ${locations.town}
        FROM ${locations}
        WHERE ${locations.id} = ${jobs.locationId}
      )`,
    })
    .from(jobs)
    .where(
      and(
        eq(jobs.employerId, userId),
        eq(jobs.deleted, false)
      )
    );
    
  // Get unique location names and filter out nulls
  type LocationResult = { locationName: string | null };
  const locationNames = Array.from(new Set(result.map((r: LocationResult) => r.locationName))).filter(Boolean) as string[];
  return locationNames;
}

// Update job status (active/inactive)
export async function updateJobStatus(jobId: string, isActive: boolean) {
  return db()
    .update(jobs)
    .set({
      isActive,
      updatedAt: new Date(),
    })
    .where(eq(jobs.id, jobId));
}

// Delete a job (soft delete)
export async function deleteJob(jobId: string) {
  return db()
    .update(jobs)
    .set({
      deleted: true,
      updatedAt: new Date(),
    })
    .where(eq(jobs.id, jobId));
}

// Create a new job
export async function createJob(jobData: Omit<NewJob, 'id' | 'createdAt' | 'updatedAt'>) {
  
  return await db()
    .insert(jobs)
    .values(jobData)
    .returning({ id: jobs.id });
}

export async function getJob(jobId: string) {
  try {
    // Get the current user ID from Supabase
    const user = await getUser();
    if (!user) return null;
    
    // Get the employer profile for the current user
    const employer = await db()
      .select({ id: employerProfiles.id })
      .from(employerProfiles)
      .where(eq(employerProfiles.profileId, user.id))
      .limit(1);

    if (!employer || employer.length === 0) return null;

    // Get the job with related information
    const result = await db()
      .select({
        id: jobs.id,
        title: jobs.title,
        description: jobs.description,
        jobType: jobs.jobType,
        workLocation: jobs.workLocation,
        locationName: sql<string>`(
          SELECT ${locations.town}
          FROM ${locations}
          WHERE ${locations.id} = ${jobs.locationId}
        )`,
        salaryRangeMin: jobs.salaryRangeMin,
        salaryRangeMax: jobs.salaryRangeMax,
        salaryCurrency: jobs.salaryCurrency,
        salaryFrequency: jobs.salaryFrequency,
        experienceLevel: jobs.experienceLevel,
        isActive: jobs.isActive,
        expiresAt: jobs.expiresAt,
        createdAt: jobs.createdAt,
        updatedAt: jobs.updatedAt,
        employerId: jobs.employerId,
        slug: jobs.slug,
        skillsRequired: jobs.skillsRequired,
        benefits: jobs.benefits
      })
      .from(jobs)
      .where(
        and(
          eq(jobs.id, jobId),
          eq(jobs.employerId, employer[0].id),
          eq(jobs.deleted, false)
        )
      )
      .limit(1);

    if (!result || result.length === 0) return null;

    // Get the applicant count for this job
    const applicantsCount = await db()
      .select({ count: count() })
      .from(applications)
      .where(
        and(
          eq(applications.jobId, jobId),
          eq(applications.deleted, false)
        )
      );

    // Combine the job details with the applicant count
    return {
      ...result[0],
      applicantCount: applicantsCount[0]?.count || 0
    };
  } catch (error) {
    console.error("Error getting job:", error);
    return null;
  }
} 