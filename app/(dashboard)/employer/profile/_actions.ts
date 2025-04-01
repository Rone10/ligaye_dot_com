'use server'

import { revalidatePath } from 'next/cache';
import { getUser } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { profiles, employerProfiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { upsertEmployerProfile } from './_queries';
import { validateEmployerProfileData, validateLogoUpload } from './_utils/validation';
import { ZodError } from 'zod';

// Define the state shape for form submission
type FormState = {
  success: boolean;
  message?: string;
}

// Update employer profile - accepts prevState for useFormState compatibility
export async function updateEmployerProfileDetails(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, message: 'Unauthorized' };
    }
    
    // Check if user has a profile
    const profile = await db()
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1)
      .then(res => res[0]);
      
    if (!profile) {
      return { success: false, message: 'Profile not found' };
    }

    // Extract and validate form data
    const data = Object.fromEntries(formData.entries()) as Record<string, any>;
    
    // Debug log
    console.log('Form data received:', data);
    console.log('Company size value:', data.companySize);
    
    // Handle empty string values
    if (data.companySize === '') {
      data.companySize = undefined;
    } else if (data.companySize) {
      // Ensure company size is one of the valid enum values
      const validCompanySizes = ['1-10', '11-50', '51-200', '201-500', '500+'];
      if (!validCompanySizes.includes(data.companySize)) {
        return { 
          success: false, 
          message: `Invalid company size: ${data.companySize}. Valid values are: ${validCompanySizes.join(', ')}`
        };
      }
    }
    
    const validatedData = validateEmployerProfileData(data);
    console.log('Validated data:', validatedData);
    
    // Update profile in database
    const result = await upsertEmployerProfile(profile.id, validatedData);
    console.log('Database update result:', result);
    
    revalidatePath('/employer/profile');
    return { success: true, message: 'Profile updated successfully' };
  } catch (error) {
    console.error('Error updating profile:', error);
    
    if (error instanceof ZodError) {
      return { 
        success: false, 
        message: 'Validation error: ' + error.errors.map(e => e.message).join(', ')
      };
    }
    
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

// Logo upload action
export async function handleLogoUpload(formData: FormData) {
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

  // Check if employer profile exists
  const employerProfile = await db()
    .select()
    .from(employerProfiles)
    .where(eq(employerProfiles.profileId, profile.id))
    .limit(1)
    .then(res => res[0]);
    
  if (!employerProfile) {
    throw new Error('Employer profile not found. Please create a profile first.');
  }
  
  const logoFile = formData.get('logo') as File;
  if (!logoFile) {
    throw new Error('No file provided');
  }
  
  // Validate the file
  validateLogoUpload(logoFile);
  
  // Upload to Supabase Storage
  const supabase = await createClient();
  // Organize files by user ID for RLS policies to work correctly
  const filePath = `${user.id}/${Date.now()}-${logoFile.name.replace(/\s+/g, '_')}`;
  const { data, error } = await supabase.storage
    .from('company-logos')
    .upload(filePath, logoFile, {
      cacheControl: '3600',
      upsert: true
    });
    
  if (error) {
    console.error('File upload failed:', error);
    throw new Error('File upload failed');
  }
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('company-logos')
    .getPublicUrl(filePath);
  
  // Update profile with logo URL
  await upsertEmployerProfile(profile.id, {
    companyLogoUrl: publicUrl
  });
  
  revalidatePath('/employer/profile');
  return { success: true, url: publicUrl };
} 