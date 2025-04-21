'use client';

import { useQueryStates } from 'nuqs';

import { 
  jobFiltersParsers, 
  jobFiltersUrlKeys 
} from '../_utils/job-filter-parsers';

// Custom hook for job filters (Client-side usage)
export function useJobFilters() {
  const [filters, setFilters] = useQueryStates(jobFiltersParsers, {
    urlKeys: jobFiltersUrlKeys,
    history: 'push', 
    shallow: false   
  });

  const resetFilters = () => {
    setFilters({
      search: '',
      locationId: null,
      jobType: 'all',
      workLocation: 'all',
      experienceLevel: 'all',
      salaryMin: null,
      salaryMax: null,
      industryId: null,
      sortBy: 'newest',
      page: 1
    });
  };

  return {
    filters,
    setFilters,
    resetFilters
  };
} 