// Cache tags for granular invalidation
export const CACHE_TAGS = {
  locations: 'locations',
  skills: 'skills',
  industries: 'industries',
  employerProfile: (userId: string) => `employer-profile-${userId}`,
  jobs: 'jobs',
  employerJobs: 'employer-jobs',
} as const