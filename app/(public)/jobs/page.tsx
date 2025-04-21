import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { 
  getFilteredJobs, 
  getLocationsForFilters, 
  getIndustriesForFilters,
  getSavedJobIdsForUser
} from './_queries';
import { createLoader } from 'nuqs/server';
import { jobFiltersParsers, jobFiltersUrlKeys } from './_utils/job-filter-parsers';
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

const loadJobFilters = createLoader(jobFiltersParsers, { urlKeys: jobFiltersUrlKeys });

export default async function JobsPage({ searchParams }: PageProps) {
  const awaitedSearchParams = await searchParams;
  const filters = await loadJobFilters(awaitedSearchParams);
  
  console.log("[Debug] filters.jobType from loader:", filters.jobType);
  
  const locations = await getLocationsForFilters();
  const industries = await getIndustriesForFilters();
  
  const queryFilters: JobFiltersType = {
    search: filters.search || null,
    locationId: filters.locationId === 'all' ? null : filters.locationId,
    jobType: filters.jobType === 'all' ? null : filters.jobType as typeof jobTypeEnum.enumValues[number] | null,
    workLocation: filters.workLocation === 'all' ? null : filters.workLocation as typeof workLocationEnum.enumValues[number] | null,
    experienceLevel: filters.experienceLevel === 'all' ? null : filters.experienceLevel as typeof experienceLevelEnum.enumValues[number] | null,
    salaryMin: filters.salaryMin || null,
    salaryMax: filters.salaryMax || null,
    industryId: filters.industryId === 'all' ? null : filters.industryId,
    sortBy: filters.sortBy
  };
  
  console.log("[Debug] queryFilters.jobType being sent to query:", queryFilters.jobType);
  
  const page = filters.page;
  const pageSize = filters.pageSize;
  
  console.log("Applied filters (loader):", queryFilters);
  console.log("Raw searchParams (awaited):", awaitedSearchParams);
  
  const { jobs, totalCount, pageCount } = await getFilteredJobs(
    queryFilters,
    { page, pageSize }
  );
  
  if (page > pageCount && pageCount > 0) {
    notFound();
  }
  
  const user = await getUser();
  const savedJobIds = user ? await getSavedJobIdsForUser(user.id) : [];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e9efff] to-[#f4f7ff]">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 text-[#1a1e2d] text-center">Find Your Perfect Job</h1>
        
        <Suspense fallback={<div className="bg-[rgba(255,255,255,0.7)] backdrop-blur-[10px] border border-[rgba(255,255,255,0.3)] rounded-[16px] p-6 mb-8 shadow-[0_8px_32px_rgba(31,38,135,0.1)] max-w-3xl mx-auto">Loading filter options...</div>}>
          <JobFilters 
            locations={locations} 
            industries={industries} 
          />
        </Suspense>
        
        <div className="mt-10">
          <Suspense 
            fallback={
              <div className="bg-[rgba(255,255,255,0.7)] backdrop-blur-[10px] border border-[rgba(255,255,255,0.3)] rounded-[16px] p-6 shadow-[0_8px_32px_rgba(31,38,135,0.1)] max-w-3xl mx-auto">Loading jobs...</div>
            }
          >
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
    </div>
  );
} 