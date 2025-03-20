'use server'

import { getUser } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/db';
import { savedJobs, candidateProfiles } from '@/lib/db/schema';
import { getDashboardStats, getRecommendedJobs } from '@/lib/db/queries/candidates/dashboard';

/**
 * Get dashboard data for the authenticated candidate
 */
export async function getCandidateDashboardData() {
  const user = await getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }
  
  const stats = await getDashboardStats(user.id);
  const recommendedJobs = await getRecommendedJobs(user.id);
  
  return {
    stats,
    recommendedJobs
  };
}