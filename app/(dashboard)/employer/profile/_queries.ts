'use server'

import { db } from '@/lib/db';
import { profiles, employerProfiles, industries, locations } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import type { Profile, EmployerProfile, Industry, Location, NewEmployerProfile } from '@/lib/db/schema';
import { unstable_cache } from 'next/cache';
import { EMPLOYER_PROFILE_CACHE_TAGS } from './_utils/cache-tags';

interface EmployerProfileData {
  profile: Profile;
  employerProfile: EmployerProfile | null;
  industry: Industry | null;
  location: Location | null;
}

/**
 * Optimized query using Drizzle relations to fetch all data in a single query
 * This eliminates the N+1 query pattern and reduces database round trips
 */
async function getEmployerProfileDataInternal(profileId: string): Promise<EmployerProfileData | null> {
  const database = await db();
  
  // Single optimized query with all necessary joins
  const result = await database
    .select({
      profile: profiles,
      employerProfile: employerProfiles,
      industry: industries,
      location: locations,
    })
    .from(profiles)
    .leftJoin(employerProfiles, eq(employerProfiles.profileId, profiles.id))
    .leftJoin(industries, and(
      employerProfiles.industryId ? eq(industries.id, employerProfiles.industryId) : undefined,
      eq(industries.deleted, false)
    ))
    .leftJoin(locations, and(
      employerProfiles.locationId ? eq(locations.id, employerProfiles.locationId) : undefined,
      eq(locations.deleted, false)
    ))
    .where(eq(profiles.id, profileId))
    .limit(1)
    .then(res => res[0]);

  if (!result || !result.profile) return null;

  return {
    profile: result.profile,
    employerProfile: result.employerProfile,
    industry: result.industry,
    location: result.location,
  };
}

/**
 * Cached version of employer profile data by profile ID
 */
export async function getEmployerProfileData(profileId: string): Promise<EmployerProfileData | null> {
  const cachedFunction = unstable_cache(
    async () => getEmployerProfileDataInternal(profileId),
    [`employer-profile-${profileId}`],
    {
      tags: EMPLOYER_PROFILE_CACHE_TAGS.getProfileTags(profileId)
    }
  );
  
  return cachedFunction();
}

/**
 * Helper to get profile ID from user ID - kept separate for reusability
 */
async function getProfileIdFromUserId(userId: string): Promise<string | null> {
  const database = await db();
  const profile = await database
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1)
    .then(res => res[0]);
    
  return profile?.id || null;
}

/**
 * Main entry point for getting employer profile by user ID
 * Optimized to use cached profile data lookup
 */
export async function getEmployerProfile(userId: string): Promise<EmployerProfileData | null> {
  const profileId = await getProfileIdFromUserId(userId);
  if (!profileId) return null;
  
  return getEmployerProfileData(profileId);
}

/**
 * Internal function to fetch all industries
 */
async function getAllIndustriesInternal(): Promise<Industry[]> {
  const database = await db();
  return database
    .select()
    .from(industries)
    .where(eq(industries.deleted, false));
}

/**
 * Cached function to get all industries with on-demand invalidation
 */
export async function getAllIndustries(): Promise<Industry[]> {
  const cachedFunction = unstable_cache(
    async () => getAllIndustriesInternal(),
    ['all-industries'],
    {
      tags: [EMPLOYER_PROFILE_CACHE_TAGS.industries]
    }
  );
  
  return cachedFunction();
}

/**
 * Internal function to fetch all locations
 */
async function getAllLocationsInternal(): Promise<Location[]> {
  const database = await db();
  return database
    .select()
    .from(locations)
    .where(eq(locations.deleted, false));
}

/**
 * Cached function to get all locations with on-demand invalidation
 */
export async function getAllLocations(): Promise<Location[]> {
  const cachedFunction = unstable_cache(
    async () => getAllLocationsInternal(),
    ['all-locations'],
    {
      tags: [EMPLOYER_PROFILE_CACHE_TAGS.locations]
    }
  );
  
  return cachedFunction();
}

// Create or update employer profile
export async function upsertEmployerProfile(
  profileId: string, 
  profileData: Partial<EmployerProfile> & (
    { id?: string } | { companyName: string }
  )
): Promise<EmployerProfile> {
  const database = await db();
  
  // Check if profile exists
  const existingProfile = await database
    .select()
    .from(employerProfiles)
    .where(eq(employerProfiles.profileId, profileId))
    .limit(1)
    .then(res => res[0]);

  if (existingProfile) {
    // Update existing profile
    const [updated] = await database
      .update(employerProfiles)
      .set({
        ...profileData,
        updatedAt: new Date(),
      })
      .where(eq(employerProfiles.id, existingProfile.id))
      .returning();
    
    return updated;
  } else {
    // Create new profile - ensure companyName is provided
    if (!('companyName' in profileData) || !profileData.companyName) {
      throw new Error('Company name is required when creating a new employer profile');
    }
    
    // Create an insert object with required fields
    const insertData: NewEmployerProfile = {
      profileId,
      companyName: profileData.companyName,
    };
    
    // Add optional fields if they exist
    if (profileData.companySize) insertData.companySize = profileData.companySize;
    if (profileData.industryId) insertData.industryId = profileData.industryId;
    if (profileData.companyDescription) insertData.companyDescription = profileData.companyDescription;
    if (profileData.website) insertData.website = profileData.website;
    if (profileData.locationId) insertData.locationId = profileData.locationId;
    if (profileData.hqAddressDisplay) insertData.hqAddressDisplay = profileData.hqAddressDisplay;
    if (profileData.companyLogoUrl) insertData.companyLogoUrl = profileData.companyLogoUrl;
    
    const [created] = await database
      .insert(employerProfiles)
      .values(insertData)
      .returning();
    
    return created;
  }
} 