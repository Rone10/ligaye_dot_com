'use server'

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { profiles, experienceLevelEnum, companySizeEnum } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { 
  updateProfile,
  updateCandidateProfile,
  updateEmployerProfile,
  addEducationRecord,
  updateEducationRecord,
  deleteEducationRecord,
  addExperienceRecord,
  updateExperienceRecord,
  deleteExperienceRecord,
  updateCandidateSkills
} from "./_queries";
import { z } from "zod";

// Validate admin access
async function validateAdminAccess() {
  const user = await getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  
  const adminProfile = await db()
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1)
    .then(res => res[0]);
  
  if (!adminProfile || adminProfile.role !== "admin") {
    throw new Error("Access denied");
  }
  
  return true;
}

// Update basic profile information
export async function updateUserProfileAdmin(formData: FormData) {
  await validateAdminAccess();
  
  // Get profile ID from form data
  const profileId = formData.get("profileId") as string;
  if (!profileId) {
    throw new Error("Profile ID is required");
  }
  
  // Extract and validate data
  const fullName = formData.get("fullName") as string;
  const avatarUrl = formData.get("avatarUrl") as string;
  
  const validatedData = {
    fullName,
    avatarUrl: avatarUrl || null
  };
  
  // Update profile in database
  const result = await updateProfile(profileId, validatedData);
  
  // Revalidate the page
  revalidatePath(`/admin/users/${profileId}`);
  
  return { success: true, data: result };
}

// Update candidate profile
export async function updateCandidateProfileAdmin(formData: FormData) {
  await validateAdminAccess();
  
  // Get profile ID from form data
  const profileId = formData.get("profileId") as string;
  if (!profileId) {
    throw new Error("Profile ID is required");
  }
  
  // Extract and validate data
  const title = formData.get("title") as string;
  const experienceLevelInput = formData.get("experienceLevel") as string;
  const bio = formData.get("bio") as string;
  const linkedinUrl = formData.get("linkedinUrl") as string;
  const githubUrl = formData.get("githubUrl") as string;
  const portfolioUrl = formData.get("portfolioUrl") as string;
  
  // Check if experienceLevel is valid enum value or null
  const experienceLevel = experienceLevelInput ? 
    (experienceLevelEnum.enumValues.includes(experienceLevelInput as any) ? 
      experienceLevelInput as typeof experienceLevelEnum.enumValues[number] : 
      null) : 
    null;
  
  // Validate and prepare data
  const validatedData = {
    title: title || null,
    experienceLevel,
    bio: bio || null,
    linkedinUrl: linkedinUrl || null,
    githubUrl: githubUrl || null,
    portfolioUrl: portfolioUrl || null
  };
  
  // Update profile in database
  const result = await updateCandidateProfile(profileId, validatedData);
  
  // Revalidate the page
  revalidatePath(`/admin/users/${profileId}`);
  
  return { success: true, data: result };
}

// Update employer profile
export async function updateEmployerProfileAdmin(formData: FormData) {
  await validateAdminAccess();
  
  // Get profile ID from form data
  const profileId = formData.get("profileId") as string;
  if (!profileId) {
    throw new Error("Profile ID is required");
  }
  
  // Extract and validate data
  const companyName = formData.get("companyName") as string;
  const companySizeInput = formData.get("companySize") as string;
  const industryId = formData.get("industryId") as string;
  const companyDescription = formData.get("companyDescription") as string;
  const website = formData.get("website") as string;
  const locationId = formData.get("locationId") as string;
  const hqAddressDisplay = formData.get("hqAddressDisplay") as string;
  
  // Check if companySize is valid enum value or null
  const companySize = companySizeInput ? 
    (companySizeEnum.enumValues.includes(companySizeInput as any) ? 
      companySizeInput as typeof companySizeEnum.enumValues[number] : 
      null) : 
    null;
  
  // Validate and prepare data
  const validatedData = {
    companyName,
    companySize,
    industryId: industryId || null,
    companyDescription: companyDescription || null,
    website: website || null,
    locationId: locationId || null,
    hqAddressDisplay: hqAddressDisplay || null
  };
  
  // Update profile in database
  const result = await updateEmployerProfile(profileId, validatedData);
  
  // Revalidate the page
  revalidatePath(`/admin/users/${profileId}`);
  
  return { success: true, data: result };
}

// Education record actions
export async function addEducationRecordAdmin(formData: FormData) {
  await validateAdminAccess();
  
  // Get candidate profile ID from form data
  const candidateProfileId = formData.get("candidateProfileId") as string;
  const profileId = formData.get("profileId") as string;
  
  if (!candidateProfileId) {
    throw new Error("Candidate profile ID is required");
  }
  
  // Extract and validate data
  const institution = formData.get("institution") as string;
  const degree = formData.get("degree") as string;
  const fieldOfStudy = formData.get("fieldOfStudy") as string;
  const startDateStr = formData.get("startDate") as string;
  const endDateStr = formData.get("endDate") as string;
  const description = formData.get("description") as string;
  
  // Validate required fields
  if (!institution || !degree) {
    throw new Error("Institution and degree are required");
  }
  
  // Create education record
  const educationData = {
    institution,
    degree,
    fieldOfStudy: fieldOfStudy || null,
    startDate: startDateStr ? new Date(startDateStr) : null,
    endDate: endDateStr ? new Date(endDateStr) : null,
    description: description || null
  };
  
  // Add education record to database
  const result = await addEducationRecord(candidateProfileId, educationData);
  
  // Revalidate the page
  revalidatePath(`/admin/users/${profileId}`);
  
  return { success: true, data: result };
}

export async function updateEducationRecordAdmin(formData: FormData) {
  await validateAdminAccess();
  
  // Get education record ID from form data
  const educationId = formData.get("educationId") as string;
  const profileId = formData.get("profileId") as string;
  
  if (!educationId) {
    throw new Error("Education record ID is required");
  }
  
  // Extract and validate data
  const institution = formData.get("institution") as string;
  const degree = formData.get("degree") as string;
  const fieldOfStudy = formData.get("fieldOfStudy") as string;
  const startDateStr = formData.get("startDate") as string;
  const endDateStr = formData.get("endDate") as string;
  const description = formData.get("description") as string;
  
  // Validate required fields
  if (!institution || !degree) {
    throw new Error("Institution and degree are required");
  }
  
  // Update education record
  const educationData = {
    institution,
    degree,
    fieldOfStudy: fieldOfStudy || null,
    startDate: startDateStr ? new Date(startDateStr) : null,
    endDate: endDateStr ? new Date(endDateStr) : null,
    description: description || null
  };
  
  // Update education record in database
  const result = await updateEducationRecord(educationId, educationData);
  
  // Revalidate the page
  revalidatePath(`/admin/users/${profileId}`);
  
  return { success: true, data: result };
}

export async function deleteEducationRecordAdmin(formData: FormData) {
  await validateAdminAccess();
  
  // Get education record ID from form data
  const educationId = formData.get("educationId") as string;
  const profileId = formData.get("profileId") as string;
  
  if (!educationId) {
    throw new Error("Education record ID is required");
  }
  
  // Delete education record in database
  const result = await deleteEducationRecord(educationId);
  
  // Revalidate the page
  revalidatePath(`/admin/users/${profileId}`);
  
  return result;
}

// Experience record actions
export async function addExperienceRecordAdmin(formData: FormData) {
  await validateAdminAccess();
  
  // Get candidate profile ID from form data
  const candidateProfileId = formData.get("candidateProfileId") as string;
  const profileId = formData.get("profileId") as string;
  
  if (!candidateProfileId) {
    throw new Error("Candidate profile ID is required");
  }
  
  // Extract and validate data
  const jobTitle = formData.get("jobTitle") as string;
  const companyName = formData.get("companyName") as string;
  const location = formData.get("location") as string;
  const startDateStr = formData.get("startDate") as string;
  const endDateStr = formData.get("endDate") as string;
  const isCurrent = formData.get("isCurrent") === "true";
  const description = formData.get("description") as string;
  
  // Validate required fields
  if (!jobTitle || !companyName) {
    throw new Error("Job title and company name are required");
  }
  
  // Create experience record
  const experienceData = {
    jobTitle,
    companyName,
    location: location || null,
    startDate: startDateStr ? new Date(startDateStr) : null,
    endDate: endDateStr ? new Date(endDateStr) : null,
    isCurrent,
    description: description || null
  };
  
  // Add experience record to database
  const result = await addExperienceRecord(candidateProfileId, experienceData);
  
  // Revalidate the page
  revalidatePath(`/admin/users/${profileId}`);
  
  return { success: true, data: result };
}

export async function updateExperienceRecordAdmin(formData: FormData) {
  await validateAdminAccess();
  
  // Get experience record ID from form data
  const experienceId = formData.get("experienceId") as string;
  const profileId = formData.get("profileId") as string;
  
  if (!experienceId) {
    throw new Error("Experience record ID is required");
  }
  
  // Extract and validate data
  const jobTitle = formData.get("jobTitle") as string;
  const companyName = formData.get("companyName") as string;
  const location = formData.get("location") as string;
  const startDateStr = formData.get("startDate") as string;
  const endDateStr = formData.get("endDate") as string;
  const isCurrent = formData.get("isCurrent") === "true";
  const description = formData.get("description") as string;
  
  // Validate required fields
  if (!jobTitle || !companyName) {
    throw new Error("Job title and company name are required");
  }
  
  // Update experience record
  const experienceData = {
    jobTitle,
    companyName,
    location: location || null,
    startDate: startDateStr ? new Date(startDateStr) : null,
    endDate: endDateStr ? new Date(endDateStr) : null,
    isCurrent,
    description: description || null
  };
  
  // Update experience record in database
  const result = await updateExperienceRecord(experienceId, experienceData);
  
  // Revalidate the page
  revalidatePath(`/admin/users/${profileId}`);
  
  return { success: true, data: result };
}

export async function deleteExperienceRecordAdmin(formData: FormData) {
  await validateAdminAccess();
  
  // Get experience record ID from form data
  const experienceId = formData.get("experienceId") as string;
  const profileId = formData.get("profileId") as string;
  
  if (!experienceId) {
    throw new Error("Experience record ID is required");
  }
  
  // Delete experience record in database
  const result = await deleteExperienceRecord(experienceId);
  
  // Revalidate the page
  revalidatePath(`/admin/users/${profileId}`);
  
  return result;
}

// Update candidate skills
export async function updateCandidateSkillsAdmin(formData: FormData) {
  await validateAdminAccess();
  
  // Get candidate profile ID from form data
  const candidateProfileId = formData.get("candidateProfileId") as string;
  const profileId = formData.get("profileId") as string;
  
  if (!candidateProfileId) {
    throw new Error("Candidate profile ID is required");
  }
  
  // Get selected skill IDs
  const selectedSkills = formData.getAll("skillIds").map(id => id.toString());
  
  // Update skills in database
  const result = await updateCandidateSkills(candidateProfileId, selectedSkills);
  
  // Revalidate the page
  revalidatePath(`/admin/users/${profileId}`);
  
  return result;
} 