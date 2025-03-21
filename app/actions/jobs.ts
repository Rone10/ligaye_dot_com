'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'
import { 
  createProfile, 
  createCandidateProfile, 
  createEmployerProfile 
} from '@/lib/db/queries/profiles'
import { experienceLevelEnum, jobTypeEnum, workLocationEnum } from '@/lib/db/schema'
import { getJobs as fetchJobs, getJobById as fetchJobById, getSimilarJobs as fetchSimilarJobs } from '@/lib/db/queries/jobs'

// Define new interface that matches what fetchJobById returns
export interface JobDetails {
  id: string;
  title: string;
  company: {
    name: string;
    logo: string;
    description: string;
    website: string;
    linkedin: string;
  };
  location: string;
  type: typeof jobTypeEnum.enumValues[number];
  workLocation: typeof workLocationEnum.enumValues[number];
  experienceLevel: typeof experienceLevelEnum.enumValues[number];
  description: string;
  skills: string[];
  salaryRange: {
    min: number;
    max: number;
    currency?: string | null;
    frequency?: string | null;
  };
  postedDate: Date;
  responsibilities: string[];
  requirements: string[];
  education: string;
}

// Simplified job type for listing results
export interface JobListing {
  id: string;
  title: string;
  company: string | { name: string };
  location: string;
  type: typeof jobTypeEnum.enumValues[number];
  workLocation: typeof workLocationEnum.enumValues[number];
  experienceLevel: typeof experienceLevelEnum.enumValues[number];
  description: string;
  skills: string[];
  salaryRange: {
    min: number;
    max: number;
    currency?: string | null;
    frequency?: string | null;
  };
  postedDate: Date;
}

export interface JobFilter {
  search?: string;
  jobTypes?: string[];
  workLocations?: string[];
  experienceLevels?: string[];
  salaryMin?: number;
  salaryMax?: number;
  postedAfter?: Date;
}

export interface JobSortOption {
  field: 'createdAt' | 'salaryRangeMin' | 'title';
  direction: 'asc' | 'desc';
}

export async function getJobs({
  page = 1,
  pageSize = 10,
  filters = {},
  sort = { field: 'createdAt', direction: 'desc' }
}: {
  page?: number;
  pageSize?: number;
  filters?: JobFilter;
  sort?: JobSortOption;
}) {
  try {
    // Use the database query function
    const jobsData = await fetchJobs({ page, pageSize, filters, sort });
    
    return {
      jobs: jobsData.jobs,
      pagination: jobsData.pagination
    };
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return {
      jobs: [],
      pagination: {
        total: 0,
        pageCount: 0,
        page,
        pageSize
      }
    };
  }
}

export async function getJobById(id: string): Promise<JobDetails> {
  try {
    return await fetchJobById(id) as JobDetails;
  } catch (error) {
    console.error('Error fetching job by ID:', error);
    throw new Error('Job not found');
  }
}

export async function getSimilarJobs(jobId: string): Promise<JobListing[]> {
  try {
    return await fetchSimilarJobs(jobId, 2) as JobListing[];
  } catch (error) {
    console.error('Error fetching similar jobs:', error);
    return [];
  }
} 