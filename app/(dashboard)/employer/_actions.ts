'use server'

import { db } from '@/lib/db';
import { getUser } from '@/lib/supabase/server';
import { getEmployerDashboardStats, getRecentEmployerJobs } from './_queries';
import { employerProfiles, profiles } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

export async function getEmployerDashboardData() {
  try {
    // Get the current user
    const user = await getUser();
    if (!user) {
      return { error: 'User not authenticated', data: null };
    }

    // Get employer profile for the user to find the companyId
    const employerProfileResult = await db()
      .select({
        employerProfileId: employerProfiles.id,
      })
      .from(profiles)
      .innerJoin(
        employerProfiles, 
        and(
          eq(profiles.id, employerProfiles.profileId),
          eq(employerProfiles.deleted, false) // Ensure employer profile is not deleted
        )
      )
      .where(and(
        eq(profiles.userId, user.id),
        eq(profiles.deleted, false) // Ensure base profile is not deleted
      ))
      .limit(1)
      .then(res => res[0]);

    if (!employerProfileResult || !employerProfileResult.employerProfileId) {
      // Handle case where employer profile doesn't exist or is deleted
      // Redirecting or showing a message might be appropriate here in the page component
      return { error: 'Employer profile not found or setup incomplete.', data: null };
    }

    const companyId = employerProfileResult.employerProfileId;

    // Fetch stats and recent jobs using the companyId
    const [statsData, recentJobs] = await Promise.all([
      getEmployerDashboardStats(companyId),
      getRecentEmployerJobs(companyId)
    ]);

    return {
      data: {
        statsData,
        recentJobs,
        userName: user?.user_metadata?.first_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Employer',
      },
      error: null
    };

  } catch (error) {
    console.error("Error fetching employer dashboard data:", error);
    return { 
      error: 'Failed to load dashboard data. Please try again later.', 
      data: null 
    };
  }
} 