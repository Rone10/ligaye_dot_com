'use server'

import { revalidatePath, revalidateTag } from 'next/cache';
import { getUser } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { profiles, employerProfiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { upsertEmployerProfile } from './_queries';
import { validateEmployerProfileData, validateLogoUpload } from './_utils/validation';
import { ZodError } from 'zod';
import { EMPLOYER_PROFILE_CACHE_TAGS } from './_utils/cache-tags';

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
    const database = await db();
    const profile = await database
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
    
    // Granular cache invalidation based on what was actually updated
    const invalidationTags = EMPLOYER_PROFILE_CACHE_TAGS.getInvalidationTags(profile.id, user.id);
    await Promise.all(invalidationTags.map(tag => revalidateTag(tag)));
    
    // Only invalidate industries/locations if they were changed
    if (validatedData.industryId !== undefined) {
      await revalidateTag(EMPLOYER_PROFILE_CACHE_TAGS.industries);
    }
    if (validatedData.locationId !== undefined) {
      await revalidateTag(EMPLOYER_PROFILE_CACHE_TAGS.locations);
    }
    
    // Revalidate the page
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
  try {
    const user = await getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }
    
    // Check if user has a profile
    const database = await db();
    const profile = await database
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1)
      .then(res => res[0]);
      
    if (!profile) {
      throw new Error('Profile not found');
    }

    // Check if employer profile exists
    const employerProfile = await database
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
    
    // Create Supabase client with proper auth context
    const supabase = await createClient();
    
    // Verify user is authenticated in the Supabase client
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser) {
      console.error('Auth verification failed:', authError);
      throw new Error('Authentication failed');
    }
    
    // First, delete any existing logo files for this user
    const { data: existingFiles } = await supabase.storage
      .from('company-logos')
      .list(user.id, {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' }
      });
    
    if (existingFiles && existingFiles.length > 0) {
      console.log(`Found ${existingFiles.length} existing logo files, deleting them...`);
      const filesToDelete = existingFiles.map(file => `${user.id}/${file.name}`);
      const { error: deleteError } = await supabase.storage
        .from('company-logos')
        .remove(filesToDelete);
      
      if (deleteError) {
        console.warn('Warning: Could not delete existing files:', deleteError);
        // Continue anyway - this is not critical
      }
    }
    
    // Organize files by user ID for RLS policies to work correctly
    const filePath = `${user.id}/${Date.now()}-${logoFile.name.replace(/\s+/g, '_')}`;
    
    console.log('Uploading file:', {
      userId: user.id,
      authUserId: authUser.id,
      filePath,
      fileName: logoFile.name,
      fileSize: logoFile.size,
      deletedFiles: existingFiles?.length || 0
    });
    
    const { data, error } = await supabase.storage
      .from('company-logos')
      .upload(filePath, logoFile, {
        cacheControl: '3600',
        upsert: false // Changed to false since we're deleting old files first
      });
      
    if (error) {
      console.error('File upload failed:', error);
      throw new Error(`File upload failed: ${error.message}`);
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('company-logos')
      .getPublicUrl(filePath);
    
    // Update profile with logo URL
    await upsertEmployerProfile(profile.id, {
      companyLogoUrl: publicUrl
    });
    
    // Granular cache invalidation for logo update
    const invalidationTags = EMPLOYER_PROFILE_CACHE_TAGS.getInvalidationTags(profile.id, user.id);
    await Promise.all(invalidationTags.map(tag => revalidateTag(tag)));
    
    // Revalidate the page
    revalidatePath('/employer/profile');
    
    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Logo upload error:', error);
    throw error;
  }
}

// Delete logo action
export async function handleLogoDelete() {
  try {
    const user = await getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }
    
    // Check if user has a profile
    const database = await db();
    const profile = await database
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1)
      .then(res => res[0]);
      
    if (!profile) {
      throw new Error('Profile not found');
    }

    // Check if employer profile exists
    const employerProfile = await database
      .select()
      .from(employerProfiles)
      .where(eq(employerProfiles.profileId, profile.id))
      .limit(1)
      .then(res => res[0]);
      
    if (!employerProfile) {
      throw new Error('Employer profile not found');
    }
    
    // Create Supabase client with proper auth context
    const supabase = await createClient();
    
    // Verify user is authenticated in the Supabase client
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser) {
      console.error('Auth verification failed:', authError);
      throw new Error('Authentication failed');
    }
    
    // Find and delete all existing logo files for this user
    const { data: existingFiles } = await supabase.storage
      .from('company-logos')
      .list(user.id, {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' }
      });
    
    if (existingFiles && existingFiles.length > 0) {
      console.log(`Deleting ${existingFiles.length} logo files for user ${user.id}`);
      const filesToDelete = existingFiles.map(file => `${user.id}/${file.name}`);
      const { error: deleteError } = await supabase.storage
        .from('company-logos')
        .remove(filesToDelete);
      
      if (deleteError) {
        console.error('Failed to delete logo files:', deleteError);
        throw new Error(`Failed to delete logo files: ${deleteError.message}`);
      }
      
      console.log(`Successfully deleted ${existingFiles.length} logo files`);
    } else {
      console.log('No logo files found to delete');
    }
    
    // Update employer profile to remove logo URL
    await upsertEmployerProfile(profile.id, {
      companyLogoUrl: null
    });
    
    // Granular cache invalidation for logo deletion
    const invalidationTags = EMPLOYER_PROFILE_CACHE_TAGS.getInvalidationTags(profile.id, user.id);
    await Promise.all(invalidationTags.map(tag => revalidateTag(tag)));
    
    // Revalidate the page
    revalidatePath('/employer/profile');
    
    return { success: true, message: 'Logo deleted successfully' };
  } catch (error) {
    console.error('Logo delete error:', error);
    throw error;
  }
} 