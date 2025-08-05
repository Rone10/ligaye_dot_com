import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { 
  getFilteredJobs, 
  getIndustriesForFilters,
  getSavedJobIdsForUser
} from './_queries';
import { createLoader } from 'nuqs/server';
import { jobFiltersParsers, jobFiltersUrlKeys } from './_utils/job-filter-parsers';
import { jobTypeEnum, workLocationEnum, experienceLevelEnum } from '@/lib/db/schema';
import { getCachedUser } from '@/lib/supabase/server';
import { 
  JobSearchFilters, 
  JobListWithSaving,
} from './_components';
import type { JobFilters as JobFiltersType } from './_utils/types';
import { generateSEOMetadata } from '@/lib/seo/metadata';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const loadJobFilters = createLoader(jobFiltersParsers, { urlKeys: jobFiltersUrlKeys });

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const awaitedSearchParams = await searchParams;
  const filters = await loadJobFilters(awaitedSearchParams);
  
  // Build dynamic title and description based on filters
  const titleParts = ['Jobs'];
  const descParts = ['Find your next career opportunity'];
  
  if (filters.search) {
    titleParts.push(`for "${filters.search}"`);
    descParts.push(`matching "${filters.search}"`);
  }
  
  if (filters.jobType && filters.jobType !== 'all') {
    const jobTypeFormatted = filters.jobType.replace(/_/g, ' ').toLowerCase();
    titleParts.push(jobTypeFormatted);
    descParts.push(`- ${jobTypeFormatted} positions`);
  }
  
  if (filters.experienceLevel && filters.experienceLevel !== 'all') {
    titleParts.push(`(${filters.experienceLevel} level)`);
  }
  
  titleParts.push('in Gambia');
  descParts.push('in Gambia. Browse thousands of job openings from top employers.');
  
  const title = titleParts.join(' ');
  const description = descParts.join(' ');
  
  return generateSEOMetadata({
    title,
    description,
    path: '/jobs',
    keywords: [
      'jobs in Gambia',
      'Gambian employment',
      'careers Gambia',
      filters.search || '',
      filters.jobType || '',
    ].filter(Boolean),
  });
}

export default async function JobsPage({ searchParams }: PageProps) {
  const awaitedSearchParams = await searchParams;
  const filters = await loadJobFilters(awaitedSearchParams);

  // OPTIMIZED: Wave 1 - Independent data that can be fetched in parallel
  const [industries, user] = await Promise.all([
    getIndustriesForFilters(), // Filter options are independent
    getCachedUser() // User authentication is independent
  ]);
  
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

  // OPTIMIZED: Wave 2 - Data that can be fetched in parallel, with user-conditional logic
  const [jobsResult, savedJobIds] = await Promise.all([
    getFilteredJobs(queryFilters, { page, pageSize }), // Jobs are independent of user
    user ? getSavedJobIdsForUser(user.id) : Promise.resolve([]) // Only fetch if user exists
  ]);

  const { jobs, totalCount, pageCount } = jobsResult;
  
  if (page > pageCount && pageCount > 0) {
    notFound();
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--bg-gradient-from))] to-[hsl(var(--bg-gradient-to))]">
      {/* <Navbar user={user} /> */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-theme-dark text-center">Find Your Perfect Job</h1>
        
        {/* Grid Layout for desktop, single column for mobile */}
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 ">
          {/* Filter Sidebar - Desktop shows as sidebar, mobile uses slide-out */}
          <Suspense fallback={<div className=" backdrop-blur-[10px] border border-[rgba(255,255,255,0.3)] rounded-[16px] p-6 mb-8 shadow-[0_8px_32px_rgba(31,38,135,0.1)] h-[300px] flex items-center justify-center">Loading filter options...</div>}>
            <JobSearchFilters 
              industries={industries}
            />
          </Suspense>
          
          {/* Job Listings */}
          <div>
            <Suspense 
              fallback={
                <div className=" backdrop-blur-[10px] border border-[rgba(255,255,255,0.3)] rounded-[16px] p-6 shadow-[0_8px_32px_rgba(31,38,135,0.1)] flex items-center justify-center h-[300px]">Loading jobs...</div>
              }
            >
              <div className=" backdrop-blur-[10px] border border-[rgba(255,255,255,0.3)] rounded-[16px] p-6 shadow-[0_8px_32px_rgba(31,38,135,0.1)]">
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