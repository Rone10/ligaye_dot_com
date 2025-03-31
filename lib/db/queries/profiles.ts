import { db } from '@/lib/db';
import { 
  profiles, 
  candidateProfiles, 
  employerProfiles, 
  NewProfile, 
  NewCandidateProfile, 
  NewEmployerProfile,
  experienceLevelEnum
} from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Create a new user profile
 */
export async function createProfile(profile: NewProfile) {
  try {
    const result = await db()
      .insert(profiles)
      .values(profile)
      .returning();
    
    return { success: true, data: result[0] };
  } catch (error) {
    console.error('Error creating profile:', error);
    return { success: false, error: 'Failed to create profile' };
  }
}

/**
 * Create a new candidate profile
 */
export async function createCandidateProfile(candidateProfile: NewCandidateProfile) {
  try {
    const result = await db()
      .insert(candidateProfiles)
      .values(candidateProfile)
      .returning();
    
    return { success: true, data: result[0] };
  } catch (error) {
    console.error('Error creating candidate profile:', error);
    return { success: false, error: 'Failed to create candidate profile' };
  }
}

/**
 * Create a new employer profile
 */
export async function createEmployerProfile(employerProfile: NewEmployerProfile) {
  try {
    const result = await db()
      .insert(employerProfiles)
      .values(employerProfile)
      .returning();
    
    return { success: true, data: result[0] };
  } catch (error) {
    console.error('Error creating employer profile:', error);
    return { success: false, error: 'Failed to create employer profile' };
  }
}

/**
 * Get a profile by user ID
 */
export async function getProfileByUserId(userId: string) {
  try {
    const result = await db()
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);
    
    return result[0] || null;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

/**
 * Get a candidate profile by profile ID
 */
export async function getCandidateProfileByProfileId(profileId: string) {
  try {
    const result = await db()
      .select()
      .from(candidateProfiles)
      .where(eq(candidateProfiles.profileId, profileId))
      .limit(1);
    
    return result[0] || null;
  } catch (error) {
    console.error('Error fetching candidate profile:', error);
    return null;
  }
}

/**
 * Get an employer profile by profile ID
 */
export async function getEmployerProfileByProfileId(profileId: string) {
  try {
    const result = await db()
      .select()
      .from(employerProfiles)
      .where(eq(employerProfiles.profileId, profileId))
      .limit(1);
    
    return result[0] || null;
  } catch (error) {
    console.error('Error fetching employer profile:', error);
    return null;
  }
}

/**
 * Check if a user has a profile
 */
export async function hasProfile(userId: string) {
  try {
    const profile = await getProfileByUserId(userId);
    return !!profile;
  } catch (error) {
    console.error('Error checking profile existence:', error);
    return false;
  }
}

/**
 * Get the user's role
 */
export async function getUserRole(userId: string) {
  try {
    const profile = await getProfileByUserId(userId);
    return profile?.role || null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
} 