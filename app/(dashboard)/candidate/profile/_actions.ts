'use server'

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getUser, createClient } from '@/lib/supabase/server';
import { profiles, candidateProfiles } from '@/lib/db/schema';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { 
  upsertCandidateProfile, 
  addEducationRecord, 
  updateEducationRecord, 
  deleteEducationRecord,
  addExperienceRecord,
  updateExperienceRecord,
  deleteExperienceRecord,
  updateCandidateSkills,
  getAvailableSkills
} from './_queries';
import { 
  validateProfileData, 
  validateEducationData, 
  validateExperienceData,
  validateSkillsData 
} from './_utils/validation';
import { 
  transformFormToEducation,
  transformFormToExperience 
} from './_utils/profile-transformers';

// Basic profile update action
export async function updateBasicProfileInfo(formData: FormData) {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  // Check if user is a candidate
  const profile = await db()
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1)
    .then(res => res[0]);

  if (!profile) {
    throw new Error('Candidate profile not found');
  }


  
  // Extract and validate data
  const data = Object.fromEntries(formData.entries());
  const validatedData = validateProfileData(data);
  
  // Update profile in database
  await upsertCandidateProfile({
    userId: user.id,
    ...validatedData
  });
  
  revalidatePath('/candidate/profile');
  return { success: true };
}

// Resume upload action
export async function handleResumeUpload(formData: FormData) {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  // Check if user has a profile
  const profile = await db()
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1)
    .then(res => res[0]);
  if (!profile) {
    throw new Error('Profile not found');
  }
  // compare profile id with candidate profile id
  const candidateProfileId = await db()
    .select()
    .from(candidateProfiles)
    .where(eq(candidateProfiles.profileId, profile.id))
    .limit(1)
    .then(res => res[0]);
  if (!candidateProfileId) {
    throw new Error('Candidate profile not found');
  }
  const resumeFile = formData.get('resume') as File;
  if (!resumeFile) {
    // Throw error if file is missing to satisfy TypeScript's control flow
    throw new Error('No file provided');
  }
  
  // Upload to Supabase Storage
  const supabase = await createClient();
  const fileName = `${user.id}-${Date.now()}-${resumeFile.name}`;
  const { data, error } = await supabase.storage
    .from('resumes')
    .upload(fileName, resumeFile);
    
  if (error){
    console.log('File upload failed in handleResumeUpload:', error);
    throw new Error('File upload failed');
  }
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from('resumes')
    .getPublicUrl(fileName);
  
  // Update profile with resume URL
  await upsertCandidateProfile({
    userId: user.id,
    resumeUrl: urlData.publicUrl,
    resumeFilename: resumeFile.name
  });
  
  revalidatePath('/candidate/profile');
  return { success: true, url: urlData.publicUrl };
}

// Education record actions
export async function addEducation(formData: FormData) {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  // Check if user is a candidate
  const profile = await db()
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1)
    .then(res => res[0]);
  
  if (!profile) {
    throw new Error('Candidate profile not found');
  }
  // Extract data
  const rawData = Object.fromEntries(formData.entries());
  
  // Parse date strings before validation
  const dataToValidate = {
    ...rawData,
    startDate: rawData.startDate ? new Date(rawData.startDate as string) : undefined,
    // Handle endDate: it could be a date string or empty/null if 'Currently studying'
    endDate: rawData.endDate ? new Date(rawData.endDate as string) : null,
  };

  // Validate data
  const validatedData = validateEducationData(dataToValidate);
  
  // Get candidate profile ID
  const candidateProfileId = formData.get('candidateProfileId') as string;
  if (!candidateProfileId) {
    throw new Error('Candidate profile not found');
  }
  
  // Transform data and add record
  const educationData = transformFormToEducation(validatedData, candidateProfileId);
  await addEducationRecord(educationData);
  
  revalidatePath('/candidate/profile');
  return { success: true };
}

export async function updateEducation(formData: FormData) {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  // Check if user is a candidate
  const profile = await db()
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1)
    .then(res => res[0]);
  if (!profile) {
    throw new Error('Candidate profile not found');
  }
  // Extract data
  const rawData = Object.fromEntries(formData.entries());
  
  // Parse date strings before validation
  const dataToValidate = {
    ...rawData,
    startDate: rawData.startDate ? new Date(rawData.startDate as string) : undefined,
    // Handle endDate: it could be a date string or empty/null if 'Currently studying'
    endDate: rawData.endDate ? new Date(rawData.endDate as string) : null,
  };

  // Validate data
  const validatedData = validateEducationData(dataToValidate);
  
  const educationId = formData.get('id') as string;
  if (!educationId) {
    throw new Error('Education ID is required');
  }
  
  // Get candidate profile ID
  const candidateProfileId = formData.get('candidateProfileId') as string;
  if (!candidateProfileId) {
    throw new Error('Candidate profile not found');
  }
  
  // Transform data and update record
  const educationData = transformFormToEducation(validatedData, candidateProfileId);
  await updateEducationRecord(educationId, educationData);
  
  revalidatePath('/candidate/profile');
  return { success: true };
}

export async function deleteEducation(formData: FormData) {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');  
  }
  // Check if user is a candidate
  const profile = await db()
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1)
    .then(res => res[0]);
  if (!profile) {
    throw new Error('Candidate profile not found');
  }
  const educationId = formData.get('id') as string;
  if (!educationId) {
    throw new Error('Education ID is required');
  }
  
  await deleteEducationRecord(educationId);
  
  revalidatePath('/candidate/profile');
  return { success: true };
}

// Experience record actions
export async function addExperience(formData: FormData) {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  // Check if user is a candidate
  const profile = await db()
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1)
    .then(res => res[0]);
  if (!profile) {
    throw new Error('Candidate profile not found');
  }
  // Extract raw data
  const rawData = Object.fromEntries(formData.entries());
  
  // Handle boolean and parse date strings before validation
  const isCurrentValue = formData.get('isCurrent');
  const isCurrent = isCurrentValue === 'true'; // FormData values are strings
  
  const dataToValidate = {
    ...rawData,
    isCurrent,
    startDate: rawData.startDate ? new Date(rawData.startDate as string) : undefined,
    // Set endDate to null if isCurrent is true, otherwise parse the date string
    endDate: isCurrent || !rawData.endDate ? null : new Date(rawData.endDate as string),
  };
  
  // Validate data
  const validatedData = validateExperienceData(dataToValidate);
  
  // Get candidate profile ID
  const candidateProfileId = formData.get('candidateProfileId') as string;
  if (!candidateProfileId) {
    throw new Error('Candidate profile not found');
  }
  
  // Transform data and add record
  const experienceData = transformFormToExperience(validatedData, candidateProfileId);
  await addExperienceRecord(experienceData);
  
  revalidatePath('/candidate/profile');
  return { success: true };
}

export async function updateExperience(formData: FormData) {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  // Check if user is a candidate
  const profile = await db()
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1)
    .then(res => res[0]);
  if (!profile) {
    throw new Error('Candidate profile not found');
  }
  // Extract raw data
  const rawData = Object.fromEntries(formData.entries());
  
  // Handle boolean and parse date strings before validation
  const isCurrentValue = formData.get('isCurrent');
  const isCurrent = isCurrentValue === 'true'; // FormData values are strings

  const dataToValidate = {
    ...rawData,
    isCurrent,
    startDate: rawData.startDate ? new Date(rawData.startDate as string) : undefined,
    // Set endDate to null if isCurrent is true, otherwise parse the date string
    endDate: isCurrent || !rawData.endDate ? null : new Date(rawData.endDate as string),
  };
  
  // Validate data
  const validatedData = validateExperienceData(dataToValidate);
  
  const experienceId = formData.get('id') as string;
  if (!experienceId) {
    throw new Error('Experience ID is required');
  }
  
  // Get candidate profile ID
  const candidateProfileId = formData.get('candidateProfileId') as string;
  if (!candidateProfileId) {
    throw new Error('Candidate profile not found');
  }
  
  // Transform data and update record
  const experienceData = transformFormToExperience(validatedData, candidateProfileId);
  await updateExperienceRecord(experienceId, experienceData);
  
  revalidatePath('/candidate/profile');
  return { success: true };
}

export async function deleteExperience(formData: FormData) {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  // Check if user is a candidate
  const profile = await db()
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1)
    .then(res => res[0]);
  if (!profile) {
    throw new Error('Candidate profile not found');
  }
  const experienceId = formData.get('id') as string;
  if (!experienceId) {
    throw new Error('Experience ID is required');
  }
  
  await deleteExperienceRecord(experienceId);
  
  revalidatePath('/candidate/profile');
  return { success: true };
}

// Fetch available skills
export async function fetchAvailableSkills() {
  // No auth check needed here as skills are likely public data
  // If skills should be restricted, add auth checks as needed.
  try {
    const skills = await getAvailableSkills();
    return { success: true, skills };
  } catch (error) {
    console.error("Failed to fetch available skills:", error);
    return { success: false, error: "Failed to load skills" };
  }
}

// Skills management
export async function updateSkills(formData: FormData) {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  // Check if user is a candidate
  const profile = await db()
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1)
    .then(res => res[0]);
  if (!profile) {
    throw new Error('Candidate profile not found');
  }
  // Get candidate profile ID
  const candidateProfileId = formData.get('candidateProfileId') as string;
  if (!candidateProfileId) {
    throw new Error('Candidate profile not found');
  }
  
  // Skills can be submitted as an array or as individual form values when using checkboxes
  let skills: string[] = [];
  
  // Try to get skills as FormData has them
  const formSkills = formData.getAll('skills');
  if (formSkills.length) {
    // If skills is an array in the form data
    skills = formSkills.map(s => s.toString());
  } else {
    // Otherwise, extract all keys that start with 'skill-' (checkbox IDs)
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('skill-') && value === 'on') {
        const skillId = key.replace('skill-', '');
        skills.push(skillId);
      }
    }
  }
  
  // Validate skills data
  validateSkillsData({ skills });
  
  // Update skills in database
  await updateCandidateSkills(candidateProfileId, skills);
  
  revalidatePath('/candidate/profile');
  return { success: true };
} 