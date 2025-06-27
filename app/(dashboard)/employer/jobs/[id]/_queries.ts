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
  applications,
  candidateProfiles
} from '@/lib/db/schema'
import { eq, and, isNull, not, count, desc } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import type { Job } from '@/lib/db/schema'
import { unstable_cache } from 'next/cache'
import { cache } from 'react'
import { JOB_DETAIL_CACHE_TAGS } from './_utils/cache-tags'

/**
 * Helper to get employer profile - cached per request
 */
const getEmployerProfileCached = cache(async (userId: string) => {
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
})

// Get employer profile for a user
export async function getEmployerProfile(userId: string) {
  return getEmployerProfileCached(userId)
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
 * Main entry point for getting job data with on-demand caching
 */
export async function getJobById(jobId: string) {
  const cachedFunction = unstable_cache(
    async () => getJobByIdData(jobId),
    [`job-detail-${jobId}`],
    {
      tags: [
        JOB_DETAIL_CACHE_TAGS.job(jobId),
        JOB_DETAIL_CACHE_TAGS.jobDetail(jobId),
        JOB_DETAIL_CACHE_TAGS.jobsDetail
      ]
    }
  )
  
  return cachedFunction()
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
 * Main entry point for getting job skills with on-demand caching
 */
export async function getJobSkills(jobId: string) {
  const cachedFunction = unstable_cache(
    async () => getJobSkillsData(jobId),
    [`job-skills-${jobId}`],
    {
      tags: [
        JOB_DETAIL_CACHE_TAGS.jobSkills(jobId),
        JOB_DETAIL_CACHE_TAGS.job(jobId)
      ]
    }
  )
  
  return cachedFunction()
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
 * Main entry point for getting job industries with on-demand caching
 */
export async function getJobIndustries(jobId: string) {
  const cachedFunction = unstable_cache(
    async () => getJobIndustriesData(jobId),
    [`job-industries-${jobId}`],
    {
      tags: [
        JOB_DETAIL_CACHE_TAGS.jobIndustries(jobId),
        JOB_DETAIL_CACHE_TAGS.job(jobId)
      ]
    }
  )
  
  return cachedFunction()
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
 * Main entry point for getting application statistics with on-demand caching
 */
export async function getApplicationStats(jobId: string) {
  const cachedFunction = unstable_cache(
    async () => getApplicationStatsData(jobId),
    [`application-stats-${jobId}`],
    {
      tags: [
        JOB_DETAIL_CACHE_TAGS.jobApplicationStats(jobId),
        JOB_DETAIL_CACHE_TAGS.jobApplications(jobId),
        JOB_DETAIL_CACHE_TAGS.allApplications
      ]
    }
  )
  
  return cachedFunction()
}

/**
 * Get recent applications (uncached version)
 */
export async function getRecentApplicationsData(jobId: string, limit = 5) {
  try {
    // Alias profiles table to avoid conflict
    const candidateBaseProfile = alias(profiles, 'candidateBaseProfile');

    const result = await db()
      .select({
        id: applications.id,
        status: applications.status,
        appliedAt: applications.appliedAt,
        candidateProfileId: applications.candidateProfileId,
        candidateName: candidateBaseProfile.fullName
      })
      .from(applications)
      .innerJoin(candidateProfiles, eq(applications.candidateProfileId, candidateProfiles.id))
      .innerJoin(candidateBaseProfile, eq(candidateProfiles.profileId, candidateBaseProfile.id))
      .where(and(
        eq(applications.jobId, jobId),
        eq(applications.deleted, false),
        eq(candidateProfiles.deleted, false),
        eq(candidateBaseProfile.deleted, false)
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
 * Main entry point for getting recent applications with on-demand caching
 */
export async function getRecentApplications(jobId: string, limit = 5) {
  const cachedFunction = unstable_cache(
    async () => getRecentApplicationsData(jobId, limit),
    [`recent-applications-${jobId}-${limit}`],
    {
      tags: [
        JOB_DETAIL_CACHE_TAGS.jobRecentApplications(jobId),
        JOB_DETAIL_CACHE_TAGS.jobApplications(jobId),
        JOB_DETAIL_CACHE_TAGS.allApplications
      ]
    }
  )
  
  return cachedFunction()
} 