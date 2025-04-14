'use server'

import { db } from '@/lib/db'
import { 
  profiles,
  employerProfiles, 
  jobs, 
  jobSkills, 
  jobIndustries,
  skills,
  industries,
  locations,
  applications
} from '@/lib/db/schema'
import { eq, and, isNull, not, count, desc } from 'drizzle-orm'
import type { Job } from '@/lib/db/schema'
import { unstable_cache } from 'next/cache'

// Get employer profile for a user
export async function getEmployerProfile(userId: string) {
  try {
    const result = await db()
      .select()
      .from(employerProfiles)
      .innerJoin(
        profiles, 
        and(
          eq(profiles.id, employerProfiles.profileId),
          eq(profiles.userId, userId),
          eq(profiles.deleted, false)
        )
      )
      .where(eq(employerProfiles.deleted, false))
      .limit(1)
    
    return result.length > 0 ? result[0].employer_profiles : null
  } catch (error) {
    console.error('Error getting employer profile:', error)
    return null
  }
}

/**
 * Get job by ID with detailed location info (uncached version)
 */
export async function getJobByIdData(jobId: string) {
  try {
    const result = await db()
      .select({
        job: jobs,
        location: locations,
      })
      .from(jobs)
      .leftJoin(
        locations,
        eq(jobs.locationId, locations.id)
      )
      .where(and(
        eq(jobs.id, jobId),
        not(eq(jobs.status, 'DELETED'))
      ))
      .limit(1)
    
    return result.length > 0 ? result[0] : null
  } catch (error) {
    console.error('Error getting job:', error)
    return null
  }
}

/**
 * Cached version of job data
 */
const getJobByIdCached = unstable_cache(
  async (jobId: string) => {
    return getJobByIdData(jobId)
  },
  ['job-detail'],
  {
    tags: ['job-detail']
  }
)

/**
 * Main entry point for getting job data
 */
export async function getJobById(jobId: string) {
  return getJobByIdCached(jobId)
}

// Check if job belongs to employer
export async function checkJobOwnership(jobId: string, employerProfileId: string) {
  try {
    const result = await db()
      .select({
        id: jobs.id
      })
      .from(jobs)
      .where(and(
        eq(jobs.id, jobId),
        eq(jobs.companyId, employerProfileId)
      ))
      .limit(1)
    
    return result.length > 0
  } catch (error) {
    console.error('Error checking job ownership:', error)
    return false
  }
}

/**
 * Get job skills (uncached version)
 */
export async function getJobSkillsData(jobId: string) {
  try {
    const result = await db()
      .select({
        id: skills.id,
        name: skills.name
      })
      .from(jobSkills)
      .innerJoin(skills, eq(jobSkills.skillId, skills.id))
      .where(and(
        eq(jobSkills.jobId, jobId),
        eq(jobSkills.deleted, false)
      ))
    
    return result
  } catch (error) {
    console.error('Error getting job skills:', error)
    return []
  }
}

/**
 * Cached version of job skills
 */
const getJobSkillsCached = unstable_cache(
  async (jobId: string) => {
    return getJobSkillsData(jobId)
  },
  ['job-skills'],
  {
    tags: ['job-detail']
  }
)

/**
 * Main entry point for getting job skills
 */
export async function getJobSkills(jobId: string) {
  return getJobSkillsCached(jobId)
}

/**
 * Get job industries (uncached version)
 */
export async function getJobIndustriesData(jobId: string) {
  try {
    const result = await db()
      .select({
        id: industries.id,
        name: industries.name
      })
      .from(jobIndustries)
      .innerJoin(industries, eq(jobIndustries.industryId, industries.id))
      .where(and(
        eq(jobIndustries.jobId, jobId),
        eq(jobIndustries.deleted, false)
      ))
    
    return result
  } catch (error) {
    console.error('Error getting job industries:', error)
    return []
  }
}

/**
 * Cached version of job industries
 */
const getJobIndustriesCached = unstable_cache(
  async (jobId: string) => {
    return getJobIndustriesData(jobId)
  },
  ['job-industries'],
  {
    tags: ['job-detail']
  }
)

/**
 * Main entry point for getting job industries
 */
export async function getJobIndustries(jobId: string) {
  return getJobIndustriesCached(jobId)
}

/**
 * Get application statistics (uncached version)
 */
export async function getApplicationStatsData(jobId: string) {
  try {
    const result = await db()
      .select({
        status: applications.status,
        count: count(),
      })
      .from(applications)
      .where(and(
        eq(applications.jobId, jobId),
        eq(applications.deleted, false)
      ))
      .groupBy(applications.status)
    
    // Calculate total applications
    const totalApplications = result.reduce((sum, { count }) => sum + Number(count), 0)
    
    return {
      byStatus: result,
      total: totalApplications
    }
  } catch (error) {
    console.error('Error getting application stats:', error)
    return {
      byStatus: [],
      total: 0
    }
  }
}

/**
 * Cached version of application statistics
 */
const getApplicationStatsCached = unstable_cache(
  async (jobId: string) => {
    return getApplicationStatsData(jobId)
  },
  ['application-stats'],
  {
    tags: ['job-applications']
  }
)

/**
 * Main entry point for getting application statistics
 */
export async function getApplicationStats(jobId: string) {
  return getApplicationStatsCached(jobId)
}

/**
 * Get recent applications (uncached version)
 */
export async function getRecentApplicationsData(jobId: string, limit = 5) {
  try {
    const result = await db()
      .select({
        id: applications.id,
        status: applications.status,
        appliedAt: applications.appliedAt,
        candidateProfileId: applications.candidateProfileId,
      })
      .from(applications)
      .where(and(
        eq(applications.jobId, jobId),
        eq(applications.deleted, false)
      ))
      .orderBy(desc(applications.appliedAt))
      .limit(limit)
    
    return result
  } catch (error) {
    console.error('Error getting recent applications:', error)
    return []
  }
}

/**
 * Cached version of recent applications
 */
const getRecentApplicationsCached = unstable_cache(
  async (jobId: string, limit = 5) => {
    return getRecentApplicationsData(jobId, limit)
  },
  ['recent-applications'],
  {
    tags: ['job-applications']
  }
)

/**
 * Main entry point for getting recent applications
 */
export async function getRecentApplications(jobId: string, limit = 5) {
  return getRecentApplicationsCached(jobId, limit)
} 