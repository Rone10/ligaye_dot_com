import { db } from '@/lib/db';
import { and, eq, sql, count } from 'drizzle-orm';
import { Job, jobs, applications } from '@/lib/db/schema';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/supabase/server';
import { unstable_cache } from 'next/cache';

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
    return getEmployerDashboardStatsData(companyId);
  },
  ['employer-dashboard-stats'],
  {
    tags: ['employer-dashboard', 'employer-jobs', 'employer-applications'],
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
    return getRecentEmployerJobsData(companyId);
  },
  ['employer-recent-jobs'],
  {
    tags: ['employer-dashboard', 'employer-jobs'],
  }
); 