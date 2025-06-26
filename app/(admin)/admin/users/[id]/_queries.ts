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
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
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

// Cache tags for hierarchical invalidation
const CACHE_TAGS = {
  userProfile: (id: string) => `user-profile-${id}`,
  userProfileDetail: (id: string) => `user-profile-detail-${id}`,
  candidateProfile: (id: string) => `candidate-profile-${id}`,
  employerProfile: (id: string) => `employer-profile-${id}`,
  education: (candidateId: string) => `education-${candidateId}`,
  experience: (candidateId: string) => `experience-${candidateId}`,
  candidateSkills: (candidateId: string) => `candidate-skills-${candidateId}`,
  skillsCollection: 'skills-collection',
  industriesCollection: 'industries-collection',
  locationsCollection: 'locations-collection',
  adminUserData: 'admin-user-data'
};

// Internal function for admin user profile view without caching
async function getAdminUserProfileViewInternal(id: string): Promise<AdminUserProfileData | null> {
  // Fetch the basic profile first
  const profileData = await db()
    .select()
    .from(profiles)
    .where(eq(profiles.id, id))
    .limit(1);
  
  if (!profileData.length) return null;
  
  const profile = profileData[0];
  const roleSpecificData: AdminUserProfileData["roleSpecificData"] = {};
  
  // Optimized role-specific data fetching with parallel queries
  if (profile.role === "candidate") {
    // Fetch candidate profile
    const candidateProfileData = await db()
      .select()
      .from(candidateProfiles)
      .where(eq(candidateProfiles.profileId, profile.id))
      .limit(1);
    
    if (candidateProfileData.length) {
      roleSpecificData.candidateProfile = candidateProfileData[0];
      const candidateProfileId = candidateProfileData[0].id;
      
      // Wave 1: Parallel data fetching - all candidate-related data simultaneously
      const [educationData, experienceData, candidateSkillsData] = await Promise.all([
        db()
          .select()
          .from(education)
          .where(
            and(
              eq(education.candidateProfileId, candidateProfileId),
              not(eq(education.deleted, true))
            )
          )
          .orderBy(education.startDate),
        
        db()
          .select()
          .from(experience)
          .where(
            and(
              eq(experience.candidateProfileId, candidateProfileId),
              not(eq(experience.deleted, true))
            )
          )
          .orderBy(experience.startDate),
        
        db()
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
              eq(candidateSkills.candidateProfileId, candidateProfileId),
              not(eq(candidateSkills.deleted, true)),
              not(eq(skills.deleted, true))
            )
          )
      ]);
      
      roleSpecificData.education = educationData;
      roleSpecificData.experience = experienceData;
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
      const employer = employerProfileData[0];
      
      // Wave 1: Parallel data fetching - industry and location simultaneously
      const [industryData, locationData] = await Promise.all([
        employer.industryId 
          ? db()
              .select()
              .from(industries)
              .where(eq(industries.id, employer.industryId))
              .limit(1)
          : Promise.resolve([]),
        
        employer.locationId 
          ? db()
              .select()
              .from(locations)
              .where(eq(locations.id, employer.locationId))
              .limit(1)
          : Promise.resolve([])
      ]);
      
      if (industryData.length) {
        roleSpecificData.industry = industryData[0];
      }
      
      if (locationData.length) {
        roleSpecificData.location = locationData[0];
      }
    }
  }
  
  return { profile, roleSpecificData };
}

// Internal functions for reference data without caching
async function getAvailableSkillsInternal(): Promise<Skill[]> {
  return db()
    .select()
    .from(skills)
    .where(not(eq(skills.deleted, true)))
    .orderBy(skills.name);
}

async function getAllIndustriesInternal(): Promise<Industry[]> {
  return db()
    .select()
    .from(industries)
    .where(not(eq(industries.deleted, true)))
    .orderBy(industries.name);
}

async function getAllLocationsInternal(): Promise<Location[]> {
  return db()
    .select()
    .from(locations)
    .where(not(eq(locations.deleted, true)))
    .orderBy(locations.region);
}

// Cached versions with on-demand invalidation
export const getAdminUserProfileView = async (id: string): Promise<AdminUserProfileData | null> => {
  const cachedFunction = unstable_cache(
    async () => getAdminUserProfileViewInternal(id),
    [`admin-user-profile-${id}`],
    {
      tags: [
        CACHE_TAGS.userProfile(id),
        CACHE_TAGS.userProfileDetail(id),
        CACHE_TAGS.candidateProfile(id),
        CACHE_TAGS.employerProfile(id),
        CACHE_TAGS.adminUserData
      ]
      // NO revalidate property = indefinite cache until tag invalidation
    }
  );
  
  return cachedFunction();
};

export const getAvailableSkills = async (): Promise<Skill[]> => {
  const cachedFunction = unstable_cache(
    async () => getAvailableSkillsInternal(),
    ['available-skills'],
    {
      tags: [CACHE_TAGS.skillsCollection]
      // NO revalidate property = indefinite cache until tag invalidation
    }
  );
  
  return cachedFunction();
};

export const getAllIndustries = async (): Promise<Industry[]> => {
  const cachedFunction = unstable_cache(
    async () => getAllIndustriesInternal(),
    ['all-industries'],
    {
      tags: [CACHE_TAGS.industriesCollection]
      // NO revalidate property = indefinite cache until tag invalidation
    }
  );
  
  return cachedFunction();
};

export const getAllLocations = async (): Promise<Location[]> => {
  const cachedFunction = unstable_cache(
    async () => getAllLocationsInternal(),
    ['all-locations'],
    {
      tags: [CACHE_TAGS.locationsCollection]
      // NO revalidate property = indefinite cache until tag invalidation
    }
  );
  
  return cachedFunction();
};

// Request-level cache for repeated calls within same request
export const getAdminUserProfileViewCached = cache(getAdminUserProfileView);
export const getAvailableSkillsCached = cache(getAvailableSkills);
export const getAllIndustriesCached = cache(getAllIndustries);
export const getAllLocationsCached = cache(getAllLocations);

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
  
  // ON-DEMAND cache invalidation
  await invalidateUserProfileCache(id);
  
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
  
  // ON-DEMAND cache invalidation
  await invalidateUserProfileCache(profileId);
  
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
  
  // ON-DEMAND cache invalidation
  await invalidateUserProfileCache(profileId);
  
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
  
  // Find the profile ID for cache invalidation
  const candidateProfile = await db()
    .select({ profileId: candidateProfiles.profileId })
    .from(candidateProfiles)
    .where(eq(candidateProfiles.id, candidateProfileId))
    .limit(1);
  
  if (candidateProfile.length) {
    await invalidateUserProfileCache(candidateProfile[0].profileId);
  }
  
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
  
  // Find the profile ID for cache invalidation
  const candidateProfile = await db()
    .select({ profileId: candidateProfiles.profileId })
    .from(candidateProfiles)
    .where(eq(candidateProfiles.id, updated[0].candidateProfileId))
    .limit(1);
  
  if (candidateProfile.length) {
    await invalidateUserProfileCache(candidateProfile[0].profileId);
  }
  
  return updated[0];
}

// Delete education record (soft delete)
export async function deleteEducationRecord(id: string): Promise<{ success: boolean }> {
  try {
    // Get the record first for cache invalidation
    const record = await db()
      .select()
      .from(education)
      .where(eq(education.id, id))
      .limit(1);
    
    await db()
      .update(education)
      .set({ deleted: true, updatedAt: new Date() })
      .where(eq(education.id, id));
    
    // Find the profile ID for cache invalidation
    if (record.length) {
      const candidateProfile = await db()
        .select({ profileId: candidateProfiles.profileId })
        .from(candidateProfiles)
        .where(eq(candidateProfiles.id, record[0].candidateProfileId))
        .limit(1);
      
      if (candidateProfile.length) {
        await invalidateUserProfileCache(candidateProfile[0].profileId);
      }
    }
    
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
  
  // Find the profile ID for cache invalidation
  const candidateProfile = await db()
    .select({ profileId: candidateProfiles.profileId })
    .from(candidateProfiles)
    .where(eq(candidateProfiles.id, candidateProfileId))
    .limit(1);
  
  if (candidateProfile.length) {
    await invalidateUserProfileCache(candidateProfile[0].profileId);
  }
  
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
  
  // Find the profile ID for cache invalidation
  const candidateProfile = await db()
    .select({ profileId: candidateProfiles.profileId })
    .from(candidateProfiles)
    .where(eq(candidateProfiles.id, updated[0].candidateProfileId))
    .limit(1);
  
  if (candidateProfile.length) {
    await invalidateUserProfileCache(candidateProfile[0].profileId);
  }
  
  return updated[0];
}

export async function deleteExperienceRecord(id: string): Promise<{ success: boolean }> {
  try {
    // Get the record first for cache invalidation
    const record = await db()
      .select()
      .from(experience)
      .where(eq(experience.id, id))
      .limit(1);
    
    await db()
      .update(experience)
      .set({ deleted: true, updatedAt: new Date() })
      .where(eq(experience.id, id));
    
    // Find the profile ID for cache invalidation
    if (record.length) {
      const candidateProfile = await db()
        .select({ profileId: candidateProfiles.profileId })
        .from(candidateProfiles)
        .where(eq(candidateProfiles.id, record[0].candidateProfileId))
        .limit(1);
      
      if (candidateProfile.length) {
        await invalidateUserProfileCache(candidateProfile[0].profileId);
      }
    }
    
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
    
    // Perform all operations in parallel where possible
    const operations = [];
    
    // Add new skills
    if (skillsToAdd.length > 0) {
      operations.push(
        db()
          .insert(candidateSkills)
          .values(
            skillsToAdd.map(skillId => ({
              candidateProfileId,
              skillId,
              deleted: false,
              createdAt: new Date(),
            }))
          )
      );
    }
    
    // Mark skills as deleted
    if (skillsToDelete.length > 0) {
      operations.push(
        db()
          .update(candidateSkills)
          .set({ deleted: true })
          .where(
            and(
              eq(candidateSkills.candidateProfileId, candidateProfileId),
              inArray(candidateSkills.id, skillsToDelete)
            )
          )
      );
    }
    
    // Restore deleted skills
    if (skillsToRestore.length > 0) {
      operations.push(
        db()
          .update(candidateSkills)
          .set({ deleted: false })
          .where(
            and(
              eq(candidateSkills.candidateProfileId, candidateProfileId),
              inArray(candidateSkills.id, skillsToRestore)
            )
          )
      );
    }
    
    // Execute all operations in parallel
    if (operations.length > 0) {
      await Promise.all(operations);
    }
    
    // Find the profile ID for cache invalidation
    const candidateProfile = await db()
      .select({ profileId: candidateProfiles.profileId })
      .from(candidateProfiles)
      .where(eq(candidateProfiles.id, candidateProfileId))
      .limit(1);
    
    if (candidateProfile.length) {
      await invalidateUserProfileCache(candidateProfile[0].profileId);
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error updating candidate skills:", error);
    return { success: false };
  }
}

// Cache invalidation helpers - call these when data changes
export async function invalidateUserProfileCache(profileId: string) {
  const { revalidateTag } = await import('next/cache');
  
  await Promise.all([
    revalidateTag(CACHE_TAGS.userProfile(profileId)),
    revalidateTag(CACHE_TAGS.userProfileDetail(profileId)),
    revalidateTag(CACHE_TAGS.candidateProfile(profileId)),
    revalidateTag(CACHE_TAGS.employerProfile(profileId)),
    revalidateTag(CACHE_TAGS.adminUserData)
  ]);
}

export async function invalidateReferenceDataCache() {
  const { revalidateTag } = await import('next/cache');
  
  await Promise.all([
    revalidateTag(CACHE_TAGS.skillsCollection),
    revalidateTag(CACHE_TAGS.industriesCollection),
    revalidateTag(CACHE_TAGS.locationsCollection)
  ]);
} 