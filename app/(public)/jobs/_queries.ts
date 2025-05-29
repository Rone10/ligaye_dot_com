import { sql, and, eq, gte, lte, like, or, inArray, ilike, asc, desc } from 'drizzle-orm';
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

/**
 * Get a filtered and paginated list of jobs based on search criteria
 */
async function getFilteredJobsData(
  filters: JobFilters,
  pagination: { page: number; pageSize: number }
): Promise<JobsQueryResult> {
  const { 
    search, locationId, jobType, workLocation, 
    experienceLevel, salaryMin, salaryMax, industryId, sortBy 
  } = filters;
  
  const { page, pageSize } = pagination;
  const offset = (page - 1) * pageSize;
  
  // Base condition: only active, non-expired jobs
  const baseConditions = and(
    eq(jobs.status, 'ACTIVE'),
    gte(jobs.expiresAt, new Date())
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
  if (salaryMin) conditions.push(gte(jobs.salaryRangeMin, salaryMin));
  if (salaryMax) conditions.push(lte(jobs.salaryRangeMax, salaryMax));
  
  // Full filter condition
  const whereCondition = conditions.length > 0
    ? and(baseConditions, ...conditions)
    : baseConditions;
  
  // Industry filter requires a subquery/join approach
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
  
  // Query jobs with pagination
  const jobsQuery = await db()
    .select({
      id: jobs.id,
      title: jobs.title,
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
      slug: jobs.slug
    })
    .from(jobs)
    .leftJoin(employerProfiles, eq(jobs.companyId, employerProfiles.id))
    .leftJoin(locations, eq(jobs.locationId, locations.id))
    .where(finalWhereCondition)
    // Use sql.coalesce to handle null publishedAt dates - fall back to createdAt
    // Apply sort direction using Drizzle functions
    .orderBy(
      sortDirection(sql`coalesce(${jobs.publishedAt}, ${jobs.createdAt})`),
      secondarySortDirection(jobs.id) // Use ID as final tiebreaker
    )
    .limit(pageSize)
    .offset(offset);
    
  // Count total matching jobs for pagination
  const countResult = await db()
    .select({ count: sql<number>`count(*)` })
    .from(jobs)
    // Restore joins for count
    .leftJoin(employerProfiles, eq(jobs.companyId, employerProfiles.id))
    .leftJoin(locations, eq(jobs.locationId, locations.id))
    .where(finalWhereCondition);
    
    // Ensure totalCount is a number before calculation
    const totalCount = Number(countResult[0]?.count || 0);
    const pageCount = Math.ceil(totalCount / pageSize);
  
  // Process the results to ensure they match the expected types
  const processedJobs = jobsQuery.map(job => ({
    ...job,
    // Ensure salaryDisplayType is never null
    salaryDisplayType: job.salaryDisplayType ?? ''
  }));
  
  return {
    jobs: processedJobs,
    totalCount,
    pageCount
  };
}

/**
 * Cached version of filtered jobs 
 */
export const getFilteredJobs = unstable_cache(
  async (filters: JobFilters, pagination: { page: number; pageSize: number }) => {
    return getFilteredJobsData(filters, pagination);
  },
  ['filtered-jobs'],
  {
    tags: ['jobs'],
    revalidate: 60 * 10 // Revalidate every 10 minutes
  }
);

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
 * Cached version of locations for filters
 */
export const getLocationsForFilters = unstable_cache(
  async () => {
    return getLocationsForFiltersData();
  },
  ['locations-for-filters'],
  {
    tags: ['locations', 'job-filters'],
    revalidate: 3600 // Revalidate hourly
  }
);

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
 * Cached version of industries for filters
 */
export const getIndustriesForFilters = unstable_cache(
  async () => {
    return getIndustriesForFiltersData();
  },
  ['industries-for-filters'],
  {
    tags: ['industries', 'job-filters'],
    revalidate: 3600 // Revalidate hourly
  }
);

/**
 * Get saved jobs IDs for a user
 */
async function getSavedJobIdsForUserData(userId: string) {
  // First get the profile ID from the user ID
  const profileResult = await db()
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);
    
  if (!profileResult.length) {
    return [];
  }
  
  const profileId = profileResult[0].id;
  
  // Get saved job IDs that aren't deleted
  const savedJobIds = await db()
    .select({ jobId: savedJobs.jobId })
    .from(savedJobs)
    .where(
      and(
        eq(savedJobs.userId, profileId),
        eq(savedJobs.deleted, false)
      )
    );
    
  return savedJobIds.map(row => row.jobId);
}

/**
 * Cached version of saved job IDs for a user
 */
export const getSavedJobIdsForUser = unstable_cache(
  async (userId: string) => {
    return getSavedJobIdsForUserData(userId);
  },
  ['saved-job-ids'],
  {
    tags: ['saved-jobs', 'user-data'],
    revalidate: 60 // Revalidate every minute
  }
); 