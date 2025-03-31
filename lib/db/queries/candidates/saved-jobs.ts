'use server'

import { db } from '@/lib/db';
import { 
  savedJobs,
  jobs,
  employerProfiles,
  NewSavedJob
} from '@/lib/db/schema';
import { eq, and, desc, sql, gt } from 'drizzle-orm';
import crypto from 'crypto';

/**
 * Get all saved jobs for a specific candidate
 */
export async function getSavedJobsByUserId(userId: string) {
  return await db()
    .select({
      savedJob: savedJobs,
      job: jobs,
      employer: employerProfiles
    })
    .from(savedJobs)
    .innerJoin(jobs, eq(savedJobs.jobId, jobs.id))
    .innerJoin(employerProfiles, eq(jobs.companyId, employerProfiles.id))
    .where(eq(savedJobs.userId, userId))
    .orderBy(desc(savedJobs.createdAt));
}

/**
 * Toggle a job saved status for a candidate
 * If job is already saved, it will be removed
 * If job is not saved, it will be added
 */
export async function toggleSavedJob(candidateId: string, jobId: string) {
  // Check if job is already saved
  const existingSaved = await db()
    .select()
    .from(savedJobs)
    .where(
      and(
        eq(savedJobs.userId, candidateId),
        eq(savedJobs.jobId, jobId)
      )
    )
    .limit(1);
  
  // If job is already saved, remove it
  if (existingSaved.length > 0) {
    return await db()
      .delete(savedJobs)
      .where(eq(savedJobs.id, existingSaved[0].id))
      .returning();
  }
  
  // Otherwise, save the job
  return await db()
    .insert(savedJobs)
    .values({
      id: crypto.randomUUID(),
      userId: candidateId,
      jobId,
      createdAt: new Date()
    })
    .returning();
}