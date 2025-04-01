import { db } from "@/lib/db";
import { 
  profiles, 
  candidateProfiles, 
  employerProfiles, 
  education, 
  experience, 
  candidateSkills, 
  skills, 
  industries, 
  locations 
} from "@/lib/db/schema";
import { eq, and, not, inArray } from "drizzle-orm";
import type { 
  Profile, 
  CandidateProfile, 
  EmployerProfile, 
  Education, 
  Experience, 
  Skill, 
  Industry, 
  Location 
} from "@/lib/db/schema";

interface AdminUserProfileData {
  profile: Profile;
  roleSpecificData: {
    candidateProfile?: CandidateProfile;
    employerProfile?: EmployerProfile;
    education?: Education[];
    experience?: Experience[];
    skills?: Array<Skill & { candidateSkillId: string }>;
    industry?: Industry;
    location?: Location;
  };
}

export async function getAdminUserProfileView(id: string): Promise<AdminUserProfileData | null> {
  // Fetch the basic profile first
  const profileData = await db()
    .select()
    .from(profiles)
    .where(eq(profiles.id, id))
    .limit(1);
  
  if (!profileData.length) return null;
  
  const profile = profileData[0];
  const roleSpecificData: AdminUserProfileData["roleSpecificData"] = {};
  
  // Depending on role, fetch the appropriate related data
  if (profile.role === "candidate") {
    // Fetch candidate profile
    const candidateProfileData = await db()
      .select()
      .from(candidateProfiles)
      .where(eq(candidateProfiles.profileId, profile.id))
      .limit(1);
    
    if (candidateProfileData.length) {
      roleSpecificData.candidateProfile = candidateProfileData[0];
      
      // Fetch education records
      const educationData = await db()
        .select()
        .from(education)
        .where(
          and(
            eq(education.candidateProfileId, candidateProfileData[0].id),
            not(eq(education.deleted, true))
          )
        )
        .orderBy(education.startDate);
      
      roleSpecificData.education = educationData;
      
      // Fetch experience records
      const experienceData = await db()
        .select()
        .from(experience)
        .where(
          and(
            eq(experience.candidateProfileId, candidateProfileData[0].id),
            not(eq(experience.deleted, true))
          )
        )
        .orderBy(experience.startDate);
      
      roleSpecificData.experience = experienceData;
      
      // Fetch skills
      const candidateSkillsData = await db()
        .select({
          id: skills.id,
          name: skills.name,
          deleted: skills.deleted,
          createdAt: skills.createdAt,
          updatedAt: skills.updatedAt,
          candidateSkillId: candidateSkills.id,
        })
        .from(candidateSkills)
        .innerJoin(skills, eq(skills.id, candidateSkills.skillId))
        .where(
          and(
            eq(candidateSkills.candidateProfileId, candidateProfileData[0].id),
            not(eq(candidateSkills.deleted, true)),
            not(eq(skills.deleted, true))
          )
        );
      
      roleSpecificData.skills = candidateSkillsData;
    }
  } 
  else if (profile.role === "employer") {
    // Fetch employer profile
    const employerProfileData = await db()
      .select()
      .from(employerProfiles)
      .where(eq(employerProfiles.profileId, profile.id))
      .limit(1);
    
    if (employerProfileData.length) {
      roleSpecificData.employerProfile = employerProfileData[0];
      
      // Fetch industry if applicable
      if (employerProfileData[0].industryId) {
        const industryData = await db()
          .select()
          .from(industries)
          .where(eq(industries.id, employerProfileData[0].industryId))
          .limit(1);
        
        if (industryData.length) {
          roleSpecificData.industry = industryData[0];
        }
      }
      
      // Fetch location if applicable
      if (employerProfileData[0].locationId) {
        const locationData = await db()
          .select()
          .from(locations)
          .where(eq(locations.id, employerProfileData[0].locationId))
          .limit(1);
        
        if (locationData.length) {
          roleSpecificData.location = locationData[0];
        }
      }
    }
  }
  
  return { profile, roleSpecificData };
}

// Get all available skills for selection
export async function getAvailableSkills(): Promise<Skill[]> {
  return db()
    .select()
    .from(skills)
    .where(not(eq(skills.deleted, true)))
    .orderBy(skills.name);
}

// Get all available industries for selection
export async function getAllIndustries(): Promise<Industry[]> {
  return db()
    .select()
    .from(industries)
    .where(not(eq(industries.deleted, true)))
    .orderBy(industries.name);
}

// Get all available locations for selection
export async function getAllLocations(): Promise<Location[]> {
  return db()
    .select()
    .from(locations)
    .where(not(eq(locations.deleted, true)))
    .orderBy(locations.region);
}

// Update base profile
export async function updateProfile(id: string, data: Partial<Profile>): Promise<Profile> {
  await db()
    .update(profiles)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(profiles.id, id));
  
  const updated = await db()
    .select()
    .from(profiles)
    .where(eq(profiles.id, id))
    .limit(1);
  
  return updated[0];
}

// Update candidate profile
export async function updateCandidateProfile(profileId: string, data: Partial<CandidateProfile>): Promise<CandidateProfile> {
  // First get the candidate profile ID
  const candidateProfileData = await db()
    .select()
    .from(candidateProfiles)
    .where(eq(candidateProfiles.profileId, profileId))
    .limit(1);
  
  if (!candidateProfileData.length) {
    throw new Error("Candidate profile not found");
  }
  
  await db()
    .update(candidateProfiles)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(candidateProfiles.id, candidateProfileData[0].id));
  
  const updated = await db()
    .select()
    .from(candidateProfiles)
    .where(eq(candidateProfiles.id, candidateProfileData[0].id))
    .limit(1);
  
  return updated[0];
}

// Update employer profile
export async function updateEmployerProfile(profileId: string, data: Partial<EmployerProfile>): Promise<EmployerProfile> {
  // First get the employer profile ID
  const employerProfileData = await db()
    .select()
    .from(employerProfiles)
    .where(eq(employerProfiles.profileId, profileId))
    .limit(1);
  
  if (!employerProfileData.length) {
    throw new Error("Employer profile not found");
  }
  
  await db()
    .update(employerProfiles)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(employerProfiles.id, employerProfileData[0].id));
  
  const updated = await db()
    .select()
    .from(employerProfiles)
    .where(eq(employerProfiles.id, employerProfileData[0].id))
    .limit(1);
  
  return updated[0];
}

// Add education record
export async function addEducationRecord(candidateProfileId: string, data: Omit<Education, "id" | "candidateProfileId" | "createdAt" | "updatedAt" | "deleted">): Promise<Education> {
  const [newRecord] = await db()
    .insert(education)
    .values({
      candidateProfileId,
      ...data,
      deleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .returning();
  
  return newRecord;
}

// Update education record
export async function updateEducationRecord(id: string, data: Partial<Education>): Promise<Education> {
  await db()
    .update(education)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(education.id, id));
  
  const updated = await db()
    .select()
    .from(education)
    .where(eq(education.id, id))
    .limit(1);
  
  return updated[0];
}

// Delete education record (soft delete)
export async function deleteEducationRecord(id: string): Promise<{ success: boolean }> {
  try {
    await db()
      .update(education)
      .set({ deleted: true, updatedAt: new Date() })
      .where(eq(education.id, id));
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting education record:", error);
    return { success: false };
  }
}

// Similar functions for experience records
export async function addExperienceRecord(candidateProfileId: string, data: Omit<Experience, "id" | "candidateProfileId" | "createdAt" | "updatedAt" | "deleted">): Promise<Experience> {
  const [newRecord] = await db()
    .insert(experience)
    .values({
      candidateProfileId,
      ...data,
      deleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .returning();
  
  return newRecord;
}

export async function updateExperienceRecord(id: string, data: Partial<Experience>): Promise<Experience> {
  await db()
    .update(experience)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(experience.id, id));
  
  const updated = await db()
    .select()
    .from(experience)
    .where(eq(experience.id, id))
    .limit(1);
  
  return updated[0];
}

export async function deleteExperienceRecord(id: string): Promise<{ success: boolean }> {
  try {
    await db()
      .update(experience)
      .set({ deleted: true, updatedAt: new Date() })
      .where(eq(experience.id, id));
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting experience record:", error);
    return { success: false };
  }
}

// Update candidate skills
export async function updateCandidateSkills(candidateProfileId: string, skillIds: string[]): Promise<{ success: boolean }> {
  try {
    // Get existing skills for this candidate
    const existingSkills = await db()
      .select()
      .from(candidateSkills)
      .where(eq(candidateSkills.candidateProfileId, candidateProfileId));
    
    // Create map of existing skills
    const existingSkillMap = new Map(
      existingSkills.map(record => [record.skillId, record])
    );
    
    // Skills to add (those in skillIds but not in existingSkillMap)
    const skillsToAdd = skillIds.filter(id => !existingSkillMap.has(id));
    
    // Skills to mark as deleted (those in existingSkillMap but not in skillIds and not already deleted)
    const skillsToDelete = existingSkills
      .filter(record => !skillIds.includes(record.skillId) && !record.deleted)
      .map(record => record.id);
    
    // Skills to restore (those in existingSkillMap and in skillIds but currently deleted)
    const skillsToRestore = existingSkills
      .filter(record => skillIds.includes(record.skillId) && record.deleted)
      .map(record => record.id);
    
    // Add new skills
    if (skillsToAdd.length > 0) {
      await db()
        .insert(candidateSkills)
        .values(
          skillsToAdd.map(skillId => ({
            candidateProfileId,
            skillId,
            deleted: false,
            createdAt: new Date(),
          }))
        );
    }
    
    // Mark skills as deleted
    if (skillsToDelete.length > 0) {
      await db()
        .update(candidateSkills)
        .set({ deleted: true })
        .where(
          and(
            eq(candidateSkills.candidateProfileId, candidateProfileId),
            inArray(candidateSkills.id, skillsToDelete)
          )
        );
    }
    
    // Restore deleted skills
    if (skillsToRestore.length > 0) {
      await db()
        .update(candidateSkills)
        .set({ deleted: false })
        .where(
          and(
            eq(candidateSkills.candidateProfileId, candidateProfileId),
            inArray(candidateSkills.id, skillsToRestore)
          )
        );
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error updating candidate skills:", error);
    return { success: false };
  }
} 