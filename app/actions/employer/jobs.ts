'use server'

import { getUser } from '@/lib/supabase/server';
import { 
  getJobStats, 
  getJobs, 
  getJobLocations,
  updateJobStatus,
  deleteJob
} from '@/lib/db/queries/employer/jobs';
import { revalidatePath } from 'next/cache';

// Types for the jobs page
export interface Job {
  id: string;
  title: string;
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
    const user = await getUser();
    if (!user) return null;
    
    const jobsData = await getJobs(user.id);
    return jobsData.map(job => ({
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