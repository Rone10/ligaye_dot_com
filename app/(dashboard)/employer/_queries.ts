'use server'

import { db } from '@/lib/db';
import { and, eq, sql, count } from 'drizzle-orm';
import { Job, jobs, applications, candidateProfiles, profiles } from '@/lib/db/schema';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/supabase/server';
import { unstable_cache } from 'next/cache';
import { alias } from 'drizzle-orm/pg-core';
import { desc } from 'drizzle-orm';

/**
 * Fetches statistics for the employer dashboard based on company ID.
 * Counts active jobs, total applicants (across all jobs), and expiring jobs.
 */
async function getEmployerDashboardStatsData(companyId: string) {
  if (!companyId) throw new Error('Company ID is required');

  const [activeJobsResult, totalApplicantsResult, expiringJobsResult] = await Promise.all([
    // Count active jobs (status = 'ACTIVE')
    db()
      .select({ value: count() })
      .from(jobs)
      .where(and(
        eq(jobs.companyId, companyId),
        eq(jobs.status, 'ACTIVE')
      ))
      .then(rows => rows[0]?.value || 0),

    // Count total applicants for all jobs by this employer
    db()
      .select({ value: count(applications.id) }) // Count distinct applications
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .where(eq(jobs.companyId, companyId))
      .then(rows => rows[0]?.value || 0),

    // Count jobs expiring within the next 7 days
    db()
      .select({ value: count() })
      .from(jobs)
      .where(and(
        eq(jobs.companyId, companyId),
        sql`${jobs.expiresAt} BETWEEN NOW() AND NOW() + interval '7 day'`
      ))
      .then(rows => rows[0]?.value || 0),
  ]);

  return {
    activeJobs: activeJobsResult,
    totalApplicants: totalApplicantsResult,
    expiringJobs: expiringJobsResult,
  };
}

/**
 * Cached version of employer dashboard stats
 */
export const getEmployerDashboardStats = unstable_cache(
  async (companyId: string) => {
    console.log(`Fetching dashboard stats for company: ${companyId}`);
    // Add proper error handling if needed
    const activeJobsCount = await db()
      .select({ count: count() })
      .from(jobs)
      .where(and(eq(jobs.companyId, companyId), eq(jobs.status, 'ACTIVE')));

    // Correctly count total non-deleted applications for this employer's jobs
    const totalApplicationsCountResult = await db()
      .select({ count: count() })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .where(and(
        eq(jobs.companyId, companyId), // Jobs belonging to the employer
        eq(applications.deleted, false) // Only count non-deleted applications
      ));

    // TODO: Implement actual expiring jobs count logic here later
    // const expiringJobsCount = await db()...select()...where(jobs.expiresAt...)

    return {
      activeJobs: activeJobsCount[0]?.count ?? 0,
      totalApplicants: totalApplicationsCountResult[0]?.count ?? 0, // Use the correct application count
      expiringJobs: 0, // Placeholder value
    };
  },
  ['employer-dashboard-stats'], // Cache key parts
  {
    tags: ['employer-dashboard', 'employer-jobs', 'employer-applications'], // Cache tags
  }
);

/**
 * Fetches the 5 most recent job postings for the employer based on company ID.
 */
async function getRecentEmployerJobsData(companyId: string): Promise<Job[]> {
  if (!companyId) throw new Error('Company ID is required');

  return db()
    .select()
    .from(jobs)
    .where(eq(jobs.companyId, companyId))
    .orderBy(sql`${jobs.createdAt} DESC`)
    .limit(5);
}

/**
 * Cached version of recent employer jobs
 */
export const getRecentEmployerJobs = unstable_cache(
  async (companyId: string) => {
    console.log(`Fetching recent jobs for company: ${companyId}`);
    // Add proper error handling
    const recentJobs = await db()
      .select({
        id: jobs.id,
        title: jobs.title,
        status: jobs.status,
        createdAt: jobs.createdAt,
      })
      .from(jobs)
      .where(and(eq(jobs.companyId, companyId), eq(jobs.status, 'ACTIVE'))) // Ensure not deleted
      .orderBy(desc(jobs.createdAt))
      .limit(5);

    // Map status to be uppercase for display consistency if needed, schema uses uppercase enums already
    // return recentJobs.map(job => ({ ...job, status: job.status.toUpperCase() }));
    return recentJobs;
  },
  ['employer-recent-jobs'], // Cache key parts
  {
    tags: ['employer-dashboard', 'employer-jobs'], // Cache tags
  }
);

// --- NEW: Recent Applications Query ---
export const getRecentApplicationsForEmployer = unstable_cache(
  async (companyId: string) => {
    console.log(`Fetching recent applications for company: ${companyId}`);

    const candidateBaseProfile = alias(profiles, 'candidateBaseProfile');

    const recentApplications = await db()
      .select({
        applicationId: applications.id,
        appliedAt: applications.appliedAt,
        jobId: jobs.id,
        jobTitle: jobs.title,
        candidateProfileId: candidateProfiles.id,
        candidateName: candidateBaseProfile.fullName,
        candidateAvatarUrl: candidateBaseProfile.avatarUrl, // Fetch avatar URL
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .innerJoin(candidateProfiles, eq(applications.candidateProfileId, candidateProfiles.id))
      .innerJoin(candidateBaseProfile, eq(candidateProfiles.profileId, candidateBaseProfile.id))
      .where(
        and(
          eq(jobs.companyId, companyId), // Filter by employer's company ID
          eq(applications.deleted, false), // Ensure application not deleted
          eq(jobs.status, 'ACTIVE'),         // Ensure job not deleted
          eq(candidateProfiles.deleted, false), // Ensure candidate profile not deleted
          eq(candidateBaseProfile.deleted, false) // Ensure base profile not deleted
        )
      )
      .orderBy(desc(applications.appliedAt))
      .limit(5);

    return recentApplications;
  },
  ['employer-recent-applications'], // Cache key parts
  {
    tags: ['employer-dashboard', 'employer-applications'], // Cache tags
  }
);

// Type definition for the data returned by getRecentApplicationsForEmployer
// export type RecentApplicationData = Awaited<ReturnType<typeof getRecentApplicationsForEmployer>>[number];
// Using ReturnType directly might be simpler in the component/action 