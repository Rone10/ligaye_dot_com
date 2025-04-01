import { db } from '@/lib/db';
import { profiles, employerProfiles, industries, locations } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import type { Profile, EmployerProfile, Industry, Location, NewEmployerProfile } from '@/lib/db/schema';

interface EmployerProfileData {
  profile: Profile;
  employerProfile: EmployerProfile | null;
  industry: Industry | null;
  location: Location | null;
}

// Main query to fetch complete employer profile
export async function getEmployerProfile(userId: string): Promise<EmployerProfileData | null> {
  // First get the base profile
  const profile = await db()
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1)
    .then(res => res[0]);

  if (!profile) return null;

  // Get the employer profile
  const employerProfile = await db()
    .select()
    .from(employerProfiles)
    .where(eq(employerProfiles.profileId, profile.id))
    .limit(1)
    .then(res => res[0]);

  // Get industry if exists
  const industry = employerProfile?.industryId 
    ? await db()
        .select()
        .from(industries)
        .where(eq(industries.id, employerProfile.industryId))
        .limit(1)
        .then(res => res[0])
    : null;

  // Get location if exists
  const location = employerProfile?.locationId
    ? await db()
        .select()
        .from(locations)
        .where(eq(locations.id, employerProfile.locationId))
        .limit(1)
        .then(res => res[0])
    : null;

  return {
    profile,
    employerProfile,
    industry,
    location,
  };
}

// Get all industries for selection
export async function getAllIndustries(): Promise<Industry[]> {
  return db()
    .select()
    .from(industries)
    .where(eq(industries.deleted, false));
}

// Get all locations for selection
export async function getAllLocations(): Promise<Location[]> {
  return db()
    .select()
    .from(locations)
    .where(eq(locations.deleted, false));
}

// Create or update employer profile
export async function upsertEmployerProfile(
  profileId: string, 
  profileData: Partial<EmployerProfile> & (
    { id?: string } | { companyName: string }
  )
): Promise<EmployerProfile> {
  // Check if profile exists
  const existingProfile = await db()
    .select()
    .from(employerProfiles)
    .where(eq(employerProfiles.profileId, profileId))
    .limit(1)
    .then(res => res[0]);

  if (existingProfile) {
    // Update existing profile
    const [updated] = await db()
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
    
    const [created] = await db()
      .insert(employerProfiles)
      .values(insertData)
      .returning();
    
    return created;
  }
} 