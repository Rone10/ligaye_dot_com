'use server'

import { getUser } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { savedJobs, candidateProfiles } from '@/lib/db/schema';
import { getSavedJobsByUserId, toggleSavedJob } from '@/lib/db/queries/candidates/saved-jobs';

/**
 * Get all saved jobs for the authenticated user
 */
export async function getSavedJobs() {
  const user = await getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }
  
  return getSavedJobsByUserId(user.id);
}

/**
 * Toggle job save status (save/unsave)
 */
export async function toggleJobSave(jobId: string) {
  const user = await getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }
  
  await toggleSavedJob(user.id, jobId);
  
  revalidatePath('/candidate/saved-jobs');
  revalidatePath('/jobs');
  return { success: true };
}