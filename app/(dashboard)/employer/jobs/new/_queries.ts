'use server'

import { db } from '@/lib/db'
import { 
  profiles,
  employerProfiles, 
  jobs, 
  jobSkills, 
  jobIndustries,
  skills,
  industries
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

// Insert a new job with related skills and industries
export async function insertNewJob(
  jobData: Omit<NewJob, 'id' | 'createdAt' | 'updatedAt'>,
  skillIds: string[],
  industryIds: string[]
) {
  try {
    // Using a transaction to ensure all related records are created
    return await db().transaction(async (tx) => {
      // Insert the job
      const [newJob] = await tx
        .insert(jobs)
        .values(jobData)
        .returning()
      
      // Insert job skills
      if (skillIds.length > 0) {
        const jobSkillsData: Omit<NewJobSkill, 'id' | 'createdAt'>[] = skillIds.map(skillId => ({
          jobId: newJob.id,
          skillId
        }))
        
        await tx
          .insert(jobSkills)
          .values(jobSkillsData)
      }
      
      // Insert job industries
      if (industryIds.length > 0) {
        const jobIndustriesData: Omit<NewJobIndustry, 'id' | 'createdAt' | 'updatedAt'>[] = industryIds.map(industryId => ({
          jobId: newJob.id,
          industryId
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