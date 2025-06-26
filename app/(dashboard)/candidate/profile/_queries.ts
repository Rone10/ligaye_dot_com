import { db } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { 
  profiles, 
  candidateProfiles, 
  education, 
  experience, 
  candidateSkills, 
  skills 
} from '@/lib/db/schema';
import type { 
  Profile, 
  CandidateProfile, 
  Education, 
  Experience, 
  Skill,
  NewCandidateProfile,
  NewEducation,
  NewExperience,
  NewCandidateSkill
} from '@/lib/db/schema';
import { unstable_cache } from 'next/cache';

// Cache tags for on-demand invalidation
export const PROFILE_CACHE_TAGS = {
  candidateProfile: (userId: string) => `candidate-profile-${userId}`,
  education: (userId: string) => `candidate-education-${userId}`,
  experience: (userId: string) => `candidate-experience-${userId}`,
  skills: (userId: string) => `candidate-skills-${userId}`,
  availableSkills: 'available-skills',
  profileCollection: 'profile-collection'
} as const

export interface CandidateProfileData {
  profile: Profile;
  candidateProfile: CandidateProfile | null;
  education: Education[];
  experience: Experience[];
  skills: (Skill & { candidateSkillId: string })[];
}

// Internal optimized function for profile data retrieval (no auth logic)
async function getCandidateProfileDataInternal(userId: string): Promise<CandidateProfileData | null> {
  try {
    // First, get the base profile
    const profile = await db()
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1)
      .then(res => res[0])

    if (!profile) {
      return null
    }

    // Get candidate profile if it exists
    const candidateProfileData = await db()
      .select()
      .from(candidateProfiles)
      .where(eq(candidateProfiles.profileId, profile.id))
      .limit(1)
      .then(res => res[0])

    if (!candidateProfileData) {
      return {
        profile,
        candidateProfile: null,
        education: [],
        experience: [],
        skills: []
      }
    }

    // Parallel execution of remaining queries for better performance
    const [educationRecords, experienceRecords, candidateSkillsData] = await Promise.all([
      // Get education records
      db()
        .select()
        .from(education)
        .where(
          and(
            eq(education.candidateProfileId, candidateProfileData.id),
            eq(education.deleted, false)
          )
        ),

      // Get experience records
      db()
        .select()
        .from(experience)
        .where(
          and(
            eq(experience.candidateProfileId, candidateProfileData.id),
            eq(experience.deleted, false)
          )
        ),

      // Get skills with a join
      db()
        .select({
          skill: skills,
          candidateSkillId: candidateSkills.id
        })
        .from(candidateSkills)
        .innerJoin(skills, eq(candidateSkills.skillId, skills.id))
        .where(
          and(
            eq(candidateSkills.candidateProfileId, candidateProfileData.id),
            eq(candidateSkills.deleted, false),
            eq(skills.deleted, false)
          )
        )
    ])

    // Transform the skills data to the expected format
    const skillsData = candidateSkillsData.map(item => ({
      ...item.skill,
      candidateSkillId: item.candidateSkillId
    }))

    return {
      profile,
      candidateProfile: candidateProfileData,
      education: educationRecords,
      experience: experienceRecords,
      skills: skillsData
    }
  } catch (error) {
    console.error('Error fetching candidate profile data:', error)
    throw new Error('Failed to fetch candidate profile data')
  }
}

// Cached version with on-demand invalidation
export const getCandidateProfileData = async (userId: string) => {
  const cachedFunction = unstable_cache(
    async () => getCandidateProfileDataInternal(userId),
    [`candidate-profile-${userId}`],
    {
      tags: [
        PROFILE_CACHE_TAGS.candidateProfile(userId),
        PROFILE_CACHE_TAGS.education(userId),
        PROFILE_CACHE_TAGS.experience(userId),
        PROFILE_CACHE_TAGS.skills(userId),
        PROFILE_CACHE_TAGS.profileCollection
      ]
      // NO revalidate property = indefinite cache until tag invalidation
    }
  )
  
  return cachedFunction()
}

// Internal function for available skills (no auth needed)
async function getAvailableSkillsInternal(): Promise<Skill[]> {
  try {
    const allSkills = await db()
      .select()
      .from(skills)
      .where(eq(skills.deleted, false))

    return allSkills
  } catch (error) {
    console.error('Error fetching available skills:', error)
    throw new Error('Failed to fetch available skills')
  }
}

// Cached version for available skills
export const getAvailableSkills = async () => {
  const cachedFunction = unstable_cache(
    async () => getAvailableSkillsInternal(),
    ['available-skills'],
    {
      tags: [PROFILE_CACHE_TAGS.availableSkills]
    }
  )
  
  return cachedFunction()
}

// Create or update candidate profile details
export async function upsertCandidateProfile(profileData: Partial<CandidateProfile> & { userId: string }): Promise<CandidateProfile> {
  const { userId, ...candidateData } = profileData

  try {
    // First, get the profile id from userId
    const profile = await db()
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1)
      .then(res => res[0])

    if (!profile) {
      throw new Error('Profile not found')
    }

    // Check if a candidate profile already exists
    const existingCandidateProfile = await db()
      .select()
      .from(candidateProfiles)
      .where(eq(candidateProfiles.profileId, profile.id))
      .limit(1)
      .then(res => res[0])

    let result: CandidateProfile

    if (existingCandidateProfile) {
      // Update existing profile
      result = await db()
        .update(candidateProfiles)
        .set({
          ...candidateData,
          updatedAt: new Date()
        })
        .where(eq(candidateProfiles.id, existingCandidateProfile.id))
        .returning()
        .then(res => res[0])
    } else {
      // Create new profile
      const newCandidateProfile: NewCandidateProfile = {
        profileId: profile.id,
        ...candidateData,
      }

      result = await db()
        .insert(candidateProfiles)
        .values(newCandidateProfile)
        .returning()
        .then(res => res[0])
    }

    // Invalidate related caches
    await invalidateCandidateProfile(userId)
    
    return result
  } catch (error) {
    console.error('Error upserting candidate profile:', error)
    throw new Error('Failed to update candidate profile')
  }
}

// Education record mutations
export async function addEducationRecord(educationData: Omit<Education, 'id' | 'createdAt' | 'updatedAt' | 'deleted'>, userId: string): Promise<Education> {
  try {
    const newEducation: NewEducation = {
      ...educationData,
      deleted: false
    }

    const createdEducation = await db()
      .insert(education)
      .values(newEducation)
      .returning()
      .then(res => res[0])

    // Invalidate education cache
    await invalidateCandidateEducation(userId)

    return createdEducation
  } catch (error) {
    console.error('Error adding education record:', error)
    throw new Error('Failed to add education record')
  }
}

export async function updateEducationRecord(id: string, educationData: Partial<Education>, userId: string): Promise<Education> {
  try {
    const updatedEducation = await db()
      .update(education)
      .set({
        ...educationData,
        updatedAt: new Date()
      })
      .where(eq(education.id, id))
      .returning()
      .then(res => res[0])

    // Invalidate education cache
    await invalidateCandidateEducation(userId)

    return updatedEducation
  } catch (error) {
    console.error('Error updating education record:', error)
    throw new Error('Failed to update education record')
  }
}

export async function deleteEducationRecord(id: string, userId: string): Promise<{ success: boolean }> {
  try {
    await db()
      .update(education)
      .set({
        deleted: true,
        updatedAt: new Date()
      })
      .where(eq(education.id, id))

    // Invalidate education cache
    await invalidateCandidateEducation(userId)

    return { success: true }
  } catch (error) {
    console.error('Error deleting education record:', error)
    throw new Error('Failed to delete education record')
  }
}

// Experience record mutations
export async function addExperienceRecord(experienceData: Omit<Experience, 'id' | 'createdAt' | 'updatedAt' | 'deleted'>, userId: string): Promise<Experience> {
  try {
    const newExperience: NewExperience = {
      ...experienceData,
      deleted: false
    }

    const createdExperience = await db()
      .insert(experience)
      .values(newExperience)
      .returning()
      .then(res => res[0])

    // Invalidate experience cache
    await invalidateCandidateExperience(userId)

    return createdExperience
  } catch (error) {
    console.error('Error adding experience record:', error)
    throw new Error('Failed to add experience record')
  }
}

export async function updateExperienceRecord(id: string, experienceData: Partial<Experience>, userId: string): Promise<Experience> {
  try {
    const updatedExperience = await db()
      .update(experience)
      .set({
        ...experienceData,
        updatedAt: new Date()
      })
      .where(eq(experience.id, id))
      .returning()
      .then(res => res[0])

    // Invalidate experience cache
    await invalidateCandidateExperience(userId)

    return updatedExperience
  } catch (error) {
    console.error('Error updating experience record:', error)
    throw new Error('Failed to update experience record')
  }
}

export async function deleteExperienceRecord(id: string, userId: string): Promise<{ success: boolean }> {
  try {
    await db()
      .update(experience)
      .set({
        deleted: true,
        updatedAt: new Date()
      })
      .where(eq(experience.id, id))

    // Invalidate experience cache
    await invalidateCandidateExperience(userId)

    return { success: true }
  } catch (error) {
    console.error('Error deleting experience record:', error)
    throw new Error('Failed to delete experience record')
  }
}

// Skills management
export async function updateCandidateSkills(candidateProfileId: string, skillIds: string[], userId: string): Promise<{ success: boolean }> {
  try {
    // First, mark all existing skills as deleted
    await db()
      .update(candidateSkills)
      .set({
        deleted: true,
      })
      .where(eq(candidateSkills.candidateProfileId, candidateProfileId))

    // Now add all the selected skills in parallel
    const skillOperations = skillIds.map(async (skillId) => {
      const existingSkill = await db()
        .select()
        .from(candidateSkills)
        .where(
          and(
            eq(candidateSkills.candidateProfileId, candidateProfileId),
            eq(candidateSkills.skillId, skillId)
          )
        )
        .limit(1)
        .then(res => res[0])

      if (existingSkill) {
        // Un-delete existing skill
        return db()
          .update(candidateSkills)
          .set({
            deleted: false,
          })
          .where(eq(candidateSkills.id, existingSkill.id))
      } else {
        // Add new skill
        const newCandidateSkill: NewCandidateSkill = {
          candidateProfileId,
          skillId,
          deleted: false
        }

        return db()
          .insert(candidateSkills)
          .values(newCandidateSkill)
      }
    })

    await Promise.all(skillOperations)

    // Invalidate skills cache
    await invalidateCandidateSkills(userId)

    return { success: true }
  } catch (error) {
    console.error('Error updating candidate skills:', error)
    throw new Error('Failed to update candidate skills')
  }
}

// Cache invalidation helpers - these need 'use server' since they're called from server actions
export async function invalidateCandidateProfile(userId: string) {
  'use server'
  const { revalidateTag } = await import('next/cache')
  
  await Promise.all([
    revalidateTag(PROFILE_CACHE_TAGS.candidateProfile(userId)),
    revalidateTag(PROFILE_CACHE_TAGS.profileCollection)
  ])
}

export async function invalidateCandidateEducation(userId: string) {
  'use server'
  const { revalidateTag } = await import('next/cache')
  
  await Promise.all([
    revalidateTag(PROFILE_CACHE_TAGS.education(userId)),
    revalidateTag(PROFILE_CACHE_TAGS.candidateProfile(userId)),
    revalidateTag(PROFILE_CACHE_TAGS.profileCollection)
  ])
}

export async function invalidateCandidateExperience(userId: string) {
  'use server'
  const { revalidateTag } = await import('next/cache')
  
  await Promise.all([
    revalidateTag(PROFILE_CACHE_TAGS.experience(userId)),
    revalidateTag(PROFILE_CACHE_TAGS.candidateProfile(userId)),
    revalidateTag(PROFILE_CACHE_TAGS.profileCollection)
  ])
}

export async function invalidateCandidateSkills(userId: string) {
  'use server'
  const { revalidateTag } = await import('next/cache')
  
  await Promise.all([
    revalidateTag(PROFILE_CACHE_TAGS.skills(userId)),
    revalidateTag(PROFILE_CACHE_TAGS.candidateProfile(userId)),
    revalidateTag(PROFILE_CACHE_TAGS.profileCollection)
  ])
}

export async function invalidateAvailableSkills() {
  'use server'
  const { revalidateTag } = await import('next/cache')
  
  await revalidateTag(PROFILE_CACHE_TAGS.availableSkills)
} 