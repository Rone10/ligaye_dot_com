import type { 
  Job, Location, EmployerProfile, Industry, Skill,
  jobTypeEnum, workLocationEnum, experienceLevelEnum, 
  salaryFrequencyEnum, applicationMethodEnum, scheduleTypeEnum,
  jobStatusEnum
} from '@/lib/db/schema';
import type { SortOption } from './job-filter-parsers';

// Filter state shape
export interface JobFilters {
  search: string | null;
  locationId: string | null;
  jobType: typeof jobTypeEnum.enumValues[number] | null;
  workLocation: typeof workLocationEnum.enumValues[number] | null;
  experienceLevel: typeof experienceLevelEnum.enumValues[number] | null;
  salaryMin: number | null;
  salaryMax: number | null;
  industryId: string | null;
  sortBy?: SortOption;
}

// Pagination state
export interface PaginationState {
  page: number;
  pageSize: number;
}

// Jobs list item with joined data needed for display
export interface JobListItem {
  id: string;
  title: string;
  companyName: string | null;
  companyLogoUrl: string | null;
  locationName: string | null;
  workLocation: typeof workLocationEnum.enumValues[number];
  jobType: typeof jobTypeEnum.enumValues[number];
  salaryRangeMin: number | null;
  salaryRangeMax: number | null;
  salaryCurrency: string;
  salaryFrequency: typeof salaryFrequencyEnum.enumValues[number] | null;
  salaryDisplayType: string;
  publishedAt: Date | null;
  slug: string | null;
}

// Result type for getFilteredJobs query
export interface JobsQueryResult {
  jobs: JobListItem[];
  totalCount: number;
  pageCount: number;
}

// Simple types for related entities
export interface SimpleSkill {
  id: string;
  name: string;
}

export interface SimpleIndustry {
  id: string;
  name: string;
}

// Comprehensive job detail with all related information
export interface JobDetail {
  // Job fields
  id: string;
  title: string;
  description: string;
  jobType: typeof jobTypeEnum.enumValues[number];
  companyId: string;
  locationId: string | null;
  workLocation: typeof workLocationEnum.enumValues[number];
  experienceLevel: typeof experienceLevelEnum.enumValues[number] | null;
  salaryRangeMin: number | null;
  salaryRangeMax: number | null;
  salaryCurrency: string;
  salaryFrequency: typeof salaryFrequencyEnum.enumValues[number] | null;
  salaryDisplayType: string;
  applicationMethod: typeof applicationMethodEnum.enumValues[number];
  applicationEmail: string | null;
  applicationUrl: string | null;
  publishedAt: Date | null;
  expiresAt: Date;
  status: typeof jobStatusEnum.enumValues[number];
  slug: string | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Additional fields
  jobLanguage?: string | null;
  numberOfOpenings?: number | null;
  displayAddress?: boolean;
  educationRequirements?: string;
  experienceRequirements?: string;
  languageRequirements?: string[] | null;
  languageTrainingProvided?: boolean;
  schedule?: (typeof scheduleTypeEnum.enumValues[number])[] | null;
  expectedHours?: number | null;
  hoursType?: string | null;
  contractLength?: number | null;
  plannedStartDate?: Date | null;
  supplementalPay?: string[] | null;
  benefits?: string[] | null;
  applicationInstructions?: string | null;
  resumeRequired?: boolean;
  allowCandidateContact?: boolean;
  applicationDeadline?: Date | null;
  
  // Related entities
  company: EmployerProfile;
  location: Location | null;
  skills: SimpleSkill[];
  industries: SimpleIndustry[];
} 