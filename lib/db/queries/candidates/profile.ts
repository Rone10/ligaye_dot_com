'use server'

import { db } from '@/lib/db/db';
import { 
  profiles, 
  candidateProfiles,
  CandidateProfile,
  NewCandidateProfile
} from '@/lib/db/schema';
import { eq, and, count, desc, sql, gt } from 'drizzle-orm';

/**
 * Get a candidate profile by user ID, including the base profile
 */
export async function getCandidateProfileByUserId(userId: string) {
  const userProfile = await db()
    .select({
      profile: profiles,
      candidateProfile: candidateProfiles
    })
    .from(profiles)
    .leftJoin(candidateProfiles, eq(profiles.id, candidateProfiles.profileId))
    .where(eq(profiles.userId, userId))
    .limit(1);
  
  return userProfile[0] || null;
}

/**
 * Update an existing candidate profile
 */
export async function updateCandidateProfile(
  profileId: string, 
  data: Partial<CandidateProfile>
) {
  return await db()
    .update(candidateProfiles)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(candidateProfiles.profileId, profileId))
    .returning();
}

/**
 * Create a new candidate profile
 */
export async function createCandidateProfile(
  data: NewCandidateProfile
) {
  return await db()
    .insert(candidateProfiles)
    .values(data)
    .returning();
}