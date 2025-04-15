'use server'

import { eq, and, or, desc, asc, ne, SQL, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { applications, jobs, employerProfiles, profiles, candidateProfiles, applicationStatusEnum, education, experience } from '@/lib/db/schema'
import { getUser } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'

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
 * Cached version of employer applications
 */
const getEmployerApplicationsCached = unstable_cache(
  async (employerProfileId: string, filter: ApplicationFilter = {}) => {
    return getEmployerApplicationsData(employerProfileId, filter);
  },
  ['employer-applications'],
  {
    tags: ['employer-applications']
  }
);

// Get applications for all jobs posted by the employer
export async function getEmployerApplications(filter: ApplicationFilter = {}) {
  try {
    const user = await getUser()
    if (!user) {
      return { error: 'Unauthorized' }
    }
    
    // Get employer profile ID
    const employerResult = await db()
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
        eq(profiles.userId, user.id),
        eq(profiles.deleted, false)
      ))
      .limit(1)
    
    if (!employerResult.length) {
      return { error: 'Employer profile not found' }
    }
    
    const employerProfileId = employerResult[0].employerProfileId
    
    // Use cached function
    const applications = await getEmployerApplicationsCached(employerProfileId, filter);
    
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
  
  // Get candidate's education history
  const educationData = await db()
    .select()
    .from(education)
    .where(and(
      eq(education.candidateProfileId, applicationData[0].candidate.id),
      eq(education.deleted, false)
    ))
    .orderBy(desc(education.endDate))
  
  // Get candidate's work experience
  const experienceData = await db()
    .select()
    .from(experience)
    .where(and(
      eq(experience.candidateProfileId, applicationData[0].candidate.id),
      eq(experience.deleted, false)
    ))
    .orderBy(desc(experience.startDate))
  
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

/**
 * Cached version of application by ID
 */
const getApplicationByIdCached = unstable_cache(
  async (employerProfileId: string, applicationId: string) => {
    return getApplicationByIdData(employerProfileId, applicationId);
  },
  ['application-detail'],
  {
    tags: ['application-detail', 'employer-applications']
  }
);

// Get specific application by ID
export async function getApplicationById(applicationId: string) {
  try {
    const user = await getUser()
    if (!user) {
      return { error: 'Unauthorized' }
    }
    
    // Get employer profile ID to verify ownership
    const employerResult = await db()
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
        eq(profiles.userId, user.id),
        eq(profiles.deleted, false)
      ))
      .limit(1)
    
    if (!employerResult.length) {
      return { error: 'Employer profile not found' }
    }
    
    const employerProfileId = employerResult[0].employerProfileId
    
    // Use cached function
    const application = await getApplicationByIdCached(employerProfileId, applicationId);
    
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

/**
 * Cached version of application counts
 */
const getApplicationCountsCached = unstable_cache(
  async (employerProfileId: string) => {
    return getApplicationCountsData(employerProfileId);
  },
  ['application-counts'],
  {
    tags: ['employer-applications']
  }
);

// Get counts of applications by status
export async function getApplicationCounts() {
  try {
    const user = await getUser()
    if (!user) {
      return { error: 'Unauthorized' }
    }
    
    // Get employer profile ID
    const employerResult = await db()
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
        eq(profiles.userId, user.id),
        eq(profiles.deleted, false)
      ))
      .limit(1)
    
    if (!employerResult.length) {
      return { error: 'Employer profile not found' }
    }
    
    const employerProfileId = employerResult[0].employerProfileId
    
    // Use cached function
    const counts = await getApplicationCountsCached(employerProfileId);
    
    return { counts }
  } catch (error) {
    console.error('Error fetching application counts:', error)
    return { error: 'Failed to fetch application counts' }
  }
} 