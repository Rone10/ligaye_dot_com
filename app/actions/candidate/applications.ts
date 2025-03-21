'use server'

import { getUser } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/db';
import { applications, jobs, candidateProfiles, profiles } from '@/lib/db/schema';
import { z } from 'zod';
import { getApplicationsByUserId, createApplication, hasAppliedToJob } from '@/lib/db/queries/candidates/applications';


// Application validation schema
const applicationSchema = z.object({
  jobId: z.string().uuid(),
  coverLetter: z.string().max(1000).optional(),
});

/**
 * Get all applications for the authenticated user
 */
export async function getApplications() {
  const user = await getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }
  
  return getApplicationsByUserId(user.id);
}

/**
 * Check if the current user has already applied for a job
 */
export async function checkIfApplied(jobId: string) {
  const user = await getUser();
  if (!user) {
    return false;
  }
  
  return hasAppliedToJob(user.id, jobId);
}

/**
 * Apply to a job using form data
 */
export async function applyToJob(formData: FormData) {
  const user = await getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }
  
  const validatedData = applicationSchema.parse({
    jobId: formData.get('jobId'),
    coverLetter: formData.get('coverLetter'),
  });
  
  // Check if user has already applied
  const alreadyApplied = await hasAppliedToJob(user.id, validatedData.jobId);
  if (alreadyApplied) {
    return { success: false, error: 'You have already applied for this job' };
  }
  
  // Create the application
  await createApplication({
    // id: crypto.randomUUID(),
    candidateId: user.id,
    jobId: validatedData.jobId,
    status: 'PENDING',
    coverLetter: validatedData.coverLetter,
    appliedAt: new Date(),
    updatedAt: new Date(),
  });
  
  revalidatePath('/candidate/applications');
  revalidatePath(`/jobs/${validatedData.jobId}`);
  return { success: true };
}