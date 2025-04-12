import { sql, and, eq, gte, lte, like, or, inArray, ilike } from 'drizzle-orm';
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

/**
 * Get a filtered and paginated list of jobs based on search criteria
 */
export async function getFilteredJobs(
  filters: JobFilters,
  pagination: { page: number; pageSize: number }
): Promise<JobsQueryResult> {
  const { 
    search, locationId, jobType, workLocation, 
    experienceLevel, salaryMin, salaryMax, industryId 
  } = filters;
  
  const { page, pageSize } = pagination;
  const offset = (page - 1) * pageSize;
  
  // Base condition: only active, non-expired jobs
  const baseConditions = and(
    eq(jobs.status, 'ACTIVE'),
    gte(jobs.expiresAt, new Date())
  );
  
  // Build additional filter conditions
  const conditions = [];
  
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
        .where(eq(jobIndustries.industryId, industryId)))
        .map(row => row.jobId)
    : null;
    
  // Apply industry filter if needed
  const finalWhereCondition = jobIdsInIndustry
    ? and(whereCondition, inArray(jobs.id, jobIdsInIndustry))
    : whereCondition;
    
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
    .orderBy(jobs.publishedAt)
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
    // Add logs for pagination debugging
    console.log("[Debug Pagination] totalCount:", totalCount, "(Type:", typeof totalCount, ")");
    console.log("[Debug Pagination] pageSize:", pageSize, "(Type:", typeof pageSize, ")");
    const pageCount = Math.ceil(totalCount / pageSize);
    console.log("[Debug Pagination] calculated pageCount:", pageCount);
  
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
 * Get list of all locations for filter options
 */
export async function getLocationsForFilters() {
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
 * Get list of all industries for filter options
 */
export async function getIndustriesForFilters() {
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
 * Get saved jobs IDs for a user
 */
export async function getSavedJobIdsForUser(userId: string) {
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