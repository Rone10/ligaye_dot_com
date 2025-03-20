'use server'

import { db } from '@/lib/db/db';
import { 
  applications,
  jobs,
  employerProfiles,
  NewApplication
} from '@/lib/db/schema';
import { eq, and, desc, sql, gt } from 'drizzle-orm';

/**
 * Get all applications for a specific candidate
 */
export async function getApplicationsByUserId(userId: string) {
  return await db()
    .select({
      application: applications,
      job: jobs,
      employer: employerProfiles
    })
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .innerJoin(employerProfiles, eq(jobs.companyId, employerProfiles.id))
    .where(eq(applications.candidateId, userId))
    .orderBy(desc(applications.appliedAt));
}

/**
 * Get a specific application by ID
 */
export async function getApplicationById(applicationId: string) {
  return await db()
    .select()
    .from(applications)
    .where(eq(applications.id, applicationId))
    .limit(1);
}

/**
 * Create a new job application
 */
export async function createApplication(data: NewApplication) {
  return await db()
    .insert(applications)
    .values(data)
    .returning();
}