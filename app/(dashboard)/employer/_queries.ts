'use server'

import { db } from '@/lib/db';
import { and, eq, count } from 'drizzle-orm';
import { jobs, applications, candidateProfiles, profiles } from '@/lib/db/schema';
import { unstable_cache } from 'next/cache';
import { alias } from 'drizzle-orm/pg-core';
import { desc } from 'drizzle-orm';
import { EMPLOYER_DASHBOARD_CACHE_TAGS } from './_utils/cache-tags';

/**
 * Cached version of employer dashboard stats scoped per employer
 */
export async function getEmployerDashboardStats(companyId: string) {
  if (!companyId) throw new Error('Company ID is required');

  const cachedFn = unstable_cache(
    async () => {
      console.log(`Fetching dashboard stats for company: ${companyId}`);
      const activeJobsCount = await db()
        .select({ count: count() })
        .from(jobs)
        .where(and(eq(jobs.companyId, companyId), eq(jobs.status, 'ACTIVE')));

      const totalApplicationsCountResult = await db()
        .select({ count: count() })
        .from(applications)
        .innerJoin(jobs, eq(applications.jobId, jobs.id))
        .where(and(
          eq(jobs.companyId, companyId),
          eq(applications.deleted, false)
        ));

      return {
        activeJobs: activeJobsCount[0]?.count ?? 0,
        totalApplicants: totalApplicationsCountResult[0]?.count ?? 0,
        expiringJobs: 0,
      };
    },
    ['employer-dashboard-stats', companyId],
    {
      tags: [
        EMPLOYER_DASHBOARD_CACHE_TAGS.stats(companyId),
      ],
    }
  );

  return cachedFn();
}

/**
 * Cached version of recent employer jobs
 */
export async function getRecentEmployerJobs(companyId: string) {
  if (!companyId) throw new Error('Company ID is required');

  const cachedFn = unstable_cache(
    async () => {
      console.log(`Fetching recent jobs for company: ${companyId}`);
      const recentJobs = await db()
        .select({
          id: jobs.id,
          title: jobs.title,
          status: jobs.status,
          createdAt: jobs.createdAt,
        })
        .from(jobs)
        .where(and(eq(jobs.companyId, companyId), eq(jobs.status, 'ACTIVE')))
        .orderBy(desc(jobs.createdAt))
        .limit(5);

      return recentJobs;
    },
    ['employer-recent-jobs', companyId],
    {
      tags: [
        EMPLOYER_DASHBOARD_CACHE_TAGS.recentJobs(companyId),
      ],
    }
  );

  return cachedFn();
}

// --- NEW: Recent Applications Query ---
export async function getRecentApplicationsForEmployer(companyId: string) {
  if (!companyId) throw new Error('Company ID is required');

  const cachedFn = unstable_cache(
    async () => {
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
          candidateAvatarUrl: candidateBaseProfile.avatarUrl,
        })
        .from(applications)
        .innerJoin(jobs, eq(applications.jobId, jobs.id))
        .innerJoin(candidateProfiles, eq(applications.candidateProfileId, candidateProfiles.id))
        .innerJoin(candidateBaseProfile, eq(candidateProfiles.profileId, candidateBaseProfile.id))
        .where(
          and(
            eq(jobs.companyId, companyId),
            eq(applications.deleted, false),
            eq(jobs.status, 'ACTIVE'),
            eq(candidateProfiles.deleted, false),
            eq(candidateBaseProfile.deleted, false)
          )
        )
        .orderBy(desc(applications.appliedAt))
        .limit(5);

      return recentApplications;
    },
    ['employer-recent-applications', companyId],
    {
      tags: [
        EMPLOYER_DASHBOARD_CACHE_TAGS.recentApplications(companyId),
      ],
    }
  );

  return cachedFn();
}

// Type definition for the data returned by getRecentApplicationsForEmployer
// export type RecentApplicationData = Awaited<ReturnType<typeof getRecentApplicationsForEmployer>>[number];
// Using ReturnType directly might be simpler in the component/action 