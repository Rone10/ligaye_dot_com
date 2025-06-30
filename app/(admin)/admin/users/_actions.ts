'use server'

import { getUser } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { deleteUserProfile, restoreUserProfile, invalidateUserCache } from "./_queries";
import { syncUserRoleToMetadata } from "@/lib/supabase/admin";

// Action to manually clear user cache
export async function clearUserCache() {
  const { revalidateTag, revalidatePath } = await import('next/cache');
  
  // Clear all user-related cache tags
  await Promise.all([
    revalidateTag('users-collection'),
    revalidateTag('admin-user-data'),
    revalidateTag('candidate-profiles-collection'),
    revalidateTag('employer-profiles-collection'),
    revalidateTag('admin-all-users'),
    revalidatePath('/admin/users')
  ]);
  
  console.log('User cache cleared successfully');
  return { success: true, message: 'Cache cleared successfully' };
}

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

// Action to sync user metadata with database role
export async function syncUserMetadataWithDatabase(formData: FormData) {
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
  
  // Get user ID from form data
  const userIdToSync = formData.get("userId") as string;
  if (!userIdToSync) {
    throw new Error("User ID is required");
  }
  
  // Sync the user's role from database to auth metadata
  const result = await syncUserRoleToMetadata(userIdToSync);
  
  if (result.success) {
    await invalidateUserCache();
    return { success: true, message: "User metadata synced successfully" };
  } else {
    return { success: false, error: result.error };
  }
}

// Action to change user role
export async function changeUserRole(formData: FormData) {
  // Get logged-in user
  const user = await getUser();
  
  // Check if user is admin
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }
  
  const adminProfile = await db()
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1)
    .then(res => res[0]);
  
  if (!adminProfile || adminProfile.role !== "admin") {
    return { success: false, error: "Access denied" };
  }
  
  // Get form data
  const profileId = formData.get("profileId") as string;
  const newRole = formData.get("newRole") as string;
  
  if (!profileId || !newRole) {
    return { success: false, error: "Profile ID and new role are required" };
  }
  
  // Validate role
  if (!['candidate', 'employer', 'admin'].includes(newRole)) {
    return { success: false, error: "Invalid role specified" };
  }
  
  try {
    console.log('Attempting to change role for profileId:', profileId, 'to role:', newRole);
    
    // First, let's clear cache to ensure we're working with fresh data
    await clearUserCache();
    
    // Get the user's auth user ID to sync metadata later
    const targetProfile = await db()
      .select({ userId: profiles.userId, fullName: profiles.fullName, currentRole: profiles.role })
      .from(profiles)
      .where(and(
        eq(profiles.id, profileId),
        eq(profiles.deleted, false)
      ))
      .limit(1)
      .then(res => res[0]);
    
    console.log('Found target profile:', targetProfile);
    
    if (!targetProfile) {
      // Let's debug what profiles exist
      const allProfiles = await db()
        .select({ id: profiles.id, userId: profiles.userId, fullName: profiles.fullName, deleted: profiles.deleted })
        .from(profiles)
        .limit(10);
      
      console.log('Available profiles (first 10):', allProfiles);
      console.log('Searching for profileId:', profileId);
      
      return { success: false, error: `User profile not found. ProfileId: ${profileId}. Try refreshing the page.` };
    }
    
    // Prevent admin from changing their own role
    if (targetProfile.userId === user.id) {
      return { success: false, error: "You cannot change your own role" };
    }
    
    console.log('Updating role from', targetProfile.currentRole, 'to', newRole);
    
    // Update role in database
    const updateResult = await db()
      .update(profiles)
      .set({ 
        role: newRole as any,
        updatedAt: new Date()
      })
      .where(eq(profiles.id, profileId))
      .returning({ id: profiles.id, newRole: profiles.role });
    
    console.log('Database update result:', updateResult);
    
    // Sync the role to auth metadata
    const syncResult = await syncUserRoleToMetadata(targetProfile.userId);
    
    if (!syncResult.success) {
      console.warn(`Failed to sync metadata for user ${targetProfile.userId}:`, syncResult.error);
      // Continue anyway, the role is updated in database
    } else {
      console.log('Successfully synced metadata for user', targetProfile.userId);
    }
    
    // Invalidate cache and revalidate the page
    await clearUserCache();
    
    return { 
      success: true, 
      message: `Successfully changed ${targetProfile.fullName}'s role to ${newRole}` 
    };
    
  } catch (error) {
    console.error('Error changing user role:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
} 