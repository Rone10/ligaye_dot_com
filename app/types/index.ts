export type JobType = 'Full-Time' | 'Part-Time' | 'Contract' | 'Internship';
export type WorkLocation = 'Remote' | 'Hybrid' | 'On-site';
export type ExperienceLevel = 'Entry' | 'Mid' | 'Senior';

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  type: JobType;
  workLocation: WorkLocation;
  experienceLevel: ExperienceLevel;
  description: string;
  skills: string[];
  salaryRange: {
    min: number;
    max: number;
  };
  postedDate: Date;
}

export interface SearchFilters {
  jobType: JobType[];
  workLocation: WorkLocation[];
  experienceLevel: ExperienceLevel[];
  salaryRange: {
    min: number;
    max: number;
  };
  datePosted: string;
}