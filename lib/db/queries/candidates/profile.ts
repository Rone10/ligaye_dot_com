'use server'

import { db } from '@/lib/db';
import { 
  profiles, 
  candidateProfiles,
  CandidateProfile,
  NewCandidateProfile,
  skills,
  candidateSkills
} from '@/lib/db/schema';
import { eq, and, count, desc, sql, gt } from 'drizzle-orm';

/**
 * Get a candidate profile by user ID, including the base profile
 */
export async function getCandidateProfileByUserId(userId: string) {
  const userProfile = await db()
    .select({
      profile: profiles,
      candidateProfile: candidateProfiles
    })
    .from(profiles)
    .leftJoin(candidateProfiles, eq(profiles.id, candidateProfiles.profileId))
    .where(eq(profiles.userId, userId))
    .limit(1);
  
  return userProfile[0] || null;
}

/**
 * Update an existing candidate profile
 */
export async function updateCandidateProfile(
  profileId: string, 
  data: Partial<CandidateProfile>
) {
  return await db()
    .update(candidateProfiles)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(candidateProfiles.profileId, profileId))
    .returning();
}

/**
 * Create a new candidate profile
 */
export async function createCandidateProfile(
  data: NewCandidateProfile,
  skillsData: Array<{skillId: string}> = []
) {
  return await db().transaction(async (tx) => {
    // Create the profile
    const newProfile = await tx
      .insert(candidateProfiles)
      .values(data)
      .returning();
      
    const candidateId = newProfile[0].id;
    
    // Add skills
    if (skillsData && skillsData.length > 0) {
      for (const { skillId } of skillsData) {
        await tx
          .insert(candidateSkills)
          .values({
            candidateId,
            skillId
          })
          .onConflictDoNothing();
      }
    }
    
    return newProfile[0];
  });
}

/**
 * Get candidate with skills
 */
export async function getCandidateWithSkills(candidateId: string) {
  // Get the candidate
  const candidate = await db()
    .select()
    .from(candidateProfiles)
    .where(eq(candidateProfiles.id, candidateId))
    .limit(1);
    
  if (!candidate.length) {
    throw new Error('Candidate not found');
  }
  
  // Get skills
  const candidateSkillsData = await db()
    .select({
      skill: {
        id: skills.id,
        name: skills.name
      }
    })
    .from(candidateSkills)
    .innerJoin(skills, eq(candidateSkills.skillId, skills.id))
    .where(eq(candidateSkills.candidateId, candidateId));
    
  const skillsList = candidateSkillsData.map(item => ({
    id: item.skill.id,
    name: item.skill.name
  }));
  
  return {
    ...candidate[0],
    skills: skillsList
  };
}

/**
 * Update candidate skills
 */
export async function updateCandidateSkills(
  candidateId: string, 
  skillsData: Array<{skillId: string}>
) {
  return await db().transaction(async (tx) => {
    // Delete existing skills
    await tx
      .delete(candidateSkills)
      .where(eq(candidateSkills.candidateId, candidateId));
      
    // Add new skills
    if (skillsData && skillsData.length > 0) {
      for (const { skillId } of skillsData) {
        await tx
          .insert(candidateSkills)
          .values({
            candidateId,
            skillId
          })
          .onConflictDoNothing();
      }
    }
    
    return { success: true };
  });
}