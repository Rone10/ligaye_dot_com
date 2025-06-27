/**
 * Cache tag constants for the applicant detail section
 * These are used for on-demand cache invalidation
 */

export const APPLICANT_DETAIL_CACHE_TAGS = {
  // Application-specific tags
  application: (id: string) => `application-${id}`,
  applicationDetail: (id: string) => `application-detail-${id}`,
  applicationEmail: (id: string) => `application-email-${id}`,
  
  // Status update tags
  applicationStatus: (id: string) => `application-status-${id}`,
  
  // Notes tags
  applicationNotes: (id: string) => `application-notes-${id}`,
  
  // Interview tags
  applicationInterview: (id: string) => `application-interview-${id}`,
} as const