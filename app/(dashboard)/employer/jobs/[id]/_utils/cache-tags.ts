/**
 * Cache tag constants for the employer job detail section
 * These are used for on-demand cache invalidation across the application
 */

export const JOB_DETAIL_CACHE_TAGS = {
  // Job-specific tags
  job: (id: string) => `job-${id}`,
  jobDetail: (id: string) => `job-detail-${id}`,
  jobSkills: (id: string) => `job-skills-${id}`,
  jobIndustries: (id: string) => `job-industries-${id}`,
  
  // Employer-specific tags
  employerProfile: (userId: string) => `employer-profile-${userId}`,
  employerJobs: (employerId: string) => `employer-jobs-${employerId}`,
  
  // Application-related tags
  jobApplications: (jobId: string) => `job-applications-${jobId}`,
  jobApplicationStats: (jobId: string) => `job-application-stats-${jobId}`,
  jobRecentApplications: (jobId: string) => `job-recent-applications-${jobId}`,
  
  // Collection tags
  allJobs: 'jobs-collection',
  allApplications: 'applications-collection',
  jobsDetail: 'job-detail',
} as const