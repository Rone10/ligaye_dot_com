'use server'

import { eq, and, or, desc, asc, ne, SQL, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { applications, jobs, employerProfiles, profiles, candidateProfiles, applicationStatusEnum } from '@/lib/db/schema'
import { getUser } from '@/lib/supabase/server'

export interface ApplicationFilter {
  status?: string
  jobId?: string
  searchTerm?: string
  sort?: 'newest' | 'oldest'
}

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
    const applicationsData = await (filter.sort === 'oldest' 
      ? query.orderBy(asc(applications.appliedAt)) 
      : query.orderBy(desc(applications.appliedAt)))
    
    return { applications: applicationsData }
  } catch (error) {
    console.error('Error fetching employer applications:', error)
    return { error: 'Failed to fetch applications' }
  }
}

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
      return { error: 'Application not found or you do not have permission to view it' }
    }
    
    return { application: applicationData[0] }
  } catch (error) {
    console.error('Error fetching application details:', error)
    return { error: 'Failed to fetch application details' }
  }
}

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
    
    // Get all applications for the employer's jobs
    const allApplications = await db()
      .select({
        status: applications.status
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .where(and(
        eq(jobs.companyId, employerProfileId),
        eq(applications.deleted, false),
        ne(jobs.status, 'DELETED')
      ))
    
    // Count applications by status
    const counts = {
      all: allApplications.length,
      applied: allApplications.filter(app => app.status === 'APPLIED').length,
      reviewing: allApplications.filter(app => app.status === 'REVIEWING').length,
      shortlisted: allApplications.filter(app => app.status === 'SHORTLISTED').length,
      interview: allApplications.filter(app => app.status === 'INTERVIEW_SCHEDULED').length,
      interviewed: allApplications.filter(app => app.status === 'INTERVIEWED').length,
      offered: allApplications.filter(app => app.status === 'OFFER_EXTENDED').length,
      hired: allApplications.filter(app => app.status === 'HIRED').length,
      rejected: allApplications.filter(app => app.status === 'REJECTED').length,
      withdrawn: allApplications.filter(app => app.status === 'WITHDRAWN').length
    }
    
    return { counts }
  } catch (error) {
    console.error('Error fetching application counts:', error)
    return { error: 'Failed to fetch application counts' }
  }
} 