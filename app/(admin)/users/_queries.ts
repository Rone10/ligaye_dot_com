import { db } from "@/lib/db";
import { profiles, candidateProfiles, employerProfiles } from "@/lib/db/schema";
import { eq, and, not, desc } from "drizzle-orm";
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

export async function getAllUsers(): Promise<UserListItem[]> {
  // Create Supabase Admin Client
  // Ensure SUPABASE_SERVICE_ROLE_KEY is set in your environment variables
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } } // Important for server-side admin client
  );

  // Fetch all users from Supabase Auth
  const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers();

  if (authError) {
    console.error('Error fetching users from Supabase Auth:', authError);
    // Decide how to handle the error - throw, return empty, or partial data?
    // For now, let's proceed but emails will be missing.
    // Consider throwing an error for better handling upstream.
    // throw new Error(`Failed to fetch Supabase Auth users: ${authError.message}`);
  }

  // Create a map for quick email lookup: userId -> email
  const emailMap = new Map<string, string>();
  if (authUsers) {
    for (const user of authUsers) {
      if (user.email) { // Ensure email exists
        emailMap.set(user.id, user.email);
      }
    }
  }

  // Fetch all profiles from the database
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
  
  // Map profiles to UserListItem, include email and hasCompletedProfile flag
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