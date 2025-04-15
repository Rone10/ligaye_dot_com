'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { getUser } from '@/lib/supabase/server';

/**
 * Revalidate the employer jobs page cache
 */
export async function revalidateEmployerJobs() {
  const user = await getUser();
  
  if (!user) {
    throw new Error('You must be logged in to perform this action');
  }
  
  // Revalidate the employer-specific job cache
  await revalidateTag(`employer-jobs-${user.id}`);
  
  // Revalidate the path as well for redundancy
  revalidatePath('/employer/jobs');
  
  return { success: true };
}

/**
 * Revalidate a specific job detail page
 */
export async function revalidateJobDetail(jobId: string) {
  // Revalidate the job-specific cache
  await revalidateTag(`job-${jobId}`);
  
  // Also revalidate any company data associated with this job
  // This is a more aggressive approach but ensures data consistency
  revalidatePath(`/jobs/${jobId}`);
  
  return { success: true };
}

/**
 * Revalidate a company's jobs
 */
export async function revalidateCompanyJobs(companyId: string) {
  // Revalidate the company-specific cache tag
  await revalidateTag(`company-${companyId}`);
  
  return { success: true };
} 