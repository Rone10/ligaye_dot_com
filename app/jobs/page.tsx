import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { 
  getFilteredJobs, 
  getLocationsForFilters, 
  getIndustriesForFilters,
  getSavedJobIdsForUser
} from './_queries';
import { createLoader } from 'nuqs/server';
import { jobFiltersParsers, jobFiltersUrlKeys } from './_hooks/useJobFilters';
import { jobTypeEnum, workLocationEnum, experienceLevelEnum } from '@/lib/db/schema';
import { getUser } from '@/lib/supabase/server';
import { 
  JobFilters, 
  JobListWithSaving,
} from './_components';
import type { JobFilters as JobFiltersType } from './_utils/types';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Create server-side loader for URL state parsing
const loadJobFilters = createLoader(jobFiltersParsers, { urlKeys: jobFiltersUrlKeys });

export default async function JobsPage({ searchParams }: PageProps) {
  // Load URL params with the loader
  const filters = await loadJobFilters(searchParams);
  
  // Get filter options for dropdowns
  const locations = await getLocationsForFilters();
  const industries = await getIndustriesForFilters();
  
  // Transform filter values for DB query
  const queryFilters: JobFiltersType = {
    search: filters.search || null,
    locationId: filters.locationId || null,
    jobType: filters.jobType as typeof jobTypeEnum.enumValues[number] | null || null,
    workLocation: filters.workLocation as typeof workLocationEnum.enumValues[number] | null || null,
    experienceLevel: filters.experienceLevel as typeof experienceLevelEnum.enumValues[number] | null || null,
    salaryMin: filters.salaryMin || null,
    salaryMax: filters.salaryMax || null,
    industryId: filters.industryId || null
  };
  
  // Get pagination values
  const page = filters.page;
  const pageSize = filters.pageSize;
  
  // Fetch jobs with filters
  const { jobs, totalCount, pageCount } = await getFilteredJobs(
    queryFilters,
    { page, pageSize }
  );
  
  if (page > pageCount && pageCount > 0) {
    // If requested page exceeds available pages, redirect to last page
    notFound();
  }
  
  // Get current user and their saved jobs
  const user = await getUser();
  const savedJobIds = user ? await getSavedJobIdsForUser(user.id) : [];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Find Your Perfect Job</h1>
      
      <Suspense fallback={<div className="bg-white/70 backdrop-blur-md border border-gray-200 rounded-lg p-6 mb-8">Loading filter options...</div>}>
        <JobFilters 
          locations={locations} 
          industries={industries} 
        />
      </Suspense>
      
      <div className="mt-8">
        <Suspense fallback={<div className="bg-white/70 backdrop-blur-md border border-gray-200 rounded-lg p-6">Loading jobs...</div>}>
          <JobListWithSaving 
            jobs={jobs}
            totalCount={totalCount}
            currentPage={page}
            pageCount={pageCount}
            savedJobIds={savedJobIds}
          />
        </Suspense>
      </div>
    </div>
  );
} 