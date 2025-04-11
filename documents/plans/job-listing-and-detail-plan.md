# Job Listing and Detail Feature Implementation Plan

## 1. Introduction and Overview

This document outlines the implementation plan for the job listing and detail features for Ligaye.com, following the project's Vertical Slice Architecture (VSA) and established conventions. These features will allow users to search, filter, and view detailed information about available job postings.

### 1.1 Feature Summary

**Job Listing Page (`/jobs`)**
- Display a paginated list of active job postings
- Implement search functionality by keywords
- Provide filtering by various job attributes (location, type, experience level, etc.)
- Utilize URL-based state management with nuqs for filters
- Implement responsive UI with glassmorphic design

**Job Detail Page (`/jobs/[id]`)**
- Display comprehensive information about a specific job
- Show company details, job requirements, and application instructions
- Provide application action button 
- Implement responsive layout optimized for all devices

### 1.2 Technical Approach

- Follow strict VSA with route-segmented folders (`app/jobs/` and `app/jobs/[id]/`)
- Keep data-fetching logic in slice-specific `_queries.ts` files
- Implement client-side filter state using nuqs for URL state management
- Use Shadcn UI components with styling adhering to the style guide
- Create responsive layouts with mobile-first approach
- Implement proper data filtering for active jobs only
- Handle error states and loading experiences

## 2. File Structure and Architecture

### 2.1 Job Listing Page Structure (`app/jobs/`)

```
app/
└── jobs/
    ├── page.tsx               # Main page component (Server Component with Client Component wrapper)
    ├── loading.tsx            # Loading state UI
    ├── error.tsx              # Error handling UI
    ├── _components/           # Components specific to jobs listing
    │   ├── JobFilters.tsx     # Search and filter controls (Client Component)
    │   ├── JobList.tsx        # Container for job results
    │   ├── JobCard.tsx        # Individual job card component
    │   ├── JobPagination.tsx  # Pagination controls
    │   └── NoResults.tsx      # Empty state when no jobs match filters
    ├── _hooks/                # Custom hooks for job listing
    │   ├── useJobFilters.ts   # Hook for managing filter state with nuqs
    │   └── index.ts           # Re-export hooks
    ├── _utils/                # Utilities specific to job listing
    │   ├── constants.ts       # Filter options, enums, display values
    │   ├── types.ts           # Types for filters and job list data
    │   └── filters.ts         # Filter utility functions
    └── _queries.ts            # Database queries for job listing
```

### 2.2 Job Detail Page Structure (`app/jobs/[id]/`)

```
app/
└── jobs/
    └── [id]/
        ├── page.tsx           # Job detail page (Server Component)
        ├── loading.tsx        # Loading state UI
        ├── error.tsx          # Error handling UI
        ├── not-found.tsx      # Not found state for invalid job IDs
        ├── _components/       # Components specific to job detail
        │   ├── JobHeader.tsx  # Title, company, and key details
        │   ├── JobDescription.tsx   # Job description section
        │   ├── JobRequirements.tsx  # Skills and experience requirements
        │   ├── JobDetails.tsx       # Additional job details (salary, location, etc)
        │   ├── CompanyInfo.tsx      # Employer information section
        │   ├── ApplyButton.tsx      # Application action button/section
        │   └── RelatedJobs.tsx      # Optional: Similar jobs section
        ├── _utils/            # Utilities specific to job detail
        │   └── formatters.ts  # Utility functions for formatting job data
        └── _queries.ts        # Database queries for job detail
```

## 3. Data Model and State Management

### 3.1 Key Database Tables

Based on the schema in `lib/db/schema.ts`, the primary tables used in these features are:

- `jobs`: Core job posting information
- `employerProfiles`: Company information related to the job
- `locations`: Structured location data
- `industries` and `jobIndustries`: Industry categorization
- `skills` and `jobSkills`: Skills required for the job

### 3.2 Types and Interfaces

**Job Listing Page Types (`app/jobs/_utils/types.ts`)**

```typescript
import type { 
  Job, Location, EmployerProfile, Industry, Skill,
  jobTypeEnum, workLocationEnum, experienceLevelEnum, 
  salaryFrequencyEnum
} from '@/lib/db/schema';

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
  companyName: string;
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
```

**Job Detail Types (Inferred from schema + custom fields)**

```typescript
import type {
  Job, EmployerProfile, Location, Skill, Industry
} from '@/lib/db/schema';

// Comprehensive job detail with all related information
export interface JobDetail extends Job {
  company: EmployerProfile & {
    location: Location | null;
    industry: Industry | null;
  };
  location: Location | null;
  skills: Skill[];
  industries: Industry[];
}
```

### 3.3 URL State Management with nuqs

**Filter State Configuration (`app/jobs/_hooks/useJobFilters.ts`)**

```typescript
import { 
  parseAsString, 
  parseAsInteger, 
  parseAsStringLiteral, 
  useQueryStates 
} from 'nuqs';
import type { UrlKeys } from 'nuqs/server';
import { 
  jobTypeEnum, 
  workLocationEnum, 
  experienceLevelEnum 
} from '@/lib/db/schema';

// Define parsers for URL state
export const jobFiltersParsers = {
  search: parseAsString.withDefault(''),
  locationId: parseAsString,
  jobType: parseAsStringLiteral(jobTypeEnum.enumValues as readonly string[]),
  workLocation: parseAsStringLiteral(workLocationEnum.enumValues as readonly string[]),
  experienceLevel: parseAsStringLiteral(experienceLevelEnum.enumValues as readonly string[]),
  salaryMin: parseAsInteger,
  salaryMax: parseAsInteger,
  industryId: parseAsString,
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(10)
};

// Define URL keys for shorter params
export const jobFiltersUrlKeys: UrlKeys<typeof jobFiltersParsers> = {
  search: 'q',
  locationId: 'loc',
  jobType: 'type',
  workLocation: 'wloc',
  experienceLevel: 'exp',
  salaryMin: 'smin',
  salaryMax: 'smax',
  industryId: 'ind',
  page: 'p',
  pageSize: 'ps'
};

// Custom hook for job filters
export function useJobFilters() {
  const [filters, setFilters] = useQueryStates(jobFiltersParsers, {
    urlKeys: jobFiltersUrlKeys,
    history: 'push', // Add to browser history for back button support
    shallow: false   // Trigger server component re-fetch when filters change
  });

  const resetFilters = () => {
    setFilters({
      search: '',
      locationId: null,
      jobType: null,
      workLocation: null,
      experienceLevel: null,
      salaryMin: null,
      salaryMax: null,
      industryId: null,
      page: 1
    });
  };

  return {
    filters,
    setFilters,
    resetFilters
  };
}
```

## 4. Database Queries Implementation

### 4.1 Job Listing Queries (`app/jobs/_queries.ts`)

```typescript
import { sql, and, eq, gte, lte, like, or, inArray } from 'drizzle-orm';
import { db } from '@/lib/db';
import { 
  jobs, 
  employerProfiles, 
  locations, 
  jobSkills, 
  skills,
  jobIndustries,
  industries
} from '@/lib/db/schema';
import type { JobFilters, JobsQueryResult } from './_utils/types';

/**
 * Get a filtered and paginated list of jobs based on search criteria
 */
export async function getFilteredJobs(
  filters: JobFilters,
  pagination: { page: number; pageSize: number }
): Promise<JobsQueryResult> {
  const { 
    search, locationId, jobType, workLocation, 
    experienceLevel, salaryMin, salaryMax, industryId 
  } = filters;
  
  const { page, pageSize } = pagination;
  const offset = (page - 1) * pageSize;
  
  // Base condition: only active, non-expired jobs
  const baseConditions = and(
    eq(jobs.status, 'ACTIVE'),
    gte(jobs.expiresAt, new Date())
  );
  
  // Build additional filter conditions
  const conditions = [];
  
  // Text search condition (search across multiple fields)
  if (search && search.trim() !== '') {
    const searchTerm = `%${search.trim()}%`;
    conditions.push(
      or(
        like(jobs.title, searchTerm),
        like(jobs.description, searchTerm),
        like(employerProfiles.companyName, searchTerm)
      )
    );
  }
  
  // Apply filter conditions if provided
  if (locationId) conditions.push(eq(jobs.locationId, locationId));
  if (jobType) conditions.push(eq(jobs.jobType, jobType));
  if (workLocation) conditions.push(eq(jobs.workLocation, workLocation));
  if (experienceLevel) conditions.push(eq(jobs.experienceLevel, experienceLevel));
  if (salaryMin) conditions.push(gte(jobs.salaryRangeMin, salaryMin));
  if (salaryMax) conditions.push(lte(jobs.salaryRangeMax, salaryMax));
  
  // Full filter condition
  const whereCondition = conditions.length > 0
    ? and(baseConditions, ...conditions)
    : baseConditions;
  
  // Industry filter requires a subquery/join approach
  const jobIdsInIndustry = industryId 
    ? (await db()
        .select({ jobId: jobIndustries.jobId })
        .from(jobIndustries)
        .where(eq(jobIndustries.industryId, industryId)))
        .map(row => row.jobId)
    : null;
    
  // Apply industry filter if needed
  const finalWhereCondition = jobIdsInIndustry
    ? and(whereCondition, inArray(jobs.id, jobIdsInIndustry))
    : whereCondition;
    
  // Query jobs with pagination
  const jobsQuery = await db()
    .select({
      id: jobs.id,
      title: jobs.title,
      companyName: employerProfiles.companyName,
      companyLogoUrl: employerProfiles.companyLogoUrl,
      locationName: locations.city,
      workLocation: jobs.workLocation,
      jobType: jobs.jobType,
      salaryRangeMin: jobs.salaryRangeMin,
      salaryRangeMax: jobs.salaryRangeMax,
      salaryCurrency: jobs.salaryCurrency,
      salaryFrequency: jobs.salaryFrequency,
      salaryDisplayType: jobs.salaryDisplayType,
      publishedAt: jobs.publishedAt,
      slug: jobs.slug
    })
    .from(jobs)
    .leftJoin(employerProfiles, eq(jobs.companyId, employerProfiles.id))
    .leftJoin(locations, eq(jobs.locationId, locations.id))
    .where(finalWhereCondition)
    .orderBy(jobs.publishedAt)
    .limit(pageSize)
    .offset(offset);
    
  // Count total matching jobs for pagination
  const countResult = await db()
    .select({ count: sql<number>`count(*)` })
    .from(jobs)
    .leftJoin(employerProfiles, eq(jobs.companyId, employerProfiles.id))
    .leftJoin(locations, eq(jobs.locationId, locations.id))
    .where(finalWhereCondition);
    
  const totalCount = countResult[0]?.count || 0;
  const pageCount = Math.ceil(totalCount / pageSize);
  
  return {
    jobs: jobsQuery,
    totalCount,
    pageCount
  };
}

/**
 * Get list of all locations for filter options
 */
export async function getLocationsForFilters() {
  return db()
    .select({
      id: locations.id,
      region: locations.region,
      district: locations.district,
      city: locations.city
    })
    .from(locations)
    .where(eq(locations.deleted, false))
    .orderBy(locations.region, locations.city);
}

/**
 * Get list of all industries for filter options
 */
export async function getIndustriesForFilters() {
  return db()
    .select({
      id: industries.id,
      name: industries.name
    })
    .from(industries)
    .where(eq(industries.deleted, false))
    .orderBy(industries.name);
}
```

### 4.2 Job Detail Queries (`app/jobs/[id]/_queries.ts`)

```typescript
import { eq, and, gte } from 'drizzle-orm';
import { db } from '@/lib/db';
import { 
  jobs, 
  employerProfiles, 
  locations, 
  industries,
  jobSkills,
  skills,
  jobIndustries
} from '@/lib/db/schema';
import { notFound } from 'next/navigation';
import type { JobDetail } from '../_utils/types';

/**
 * Get detailed job information by ID
 */
export async function getJobById(jobId: string): Promise<JobDetail> {
  // Get the job with basic company and location information
  const jobQuery = await db()
    .select()
    .from(jobs)
    .where(
      and(
        eq(jobs.id, jobId),
        eq(jobs.status, 'ACTIVE'),
        gte(jobs.expiresAt, new Date())
      )
    )
    .leftJoin(employerProfiles, eq(jobs.companyId, employerProfiles.id))
    .leftJoin(locations, eq(jobs.locationId, locations.id));
    
  if (jobQuery.length === 0) {
    notFound();
  }
  
  const jobResult = jobQuery[0];
  
  // Get company location and industry
  let companyLocation = null;
  let companyIndustry = null;
  
  if (jobResult.employer_profiles?.locationId) {
    const companyLocationQuery = await db()
      .select()
      .from(locations)
      .where(eq(locations.id, jobResult.employer_profiles.locationId));
    
    companyLocation = companyLocationQuery[0] || null;
  }
  
  if (jobResult.employer_profiles?.industryId) {
    const companyIndustryQuery = await db()
      .select()
      .from(industries)
      .where(eq(industries.id, jobResult.employer_profiles.industryId));
      
    companyIndustry = companyIndustryQuery[0] || null;
  }
  
  // Get job skills
  const jobSkillsQuery = await db()
    .select({
      id: skills.id,
      name: skills.name
    })
    .from(jobSkills)
    .leftJoin(skills, eq(jobSkills.skillId, skills.id))
    .where(eq(jobSkills.jobId, jobId));
    
  // Get job industries
  const jobIndustriesQuery = await db()
    .select({
      id: industries.id,
      name: industries.name
    })
    .from(jobIndustries)
    .leftJoin(industries, eq(jobIndustries.industryId, industries.id))
    .where(eq(jobIndustries.jobId, jobId));
  
  // Restructure data into the expected format
  const jobDetail: JobDetail = {
    ...jobResult.jobs,
    company: {
      ...jobResult.employer_profiles,
      location: companyLocation,
      industry: companyIndustry
    },
    location: jobResult.locations,
    skills: jobSkillsQuery,
    industries: jobIndustriesQuery
  };

  return jobDetail;
}

/**
 * Get similar/related jobs (same company or industry)
 */
export async function getRelatedJobs(jobId: string, limit: number = 3) {
  const currentJob = await db()
    .select({
      companyId: jobs.companyId
    })
    .from(jobs)
    .where(eq(jobs.id, jobId));
    
  if (currentJob.length === 0) {
    return [];
  }
  
  const companyId = currentJob[0].companyId;
  
  // Get other jobs from the same company
  return db()
    .select({
      id: jobs.id,
      title: jobs.title,
      jobType: jobs.jobType,
      locationName: locations.city,
      slug: jobs.slug
    })
    .from(jobs)
    .leftJoin(locations, eq(jobs.locationId, locations.id))
    .where(
      and(
        eq(jobs.companyId, companyId),
        eq(jobs.status, 'ACTIVE'),
        gte(jobs.expiresAt, new Date())
      )
    )
    .limit(limit);
}
```

## 5. Component Implementation

### 5.1 Job Listing Page Components

**Main Page Component (`app/jobs/page.tsx`)**

```tsx
import React from 'react';
import { Suspense } from 'react';
import { getLocationsForFilters, getIndustriesForFilters, getFilteredJobs } from './_queries';
import { createLoader } from 'nuqs/server';
import { jobFiltersParsers, jobFiltersUrlKeys } from './_hooks/useJobFilters';
import JobFilters from './_components/JobFilters';
import JobList from './_components/JobList';
import JobPagination from './_components/JobPagination';
import { Card } from '@/components/ui/card';

// Server-side loader for search params
const loadJobFilters = createLoader(jobFiltersParsers, { urlKeys: jobFiltersUrlKeys });

interface PageProps {
  searchParams: Promise<URLSearchParams> | URLSearchParams;
}

export default async function JobsPage({ searchParams }: PageProps) {
  // Parse search params into filters
  const filters = await loadJobFilters(searchParams);
  
  // Fetch filter options
  const [locations, industries] = await Promise.all([
    getLocationsForFilters(),
    getIndustriesForFilters()
  ]);
  
  // Fetch filtered jobs with pagination
  const { jobs, totalCount, pageCount } = await getFilteredJobs(
    {
      search: filters.search,
      locationId: filters.locationId,
      jobType: filters.jobType,
      workLocation: filters.workLocation,
      experienceLevel: filters.experienceLevel,
      salaryMin: filters.salaryMin,
      salaryMax: filters.salaryMax,
      industryId: filters.industryId
    },
    {
      page: filters.page,
      pageSize: filters.pageSize
    }
  );
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Find Your Perfect Job</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar with filters */}
        <div className="w-full md:w-1/3 lg:w-1/4">
          <Card className="p-4 bg-white/70 backdrop-blur-md border border-white/30 shadow-md">
            <JobFilters 
              locations={locations}
              industries={industries}
              initialFilters={filters}
            />
          </Card>
        </div>
        
        {/* Main content area */}
        <div className="w-full md:w-2/3 lg:w-3/4">
          <div className="mb-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {totalCount} job{totalCount !== 1 ? 's' : ''} found
            </p>
          </div>
          
          <Suspense fallback={<div>Loading jobs...</div>}>
            <JobList jobs={jobs} />
            
            {pageCount > 1 && (
              <div className="mt-6">
                <JobPagination 
                  currentPage={filters.page} 
                  totalPages={pageCount}
                />
              </div>
            )}
          </Suspense>
        </div>
      </div>
    </div>
  );
}
```

**Job Filters Component (`app/jobs/_components/JobFilters.tsx`)**

```tsx
'use client';

import React from 'react';
import { useJobFilters } from '../_hooks';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { 
  jobTypeOptions, 
  workLocationOptions,
  experienceLevelOptions,
  formatCurrency
} from '../_utils/constants';
import type { Location, Industry } from '@/lib/db/schema';
import { Search, X } from 'lucide-react';

interface JobFiltersProps {
  locations: Location[];
  industries: Industry[];
  initialFilters: ReturnType<typeof useJobFilters>['filters'];
}

export default function JobFilters({ 
  locations, 
  industries,
  initialFilters
}: JobFiltersProps) {
  const { filters, setFilters, resetFilters } = useJobFilters();
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value });
  };
  
  // Handle select changes
  const handleSelectChange = (value: string | null, field: string) => {
    setFilters({ [field]: value });
  };
  
  // Handle salary range changes
  const handleSalaryChange = (values: number[]) => {
    if (values.length === 2) {
      setFilters({
        salaryMin: values[0] || null,
        salaryMax: values[1] || null
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-2">Search</h3>
        <div className="relative">
          <Input
            placeholder="Job title, keywords, company..."
            value={filters.search || ''}
            onChange={handleSearchChange}
            className="pl-10"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
      </div>
      
      <div>
        <h3 className="font-semibold mb-2">Location</h3>
        <Select
          value={filters.locationId || ''}
          onValueChange={(value) => handleSelectChange(value === '' ? null : value, 'locationId')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All locations</SelectItem>
            {locations.map((location) => (
              <SelectItem key={location.id} value={location.id}>
                {location.city ? `${location.city}, ${location.region}` : location.region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <h3 className="font-semibold mb-2">Job Type</h3>
        <Select
          value={filters.jobType || ''}
          onValueChange={(value) => handleSelectChange(value === '' ? null : value, 'jobType')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select job type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All job types</SelectItem>
            {jobTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <h3 className="font-semibold mb-2">Work Location</h3>
        <Select
          value={filters.workLocation || ''}
          onValueChange={(value) => handleSelectChange(value === '' ? null : value, 'workLocation')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select work location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All work locations</SelectItem>
            {workLocationOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <h3 className="font-semibold mb-2">Experience Level</h3>
        <Select
          value={filters.experienceLevel || ''}
          onValueChange={(value) => handleSelectChange(value === '' ? null : value, 'experienceLevel')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select experience level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All experience levels</SelectItem>
            {experienceLevelOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <h3 className="font-semibold mb-2">Industry</h3>
        <Select
          value={filters.industryId || ''}
          onValueChange={(value) => handleSelectChange(value === '' ? null : value, 'industryId')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select industry" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All industries</SelectItem>
            {industries.map((industry) => (
              <SelectItem key={industry.id} value={industry.id}>
                {industry.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <h3 className="font-semibold mb-2">Salary Range (GMD)</h3>
        <Slider
          defaultValue={[filters.salaryMin || 0, filters.salaryMax || 100000]}
          min={0}
          max={100000}
          step={5000}
          onValueChange={handleSalaryChange}
          className="mt-6"
        />
        <div className="flex justify-between mt-2 text-sm">
          <span>{formatCurrency(filters.salaryMin || 0)}</span>
          <span>{formatCurrency(filters.salaryMax || 100000)}</span>
        </div>
      </div>
      
      <Button 
        variant="outline" 
        onClick={resetFilters}
        className="w-full mt-4 flex items-center justify-center"
      >
        <X className="h-4 w-4 mr-2" />
        Reset Filters
      </Button>
    </div>
  );
}
```

**Job Card Component (`app/jobs/_components/JobCard.tsx`)**

```tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistance } from 'date-fns';
import { Briefcase, MapPin, Clock } from 'lucide-react';
import type { JobListItem } from '../_utils/types';
import { 
  formatCurrency, 
  formatSalaryDisplay, 
  jobTypeLabels,
  workLocationLabels
} from '../_utils/constants';

interface JobCardProps {
  job: JobListItem;
}

export default function JobCard({ job }: JobCardProps) {
  // Format published date relative to now (e.g., "2 days ago")
  const publishedTimeAgo = job.publishedAt 
    ? formatDistance(new Date(job.publishedAt), new Date(), { addSuffix: true })
    : 'Recently';
    
  // Format location display
  const locationDisplay = job.locationName
    ? job.locationName
    : workLocationLabels[job.workLocation] || job.workLocation;
    
  // Format salary display
  const salaryDisplay = formatSalaryDisplay({
    min: job.salaryRangeMin,
    max: job.salaryRangeMax,
    currency: job.salaryCurrency,
    frequency: job.salaryFrequency,
    displayType: job.salaryDisplayType
  });
  
  return (
    <Link href={`/jobs/${job.id}`}>
      <Card className="mb-4 hover:shadow-lg transition-shadow duration-300 border border-white/30 bg-white/70 backdrop-blur-md hover:translate-y-[-2px]">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row items-start gap-4">
            {/* Company logo */}
            <div className="flex-shrink-0 w-16 h-16 relative bg-white rounded-md overflow-hidden flex items-center justify-center border border-gray-100">
              {job.companyLogoUrl ? (
                <Image 
                  src={job.companyLogoUrl}
                  alt={job.companyName}
                  fill
                  sizes="64px"
                  className="object-contain"
                />
              ) : (
                <Briefcase className="w-8 h-8 text-gray-400" />
              )}
            </div>
            
            {/* Job details */}
            <div className="flex-grow">
              <h3 className="text-lg font-semibold mb-1 text-primary-blue">{job.title}</h3>
              <p className="text-gray-700 mb-2">{job.companyName}</p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  {locationDisplay}
                </span>
                <span className="flex items-center text-sm text-gray-600">
                  <Briefcase className="h-4 w-4 mr-1" />
                  {jobTypeLabels[job.jobType] || job.jobType}
                </span>
                <span className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  {publishedTimeAgo}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-white/80">
                  {salaryDisplay}
                </Badge>
                <Badge variant="outline" className="bg-white/80">
                  {workLocationLabels[job.workLocation] || job.workLocation}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
```

### 5.2 Job Detail Page Components

**Job Detail Page Component (`app/jobs/[id]/page.tsx`)**

```tsx
import React from 'react';
import { getJobById, getRelatedJobs } from './_queries';
import { notFound } from 'next/navigation';
import { JobHeader } from './_components/JobHeader';
import { JobDescription } from './_components/JobDescription';
import { JobRequirements } from './_components/JobRequirements';
import { JobDetails } from './_components/JobDetails';
import { CompanyInfo } from './_components/CompanyInfo';
import { ApplyButton } from './_components/ApplyButton';
import { RelatedJobs } from './_components/RelatedJobs';
import { Card } from '@/components/ui/card';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: PageProps) {
  // Extract the job ID from params
  const { id } = await params;
  
  try {
    // Fetch job details and related jobs
    const [job, relatedJobs] = await Promise.all([
      getJobById(id),
      getRelatedJobs(id)
    ]);
    
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content (2/3 width on desktop) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job header section */}
            <Card className="p-6 bg-white/70 backdrop-blur-md border border-white/30 shadow-md">
              <JobHeader job={job} />
            </Card>
            
            {/* Job description section */}
            <Card className="p-6 bg-white/70 backdrop-blur-md border border-white/30 shadow-md">
              <JobDescription job={job} />
            </Card>
            
            {/* Job requirements section */}
            <Card className="p-6 bg-white/70 backdrop-blur-md border border-white/30 shadow-md">
              <JobRequirements job={job} />
            </Card>
            
            {/* Job details section */}
            <Card className="p-6 bg-white/70 backdrop-blur-md border border-white/30 shadow-md">
              <JobDetails job={job} />
            </Card>
          </div>
          
          {/* Sidebar (1/3 width on desktop) */}
          <div className="space-y-6">
            {/* Apply button card */}
            <Card className="p-6 bg-white/70 backdrop-blur-md border border-white/30 shadow-md">
              <ApplyButton job={job} />
            </Card>
            
            {/* Company info card */}
            <Card className="p-6 bg-white/70 backdrop-blur-md border border-white/30 shadow-md">
              <CompanyInfo company={job.company} />
            </Card>
            
            {/* Related jobs card */}
            {relatedJobs.length > 0 && (
              <Card className="p-6 bg-white/70 backdrop-blur-md border border-white/30 shadow-md">
                <RelatedJobs jobs={relatedJobs} />
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching job details:', error);
    notFound();
  }
}
```

**Job Header Component (`app/jobs/[id]/_components/JobHeader.tsx`)**

```tsx
import React from 'react';
import Image from 'next/image';
import { Briefcase, MapPin, Building, Clock } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { 
  formatSalaryDisplay, 
  jobTypeLabels,
  workLocationLabels
} from '../../_utils/constants';
import type { JobDetail } from '../../_utils/types';

interface JobHeaderProps {
  job: JobDetail;
}

export function JobHeader({ job }: JobHeaderProps) {
  // Format published date relative to now
  const publishedTimeAgo = job.publishedAt 
    ? formatDistance(new Date(job.publishedAt), new Date(), { addSuffix: true })
    : 'Recently';
    
  // Format location display
  const locationDisplay = job.location?.city
    ? `${job.location.city}, ${job.location.region}`
    : workLocationLabels[job.workLocation] || job.workLocation;
    
  // Format salary display
  const salaryDisplay = formatSalaryDisplay({
    min: job.salaryRangeMin,
    max: job.salaryRangeMax,
    currency: job.salaryCurrency,
    frequency: job.salaryFrequency,
    displayType: job.salaryDisplayType
  });
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        {/* Company logo */}
        <div className="flex-shrink-0 w-20 h-20 relative bg-white rounded-md overflow-hidden flex items-center justify-center border border-gray-100">
          {job.company?.companyLogoUrl ? (
            <Image 
              src={job.company.companyLogoUrl}
              alt={job.company.companyName}
              fill
              sizes="80px"
              className="object-contain"
            />
          ) : (
            <Building className="w-10 h-10 text-gray-400" />
          )}
        </div>
        
        {/* Title and company */}
        <div>
          <h1 className="text-2xl font-bold text-dark mb-1">{job.title}</h1>
          <p className="text-lg text-gray-700 mb-3">{job.company?.companyName}</p>
          
          <div className="flex flex-wrap gap-3 mb-4">
            <span className="flex items-center text-gray-600">
              <MapPin className="h-4 w-4 mr-1" />
              {locationDisplay}
            </span>
            <span className="flex items-center text-gray-600">
              <Briefcase className="h-4 w-4 mr-1" />
              {jobTypeLabels[job.jobType] || job.jobType}
            </span>
            <span className="flex items-center text-gray-600">
              <Clock className="h-4 w-4 mr-1" />
              {publishedTimeAgo}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-primary-blue text-white">
              {salaryDisplay}
            </Badge>
            <Badge variant="outline" className="bg-white/80">
              {workLocationLabels[job.workLocation] || job.workLocation}
            </Badge>
            {job.experienceLevel && (
              <Badge variant="outline" className="bg-white/80">
                {job.experienceLevel}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Apply Button Component (`app/jobs/[id]/_components/ApplyButton.tsx`)**

```tsx
'use client';

import React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { User, Clock } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { 
  applicationMethodLabels
} from '../../_utils/constants';
import type { JobDetail } from '../../_utils/types';

interface ApplyButtonProps {
  job: JobDetail;
}

export function ApplyButton({ job }: ApplyButtonProps) {
  const [isApplying, setIsApplying] = useState(false);
  
  // Format deadline if available
  const deadline = job.applicationDeadline
    ? formatDistance(new Date(job.applicationDeadline), new Date(), { addSuffix: true })
    : null;
    
  // Handle application based on application method
  const handleApply = () => {
    setIsApplying(true);
    
    switch (job.applicationMethod) {
      case 'EMAIL':
        if (job.applicationEmail) {
          window.location.href = `mailto:${job.applicationEmail}?subject=Application for ${job.title} position`;
        }
        break;
      case 'WEBSITE':
        if (job.applicationUrl) {
          window.open(job.applicationUrl, '_blank');
        }
        break;
      case 'PHONE':
        // Phone application would need a special handler or instructions
        break;
      case 'PLATFORM':
      default:
        // This would link to the application form or process
        // For now, we'll just simulate completion
        setTimeout(() => {
          setIsApplying(false);
          alert('Application feature coming soon!');
        }, 1000);
        break;
    }
  };
  
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Apply for this position</h3>
      
      <Button 
        className="w-full py-6 text-md"
        onClick={handleApply}
        disabled={isApplying}
      >
        {isApplying ? 'Processing...' : 'Apply Now'}
      </Button>
      
      <div className="text-sm text-gray-600 space-y-2">
        {job.applicationMethod && (
          <p>
            <span className="font-medium">Application Method:</span>{' '}
            {applicationMethodLabels[job.applicationMethod] || job.applicationMethod}
          </p>
        )}
        
        {deadline && (
          <p className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span className="font-medium">Deadline:</span> {deadline}
          </p>
        )}
        
        <p className="flex items-center">
          <User className="h-4 w-4 mr-1" />
          {job.numberOfOpenings > 1 
            ? `${job.numberOfOpenings} openings` 
            : '1 opening'}
        </p>
      </div>
      
      {job.applicationInstructions && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm">
          <p className="font-medium mb-1">Application Instructions:</p>
          <p>{job.applicationInstructions}</p>
        </div>
      )}
    </div>
  );
}
```

## 6. Implementation Strategy and Considerations

### 6.1 Implementation Order

1. **Set Up Basic Route Structure**
   - Create the necessary directory structure for both pages
   - Implement basic loading and error components

2. **Implement Core Data Layer**
   - Create the query functions in respective `_queries.ts` files
   - Set up types and constants

3. **Implement Job Listing Page**
   - Build out URL state management with nuqs
   - Implement filter components
   - Implement job list and card components
   - Add pagination logic

4. **Implement Job Detail Page**
   - Build out the job detail page structure
   - Implement the various detail components
   - Add application button functionality

5. **Polish and Optimize**
   - Add responsive adjustments for mobile
   - Implement better loading states
   - Test and fix edge cases

### 6.2 Styling Considerations

- Following the style guide, use glassmorphic effects for cards:
  - `bg-white/70` for background with 70% opacity
  - `backdrop-blur-md` for the frosted glass effect
  - `border border-white/30` for subtle borders
  - `shadow-md` for the specified shadow level

- Use the specified color palette:
  - Primary blue: `#4a6cfa`
  - Primary blue light: `#7b90ff`
  - Secondary green: `#05ce91`
  - Other neutrals as specified

- Implement proper elevation using the shadow system in the style guide

- Ensure responsive design following the breakpoints defined in the style guide

### 6.3 Performance Considerations

- Use Server Components where possible for initial data fetching
- Implement proper loading states with Suspense
- Optimize images with Next.js Image component
- Use client components only where necessary for interactivity

### 6.4 Potential Challenges

- **URL State Synchronization**: Ensuring filter state is properly reflected in the URL and preserved during navigation
- **Complex Database Queries**: Handling multiple joined tables efficiently
- **Mobile Responsiveness**: Ensuring the filter UI works well on small screens
- **Edge Cases**: Handling jobs with missing data (salary, location, etc.)

## 7. Conclusion

This implementation plan provides a comprehensive roadmap for building the job listing and detail features for Ligaye.com. By following the Vertical Slice Architecture and established project conventions, the implementation will be modular, maintainable, and aligned with the overall architecture.

The plan prioritizes:
- Clean separation of concerns
- Type safety
- Responsive design
- Performance optimization
- User experience

Each component and function has a clear, defined purpose and fits within the overall architecture. The use of nuqs for URL state management ensures that filter state is preserved during navigation and shareable via URL, enhancing the user experience.
