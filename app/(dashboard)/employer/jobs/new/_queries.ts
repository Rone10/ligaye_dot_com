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
import { eq, and } from 'drizzle-orm'
import type { NewJob, NewJobSkill, NewJobIndustry } from '@/lib/db/schema'

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

// Helper to calculate expiresAt based on duration
export async function calculateExpiryDate(durationMonths: number): Promise<Date> {
  try {
    const expiryDate = new Date()
    expiryDate.setMonth(expiryDate.getMonth() + durationMonths)
    // Validate date by checking if it can be converted to ISO string
    expiryDate.toISOString()
    return expiryDate
  } catch (error) {
    console.error('Invalid expiry date calculation:', error)
    // Return a safe default (1 month from now)
    const safeDate = new Date()
    safeDate.setDate(safeDate.getDate() + 30)
    return safeDate
  }
}

// Insert a new job with related skills and industries
export async function insertNewJob(
  jobData: Omit<NewJob, 'id' | 'createdAt' | 'updatedAt'>,
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
        // Ensure all date fields are properly formatted as Date objects
        plannedStartDate: safeDate(jobData.plannedStartDate),
        applicationDeadline: safeDate(jobData.applicationDeadline),
        expiresAt: safeDate(jobData.expiresAt),
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      // Insert the job first
      const [newJob] = await tx
        .insert(jobs)
        .values(processedJobData)
        .returning({ id: jobs.id })
      
      // Insert job skills
      if (skillIds.length > 0) {
        const jobSkillsData: Omit<NewJobSkill, 'id' | 'createdAt'>[] = skillIds.map(skillId => ({
          jobId: newJob.id,
          skillId,
          deleted: false
        }))
        
        await tx
          .insert(jobSkills)
          .values(jobSkillsData)
      }
      
      // Insert job industries
      if (industryIds.length > 0) {
        const jobIndustriesData: Omit<NewJobIndustry, 'id' | 'createdAt' | 'updatedAt'>[] = industryIds.map(industryId => ({
          jobId: newJob.id,
          industryId,
          deleted: false
        }))
        
        await tx
          .insert(jobIndustries)
          .values(jobIndustriesData)
      }
      
      return newJob
    })
  } catch (error) {
    console.error('Error inserting new job:', error)
    throw error
  }
} 