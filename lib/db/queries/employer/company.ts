import { db } from '@/lib/db';
import { 
  profiles, 
  employerProfiles, 
  EmployerProfile,
  NewEmployerProfile,
  jobs
} from '@/lib/db/schema';
import { eq, and, count } from 'drizzle-orm';

/**
 * Get an employer profile by ID
 */
export async function getEmployerProfileById(id: string) {
  try {
    const result = await db()
      .select()
      .from(employerProfiles)
      .where(eq(employerProfiles.id, id))
      .limit(1);
    
    return result[0] || null;
  } catch (error) {
    console.error('Error fetching employer profile by ID:', error);
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
    console.error('Error fetching employer profile by profile ID:', error);
    return null;
  }
}

/**
 * Get employer profile with user details by profile ID
 */
export async function getEmployerProfileWithUserByProfileId(profileId: string) {
  try {
    const result = await db()
      .select({
        id: employerProfiles.id,
        profileId: employerProfiles.profileId,
        companyName: employerProfiles.companyName,
        companySize: employerProfiles.companySize,
        industry: employerProfiles.industry,
        companyDescription: employerProfiles.companyDescription,
        website: employerProfiles.website,
        location: employerProfiles.location,
        createdAt: employerProfiles.createdAt,
        updatedAt: employerProfiles.updatedAt,
        fullName: profiles.fullName,
        email: profiles.email,
        avatarUrl: profiles.avatarUrl,
      })
      .from(employerProfiles)
      .innerJoin(profiles, eq(employerProfiles.profileId, profiles.id))
      .where(eq(employerProfiles.profileId, profileId))
      .limit(1);
    
    return result[0] || null;
  } catch (error) {
    console.error('Error fetching employer profile with user details:', error);
    return null;
  }
}

/**
 * Get the count of active jobs for an employer
 */
export async function getEmployerActiveJobsCount(companyId: string) {
  try {
    const result = await db()
      .select({ count: count() })
      .from(jobs)
      .where(
        and(
          eq(jobs.companyId, companyId),
          eq(jobs.isActive, true)
        )
      );
    
    return result[0]?.count || 0;
  } catch (error) {
    console.error('Error counting employer active jobs:', error);
    return 0;
  }
}

/**
 * Update an employer profile
 */
export async function updateEmployerProfile(id: string, data: Partial<EmployerProfile>) {
  try {
    // Remove fields that shouldn't be updated
    const { id: _, profileId: __, createdAt: ___, ...updateData } = data as any;
    
    // Add updatedAt timestamp
    const dataToUpdate = {
      ...updateData,
      updatedAt: new Date(),
    };
    
    const result = await db()
      .update(employerProfiles)
      .set(dataToUpdate)
      .where(eq(employerProfiles.id, id))
      .returning();
    
    return { success: true, data: result[0] };
  } catch (error) {
    console.error('Error updating employer profile:', error);
    return { success: false, error: 'Failed to update employer profile' };
  }
}
