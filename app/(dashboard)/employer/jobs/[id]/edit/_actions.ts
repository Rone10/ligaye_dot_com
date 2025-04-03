'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/supabase/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { employerProfiles, profiles } from '@/lib/db/schema';
// Import query functions
import { getJobForEditing, getFormData } from './_queries';
import type { User } from '@supabase/supabase-js'; // Import User type if needed

// Placeholder Types - Replace with actual imports or definitions from _queries
type JobForEditing = any;
type FormData = { locations: any[], industries: any[], skills: any[] };

// Refactored: Check if user is logged in and has an employer profile.
// Returns the Supabase User object if true, otherwise null.
export async function checkIfEmployer(): Promise<User | null> {
  const user = await getUser()
    if (!user) {
      throw new Error('You must be logged in to post a job')
    }
    
    // Get employer profile for the user
    const result = await db()
      .select({
        employerProfileId: employerProfiles.id,
        profileId: profiles.id,
      })
      .from(profiles)
      .innerJoin(
        employerProfiles, 
        and(
          eq(profiles.id, employerProfiles.profileId),
          eq(employerProfiles.deleted, false)
        )
      )
      .where(and(
        eq(profiles.userId, user.id),
        eq(profiles.deleted, false)
      ))
      .limit(1)
      .then(res => res[0])
    
    if (!result) {
      throw new Error('Employer profile not found. Please complete your profile first.')
    }

  console.log(`checkIfEmployer: Employer profile found for user ${user.id}.`);
  return user; // Return the full user object if employer profile exists
}

// New action to fetch page data, including authorization check
interface PageDataResult {
  job: JobForEditing | null;
  formData: FormData | null;
  error?: string;
}

export async function getPageDataAction(jobId: string): Promise<PageDataResult> {
  console.log(`getPageDataAction called for job ID: ${jobId}`);
  const employerUser = await checkIfEmployer();

  if (!employerUser) {
    return { job: null, formData: null, error: 'Unauthorized: User is not an employer.' };
  }

  try {
    console.log(`Fetching job (${jobId}) and form data for employer user ${employerUser.id}...`);
    // Fetch job details ensuring ownership AND form data in parallel
    const [job, formData] = await Promise.all([
      getJobForEditing(jobId, employerUser.id), // Pass employer user ID for ownership check
      getFormData()
    ]);

    if (!job) {
       return { job: null, formData: null, error: 'Job not found or user does not own it.' };
    }

    console.log('getPageDataAction: Data fetched successfully.');
    return { job, formData, error: undefined };

  } catch (error: any) {
    console.error('Error fetching page data in action:', error);
    return { job: null, formData: null, error: `Failed to fetch page data: ${error.message}` };
  }
}

// TODO: Import `updateJobQuery` from './_queries'
// TODO: Import the Zod schema from EditJobForm or a shared utils file

// Placeholder: Define Zod schema matching the form
// TODO: Replace with the actual schema import
const editJobFormSchema = z.object({
  title: z.string().min(5), // Ensure this matches the client-side schema
  description: z.string().min(20),
  // ... other fields
});

interface ActionResult {
  error?: string;
}

export async function updateJobAction(
  jobId: string,
  formData: z.infer<typeof editJobFormSchema>
): Promise<ActionResult | void> {
  console.log(`Server action updateJobAction called for job ID: ${jobId}`);

  // Re-check employer status within the action for security
  const employerUser = await checkIfEmployer();
  if (!employerUser) {
    return { error: 'Unauthorized: Must be an employer.' };
  }

  // Validate form data on the server
  const validatedFields = editJobFormSchema.safeParse(formData);

  if (!validatedFields.success) {
    console.error('Server-side validation failed:', validatedFields.error.flatten().fieldErrors);
    // Return detailed errors if needed, or a generic message
    return {
      error: 'Invalid form data. Please check the fields and try again.',
      // errors: validatedFields.error.flatten().fieldErrors, // Optionally return detailed errors
    };
  }

  const dataToUpdate = validatedFields.data;
  console.log('Server-side validation successful. Data to update:', dataToUpdate);

  try {
    // TODO: Call the database mutation query, ensuring ownership
    // await updateJobQuery(jobId, dataToUpdate, employerUser.id);
    console.log(`Placeholder: Would update job ${jobId} in DB now using user ${employerUser.id}.`);

    // Revalidate the path for the edited job and potentially the jobs list
    revalidatePath(`/employer/jobs/${jobId}/edit`);
    revalidatePath('/employer/jobs'); // Revalidate the list page too

  } catch (error: any) {
    console.error('Database update failed:', error);
    return { error: `Database Error: ${error.message || 'Failed to update job.'}` };
  }

  // Optionally redirect after successful update
  // redirect(`/employer/jobs/${jobId}`); // Redirect to view page? Or stay on edit?
  // For now, just return success (no error)
  console.log(`Job ${jobId} update processed successfully.`);
} 