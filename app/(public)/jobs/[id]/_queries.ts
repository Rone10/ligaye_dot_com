import { eq, and, gte, ne } from 'drizzle-orm';
import { db } from '@/lib/db';
import { 
  jobs, 
  employerProfiles, 
  locations, 
  industries,
  jobSkills,
  skills,
  jobIndustries,
  candidateProfiles,
  profiles,
  applications,
  savedJobs
} from '@/lib/db/schema';
import { notFound } from 'next/navigation';
import type { JobDetail, SimpleSkill, SimpleIndustry } from '../_utils/types';
import { unstable_cache } from 'next/cache';

// Cache options type for Next.js
type CacheOptions = {
  next?: {
    tags?: string[];
    revalidate?: number;
  }
};

/**
 * Optimized job data fetching with combined queries
 * Uses Next.js unstable_cache for proper server-side caching
 */
async function getJobByIdData(
  jobId: string, 
  skipStatusFilter: boolean = false
): Promise<JobDetail> {
  // Build the where conditions based on whether we should filter by status
  const whereConditions = skipStatusFilter 
    ? eq(jobs.id, jobId)
    : and(
        eq(jobs.id, jobId),
        eq(jobs.status, 'ACTIVE'),
        gte(jobs.expiresAt, new Date())
      );

  // OPTIMIZATION: Single query to get all job data including skills and industries
  // Using Drizzle's query API for more efficient joins
  const jobData = await db().query.jobs.findFirst({
    where: whereConditions,
    with: {
      company: true,
      location: true,
      jobSkills: {
        with: {
          skill: true
        }
      },
      jobIndustries: {
        with: {
          industry: true
        }
      }
    }
  });
    
  if (!jobData) {
    notFound();
  }
  
  if (!jobData.company) {
    notFound();
  }
  
  // Transform the data to match the expected format
  const jobSkillsList: SimpleSkill[] = jobData.jobSkills
    .filter(js => js.skill)
    .map(js => ({
      id: js.skill!.id,
      name: js.skill!.name
    }));
    
  const jobIndustriesList: SimpleIndustry[] = jobData.jobIndustries
    .filter(ji => ji.industry)
    .map(ji => ({
      id: ji.industry!.id,
      name: ji.industry!.name
    }));
  
  // Restructure data into the expected format
  const jobDetail: JobDetail = {
    // Core job data
    id: jobData.id,
    title: jobData.title,
    description: jobData.description,
    jobType: jobData.jobType,
    companyId: jobData.companyId,
    locationId: jobData.locationId,
    workLocation: jobData.workLocation,
    experienceLevel: jobData.experienceLevel,
    salaryRangeMin: jobData.salaryRangeMin,
    salaryRangeMax: jobData.salaryRangeMax,
    salaryCurrency: jobData.salaryCurrency,
    salaryFrequency: jobData.salaryFrequency,
    salaryDisplayType: jobData.salaryDisplayType ?? '',
    applicationMethod: jobData.applicationMethod as JobDetail['applicationMethod'],
    applicationEmail: jobData.applicationEmail,
    applicationUrl: jobData.applicationUrl,
    publishedAt: jobData.publishedAt,
    expiresAt: jobData.expiresAt ?? new Date(),
    status: jobData.status,
    slug: jobData.slug,
    createdAt: jobData.createdAt,
    updatedAt: jobData.updatedAt,
    
    // Additional fields
    jobLanguage: jobData.jobLanguage,
    numberOfOpenings: jobData.numberOfOpenings,
    displayAddress: jobData.displayAddress === null ? undefined : jobData.displayAddress,
    educationRequirements: jobData.educationRequirements,
    experienceRequirements: jobData.experienceRequirements,
    languageRequirements: jobData.languageRequirements,
    languageTrainingProvided: jobData.languageTrainingProvided === null ? undefined : jobData.languageTrainingProvided,
    schedule: jobData.schedule,
    expectedHours: jobData.expectedHours,
    hoursType: jobData.hoursType,
    contractLength: jobData.contractLength,
    plannedStartDate: jobData.plannedStartDate,
    supplementalPay: jobData.supplementalPay,
    benefits: jobData.benefits,
    applicationInstructions: jobData.applicationInstructions,
    resumeRequired: jobData.resumeRequired === null ? undefined : jobData.resumeRequired,
    allowCandidateContact: jobData.allowCandidateContact === null ? undefined : jobData.allowCandidateContact,
    applicationDeadline: jobData.applicationDeadline,
    
    // Related entities
    company: jobData.company,
    location: jobData.location,
    skills: jobSkillsList,
    industries: jobIndustriesList
  };

  return jobDetail;
}

/**
 * Cached version of getJobById with proper Next.js caching
 */
export const getJobById = async (
  jobId: string, 
  options?: CacheOptions & { skipStatusFilter?: boolean }
): Promise<JobDetail> => {
  const skipStatusFilter = options?.skipStatusFilter || false;
  
  // Use unstable_cache for proper server-side caching
  const cachedFunction = unstable_cache(
    async () => getJobByIdData(jobId, skipStatusFilter),
    [`job-${jobId}-${skipStatusFilter}`],
    {
      tags: [`job-${jobId}`],
      revalidate: 3600, // 1 hour cache
    }
  );
  
  return cachedFunction();
};

/**
 * Optimized related jobs query - uses Drizzle query API for efficiency
 */
async function getRelatedJobsData(jobId: string, limit: number = 3): Promise<any[]> {
  // First get the current job's company ID efficiently
  const currentJob = await db().query.jobs.findFirst({
    where: eq(jobs.id, jobId),
    columns: { companyId: true }
  });
  
  if (!currentJob) {
    return [];
  }
  
  // Then get related jobs from the same company using query API
  return db().query.jobs.findMany({
    where: and(
      eq(jobs.companyId, currentJob.companyId),
      eq(jobs.status, 'ACTIVE'),
      gte(jobs.expiresAt, new Date()),
      ne(jobs.id, jobId)
    ),
    columns: {
      id: true,
      title: true,
      jobType: true,
      slug: true
    },
    with: {
      location: {
        columns: {
          city: true
        }
      }
    },
    limit
  });
}

/**
 * Cached version of getRelatedJobs
 */
export const getRelatedJobs = async (jobId: string, limit: number = 3, options?: CacheOptions) => {
  const cachedFunction = unstable_cache(
    async () => getRelatedJobsData(jobId, limit),
    [`related-jobs-${jobId}-${limit}`],
    {
      tags: [`related-jobs-${jobId}`],
      revalidate: 3600,
    }
  );
  
  return cachedFunction();
};

/**
 * Optimized user application check with single query
 */
async function checkUserApplicationData(jobId: string, userId: string): Promise<boolean> {
  // OPTIMIZATION: Single query with joins instead of multiple queries
  const applicationResult = await db()
    .select({ id: applications.id })
    .from(applications)
    .innerJoin(candidateProfiles, eq(applications.candidateProfileId, candidateProfiles.id))
    .innerJoin(profiles, eq(candidateProfiles.profileId, profiles.id))
    .where(
      and(
        eq(applications.jobId, jobId),
        eq(profiles.userId, userId),
        eq(applications.deleted, false)
      )
    )
    .limit(1);
  
  return applicationResult.length > 0;
}

/**
 * Cached version of checkUserApplication
 */
export const checkUserApplication = async (jobId: string, userId: string | undefined, options?: CacheOptions) => {
  if (!userId) {
    return false;
  }
  
  const cachedFunction = unstable_cache(
    async () => checkUserApplicationData(jobId, userId),
    [`user-application-${jobId}-${userId}`],
    {
      tags: [`user-application-${userId}`, `job-applications-${jobId}`],
      revalidate: 300, // 5 minutes cache (shorter for user-specific data)
    }
  );
  
  return cachedFunction();
};

/**
 * Optimized saved job check with single query
 */
async function checkUserSavedJobData(jobId: string, userId: string): Promise<boolean> {
  // OPTIMIZATION: Single query with joins instead of multiple queries
  const savedJobResult = await db()
    .select({ deleted: savedJobs.deleted })
    .from(savedJobs)
    .innerJoin(profiles, eq(savedJobs.userId, profiles.id))
    .where(
      and(
        eq(savedJobs.jobId, jobId),
        eq(profiles.userId, userId)
      )
    )
    .limit(1);
  
  // Return true if the job is saved (record exists and deleted is false)
  return savedJobResult.length > 0 && !savedJobResult[0].deleted;
}

/**
 * Cached version of checkUserSavedJob
 */
export const checkUserSavedJob = async (jobId: string, userId: string | undefined, options?: CacheOptions) => {
  if (!userId) return false;
  
  const cachedFunction = unstable_cache(
    async () => checkUserSavedJobData(jobId, userId),
    [`user-saved-job-${jobId}-${userId}`],
    {
      tags: [`user-saved-jobs-${userId}`, `job-saved-${jobId}`],
      revalidate: 300, // 5 minutes cache (shorter for user-specific data)
    }
  );
  
  return cachedFunction();
}; 