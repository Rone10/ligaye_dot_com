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
  JobSearchFilters, 
  JobListWithSaving,
} from './_components';
import type { JobFilters as JobFiltersType } from './_utils/types';
import Navbar from '@/components/Navbar';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const loadJobFilters = createLoader(jobFiltersParsers, { urlKeys: jobFiltersUrlKeys });

export default async function JobsPage({ searchParams }: PageProps) {
  const awaitedSearchParams = await searchParams;
  const filters = await loadJobFilters(awaitedSearchParams);
  
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
  
  const page = filters.page;
  const pageSize = filters.pageSize;
  
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
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--bg-gradient-from))] to-[hsl(var(--bg-gradient-to))]">
      {/* <Navbar user={user} /> */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-theme-dark text-center">Find Your Perfect Job</h1>
        
        {/* Grid Layout for desktop, single column for mobile */}
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 ">
          {/* Filter Sidebar - Desktop shows as sidebar, mobile uses slide-out */}
          <Suspense fallback={<div className="bg-[rgba(255,255,255,0.7)] backdrop-blur-[10px] border border-[rgba(255,255,255,0.3)] rounded-[16px] p-6 mb-8 shadow-[0_8px_32px_rgba(31,38,135,0.1)] h-[300px] flex items-center justify-center">Loading filter options...</div>}>
            <JobSearchFilters 
              locations={locations} 
              industries={industries}
            />
          </Suspense>
          
          {/* Job Listings */}
          <div>
            <Suspense 
              fallback={
                <div className="bg-[rgba(255,255,255,0.7)] backdrop-blur-[10px] border border-[rgba(255,255,255,0.3)] rounded-[16px] p-6 shadow-[0_8px_32px_rgba(31,38,135,0.1)] flex items-center justify-center h-[300px]">Loading jobs...</div>
              }
            >
              <div className="bg-[rgba(255,255,255,0.7)] backdrop-blur-[10px] border border-[rgba(255,255,255,0.3)] rounded-[16px] p-6 shadow-[0_8px_32px_rgba(31,38,135,0.1)]">
                <JobListWithSaving 
                  jobs={jobs}
                  totalCount={totalCount}
                  currentPage={page}
                  pageCount={pageCount}
                  savedJobIds={savedJobIds}
                />
              </div>
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
} 