'use server'

import { eq, and, or, desc, asc, ne, SQL, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { applications, jobs, employerProfiles, profiles, candidateProfiles, applicationStatusEnum, education, experience } from '@/lib/db/schema'
import { getUser } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'
import { cache } from 'react'
import { APPLICANTS_CACHE_TAGS } from './_utils/cache-tags'

export interface ApplicationFilter {
  status?: string
  jobId?: string
  searchTerm?: string
  sort?: 'newest' | 'oldest'
}

/**
 * Data fetching function for employer applications
 */
async function getEmployerApplicationsData(employerProfileId: string, filter: ApplicationFilter = {}) {
  // Start with base conditions
  let conditions = and(
    eq(jobs.companyId, employerProfileId),
    eq(applications.deleted, false),
    ne(jobs.status, 'DELETED')
  );

  // Add additional filters to conditions
  if (filter.status && filter.status !== 'ALL') {
    conditions = and(conditions, eq(applications.status, filter.status as any));
  }

  if (filter.jobId) {
    conditions = and(conditions, eq(jobs.id, filter.jobId));
  }

  if (filter.searchTerm) {
    const term = `%${filter.searchTerm}%`;
    conditions = and(
      conditions, 
      or(
        sql`${jobs.title} ILIKE ${term}`,
        sql`${profiles.fullName} ILIKE ${term}`
      )
    );
  }

  // Apply all conditions in a single where call
  const query = db()
    .select({
      application: {
        id: applications.id,
        status: applications.status,
        appliedAt: applications.appliedAt,
        updatedAt: applications.updatedAt,
        coverLetterText: applications.coverLetterText,
        coverLetterUrl: applications.coverLetterUrl,
        resumeUrl: applications.resumeUrl,
        interviewDate: applications.interviewDate
      },
      job: {
        id: jobs.id,
        title: jobs.title
      },
      candidate: {
        id: candidateProfiles.id,
        fullName: profiles.fullName,
        title: candidateProfiles.title,
        avatarUrl: profiles.avatarUrl
      }
    })
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .innerJoin(candidateProfiles, eq(applications.candidateProfileId, candidateProfiles.id))
    .innerJoin(profiles, eq(candidateProfiles.profileId, profiles.id))
    .where(conditions);
  
  // Apply sorting
  return await (filter.sort === 'oldest' 
    ? query.orderBy(asc(applications.appliedAt)) 
    : query.orderBy(desc(applications.appliedAt)))
}

/**
 * Helper to get employer profile ID - cached per request
 */
const getEmployerProfileIdCached = cache(async (userId: string) => {
  const result = await db()
    .select({
      employerProfileId: employerProfiles.id
    })
    .from(profiles)
    .innerJoin(
      employerProfiles,
      and(
        eq(profiles.id, employerProfiles.profileId),
        eq(employerProfiles.deleted, false)
      )
    )
    .where(and(
      eq(profiles.userId, userId),
      eq(profiles.deleted, false)
    ))
    .limit(1)
  
  return result[0]?.employerProfileId || null
})

// Get applications for all jobs posted by the employer
export async function getEmployerApplications(filter: ApplicationFilter = {}) {
  try {
    // Authentication check OUTSIDE cache scope
    const user = await getUser()
    if (!user) {
      return { error: 'Unauthorized' }
    }
    
    // Get employer profile ID using request-level cache
    const employerProfileId = await getEmployerProfileIdCached(user.id)
    
    if (!employerProfileId) {
      return { error: 'Employer profile not found' }
    }
    
    // Create cache key based on filter parameters
    const cacheKey = [
      'employer-applications',
      employerProfileId,
      filter.status || 'all',
      filter.jobId || 'all',
      filter.searchTerm || '',
      filter.sort || 'newest'
    ]
    
    // Cache the data fetching function with on-demand invalidation
    const cachedFunction = unstable_cache(
      async () => getEmployerApplicationsData(employerProfileId, filter),
      cacheKey,
      {
        tags: [
          APPLICANTS_CACHE_TAGS.allApplications,
          APPLICANTS_CACHE_TAGS.employerApplications(employerProfileId),
          ...(filter.jobId ? [APPLICANTS_CACHE_TAGS.jobApplications(filter.jobId)] : []),
          ...(filter.status ? [APPLICANTS_CACHE_TAGS.applicationsByStatus(filter.status)] : [])
        ]
      }
    )
    
    const applications = await cachedFunction()
    
    return { applications }
  } catch (error) {
    console.error('Error fetching employer applications:', error)
    return { error: 'Failed to fetch applications' }
  }
}

/**
 * Data fetching function for application by ID
 */
async function getApplicationByIdData(employerProfileId: string, applicationId: string) {
  // Get application details with candidate and job info
  const applicationData = await db()
    .select({
      application: {
        id: applications.id,
        status: applications.status,
        appliedAt: applications.appliedAt,
        updatedAt: applications.updatedAt,
        coverLetterText: applications.coverLetterText,
        coverLetterUrl: applications.coverLetterUrl,
        coverLetterFilename: applications.coverLetterFilename,
        resumeUrl: applications.resumeUrl,
        resumeFilename: applications.resumeFilename,
        notes: applications.notes,
        interviewDate: applications.interviewDate
      },
      job: {
        id: jobs.id,
        title: jobs.title,
        description: jobs.description,
        workLocation: jobs.workLocation,
        jobType: jobs.jobType
      },
      candidate: {
        id: candidateProfiles.id,
        fullName: profiles.fullName,
        title: candidateProfiles.title,
        experienceLevel: candidateProfiles.experienceLevel,
        avatarUrl: profiles.avatarUrl,
        resumeUrl: candidateProfiles.resumeUrl,
        linkedinUrl: candidateProfiles.linkedinUrl,
        githubUrl: candidateProfiles.githubUrl,
        portfolioUrl: candidateProfiles.portfolioUrl,
        bio: candidateProfiles.bio
      }
    })
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .innerJoin(candidateProfiles, eq(applications.candidateProfileId, candidateProfiles.id))
    .innerJoin(profiles, eq(candidateProfiles.profileId, profiles.id))
    .where(and(
      eq(applications.id, applicationId),
      eq(jobs.companyId, employerProfileId),
      eq(applications.deleted, false)
    ))
    .limit(1)
  
  if (!applicationData.length) {
    return null;
  }
  
  // Parallel fetching of education and experience data
  const [educationData, experienceData] = await Promise.all([
    // Get candidate's education history
    db()
      .select()
      .from(education)
      .where(and(
        eq(education.candidateProfileId, applicationData[0].candidate.id),
        eq(education.deleted, false)
      ))
      .orderBy(desc(education.endDate)),
    
    // Get candidate's work experience
    db()
      .select()
      .from(experience)
      .where(and(
        eq(experience.candidateProfileId, applicationData[0].candidate.id),
        eq(experience.deleted, false)
      ))
      .orderBy(desc(experience.startDate))
  ])
  
  // Ensure dates are properly formatted as Date objects
  const formattedEducation = educationData.map(edu => ({
    ...edu,
    startDate: edu.startDate ? new Date(edu.startDate) : null,
    endDate: edu.endDate ? new Date(edu.endDate) : null
  }))
  
  const formattedExperience = experienceData.map(exp => ({
    ...exp,
    startDate: exp.startDate ? new Date(exp.startDate) : null,
    endDate: exp.endDate ? new Date(exp.endDate) : null
  }))
  
  return {
    ...applicationData[0],
    candidate: {
      ...applicationData[0].candidate,
      education: formattedEducation,
      experience: formattedExperience
    }
  }
}


// Get specific application by ID
export async function getApplicationById(applicationId: string) {
  try {
    // Authentication check OUTSIDE cache scope
    const user = await getUser()
    if (!user) {
      return { error: 'Unauthorized' }
    }
    
    // Get employer profile ID using request-level cache
    const employerProfileId = await getEmployerProfileIdCached(user.id)
    
    if (!employerProfileId) {
      return { error: 'Employer profile not found' }
    }
    
    // Cache the data fetching function with on-demand invalidation
    const cachedFunction = unstable_cache(
      async () => getApplicationByIdData(employerProfileId, applicationId),
      [`application-detail-${applicationId}`],
      {
        tags: [
          APPLICANTS_CACHE_TAGS.application(applicationId),
          APPLICANTS_CACHE_TAGS.applicationDetail(applicationId),
          APPLICANTS_CACHE_TAGS.allApplications
        ]
      }
    )
    
    const application = await cachedFunction()
    
    if (!application) {
      return { error: 'Application not found or you do not have permission to view it' }
    }
    
    return { application }
  } catch (error) {
    console.error('Error fetching application details:', error)
    return { error: 'Failed to fetch application details' }
  }
}

/**
 * Data fetching function for application counts
 */
async function getApplicationCountsData(employerProfileId: string) {
  // Get application counts using SQL aggregation for better performance
  const countsByStatus = await db()
    .select({
      status: applications.status,
      count: sql`count(*)`.as('count')
    })
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .where(and(
      eq(jobs.companyId, employerProfileId),
      eq(applications.deleted, false),
      ne(jobs.status, 'DELETED')
    ))
    .groupBy(applications.status)
  
  // Initialize counts object with zeros
  const counts = {
    all: 0,
    applied: 0,
    reviewing: 0,
    shortlisted: 0,
    interview: 0,
    interviewed: 0,
    offered: 0,
    hired: 0,
    rejected: 0,
    withdrawn: 0
  };
  
  // Calculate total
  let total = 0;
  
  // Populate counts from SQL aggregation results
  countsByStatus.forEach(item => {
    const count = Number(item.count);
    total += count;
    
    switch(item.status) {
      case 'APPLIED':
        counts.applied = count;
        break;
      case 'REVIEWING':
        counts.reviewing = count;
        break;
      case 'SHORTLISTED':
        counts.shortlisted = count;
        break;
      case 'INTERVIEW_SCHEDULED':
        counts.interview = count;
        break;
      case 'INTERVIEWED':
        counts.interviewed = count;
        break;
      case 'OFFER_EXTENDED':
        counts.offered = count;
        break;
      case 'HIRED':
        counts.hired = count;
        break;
      case 'REJECTED':
        counts.rejected = count;
        break;
      case 'WITHDRAWN':
        counts.withdrawn = count;
        break;
    }
  });
  
  counts.all = total;
  
  return counts;
}


// Get counts of applications by status
export async function getApplicationCounts() {
  try {
    // Authentication check OUTSIDE cache scope
    const user = await getUser()
    if (!user) {
      return { error: 'Unauthorized' }
    }
    
    // Get employer profile ID using request-level cache
    const employerProfileId = await getEmployerProfileIdCached(user.id)
    
    if (!employerProfileId) {
      return { error: 'Employer profile not found' }
    }
    
    // Cache the data fetching function with on-demand invalidation
    const cachedFunction = unstable_cache(
      async () => getApplicationCountsData(employerProfileId),
      [`application-counts-${employerProfileId}`],
      {
        tags: [
          APPLICANTS_CACHE_TAGS.applicationCounts,
          APPLICANTS_CACHE_TAGS.employerApplications(employerProfileId),
          APPLICANTS_CACHE_TAGS.allApplications
        ]
      }
    )
    
    const counts = await cachedFunction()
    
    return { counts }
  } catch (error) {
    console.error('Error fetching application counts:', error)
    return { error: 'Failed to fetch application counts' }
  }
} 