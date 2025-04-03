'use server';

import { db } from '@/lib/db';
import {
  jobs,
  locations,
  industries,
  skills,
  jobSkills,
  jobIndustries,
  employerProfiles,
  profiles,
  type Job, // Import base type
  type Location,
  type Industry,
  type Skill,
} from '@/lib/db/schema';
import { and, eq, desc, inArray } from 'drizzle-orm';
import { unstable_noStore as noStore } from 'next/cache';
import { alias } from 'drizzle-orm/pg-core';

// --- Type Definitions ---

// Type for the data needed by the form dropdowns/selectors
export interface JobFormData {
  locations: Pick<Location, 'id' | 'region' | 'city'>[];
  industries: Pick<Industry, 'id' | 'name'>[];
  skills: Pick<Skill, 'id' | 'name'>[];
}

// Type for the job data needed specifically for the edit form
// Includes base job fields plus IDs of related skills and industries
export type JobForEditing = Omit<Job, 'createdAt' | 'updatedAt' | 'publishedAt' | 'expiresAt' | 'slug'> & {
  skillIds: string[];
  industryIds: string[];
};

// --- Query Functions ---

/**
 * Fetches the job details for editing, ensuring the requesting user owns the job.
 */
export async function getJobForEditing(jobId: string, authUserId: string): Promise<JobForEditing | null> {
  noStore();
  console.log(`Fetching job ${jobId} for editing by auth user ${authUserId}`);

  try {
    // Need to verify that the authUserId corresponds to the employer who owns the job.
    // profiles.userId (auth) -> profiles.id -> employerProfiles.profileId -> employerProfiles.id -> jobs.companyId

    const jobData = await db().query.jobs.findFirst({
      where: eq(jobs.id, jobId),
      with: {
        // Eager load related skill and industry IDs
        jobSkills: { columns: { skillId: true } },
        jobIndustries: { columns: { industryId: true } },
        // Load company profile to check ownership link
        company: {
          columns: { id: true },
          with: {
            profile: { // Link employer profile back to base profile
              columns: { userId: true } // Get the auth user ID
            }
          }
        }
      }
    });

    if (!jobData) {
      console.log(`Job ${jobId} not found.`);
      return null;
    }

    // Ownership check: Ensure the job's company profile links back to the authenticated user
    if (jobData.company?.profile?.userId !== authUserId) {
      console.warn(`Ownership check failed: Job ${jobId} owner (${jobData.company?.profile?.userId}) does not match requesting user (${authUserId}).`);
      return null;
    }

    // Map the fetched data to the JobForEditing type
    const jobForEditing: JobForEditing = {
      ...jobData,
      // Extract just the IDs from the loaded relations
      skillIds: jobData.jobSkills.map(js => js.skillId),
      industryIds: jobData.jobIndustries.map(ji => ji.industryId),
    };

    // Remove relational data included by `with` that isn't part of JobForEditing type
    delete (jobForEditing as any).jobSkills;
    delete (jobForEditing as any).jobIndustries;
    delete (jobForEditing as any).company;

    console.log(`Successfully fetched job ${jobId} for editing.`);
    return jobForEditing;

  } catch (error) {
    console.error(`Error fetching job ${jobId} for editing:`, error);
    // Optionally re-throw or handle specific errors
    throw new Error('Failed to fetch job details for editing.');
  }
}

/**
 * Fetches static data required for the job editing form (e.g., dropdown options).
 */
export async function getFormData(): Promise<JobFormData> {
  noStore();
  console.log('Fetching form data (locations, industries, skills)');

  try {
    const [locationsData, industriesData, skillsData] = await Promise.all([
      db().select({
        id: locations.id,
        region: locations.region,
        city: locations.city
      }).from(locations).where(eq(locations.deleted, false)).orderBy(locations.region, locations.city),

      db().select({
        id: industries.id,
        name: industries.name
      }).from(industries).where(eq(industries.deleted, false)).orderBy(industries.name),

      db().select({
        id: skills.id,
        name: skills.name
      }).from(skills).where(eq(skills.deleted, false)).orderBy(skills.name)
    ]);

    console.log('Successfully fetched form data.');
    return {
      locations: locationsData,
      industries: industriesData,
      skills: skillsData
    };
  } catch (error) {
    console.error('Error fetching form data:', error);
    throw new Error('Failed to fetch form data.');
  }
}

/**
 * Updates the job in the database, including related skills and industries.
 * Ensures the user owns the job they are trying to update.
 */
// Define the expected shape of the update data (adjust based on your Zod schema in EditJobForm)
// This should include fields from the `jobs` table plus `skillIds` and `industryIds` arrays
// Make sure all fields from the form are included here
type UpdateJobData = Partial<Omit<Job, 'id' | 'companyId' | 'createdAt' | 'updatedAt' | 'slug' | 'publishedAt' | 'expiresAt'>> & {
  skillIds?: string[];
  industryIds?: string[];
};

export async function updateJobQuery(jobId: string, data: UpdateJobData, authUserId: string): Promise<void> {
  console.log(`Executing updateJobQuery for job ${jobId} by auth user ${authUserId}`);
  // console.log('Data received for update:', data); // Be careful logging sensitive data

  try {
    await db().transaction(async (tx) => {
      // 1. Verify Ownership Again (Defense in Depth)
      const jobOwnerCheck = await tx.query.jobs.findFirst({
        columns: { id: true },
        where: eq(jobs.id, jobId),
        with: {
          company: {
            columns: { id: true },
            with: {
              profile: { columns: { userId: true } }
            }
          }
        }
      });

      if (!jobOwnerCheck || jobOwnerCheck.company?.profile?.userId !== authUserId) {
        console.warn(`Update rejected: Job ${jobId} not found or ownership check failed for user ${authUserId}.`);
        throw new Error('Unauthorized or job not found.');
      }

      console.log(`Ownership verified for job ${jobId}. Proceeding with update.`);

      // 2. Separate Job Data from Relation IDs
      const { skillIds: newSkillIds = [], industryIds: newIndustryIds = [], ...jobUpdateData } = data;

      // 3. Update main Job Table
      if (Object.keys(jobUpdateData).length > 0) {
        await tx.update(jobs)
          .set({ ...jobUpdateData, updatedAt: new Date() })
          .where(eq(jobs.id, jobId));
        console.log(`Updated main job table for ${jobId}`);
      }

      // --- 4. Update Job Skills (Handle Add/Remove) ---
      const currentJobSkills = await tx.select({ skillId: jobSkills.skillId })
        .from(jobSkills)
        .where(and(eq(jobSkills.jobId, jobId), eq(jobSkills.deleted, false)));
      const currentSkillIds = currentJobSkills.map(js => js.skillId);

      const skillsToAdd = newSkillIds.filter(id => !currentSkillIds.includes(id));
      const skillsToRemove = currentSkillIds.filter(id => !newSkillIds.includes(id));

      // Add new skills
      if (skillsToAdd.length > 0) {
        await tx.insert(jobSkills).values(skillsToAdd.map(skillId => ({
          jobId: jobId,
          skillId: skillId,
          // createdAt will default
        })));
        console.log(`Added ${skillsToAdd.length} skills to job ${jobId}`);
      }

      // Soft-delete removed skills
      if (skillsToRemove.length > 0) {
        await tx.update(jobSkills)
          .set({ deleted: true })
          .where(and(
            eq(jobSkills.jobId, jobId),
            inArray(jobSkills.skillId, skillsToRemove)
          ));
        console.log(`Soft-deleted ${skillsToRemove.length} skills from job ${jobId}`);
      }

      // --- 5. Update Job Industries (Handle Add/Remove) ---
      const currentJobIndustries = await tx.select({ industryId: jobIndustries.industryId })
        .from(jobIndustries)
        .where(and(eq(jobIndustries.jobId, jobId), eq(jobIndustries.deleted, false)));
      const currentIndustryIds = currentJobIndustries.map(ji => ji.industryId);

      const industriesToAdd = newIndustryIds.filter(id => !currentIndustryIds.includes(id));
      const industriesToRemove = currentIndustryIds.filter(id => !newIndustryIds.includes(id));

      // Add new industries
      if (industriesToAdd.length > 0) {
        await tx.insert(jobIndustries).values(industriesToAdd.map(industryId => ({
          jobId: jobId,
          industryId: industryId,
        })));
        console.log(`Added ${industriesToAdd.length} industries to job ${jobId}`);
      }

      // Soft-delete removed industries
      if (industriesToRemove.length > 0) {
        await tx.update(jobIndustries)
          .set({ deleted: true })
          .where(and(
            eq(jobIndustries.jobId, jobId),
            inArray(jobIndustries.industryId, industriesToRemove)
          ));
        console.log(`Soft-deleted ${industriesToRemove.length} industries from job ${jobId}`);
      }

      console.log(`Transaction successful for updating job ${jobId}.`);
    }); // End transaction

  } catch (error) {
    console.error(`Error updating job ${jobId} in transaction:`, error);
    // Throw a more specific error or the original error
    if (error instanceof Error && error.message === 'Unauthorized or job not found.') {
        throw error; // Re-throw authorization error
    }
    throw new Error(`Failed to update job ${jobId}.`);
  }
} 