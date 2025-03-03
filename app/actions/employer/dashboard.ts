'use server';

import { getUser } from '@/lib/supabase/server';
import { 
  getEmployerActiveJobsCount,
  getEmployerTotalApplicantsCount,
  getEmployerPendingApplicationsCount,
  getEmployerActiveJobs,
  getEmployerRecentApplicants,
  getEmployerProfileCompletion
} from '@/lib/db/queries/employer/dashboard';
import { getEmployerProfileByProfileId } from '@/lib/db/queries/employer/company';
import { getProfileByUserId } from '@/lib/db/queries/profiles';
import { formatDistanceToNow } from 'date-fns';

// Define the dashboard stats interface
export interface DashboardStat {
  label: string;
  value: string;
  icon: string;
  className: string;
  iconColor: string;
}

// Define the active job interface
export interface ActiveJob {
  id: string;
  title: string;
  location: string;
  type: string;
  applicants: number;
  expiresIn: string;
}

// Define the recent applicant interface
export interface RecentApplicant {
  id: string;
  name: string;
  position: string;
  avatar: string;
  timeAgo: string;
}

// Define the quick tip interface
export interface QuickTip {
  title: string;
  description: string;
  icon: string;
}

/**
 * Get the current user's profile ID
 */
async function getCurrentUserProfileId() {
  const user = await getUser();
  
  if (!user) {
    return null;
  }
  
  const profile = await getProfileByUserId(user.id);
  return profile?.id || null;
}

/**
 * Get the current employer's company ID
 */
async function getCurrentEmployerCompanyId() {
  const profileId = await getCurrentUserProfileId();
  
  if (!profileId) {
    return null;
  }
  
  const employerProfile = await getEmployerProfileByProfileId(profileId);
  return employerProfile?.id || null;
}

/**
 * Get the dashboard stats
 */
export async function getDashboardStats(): Promise<DashboardStat[]> {
  try {
    const companyId = await getCurrentEmployerCompanyId();
    
    if (!companyId) {
      return [];
    }
    
    // Get the stats
    const [activeJobsCount, totalApplicantsCount, pendingApplicationsCount] = await Promise.all([
      getEmployerActiveJobsCount(companyId),
      getEmployerTotalApplicantsCount(companyId),
      getEmployerPendingApplicationsCount(companyId)
    ]);
    
    // Format the stats
    return [
      {
        label: 'Active Jobs',
        value: activeJobsCount.toString(),
        icon: 'Briefcase',
        className: 'bg-blue-50',
        iconColor: 'text-blue-600',
      },
      {
        label: 'Total Applicants',
        value: totalApplicantsCount.toString(),
        icon: 'Users',
        className: 'bg-green-50',
        iconColor: 'text-green-600',
      },
      {
        label: 'Job Views',
        value: '0', // Placeholder - add this functionality if needed
        icon: 'Eye',
        className: 'bg-purple-50',
        iconColor: 'text-purple-600',
      },
      {
        label: 'Pending Reviews',
        value: pendingApplicationsCount.toString(),
        icon: 'Clock',
        className: 'bg-yellow-50',
        iconColor: 'text-yellow-600',
      },
    ];
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return [];
  }
}

/**
 * Get the active jobs
 */
export async function getActiveJobs(): Promise<ActiveJob[]> {
  try {
    const companyId = await getCurrentEmployerCompanyId();
    
    if (!companyId) {
      return [];
    }
    
    // Get the active jobs
    const jobs = await getEmployerActiveJobs(companyId);
    
    // Format the jobs
    return jobs.map(job => ({
      id: job.id,
      title: job.title,
      location: job.location,
      type: job.jobType,
      applicants: job.applicants,
      expiresIn: job.expiresAt ? formatDistanceToNow(job.expiresAt, { addSuffix: false }) : 'N/A',
    }));
  } catch (error) {
    console.error('Error fetching active jobs:', error);
    return [];
  }
}

/**
 * Get the recent applicants
 */
export async function getRecentApplicants(): Promise<RecentApplicant[]> {
  try {
    const companyId = await getCurrentEmployerCompanyId();
    
    if (!companyId) {
      return [];
    }
    
    // Get the recent applicants
    const applicants = await getEmployerRecentApplicants(companyId);
    
    // Filter out null values and return the applicants
    return applicants.filter((applicant): applicant is RecentApplicant => applicant !== null);
  } catch (error) {
    console.error('Error fetching recent applicants:', error);
    return [];
  }
}

/**
 * Get the quick tips
 */
export async function getQuickTips(): Promise<QuickTip[]> {
  // These are static tips, but could be fetched from a database or CMS in the future
  return [
    {
      title: 'Write Better Job Descriptions',
      description: 'Learn how to write compelling job descriptions that attract top talent.',
      icon: 'LightbulbIcon',
    },
    {
      title: 'Improve Your Hiring Process',
      description: 'Tips for streamlining your recruitment and selection process.',
      icon: 'TrendingUp',
    },
  ];
}

/**
 * Get the profile completion percentage
 */
export async function getProfileCompletion(): Promise<number> {
  try {
    const companyId = await getCurrentEmployerCompanyId();
    
    if (!companyId) {
      return 0;
    }
    
    // Get the profile completion percentage
    return await getEmployerProfileCompletion(companyId);
  } catch (error) {
    console.error('Error fetching profile completion:', error);
    return 0;
  }
} 