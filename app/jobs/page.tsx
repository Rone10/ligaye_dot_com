import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getFilteredJobs, getLocationsForFilters, getIndustriesForFilters } from './_queries';
import { createLoader } from 'nuqs/server';
import { jobFiltersParsers, jobFiltersUrlKeys } from './_hooks/useJobFilters';
import { jobTypeEnum, workLocationEnum, experienceLevelEnum } from '@/lib/db/schema';
import type { JobFilters } from './_utils/types';

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
  const queryFilters: JobFilters = {
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
    // This would be handled with a redirect in a real implementation
    notFound();
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Find Your Perfect Job</h1>
      
      <Suspense fallback={<div>Loading filter options...</div>}>
        {/* Placeholder for JobFilters component */}
        <div className="bg-white/70 backdrop-blur-md border border-gray-200 rounded-lg p-6 mb-8">
          <p>Filter UI will go here</p>
        </div>
      </Suspense>
      
      <div className="mb-4">
        <p className="text-gray-600">
          {totalCount} {totalCount === 1 ? 'job' : 'jobs'} found • Page {page} of {pageCount}
        </p>
      </div>
      
      <Suspense fallback={<div>Loading jobs...</div>}>
        {/* Job listing */}
        <div className="space-y-6">
          {jobs.length > 0 ? (
            jobs.map(job => (
              <div
                key={job.id}
                className="bg-white/70 backdrop-blur-md border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <h2 className="text-xl font-semibold text-blue-700">{job.title}</h2>
                <div className="mt-2 text-gray-700">{job.companyName}</div>
                <div className="mt-1 text-gray-600">{job.locationName || 'Remote'}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {job.jobType.replace('_', ' ')}
                  </span>
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {job.workLocation}
                  </span>
                </div>
                {/* More job details */}
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-gray-700">Published: {job.publishedAt?.toLocaleDateString()}</div>
                  <a 
                    href={`/jobs/${job.id}`} 
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View Details →
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900">No jobs found</h3>
              <p className="mt-2 text-gray-600">Try adjusting your filters to find more opportunities.</p>
            </div>
          )}
        </div>
      </Suspense>
      
      {/* Pagination placeholder */}
      {pageCount > 1 && (
        <div className="mt-8 flex justify-center">
          <p>Pagination UI will go here</p>
        </div>
      )}
    </div>
  );
} 