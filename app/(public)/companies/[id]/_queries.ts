import { eq, and, or, gte, isNull, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { employerProfiles, jobs, locations, industries } from '@/lib/db/schema';
import { notFound } from 'next/navigation';
import { unstable_cache } from 'next/cache';
import type { JobListItem } from '@/app/(public)/jobs/_utils/types';

// Cache tags for company profile data
const CACHE_TAGS = {
  company: (id: string) => `company-${id}`,
  companyJobs: (id: string) => `company-jobs-${id}`,
};

/**
 * Get company profile by ID with location and industry relations
 */
async function getCompanyProfileByIdData(companyId: string) {
  const company = await db().query.employerProfiles.findFirst({
    where: and(
      eq(employerProfiles.id, companyId),
      eq(employerProfiles.deleted, false)
    ),
    with: {
      location: true,
      industry: true,
    },
  });

  if (!company) {
    notFound();
  }

  return company;
}

/**
 * Cached version of get company profile
 */
export async function getCompanyProfileById(companyId: string) {
  return unstable_cache(
    async () => {
      return getCompanyProfileByIdData(companyId);
    },
    ['company-profile', companyId],
    {
      tags: [CACHE_TAGS.company(companyId)],
      revalidate: 3600, // Revalidate every hour
    }
  )();
}

/**
 * Get current job openings (ACTIVE status, not expired)
 */
async function getCompanyCurrentJobsData(companyId: string): Promise<JobListItem[]> {
  const results = await db()
    .select({
      id: jobs.id,
      title: jobs.title,
      companyId: jobs.companyId,
      companyName: employerProfiles.companyName,
      companyLogoUrl: employerProfiles.companyLogoUrl,
      locationName: locations.city,
      workLocation: jobs.workLocation,
      jobType: jobs.jobType,
      salaryRangeMin: jobs.salaryRangeMin,
      salaryRangeMax: jobs.salaryRangeMax,
      salaryCurrency: jobs.salaryCurrency,
      salaryFrequency: jobs.salaryFrequency,
      salaryDisplayType: jobs.salaryDisplayType,
      publishedAt: jobs.publishedAt,
      slug: jobs.slug,
    })
    .from(jobs)
    .leftJoin(employerProfiles, eq(jobs.companyId, employerProfiles.id))
    .leftJoin(locations, eq(jobs.locationId, locations.id))
    .where(
      and(
        eq(jobs.companyId, companyId),
        eq(jobs.status, 'ACTIVE'),
        or(
          isNull(jobs.expiresAt),
          gte(jobs.expiresAt, new Date())
        )
      )
    )
    .orderBy(desc(jobs.publishedAt));

  return results.map(job => ({
    id: job.id,
    title: job.title,
    companyId: job.companyId,
    companyName: job.companyName,
    companyLogoUrl: job.companyLogoUrl,
    locationName: job.locationName,
    workLocation: job.workLocation,
    jobType: job.jobType,
    salaryRangeMin: job.salaryRangeMin,
    salaryRangeMax: job.salaryRangeMax,
    salaryCurrency: job.salaryCurrency,
    salaryFrequency: job.salaryFrequency,
    salaryDisplayType: job.salaryDisplayType ?? '',
    publishedAt: job.publishedAt,
    slug: job.slug,
  }));
}

/**
 * Cached version of get current jobs
 */
export async function getCompanyCurrentJobs(companyId: string) {
  return unstable_cache(
    async () => {
      return getCompanyCurrentJobsData(companyId);
    },
    ['company-current-jobs', companyId],
    {
      tags: [CACHE_TAGS.companyJobs(companyId)],
      revalidate: 3600,
    }
  )();
}

/**
 * Get past job openings (EXPIRED and FILLED status only)
 */
async function getCompanyPastJobsData(companyId: string): Promise<JobListItem[]> {
  const results = await db()
    .select({
      id: jobs.id,
      title: jobs.title,
      companyId: jobs.companyId,
      companyName: employerProfiles.companyName,
      companyLogoUrl: employerProfiles.companyLogoUrl,
      locationName: locations.city,
      workLocation: jobs.workLocation,
      jobType: jobs.jobType,
      salaryRangeMin: jobs.salaryRangeMin,
      salaryRangeMax: jobs.salaryRangeMax,
      salaryCurrency: jobs.salaryCurrency,
      salaryFrequency: jobs.salaryFrequency,
      salaryDisplayType: jobs.salaryDisplayType,
      publishedAt: jobs.publishedAt,
      slug: jobs.slug,
    })
    .from(jobs)
    .leftJoin(employerProfiles, eq(jobs.companyId, employerProfiles.id))
    .leftJoin(locations, eq(jobs.locationId, locations.id))
    .where(
      and(
        eq(jobs.companyId, companyId),
        or(
          eq(jobs.status, 'EXPIRED'),
          eq(jobs.status, 'FILLED')
        )
      )
    )
    .orderBy(desc(jobs.publishedAt))
    .limit(50); // Limit past jobs to 50 most recent

  return results.map(job => ({
    id: job.id,
    title: job.title,
    companyId: job.companyId,
    companyName: job.companyName,
    companyLogoUrl: job.companyLogoUrl,
    locationName: job.locationName,
    workLocation: job.workLocation,
    jobType: job.jobType,
    salaryRangeMin: job.salaryRangeMin,
    salaryRangeMax: job.salaryRangeMax,
    salaryCurrency: job.salaryCurrency,
    salaryFrequency: job.salaryFrequency,
    salaryDisplayType: job.salaryDisplayType ?? '',
    publishedAt: job.publishedAt,
    slug: job.slug,
  }));
}

/**
 * Cached version of get past jobs
 */
export async function getCompanyPastJobs(companyId: string) {
  return unstable_cache(
    async () => {
      return getCompanyPastJobsData(companyId);
    },
    ['company-past-jobs', companyId],
    {
      tags: [CACHE_TAGS.companyJobs(companyId)],
      revalidate: 3600,
    }
  )();
}

