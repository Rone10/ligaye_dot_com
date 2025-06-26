import { db } from "@/lib/db";
import { profiles, candidateProfiles, employerProfiles } from "@/lib/db/schema";
import { eq, and, not, desc } from "drizzle-orm";
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import type { Profile } from "@/lib/db/schema";
// Import the standard Supabase client library
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export interface UserListItem {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  role: "candidate" | "employer" | "admin";
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  deleted: boolean;
  hasCompletedProfile: boolean;
}

// Cache tags for hierarchical invalidation
const CACHE_TAGS = {
  user: (id: string) => `user-${id}`,
  userCollection: 'users-collection',
  adminUserData: 'admin-user-data',
  candidateProfiles: 'candidate-profiles-collection',
  employerProfiles: 'employer-profiles-collection'
};

// Internal function without caching - optimized with parallel queries
async function getAllUsersInternal(): Promise<UserListItem[]> {
  // Create Supabase Admin Client
  // Ensure SUPABASE_SERVICE_ROLE_KEY is set in your environment variables
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } } // Important for server-side admin client
  );

  try {
    // Wave 1: Parallel data fetching - all independent queries
    const [authUsersResult, allProfiles, candidateProfilesData, employerProfilesData] = await Promise.all([
      supabaseAdmin.auth.admin.listUsers(),
      db().select().from(profiles).orderBy(desc(profiles.createdAt)),
      db()
        .select({
          profileId: candidateProfiles.profileId,
        })
        .from(candidateProfiles)
        .where(not(eq(candidateProfiles.deleted, true))),
      db()
        .select({
          profileId: employerProfiles.profileId,
        })
        .from(employerProfiles)
        .where(not(eq(employerProfiles.deleted, true)))
    ]);

    // Handle potential auth error but continue with partial data
    const authUsers = authUsersResult.data?.users;
    if (authUsersResult.error) {
      console.error('Error fetching users from Supabase Auth:', authUsersResult.error);
      // Continue processing but emails will be missing
    }

    // Create optimized lookups
    const emailMap = new Map<string, string>();
    if (authUsers) {
      for (const user of authUsers) {
        if (user.email) {
          emailMap.set(user.id, user.email);
        }
      }
    }

    const candidateProfileIds = new Set(candidateProfilesData.map(p => p.profileId));
    const employerProfileIds = new Set(employerProfilesData.map(p => p.profileId));
    
    // Map profiles to UserListItem with optimized completion check
    return allProfiles.map(profile => ({
      id: profile.id,
      userId: profile.userId,
      fullName: profile.fullName,
      email: emailMap.get(profile.userId) || 'N/A', // Get email from map, provide fallback
      role: profile.role,
      avatarUrl: profile.avatarUrl,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      deleted: profile.deleted,
      hasCompletedProfile: profile.role === "candidate" 
        ? candidateProfileIds.has(profile.id)
        : profile.role === "employer"
          ? employerProfileIds.has(profile.id)
          : true // Admins are considered complete by default
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users');
  }
}

// Cached version with on-demand invalidation
export const getAllUsers = async (): Promise<UserListItem[]> => {
  const cachedFunction = unstable_cache(
    async () => getAllUsersInternal(),
    ['admin-all-users'],
    {
      tags: [
        CACHE_TAGS.userCollection,
        CACHE_TAGS.adminUserData,
        CACHE_TAGS.candidateProfiles,
        CACHE_TAGS.employerProfiles
      ]
      // NO revalidate property = indefinite cache until tag invalidation
    }
  );
  
  return cachedFunction();
};

// Request-level cache for repeated calls within same request
export const getAllUsersCached = cache(getAllUsers);

// Internal delete function
async function deleteUserProfileInternal(id: string): Promise<{ success: boolean }> {
  try {
    // Soft delete the profile
    await db()
      .update(profiles)
      .set({ deleted: true, updatedAt: new Date() })
      .where(eq(profiles.id, id));
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting user profile:", error);
    return { success: false };
  }
}

// Internal restore function
async function restoreUserProfileInternal(id: string): Promise<{ success: boolean }> {
  try {
    // Restore the profile
    await db()
      .update(profiles)
      .set({ deleted: false, updatedAt: new Date() })
      .where(eq(profiles.id, id));
    
    return { success: true };
  } catch (error) {
    console.error("Error restoring user profile:", error);
    return { success: false };
  }
}

// Exported functions with cache invalidation
export async function deleteUserProfile(id: string): Promise<{ success: boolean }> {
  const result = await deleteUserProfileInternal(id);
  
  if (result.success) {
    // ON-DEMAND cache invalidation
    await invalidateUserCache(id);
  }
  
  return result;
}

export async function restoreUserProfile(id: string): Promise<{ success: boolean }> {
  const result = await restoreUserProfileInternal(id);
  
  if (result.success) {
    // ON-DEMAND cache invalidation
    await invalidateUserCache(id);
  }
  
  return result;
}

// Cache invalidation helpers - call these when data changes
export async function invalidateUserCache(userId?: string) {
  const { revalidateTag } = await import('next/cache');
  
  const tags = [
    CACHE_TAGS.userCollection,
    CACHE_TAGS.adminUserData
  ];
  
  if (userId) {
    tags.push(CACHE_TAGS.user(userId));
  }
  
  await Promise.all(tags.map(tag => revalidateTag(tag)));
}

export async function invalidateCandidateProfilesCache() {
  const { revalidateTag } = await import('next/cache');
  
  await Promise.all([
    revalidateTag(CACHE_TAGS.candidateProfiles),
    revalidateTag(CACHE_TAGS.userCollection),
    revalidateTag(CACHE_TAGS.adminUserData)
  ]);
}

export async function invalidateEmployerProfilesCache() {
  const { revalidateTag } = await import('next/cache');
  
  await Promise.all([
    revalidateTag(CACHE_TAGS.employerProfiles),
    revalidateTag(CACHE_TAGS.userCollection),
    revalidateTag(CACHE_TAGS.adminUserData)
  ]);
} 