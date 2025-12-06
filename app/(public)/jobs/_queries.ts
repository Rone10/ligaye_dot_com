import { sql, and, eq, gte, lte, like, or, inArray, ilike, asc, desc, isNull } from 'drizzle-orm';
import { db } from '@/lib/db';
import { 
  jobs, 
  employerProfiles, 
  locations, 
  jobSkills, 
  skills,
  jobIndustries,
  industries,
  savedJobs,
  profiles
} from '@/lib/db/schema';
import type { JobFilters, JobsQueryResult } from './_utils/types';
import { unstable_cache } from 'next/cache';
import { getEffectiveSalaryRange } from './_utils/salary-utils';

// Cache tag helpers for hierarchical invalidation
const CACHE_TAGS = {
  job: (id: string) => `job-${id}`,
  jobs: 'jobs-collection',
  jobsFiltered: (filtersHash: string) => `jobs-filtered-${filtersHash}`,
  userSavedJobs: (userId: string) => `user-saved-jobs-${userId}`,
  industries: 'industries-collection',
  locations: 'locations-collection',
  filters: 'job-filters'
};

// Helper to create cache key from filters
function createFiltersHash(filters: JobFilters, pagination: { page: number; pageSize: number }): string {
  const filterStr = JSON.stringify({ ...filters, ...pagination });
  return Buffer.from(filterStr).toString('base64').slice(0, 16);
}

/**
 * OPTIMIZED: Get a filtered and paginated list of jobs with consolidated queries
 */
async function getFilteredJobsData(
  filters: JobFilters,
  pagination: { page: number; pageSize: number }
): Promise<JobsQueryResult> {
  const { 
    search, locationId, jobType, workLocation, 
    experienceLevel, salaryMin, salaryMax, industryId, sortBy, includeNegotiable = true 
  } = filters;
  
  const { page, pageSize } = pagination;
  const offset = (page - 1) * pageSize;
  
  // Base condition: only active, non-expired jobs
  const baseConditions = and(
    eq(jobs.status, 'ACTIVE'),
    or(
      isNull(jobs.expiresAt),
      gte(jobs.expiresAt, new Date())
    )
  );
  
  // Build additional filter conditions
  const conditions: any[] = [];
  
  // Text search condition (search across multiple fields)
  if (search && search.trim() !== '') {
    const searchTerm = `%${search.trim()}%`;
    conditions.push(
      or(
        ilike(jobs.title, searchTerm),
        ilike(jobs.description, searchTerm),
        ilike(employerProfiles.companyName, searchTerm)
      )
    );
  }
  
  // Apply filter conditions if provided
  if (locationId) conditions.push(eq(jobs.locationId, locationId));
  if (jobType) conditions.push(eq(jobs.jobType, jobType));
  if (workLocation) conditions.push(eq(jobs.workLocation, workLocation));
  if (experienceLevel) conditions.push(eq(jobs.experienceLevel, experienceLevel));
  
  // Enhanced salary filtering
  if (salaryMin !== null || salaryMax !== null) {
    const salaryConditions = [];
    
    // Handle negotiable salaries
    if (includeNegotiable) {
      salaryConditions.push(eq(jobs.salaryDisplayType, 'NEGOTIABLE'));
    }
    
    // Handle jobs with actual salary ranges
    if (salaryMin !== null || salaryMax !== null) {
      const rangeConditions = [];
      
      // For jobs with salary information, we need to check different display types
      if (salaryMin !== null) {
        // Job's effective maximum should be >= filter minimum
        rangeConditions.push(
          or(
            // RANGE: use salaryRangeMax
            and(
              eq(jobs.salaryDisplayType, 'RANGE'),
              gte(sql`
                CASE 
                  WHEN ${jobs.salaryFrequency} = 'HOUR' THEN ${jobs.salaryRangeMax} * 40 * 52
                  WHEN ${jobs.salaryFrequency} = 'DAY' THEN ${jobs.salaryRangeMax} * 5 * 52
                  WHEN ${jobs.salaryFrequency} = 'WEEK' THEN ${jobs.salaryRangeMax} * 52
                  WHEN ${jobs.salaryFrequency} = 'MONTH' THEN ${jobs.salaryRangeMax} * 12
                  ELSE COALESCE(${jobs.salaryRangeMax}, ${jobs.salaryRangeMin})
                END
              `, salaryMin)
            ),
            // FIXED: use salaryRangeMin
            and(
              eq(jobs.salaryDisplayType, 'FIXED'),
              gte(sql`
                CASE 
                  WHEN ${jobs.salaryFrequency} = 'HOUR' THEN ${jobs.salaryRangeMin} * 40 * 52
                  WHEN ${jobs.salaryFrequency} = 'DAY' THEN ${jobs.salaryRangeMin} * 5 * 52
                  WHEN ${jobs.salaryFrequency} = 'WEEK' THEN ${jobs.salaryRangeMin} * 52
                  WHEN ${jobs.salaryFrequency} = 'MONTH' THEN ${jobs.salaryRangeMin} * 12
                  ELSE ${jobs.salaryRangeMin}
                END
              `, salaryMin)
            ),
            // STARTING_AMOUNT: no upper limit, always matches if has starting amount
            and(
              eq(jobs.salaryDisplayType, 'STARTING_AMOUNT'),
              gte(sql`
                CASE 
                  WHEN ${jobs.salaryFrequency} = 'HOUR' THEN ${jobs.salaryRangeMin} * 40 * 52
                  WHEN ${jobs.salaryFrequency} = 'DAY' THEN ${jobs.salaryRangeMin} * 5 * 52
                  WHEN ${jobs.salaryFrequency} = 'WEEK' THEN ${jobs.salaryRangeMin} * 52
                  WHEN ${jobs.salaryFrequency} = 'MONTH' THEN ${jobs.salaryRangeMin} * 12
                  ELSE ${jobs.salaryRangeMin}
                END
              `, salaryMin)
            ),
            // MAXIMUM_AMOUNT: use salaryRangeMax
            and(
              eq(jobs.salaryDisplayType, 'MAXIMUM_AMOUNT'),
              gte(sql`
                CASE 
                  WHEN ${jobs.salaryFrequency} = 'HOUR' THEN ${jobs.salaryRangeMax} * 40 * 52
                  WHEN ${jobs.salaryFrequency} = 'DAY' THEN ${jobs.salaryRangeMax} * 5 * 52
                  WHEN ${jobs.salaryFrequency} = 'WEEK' THEN ${jobs.salaryRangeMax} * 52
                  WHEN ${jobs.salaryFrequency} = 'MONTH' THEN ${jobs.salaryRangeMax} * 12
                  ELSE ${jobs.salaryRangeMax}
                END
              `, salaryMin)
            )
          )
        );
      }
      
      if (salaryMax !== null) {
        // Job's effective minimum should be <= filter maximum
        rangeConditions.push(
          or(
            // RANGE: use salaryRangeMin
            and(
              eq(jobs.salaryDisplayType, 'RANGE'),
              lte(sql`
                CASE 
                  WHEN ${jobs.salaryFrequency} = 'HOUR' THEN ${jobs.salaryRangeMin} * 40 * 52
                  WHEN ${jobs.salaryFrequency} = 'DAY' THEN ${jobs.salaryRangeMin} * 5 * 52
                  WHEN ${jobs.salaryFrequency} = 'WEEK' THEN ${jobs.salaryRangeMin} * 52
                  WHEN ${jobs.salaryFrequency} = 'MONTH' THEN ${jobs.salaryRangeMin} * 12
                  ELSE ${jobs.salaryRangeMin}
                END
              `, salaryMax)
            ),
            // FIXED: use salaryRangeMin
            and(
              eq(jobs.salaryDisplayType, 'FIXED'),
              lte(sql`
                CASE 
                  WHEN ${jobs.salaryFrequency} = 'HOUR' THEN ${jobs.salaryRangeMin} * 40 * 52
                  WHEN ${jobs.salaryFrequency} = 'DAY' THEN ${jobs.salaryRangeMin} * 5 * 52
                  WHEN ${jobs.salaryFrequency} = 'WEEK' THEN ${jobs.salaryRangeMin} * 52
                  WHEN ${jobs.salaryFrequency} = 'MONTH' THEN ${jobs.salaryRangeMin} * 12
                  ELSE ${jobs.salaryRangeMin}
                END
              `, salaryMax)
            ),
            // STARTING_AMOUNT: use salaryRangeMin
            and(
              eq(jobs.salaryDisplayType, 'STARTING_AMOUNT'),
              lte(sql`
                CASE 
                  WHEN ${jobs.salaryFrequency} = 'HOUR' THEN ${jobs.salaryRangeMin} * 40 * 52
                  WHEN ${jobs.salaryFrequency} = 'DAY' THEN ${jobs.salaryRangeMin} * 5 * 52
                  WHEN ${jobs.salaryFrequency} = 'WEEK' THEN ${jobs.salaryRangeMin} * 52
                  WHEN ${jobs.salaryFrequency} = 'MONTH' THEN ${jobs.salaryRangeMin} * 12
                  ELSE ${jobs.salaryRangeMin}
                END
              `, salaryMax)
            ),
            // MAXIMUM_AMOUNT: no lower limit, always matches
            eq(jobs.salaryDisplayType, 'MAXIMUM_AMOUNT')
          )
        );
      }
      
      if (rangeConditions.length > 0) {
        salaryConditions.push(and(...rangeConditions));
      }
    }
    
    if (salaryConditions.length > 0) {
      conditions.push(or(...salaryConditions));
    }
  }
  
  // Full filter condition
  const whereCondition = conditions.length > 0
    ? and(baseConditions, ...conditions)
    : baseConditions;

  // OPTIMIZED: Industry filter using optimized subquery with EXISTS
  const jobIdsInIndustry = industryId 
    ? (await db()
        .select({ jobId: jobIndustries.jobId })
        .from(jobIndustries)
        .where(and(
          eq(jobIndustries.industryId, industryId),
          eq(jobIndustries.deleted, false)
        )))
        .map(row => row.jobId)
    : null;
    
  // Apply industry filter if needed - handle empty array case
  const finalWhereCondition = jobIdsInIndustry && jobIdsInIndustry.length > 0
    ? and(whereCondition, inArray(jobs.id, jobIdsInIndustry))
    : jobIdsInIndustry && jobIdsInIndustry.length === 0
    ? and(whereCondition, sql`false`) // No jobs match this industry
    : whereCondition;
    
  // Determine sort order based on sortBy param (default to newest first)
  const sortDirection = sortBy === 'oldest' ? asc : desc;
  const secondarySortDirection = sortBy === 'oldest' ? asc : desc;
  
  // OPTIMIZED: Single query for both jobs and count using window function
  const results = await db()
    .select({
      // Job data
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
      // Count for pagination
      totalCount: sql<number>`count(*) over()`.as('totalCount')
    })
    .from(jobs)
    .leftJoin(employerProfiles, eq(jobs.companyId, employerProfiles.id))
    .leftJoin(locations, eq(jobs.locationId, locations.id))
    .where(finalWhereCondition)
    .orderBy(
      sortDirection(sql`coalesce(${jobs.publishedAt}, ${jobs.createdAt})`),
      secondarySortDirection(jobs.id)
    )
    .limit(pageSize)
    .offset(offset);

  const totalCount = results.length > 0 ? Number(results[0].totalCount) : 0;
  const pageCount = Math.ceil(totalCount / pageSize);
  
  // Process the results to ensure they match the expected types
  const processedJobs = results.map(job => ({
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
    slug: job.slug
  }));
  
  return {
    jobs: processedJobs,
    totalCount,
    pageCount
  };
}

/**
 * OPTIMIZED: Indefinite cache with on-demand revalidation via tags
 */
export const getFilteredJobs = async (
  filters: JobFilters, 
  pagination: { page: number; pageSize: number }
) => {
  const filtersHash = createFiltersHash(filters, pagination);
  
  const cachedFunction = unstable_cache(
    async () => getFilteredJobsData(filters, pagination),
    [`filtered-jobs-${filtersHash}`],
    {
      tags: [
        CACHE_TAGS.jobs,
        CACHE_TAGS.jobsFiltered(filtersHash),
        CACHE_TAGS.filters
      ]
      // NO revalidate property = indefinite cache until tag invalidation
    }
  );
  
  return cachedFunction();
};

/**
 * Get location data for filter options
 */
async function getLocationsForFiltersData() {
  return db()
    .select({
      id: locations.id,
      region: locations.region,
      district: locations.district,
      city: locations.city
    })
    .from(locations)
    .where(eq(locations.deleted, false))
    .orderBy(locations.region, locations.city);
}

/**
 * OPTIMIZED: Indefinite cache with on-demand revalidation
 */
export const getLocationsForFilters = async () => {
  const cachedFunction = unstable_cache(
    async () => getLocationsForFiltersData(),
    ['locations-for-filters'],
    {
      tags: [CACHE_TAGS.locations, CACHE_TAGS.filters]
      // NO revalidate property = indefinite cache until tag invalidation
    }
  );
  
  return cachedFunction();
};

/**
 * Get industry data for filter options
 */
async function getIndustriesForFiltersData() {
  return db()
    .select({
      id: industries.id,
      name: industries.name
    })
    .from(industries)
    .where(eq(industries.deleted, false))
    .orderBy(industries.name);
}

/**
 * OPTIMIZED: Indefinite cache with on-demand revalidation
 */
export const getIndustriesForFilters = async () => {
  const cachedFunction = unstable_cache(
    async () => getIndustriesForFiltersData(),
    ['industries-for-filters'],
    {
      tags: [CACHE_TAGS.industries, CACHE_TAGS.filters]
      // NO revalidate property = indefinite cache until tag invalidation
    }
  );
  
  return cachedFunction();
};

/**
 * OPTIMIZED: Get saved job IDs with single JOIN query
 */
async function getSavedJobIdsForUserData(userId: string) {
  // Single query with JOIN instead of N+1 pattern
  const savedJobIds = await db()
    .select({ jobId: savedJobs.jobId })
    .from(savedJobs)
    .innerJoin(profiles, eq(savedJobs.userId, profiles.id))
    .where(
      and(
        eq(profiles.userId, userId),
        eq(savedJobs.deleted, false)
      )
    );
    
  return savedJobIds.map(row => row.jobId);
}

/**
 * OPTIMIZED: Indefinite cache with on-demand revalidation for user data
 */
export const getSavedJobIdsForUser = async (userId: string) => {
  const cachedFunction = unstable_cache(
    async () => getSavedJobIdsForUserData(userId),
    [`saved-job-ids-${userId}`],
    {
      tags: [
        CACHE_TAGS.userSavedJobs(userId),
        'saved-jobs-collection'
      ]
      // NO revalidate property = indefinite cache until tag invalidation
    }
  );
  
  return cachedFunction();
};

// OPTIMIZED: Cache invalidation helpers for mutation-triggered revalidation
export async function invalidateJobsCache() {
  const { revalidateTag } = await import('next/cache');
  
  await Promise.all([
    revalidateTag(CACHE_TAGS.jobs),
    revalidateTag(CACHE_TAGS.filters)
  ]);
}

export async function invalidateUserSavedJobsCache(userId: string) {
  const { revalidateTag } = await import('next/cache');
  
  await revalidateTag(CACHE_TAGS.userSavedJobs(userId));
}

export async function invalidateFiltersCache() {
  const { revalidateTag } = await import('next/cache');
  
  await Promise.all([
    revalidateTag(CACHE_TAGS.locations),
    revalidateTag(CACHE_TAGS.industries),
    revalidateTag(CACHE_TAGS.filters)
  ]);
}

// Additional cache invalidation helpers for comprehensive mutation coverage
export async function invalidateJobCache(jobId: string) {
  const { revalidateTag } = await import('next/cache');
  
  await Promise.all([
    revalidateTag(CACHE_TAGS.job(jobId)),
    revalidateTag(CACHE_TAGS.jobs), // Invalidate job listings
    revalidateTag(CACHE_TAGS.filters) // Job changes might affect filter counts
  ]);
}

export async function invalidateAllJobCaches() {
  const { revalidateTag } = await import('next/cache');
  
  await Promise.all([
    revalidateTag(CACHE_TAGS.jobs),
    revalidateTag(CACHE_TAGS.filters),
    revalidateTag('saved-jobs-collection')
  ]);
} 