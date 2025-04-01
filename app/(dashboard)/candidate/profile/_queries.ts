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

export interface CandidateProfileData {
  profile: Profile;
  candidateProfile: CandidateProfile | null;
  education: Education[];
  experience: Experience[];
  skills: (Skill & { candidateSkillId: string })[];
}

// Main query to fetch complete candidate profile
export async function getCandidateProfile(userId: string): Promise<CandidateProfileData | null> {
  // First, get the base profile
  const profile = await db()
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1)
    .then(res => res[0]);

  if (!profile) return null;

  // Get candidate profile if it exists
  const candidateProfileData = await db()
    .select()
    .from(candidateProfiles)
    .where(eq(candidateProfiles.profileId, profile.id))
    .limit(1)
    .then(res => res[0]);

  // Get education records
  const educationRecords = candidateProfileData 
    ? await db()
        .select()
        .from(education)
        .where(
          and(
            eq(education.candidateProfileId, candidateProfileData.id),
            eq(education.deleted, false)
          )
        )
    : [];

  // Get experience records
  const experienceRecords = candidateProfileData 
    ? await db()
        .select()
        .from(experience)
        .where(
          and(
            eq(experience.candidateProfileId, candidateProfileData.id),
            eq(experience.deleted, false)
          )
        )
    : [];

  // Get skills with a join
  const candidateSkillsData = candidateProfileData 
    ? await db()
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
    : [];

  // Transform the skills data to the expected format
  const skillsData = candidateSkillsData.map(item => ({
    ...item.skill,
    candidateSkillId: item.candidateSkillId
  }));

  return {
    profile,
    candidateProfile: candidateProfileData || null,
    education: educationRecords,
    experience: experienceRecords,
    skills: skillsData
  };
}

// Create or update candidate profile details
export async function upsertCandidateProfile(profileData: Partial<CandidateProfile> & { userId: string }): Promise<CandidateProfile> {
  const { userId, ...candidateData } = profileData;

  // First, get the profile id from userId
  const profile = await db()
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1)
    .then(res => res[0]);

  if (!profile) {
    throw new Error('Profile not found');
  }

  // Check if a candidate profile already exists
  const existingCandidateProfile = await db()
    .select()
    .from(candidateProfiles)
    .where(eq(candidateProfiles.profileId, profile.id))
    .limit(1)
    .then(res => res[0]);

  if (existingCandidateProfile) {
    // Update existing profile
    const updatedProfile = await db()
      .update(candidateProfiles)
      .set({
        ...candidateData,
        updatedAt: new Date()
      })
      .where(eq(candidateProfiles.id, existingCandidateProfile.id))
      .returning()
      .then(res => res[0]);
      
    return updatedProfile;
  } else {
    // Create new profile
    const newCandidateProfile: NewCandidateProfile = {
      profileId: profile.id,
      ...candidateData,
    };

    const createdProfile = await db()
      .insert(candidateProfiles)
      .values(newCandidateProfile)
      .returning()
      .then(res => res[0]);
      
    return createdProfile;
  }
}

// Education record mutations
export async function addEducationRecord(educationData: Omit<Education, 'id' | 'createdAt' | 'updatedAt' | 'deleted'>): Promise<Education> {
  const newEducation: NewEducation = {
    ...educationData,
    deleted: false
  };

  const createdEducation = await db()
    .insert(education)
    .values(newEducation)
    .returning()
    .then(res => res[0]);

  return createdEducation;
}

export async function updateEducationRecord(id: string, educationData: Partial<Education>): Promise<Education> {
  const updatedEducation = await db()
    .update(education)
    .set({
      ...educationData,
      updatedAt: new Date()
    })
    .where(eq(education.id, id))
    .returning()
    .then(res => res[0]);

  return updatedEducation;
}

export async function deleteEducationRecord(id: string): Promise<{ success: boolean }> {
  await db()
    .update(education)
    .set({
      deleted: true,
      updatedAt: new Date()
    })
    .where(eq(education.id, id));

  return { success: true };
}

// Experience record mutations - similar to education
export async function addExperienceRecord(experienceData: Omit<Experience, 'id' | 'createdAt' | 'updatedAt' | 'deleted'>): Promise<Experience> {
  const newExperience: NewExperience = {
    ...experienceData,
    deleted: false
  };

  const createdExperience = await db()
    .insert(experience)
    .values(newExperience)
    .returning()
    .then(res => res[0]);

  return createdExperience;
}

export async function updateExperienceRecord(id: string, experienceData: Partial<Experience>): Promise<Experience> {
  const updatedExperience = await db()
    .update(experience)
    .set({
      ...experienceData,
      updatedAt: new Date()
    })
    .where(eq(experience.id, id))
    .returning()
    .then(res => res[0]);

  return updatedExperience;
}

export async function deleteExperienceRecord(id: string): Promise<{ success: boolean }> {
  await db()
    .update(experience)
    .set({
      deleted: true,
      updatedAt: new Date()
    })
    .where(eq(experience.id, id));

  return { success: true };
}

// Skills management
export async function getAvailableSkills(): Promise<Skill[]> {
  const allSkills = await db()
    .select()
    .from(skills)
    .where(eq(skills.deleted, false));

  return allSkills;
}

export async function updateCandidateSkills(candidateProfileId: string, skillIds: string[]): Promise<{ success: boolean }> {
  // First, mark all existing skills as deleted
  await db()
    .update(candidateSkills)
    .set({
      deleted: true,
    })
    .where(eq(candidateSkills.candidateProfileId, candidateProfileId));

  // Now add all the selected skills
  // For existing (deleted) skills, we'll un-delete them
  // For new skills, we'll insert them
  for (const skillId of skillIds) {
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
      .then(res => res[0]);

    if (existingSkill) {
      // Un-delete existing skill
      await db()
        .update(candidateSkills)
        .set({
          deleted: false,
        })
        .where(eq(candidateSkills.id, existingSkill.id));
    } else {
      // Add new skill
      const newCandidateSkill: NewCandidateSkill = {
        candidateProfileId,
        skillId,
        deleted: false
      };

      await db()
        .insert(candidateSkills)
        .values(newCandidateSkill);
    }
  }

  return { success: true };
} 