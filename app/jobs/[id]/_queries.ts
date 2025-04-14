import { eq, and, gte } from 'drizzle-orm';
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
  applications
} from '@/lib/db/schema';
import { notFound } from 'next/navigation';
import type { JobDetail, SimpleSkill, SimpleIndustry } from '../_utils/types';

/**
 * Get detailed job information by ID
 */
export async function getJobById(jobId: string): Promise<JobDetail> {
  // Get the job with basic company and location information
  const jobQuery = await db()
    .select()
    .from(jobs)
    .where(
      and(
        eq(jobs.id, jobId),
        eq(jobs.status, 'ACTIVE'),
        gte(jobs.expiresAt, new Date())
      )
    )
    .leftJoin(employerProfiles, eq(jobs.companyId, employerProfiles.id))
    .leftJoin(locations, eq(jobs.locationId, locations.id));
    
  if (jobQuery.length === 0) {
    notFound();
  }
  
  const jobResult = jobQuery[0];
  
  if (!jobResult.employer_profiles) {
    notFound();
  }
  
  const job = jobResult.jobs;
  
  // Get job skills
  const skillsQuery = await db()
    .select({
      id: skills.id,
      name: skills.name
    })
    .from(jobSkills)
    .leftJoin(skills, eq(jobSkills.skillId, skills.id))
    .where(eq(jobSkills.jobId, jobId));
    
  const jobSkillsList: SimpleSkill[] = skillsQuery
    .filter(skill => skill.id !== null)
    .map(skill => ({
      id: skill.id as string,
      name: skill.name || ''
    }));
    
  // Get job industries
  const industriesQuery = await db()
    .select({
      id: industries.id,
      name: industries.name
    })
    .from(jobIndustries)
    .leftJoin(industries, eq(jobIndustries.industryId, industries.id))
    .where(eq(jobIndustries.jobId, jobId));
  
  const jobIndustriesList: SimpleIndustry[] = industriesQuery
    .filter(industry => industry.id !== null)
    .map(industry => ({
      id: industry.id as string,
      name: industry.name || ''
    }));
  
  // Restructure data into the expected format
  const jobDetail: JobDetail = {
    // Core job data
    id: job.id,
    title: job.title,
    description: job.description,
    jobType: job.jobType,
    companyId: job.companyId,
    locationId: job.locationId,
    workLocation: job.workLocation,
    experienceLevel: job.experienceLevel,
    salaryRangeMin: job.salaryRangeMin,
    salaryRangeMax: job.salaryRangeMax,
    salaryCurrency: job.salaryCurrency,
    salaryFrequency: job.salaryFrequency,
    salaryDisplayType: job.salaryDisplayType ?? '',
    applicationMethod: job.applicationMethod as JobDetail['applicationMethod'],
    applicationEmail: job.applicationEmail,
    applicationUrl: job.applicationUrl,
    publishedAt: job.publishedAt,
    expiresAt: job.expiresAt ?? new Date(),
    status: job.status,
    slug: job.slug,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    
    // Additional fields
    jobLanguage: job.jobLanguage,
    numberOfOpenings: job.numberOfOpenings,
    displayAddress: job.displayAddress === null ? undefined : job.displayAddress,
    educationRequirements: job.educationRequirements,
    experienceRequirements: job.experienceRequirements,
    languageRequirements: job.languageRequirements,
    languageTrainingProvided: job.languageTrainingProvided === null ? undefined : job.languageTrainingProvided,
    schedule: job.schedule,
    expectedHours: job.expectedHours,
    hoursType: job.hoursType,
    contractLength: job.contractLength,
    plannedStartDate: job.plannedStartDate,
    supplementalPay: job.supplementalPay,
    benefits: job.benefits,
    applicationInstructions: job.applicationInstructions,
    resumeRequired: job.resumeRequired === null ? undefined : job.resumeRequired,
    allowCandidateContact: job.allowCandidateContact === null ? undefined : job.allowCandidateContact,
    applicationDeadline: job.applicationDeadline,
    
    // Related entities
    company: jobResult.employer_profiles,
    location: jobResult.locations,
    skills: jobSkillsList,
    industries: jobIndustriesList
  };

  return jobDetail;
}

/**
 * Get similar/related jobs (same company or industry)
 */
export async function getRelatedJobs(jobId: string, limit: number = 3) {
  const currentJob = await db()
    .select({
      companyId: jobs.companyId
    })
    .from(jobs)
    .where(eq(jobs.id, jobId));
    
  if (currentJob.length === 0) {
    return [];
  }
  
  const companyId = currentJob[0].companyId;
  
  // Get other jobs from the same company
  return db()
    .select({
      id: jobs.id,
      title: jobs.title,
      jobType: jobs.jobType,
      locationName: locations.city,
      slug: jobs.slug
    })
    .from(jobs)
    .leftJoin(locations, eq(jobs.locationId, locations.id))
    .where(
      and(
        eq(jobs.companyId, companyId),
        eq(jobs.status, 'ACTIVE'),
        gte(jobs.expiresAt, new Date())
      )
    )
    .limit(limit);
}

// Add this function after existing exports
export async function checkUserApplication(jobId: string, userId: string | undefined) {
  if (!userId) return false;
  
  // Get the candidate profile ID for this user
  const candidateResult = await db()
    .select({
      id: candidateProfiles.id,
    })
    .from(candidateProfiles)
    .leftJoin(profiles, eq(candidateProfiles.profileId, profiles.id))
    .where(eq(profiles.userId, userId))
    .limit(1);
  
  if (!candidateResult.length) return false;
  
  const candidateProfileId = candidateResult[0].id;
  
  // Check if this candidate has applied to this job
  const applicationResult = await db()
    .select({ id: applications.id })
    .from(applications)
    .where(
      and(
        eq(applications.jobId, jobId),
        eq(applications.candidateProfileId, candidateProfileId)
      )
    )
    .limit(1);
  
  return applicationResult.length > 0;
} 