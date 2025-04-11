'use client';

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