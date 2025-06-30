'use server'

import { getUser } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { deleteUserProfile, restoreUserProfile, invalidateUserCache } from "./_queries";

// Action to delete a user profile (soft delete)
export async function softDeleteUserProfile(formData: FormData) {
  // Get logged-in user
  const user = await getUser();
  
  // Check if user is admin
  if (!user) {
    throw new Error("Unauthorized");
  }
  
  const adminProfile = await db()
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1)
    .then(res => res[0]);
  
  if (!adminProfile || adminProfile.role !== "admin") {
    throw new Error("Access denied");
  }
  
  // Get profile ID from form data
  const profileId = formData.get("profileId") as string;
  if (!profileId) {
    throw new Error("Profile ID is required");
  }
  
  // Delete the profile (this already includes cache invalidation)
  const result = await deleteUserProfile(profileId);
  await invalidateUserCache();
  
  return result;
}

// Action to restore a deleted user profile
export async function restoreDeletedUserProfile(formData: FormData) {
  // Get logged-in user
  const user = await getUser();
  
  // Check if user is admin
  if (!user) {
    throw new Error("Unauthorized");
  }
  
  const adminProfile = await db()
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1)
    .then(res => res[0]);
  
  if (!adminProfile || adminProfile.role !== "admin") {
    throw new Error("Access denied");
  }
  
  // Get profile ID from form data
  const profileId = formData.get("profileId") as string;
  if (!profileId) {
    throw new Error("Profile ID is required");
  }
  
  // Restore the profile (this already includes cache invalidation)
  const result = await restoreUserProfile(profileId);
  await invalidateUserCache();
  return result;
} 