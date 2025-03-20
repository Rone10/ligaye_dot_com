'use server'

import { getUser } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/db';
import { applications, jobs, candidateProfiles, profiles } from '@/lib/db/schema';
import { z } from 'zod';
import { getApplicationsByUserId, createApplication } from '@/lib/db/queries/candidates/applications';
import crypto from 'crypto';

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
  return { success: true };
}