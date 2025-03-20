'use server'

import { getUser } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/db';
import { candidateProfiles } from '@/lib/db/schema';
import { z } from 'zod';
import { getCandidateProfileByUserId, updateCandidateProfile, createCandidateProfile } from '@/lib/db/queries/candidates/profile';
import { createClient } from '@/lib/supabase/server';

// Create validation schema for profile updates
const profileUpdateSchema = z.object({
  title: z.string().min(3).max(100),
  experienceLevel: z.enum(['Entry', 'Junior', 'Mid-Level', 'Senior', 'Director', 'Executive']),
  skills: z.array(z.string()).min(1),
  bio: z.string().max(500).optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
});

/**
 * Get the candidate profile for the authenticated user
 */
export async function getCandidateProfile() {
  const user = await getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }
  
  return getCandidateProfileByUserId(user.id);
}

/**
 * Update the candidate profile with form data
 */
export async function updateProfile(formData: FormData) {
  const user = await getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }
  
  const profile = await getCandidateProfileByUserId(user.id);
  if (!profile) {
    throw new Error('Profile not found');
  }
  
  // Parse skills - expect a comma-separated list from form
  const skillsString = formData.get('skills') as string;
  const skills = skillsString.split(',').map(s => s.trim()).filter(Boolean);
  
  // Validate and process the form data
  const validatedData = profileUpdateSchema.parse({
    title: formData.get('title'),
    experienceLevel: formData.get('experienceLevel'),
    skills,
    bio: formData.get('bio'),
    linkedinUrl: formData.get('linkedinUrl'),
    githubUrl: formData.get('githubUrl'),
  });
  
  // Update the profile
  await updateCandidateProfile(profile.profile.id, validatedData);
  
  // Handle resume upload if provided
  const resumeFile = formData.get('resume') as File;
  if (resumeFile && resumeFile.size > 0) {
    try {
      // Get file name and create a unique file path
      const fileExt = resumeFile.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `resumes/${fileName}`;
      
      // Create Supabase client
      const supabase = await createClient();
      
      // Convert the file to an ArrayBuffer for upload
      const fileArrayBuffer = await resumeFile.arrayBuffer();
      
      // Upload file to Supabase bucket 'candidate-resumes'
      const { data, error } = await supabase.storage
        .from('candidate-resumes')
        .upload(filePath, fileArrayBuffer, {
          contentType: resumeFile.type,
          upsert: true,
        });
      
      if (error) {
        console.error('Error uploading resume:', error);
        throw new Error(`Failed to upload resume: ${error.message}`);
      }
      
      // Get the public URL for the file
      const { data: urlData } = supabase.storage
        .from('candidate-resumes')
        .getPublicUrl(filePath);
      
      // Update candidate profile with resume URL
      await updateCandidateProfile(profile.profile.id, {
        resumeUrl: urlData.publicUrl,
      });
    } catch (error) {
      console.error('Error processing resume upload:', error);
      throw new Error('Failed to process resume upload');
    }
  }
  
  revalidatePath('/candidate/profile');
  return { success: true };
}