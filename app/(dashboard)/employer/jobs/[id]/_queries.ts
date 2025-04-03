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

// Get job by ID with detailed location info
export async function getJobById(jobId: string) {
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

// Get job skills
export async function getJobSkills(jobId: string) {
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

// Get job industries
export async function getJobIndustries(jobId: string) {
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

// Get application statistics
export async function getApplicationStats(jobId: string) {
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

// Get recent applications
export async function getRecentApplications(jobId: string, limit = 5) {
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