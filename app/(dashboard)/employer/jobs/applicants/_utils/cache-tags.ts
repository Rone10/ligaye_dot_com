/**
 * Cache tag constants for the applicants section
 * These are used for on-demand cache invalidation across the application
 */

export const APPLICANTS_CACHE_TAGS = {
  // Collection-level tags
  allApplications: 'employer-applications',
  applicationCounts: 'application-counts',
  
  // Entity-specific tags
  application: (id: string) => `application-${id}`,
  applicationDetail: (id: string) => `application-detail-${id}`,
  
  // Employer-specific tags
  employerApplications: (employerId: string) => `employer-applications-${employerId}`,
  employerProfile: (userId: string) => `employer-profile-${userId}`,
  
  // Job-specific tags
  jobApplications: (jobId: string) => `job-applications-${jobId}`,
  
  // Candidate-specific tags
  candidateApplications: (candidateId: string) => `candidate-applications-${candidateId}`,
  
  // Status-specific tags
  applicationsByStatus: (status: string) => `applications-status-${status}`,
} as const