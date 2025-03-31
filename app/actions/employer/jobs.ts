'use server'

import { getUser } from '@/lib/supabase/server';
import { 
  getJobStats, 
  getJobs, 
  getJobLocations,
  updateJobStatus,
  deleteJob,
  createJob as dbCreateJob,
  getJob
} from '@/lib/db/queries/employer/jobs';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { employerProfiles, NewJob, profiles } from '@/lib/db/schema';

// Types for the jobs page
export interface Job {
  id: string;
  title: string;
  description?: string;
  jobType: string;
  workLocation: string;
  locationName: string | null;
  salaryRangeMin: number | null;
  salaryRangeMax: number | null;
  salaryCurrency: string | null;
  salaryFrequency: string;
  experienceLevel: string;
  isActive: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  applicantCount: number;
  slug?: string;
  skillsRequired?: string[];
  benefits?: string[];
}

export interface JobStats {
  total: number;
  active: number;
  applications: number;
  expiringSoon: number;
}

// Get job stats for the current employer
export async function fetchJobStats(): Promise<JobStats | null> {
  try {
    const user = await getUser();
    if (!user) return null;
    
    return await getJobStats(user.id);
  } catch (error) {
    console.error('Error fetching job stats:', error);
    return null;
  }
}

// Get all jobs for the current employer
export async function fetchJobs(): Promise<Job[] | null> {
  try {
    console.log("fetchJobs: Starting job fetch");
    
    const user = await getUser();
    console.log("fetchJobs: User auth result:", user ? "User authenticated" : "No user found");
    
    if (!user) return null;
    
    console.log("fetchJobs: Calling database getJobs with user ID:", user.id);
    const jobsData = await getJobs(user.id);
    console.log("fetchJobs: Database returned job count:", jobsData?.length || 0);
    
    if (!jobsData || jobsData.length === 0) {
      console.log("fetchJobs: No jobs found in database");
      return [];
    }
    
    const mappedJobs = jobsData.map(job => ({
      id: job.id,
      title: job.title,
      jobType: job.jobType,
      workLocation: job.workLocation,
      locationName: job.locationName,
      salaryRangeMin: job.salaryRangeMin,
      salaryRangeMax: job.salaryRangeMax,
      salaryCurrency: job.salaryCurrency || 'GMD',
      salaryFrequency: job.salaryFrequency,
      experienceLevel: job.experienceLevel,
      isActive: job.isActive === null ? false : job.isActive,
      expiresAt: job.expiresAt,
      createdAt: job.createdAt,
      applicantCount: job.applicantCount || 0
    }));
    
    console.log("fetchJobs: Returning mapped jobs, count:", mappedJobs.length);
    return mappedJobs;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return null;
  }
}

// Get all job locations for filtering
export async function fetchJobLocations(): Promise<string[] | null> {
  try {
    const user = await getUser();
    if (!user) return null;
    
    return await getJobLocations(user.id);
  } catch (error) {
    console.error('Error fetching job locations:', error);
    return null;
  }
}

// Update job status (active/inactive)
export async function updateJobActiveStatus(jobId: string, isActive: boolean): Promise<boolean> {
  try {
    const user = await getUser();
    if (!user) return false;
    
    await updateJobStatus(jobId, isActive);
    revalidatePath('/employer/jobs');
    return true;
  } catch (error) {
    console.error('Error updating job status:', error);
    return false;
  }
}

// Delete a job
export async function removeJob(jobId: string): Promise<boolean> {
  try {
    const user = await getUser();
    if (!user) return false;
    
    await deleteJob(jobId);
    revalidatePath('/employer/jobs');
    return true;
  } catch (error) {
    console.error('Error deleting job:', error);
    return false;
  }
}

// Create a new job
export async function createJob(formData: FormData): Promise<{ success: boolean; jobId?: string; error?: string }> {
  try {
    console.log("createJob Action: Starting job creation");
    
    const user = await getUser();
    if (!user) {
      console.log("createJob Action: No authenticated user");
      return { success: false, error: 'Not authorized' };
    }

    console.log("createJob Action: Fetching user profile for user ID:", user.id);
    
    // check user profile id
    const userProfile = await db()
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1);

    if (!userProfile || userProfile.length === 0) {
      console.log("createJob Action: No user profile found");
      return { success: false, error: 'User profile not found' };
    }

    const profileId = userProfile[0].id;
    console.log("createJob Action: Found profile ID:", profileId);

    // Get employer profile to get companyId
    const employerProfile = await db()
      .select()
      .from(employerProfiles)
      .where(eq(employerProfiles.profileId, profileId))
      .limit(1);

    if (!employerProfile || employerProfile.length === 0) {
      console.log("createJob Action: No employer profile found for profile ID:", profileId);
      return { success: false, error: 'Employer profile not found' };
    }

    const companyId = employerProfile[0].id;
    console.log("createJob Action: Found company ID:", companyId);
    
    // Process form data
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const locationId = formData.get('locationId') as string || null;
    const jobType = formData.get('jobType') as string;
    const workLocation = formData.get('workLocation') as string;
    const experienceLevel = formData.get('experienceLevel') as string;
    const salaryFrequency = formData.get('salaryFrequency') as string;
    const salaryRangeMin = formData.get('salaryRangeMin') ? parseInt(formData.get('salaryRangeMin') as string) : null;
    const salaryRangeMax = formData.get('salaryRangeMax') ? parseInt(formData.get('salaryRangeMax') as string) : null;
    const salaryCurrency = formData.get('salaryCurrency') as string || 'GMD';
    
    // Handle arrays
    const educationRequirements = formData.getAll('educationRequirements') as string[];
    const experienceRequirements = formData.getAll('experienceRequirements') as string[];
    const benefits = formData.getAll('benefits') as string[];
    const skillsRequired = formData.getAll('skillsRequired') as string[];
    
    // Handle date fields
    const applicationDeadline = formData.get('applicationDeadline') ? new Date(formData.get('applicationDeadline') as string) : null;
    
    // Calculate expiry date (default to 30 days from now if not provided)
    const expiresAt = formData.get('expiresAt') 
      ? new Date(formData.get('expiresAt') as string) 
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    
    // Create slug from title
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    // Create new job
    const jobData = {
      employerId: profileId,  // This should be the profile ID
      companyId,              // This should be the employer profile ID
      title,
      description,
      locationId,
      jobType,
      workLocation,
      experienceLevel,
      salaryFrequency,
      salaryRangeMin,
      salaryRangeMax,
      salaryCurrency,
      educationRequirements,
      experienceRequirements,
      benefits,
      skillsRequired,
      applicationDeadline,
      expiresAt,
      slug,
      isActive: true,
      deleted: false
    };
    
    console.log("createJob Action: Creating job with employer ID:", profileId, "and company ID:", companyId);
    
    // Insert job into database
    const result = await dbCreateJob(jobData as any);
    
    if (!result || result.length === 0) {
      console.log("createJob Action: Failed to create job");
      return { success: false, error: 'Failed to create job' };
    }
    
    console.log("createJob Action: Job created successfully with ID:", result[0].id);
    revalidatePath('/employer/jobs');
    return { success: true, jobId: result[0].id };
  } catch (error) {
    console.error('Error creating job:', error);
    return { success: false, error: 'An error occurred while creating the job' };
  }
}

// Fetch a single job by ID
export async function fetchJob(jobId: string): Promise<(Job & { 
  description: string;
  slug?: string;
  skillsRequired?: string[];
  benefits?: string[];
}) | null> {
  try {
    const job = await getJob(jobId);
    if (!job) return null;
    
    return {
      id: job.id,
      title: job.title,
      description: job.description,
      jobType: job.jobType,
      workLocation: job.workLocation,
      locationName: job.locationName,
      salaryRangeMin: job.salaryRangeMin,
      salaryRangeMax: job.salaryRangeMax,
      salaryCurrency: job.salaryCurrency || 'GMD',
      salaryFrequency: job.salaryFrequency,
      experienceLevel: job.experienceLevel,
      isActive: job.isActive === null ? false : job.isActive,
      expiresAt: job.expiresAt,
      createdAt: job.createdAt,
      applicantCount: job.applicantCount || 0,
      slug: job.slug || undefined,
      skillsRequired: job.skillsRequired || [],
      benefits: job.benefits || []
    };
  } catch (error) {
    console.error('Error fetching job:', error);
    return null;
  }
} 