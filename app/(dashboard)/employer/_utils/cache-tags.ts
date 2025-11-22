/**
 * Cache tags for employer dashboard data so we can invalidate per employer.
 */
export const EMPLOYER_DASHBOARD_CACHE_TAGS = {
  stats: (companyId: string) => `employer-dashboard-stats-${companyId}`,
  recentJobs: (companyId: string) => `employer-dashboard-recent-jobs-${companyId}`,
  recentApplications: (companyId: string) => `employer-dashboard-recent-applications-${companyId}`,
} as const;
