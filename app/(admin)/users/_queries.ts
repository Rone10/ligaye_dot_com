import { db } from "@/lib/db";
import { profiles, candidateProfiles, employerProfiles } from "@/lib/db/schema";
import { eq, and, not, desc } from "drizzle-orm";
import type { Profile } from "@/lib/db/schema";

export interface UserListItem {
  id: string;
  userId: string;
  fullName: string;
  role: "candidate" | "employer" | "admin";
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  deleted: boolean;
  hasCompletedProfile: boolean;
}

export async function getAllUsers(): Promise<UserListItem[]> {
  // Fetch all profiles
  const allProfiles = await db()
    .select()
    .from(profiles)
    .orderBy(desc(profiles.createdAt));
  
  // Get candidate profiles to check completion
  const candidateProfilesData = await db()
    .select({
      profileId: candidateProfiles.profileId,
    })
    .from(candidateProfiles)
    .where(not(eq(candidateProfiles.deleted, true)));
  
  const candidateProfileIds = new Set(candidateProfilesData.map(p => p.profileId));
  
  // Get employer profiles to check completion
  const employerProfilesData = await db()
    .select({
      profileId: employerProfiles.profileId,
    })
    .from(employerProfiles)
    .where(not(eq(employerProfiles.deleted, true)));
  
  const employerProfileIds = new Set(employerProfilesData.map(p => p.profileId));
  
  // Map profiles to UserListItem and include hasCompletedProfile flag
  return allProfiles.map(profile => ({
    id: profile.id,
    userId: profile.userId,
    fullName: profile.fullName,
    role: profile.role,
    avatarUrl: profile.avatarUrl,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
    deleted: profile.deleted,
    hasCompletedProfile: profile.role === "candidate" 
      ? candidateProfileIds.has(profile.id)
      : profile.role === "employer"
        ? employerProfileIds.has(profile.id)
        : true
  }));
}

export async function deleteUserProfile(id: string): Promise<{ success: boolean }> {
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

export async function restoreUserProfile(id: string): Promise<{ success: boolean }> {
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