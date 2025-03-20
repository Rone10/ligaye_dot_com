// Company sizes
export const companySizes = ['1-10', '11-50', '51-200', '201-500', '500+'];

// Experience levels
export const experienceLevels = ['Entry', 'Junior', 'Mid-Level', 'Senior', 'Director', 'Executive'];

// Job types
export const jobTypes = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'TEMPORARY', 'INTERNSHIP'];

// Work locations
export const workLocations = ['ONSITE', 'REMOTE', 'HYBRID'];

// Salary frequencies
export const salaryFrequencies = ['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'];

// Application status map for display
export const applicationStatusMap: Record<string, string> = {
  PENDING: "Pending",
  REVIEWING: "Under Review",
  SHORTLISTED: "Shortlisted",
  INTERVIEW_SCHEDULED: "Interview Scheduled",
  INTERVIEWED: "Interviewed",
  OFFER_EXTENDED: "Offer Extended",
  HIRED: "Hired",
  REJECTED: "Rejected"
}; 