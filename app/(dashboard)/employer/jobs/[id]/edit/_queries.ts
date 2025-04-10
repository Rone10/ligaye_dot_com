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
  locations
} from '@/lib/db/schema'
import { eq, and, inArray } from 'drizzle-orm'
import type { NewJob, NewJobSkill, NewJobIndustry, Job } from '@/lib/db/schema'

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

// Get job by ID
export async function getJobById(jobId: string) {
  try {
    const result = await db()
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId))
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

// Get all locations from database
export async function getAllLocations() {
  try {
    return await db()
      .select({
        id: locations.id,
        region: locations.region,
        district: locations.district,
        city: locations.city
      })
      .from(locations)
      .where(eq(locations.deleted, false))
      .orderBy(locations.region, locations.city)
  } catch (error) {
    console.error('Error fetching locations:', error)
    return []
  }
}

// Get all skills from database
export async function getAllSkills() {
  try {
    return await db()
      .select({
        id: skills.id,
        name: skills.name
      })
      .from(skills)
      .where(eq(skills.deleted, false))
      .orderBy(skills.name)
  } catch (error) {
    console.error('Error fetching skills:', error)
    return []
  }
}

// Get all industries from database
export async function getAllIndustries() {
  try {
    return await db()
      .select({
        id: industries.id,
        name: industries.name
      })
      .from(industries)
      .where(eq(industries.deleted, false))
      .orderBy(industries.name)
  } catch (error) {
    console.error('Error fetching industries:', error)
    return []
  }
}

// Update job with related skills and industries
export async function updateJob(
  jobId: string,
  jobData: Partial<Job>,
  skillIds: string[],
  industryIds: string[]
) {
  try {
    return await db().transaction(async (tx) => {
      // Helper function to safely parse dates
      const safeDate = (value: any): Date | undefined => {
        if (!value) return undefined
        
        try {
          if (value instanceof Date) {
            // Verify it's a valid date by trying to convert to ISO string
            value.toISOString()
            return value
          }
          
          // If it's a string, try to create a new Date
          const date = new Date(value)
          // Validate the date is valid
          date.toISOString()
          return date
        } catch (error) {
          console.warn('Invalid date value:', value)
          return undefined
        }
      }
      
      // Process date fields to ensure they're valid Date objects
      const processedJobData = {
        ...jobData,
        // Ensure benefits and supplementalPay are arrays or default to empty arrays
        benefits: Array.isArray(jobData.benefits) ? jobData.benefits : [],
        supplementalPay: Array.isArray(jobData.supplementalPay) ? jobData.supplementalPay : [],
        // Ensure all date fields are properly formatted as Date objects
        plannedStartDate: safeDate(jobData.plannedStartDate),
        applicationDeadline: safeDate(jobData.applicationDeadline),
        updatedAt: new Date()
      }
      
      // Update the job
      await tx
        .update(jobs)
        .set(processedJobData)
        .where(eq(jobs.id, jobId))
      
      // Get current skills
      const currentSkills = await tx
        .select({ id: jobSkills.id, skillId: jobSkills.skillId })
        .from(jobSkills)
        .where(and(
          eq(jobSkills.jobId, jobId),
          eq(jobSkills.deleted, false)
        ))
      
      const currentSkillIds = currentSkills.map(skill => skill.skillId)
      const skillsToAdd = skillIds.filter(id => !currentSkillIds.includes(id))
      const skillsToRemove = currentSkills.filter(skill => !skillIds.includes(skill.skillId))
      
      // Add new skills
      if (skillsToAdd.length > 0) {
        const jobSkillsData = skillsToAdd.map(skillId => ({
          jobId,
          skillId,
          deleted: false
        }))
        
        await tx
          .insert(jobSkills)
          .values(jobSkillsData)
      }
      
      // Remove skills by marking as deleted
      if (skillsToRemove.length > 0) {
        const skillIdsToRemove = skillsToRemove.map(skill => skill.id)
        
        await tx
          .update(jobSkills)
          .set({ deleted: true })
          .where(inArray(jobSkills.id, skillIdsToRemove))
      }
      
      // Get current industries
      const currentIndustries = await tx
        .select({ id: jobIndustries.id, industryId: jobIndustries.industryId })
        .from(jobIndustries)
        .where(and(
          eq(jobIndustries.jobId, jobId),
          eq(jobIndustries.deleted, false)
        ))
      
      const currentIndustryIds = currentIndustries.map(industry => industry.industryId)
      const industriesToAdd = industryIds.filter(id => !currentIndustryIds.includes(id))
      const industriesToRemove = currentIndustries.filter(industry => !industryIds.includes(industry.industryId))
      
      // Add new industries
      if (industriesToAdd.length > 0) {
        const jobIndustriesData = industriesToAdd.map(industryId => ({
          jobId,
          industryId,
          deleted: false
        }))
        
        await tx
          .insert(jobIndustries)
          .values(jobIndustriesData)
      }
      
      // Remove industries by marking as deleted
      if (industriesToRemove.length > 0) {
        const industryIdsToRemove = industriesToRemove.map(industry => industry.id)
        
        await tx
          .update(jobIndustries)
          .set({ deleted: true })
          .where(inArray(jobIndustries.id, industryIdsToRemove))
      }
      
      return { id: jobId }
    })
  } catch (error) {
    console.error('Error updating job:', error)
    throw error
  }
} 