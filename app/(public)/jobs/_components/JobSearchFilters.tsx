'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import { useJobFilters } from '../_hooks/useJobFilters';
import { useMediaQuery, useDebounce } from '../_hooks/';
import {
  jobTypeOptions,
  workLocationOptions,
  experienceLevelOptions
} from '../_utils/constants';
import { Search, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FilterSection } from './FilterSection';
import { FilterCheckbox } from './FilterCheckbox';
import { SalaryRangeFilter } from './SalaryRangeFilter';
import { MobileFilterToggle } from './MobileFilterToggle';
import { LocationSelector } from '@/components/ui/location-selector';
import PropagateLoader from 'react-spinners/PropagateLoader';
import { jobTypeEnum, workLocationEnum, experienceLevelEnum } from '@/lib/db/schema';
import type { LocationSelection } from '@/lib/types/locations';

interface FilterProps {
  industries: { id: string; name: string }[];
}

export function JobSearchFilters({ industries }: FilterProps) {
  const { filters, setFilters, resetFilters } = useJobFilters();
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [locationSelection, setLocationSelection] = useState<LocationSelection>({});
  const [salaryRange, setSalaryRange] = useState<[number, number]>([
    filters.salaryMin || 0,
    filters.salaryMax || 1000000
  ]);
  const [isPending, startTransition] = useTransition();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Local state for search input to provide immediate feedback
  const [searchInput, setSearchInput] = useState(filters.search || '');

  // Debounce the search input to prevent excessive fetching
  const debouncedSearchTerm = useDebounce(searchInput, 500);

  // --- Wrapped state update functions ---
  const handleFilterChange = useCallback((update: Parameters<typeof setFilters>[0]) => {
    startTransition(() => {
      setFilters(update);
    });
  }, [setFilters, startTransition]);

  // Update filters when debounced search term changes
  useEffect(() => {
    if (debouncedSearchTerm !== filters.search) {
      handleFilterChange({ search: debouncedSearchTerm || null, page: 1 });
    }
  }, [debouncedSearchTerm, filters.search, handleFilterChange]);

  // Local state for industry search
  const [industrySearchInput, setIndustrySearchInput] = useState('');
  const [includeNegotiable, setIncludeNegotiable] = useState(filters.includeNegotiable ?? true);

  // Helper function to get the most specific location ID from selection
  const getLocationIdFromSelection = (selection: LocationSelection): string | null => {
    return selection.cityId || selection.districtId || selection.regionId || null;
  }

  // Helper function to get location display text from selection
  const getLocationDisplayFromSelection = (selection: LocationSelection): string => {
    if (selection.city) {
      return selection.district ? `${selection.city}, ${selection.district}, ${selection.region}` : `${selection.city}, ${selection.region}`;
    } else if (selection.district) {
      return `${selection.district}, ${selection.region}`;
    } else if (selection.region) {
      return selection.region;
    }
    return '';
  }

  // Handle location selection change
  const handleLocationChange = (selection: LocationSelection) => {
    setLocationSelection(selection);
    const locationId = getLocationIdFromSelection(selection);
    handleFilterChange({ locationId: locationId || 'all', page: 1 });
  }

  // Clear location selection
  const handleClearLocation = () => {
    setLocationSelection({});
    handleFilterChange({ locationId: 'all', page: 1 });
  }

  // Filtered industries based on search input
  const filteredIndustries = industrySearchInput
    ? industries.filter(industry =>
      industry.name.toLowerCase().includes(industrySearchInput.toLowerCase())
    )
    : industries;

  const isMobile = useMediaQuery('(max-width: 767px)');

  // Sort options
  const sortOptions = [
    { value: 'newest', label: 'Newest first' },
    { value: 'oldest', label: 'Oldest first' }
  ];

  // Track active filter count for mobile badge
  useEffect(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.locationId && filters.locationId !== 'all') count++;
    if (filters.jobType && filters.jobType !== 'all') count++;
    if (filters.workLocation && filters.workLocation !== 'all') count++;
    if (filters.experienceLevel && filters.experienceLevel !== 'all') count++;
    if (filters.salaryMin) count++;
    if (filters.salaryMax && filters.salaryMax < 1000000) count++;
    if (filters.industryId && filters.industryId !== 'all') count++;
    if (filters.sortBy && filters.sortBy !== 'newest') count++;
    setActiveFiltersCount(count);
  }, [filters]);

  // Format industry display
  const getIndustryLabel = (industryId: string) => {
    if (industryId === 'all') return 'Any Industry';
    const industry = industries.find(ind => ind.id === industryId);
    return industry ? industry.name : '';
  };

  const handleResetFilters = () => {
    startTransition(() => {
      resetFilters();
      setSearchInput('');
      setLocationSelection({});
      setIndustrySearchInput('');
    });
  };

  const applySalaryRange = () => {
    startTransition(() => {
      setFilters({
        salaryMin: salaryRange[0] > 0 ? salaryRange[0] : null,
        salaryMax: salaryRange[1] < 1000000 ? salaryRange[1] : null,
        includeNegotiable: includeNegotiable,
        page: 1
      });
    });
  };

  const handleSalaryRangeChange = (value: [number, number]) => {
    setSalaryRange(value);
  };

  const handleIncludeNegotiableChange = (include: boolean) => {
    setIncludeNegotiable(include);
    // Apply the change immediately
    startTransition(() => {
      setFilters({
        includeNegotiable: include,
        page: 1
      });
    });
  };

  const toggleMobileFilter = () => {
    setIsMobileFilterOpen(prev => !prev);
  };

  // Handle search input change without immediate filtering
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  // Clear search immediately when clicking the X button
  const handleClearSearch = () => {
    setSearchInput('');
    handleFilterChange({ search: null, page: 1 });
  };

  // Generate counters for filter options
  const getJobTypeCount = (type: string) => {
    // In a real implementation, this would come from an API call with aggregated counts
    const counts: Record<string, number> = {
      'FULL_TIME': 345,
      'PART_TIME': 127,
      'PERMANENT': 201,
      'FIXED_TERM_CONTRACT': 89,
      'CASUAL': 56,
      'SEASONAL': 32,
      'FREELANCE': 78,
      'APPRENTICESHIP': 14,
      'INTERNSHIP': 43
    };
    return counts[type] || 0;
  };

  const getWorkLocationCount = (type: string) => {
    const counts: Record<string, number> = {
      'REMOTE': 128,
      'HYBRID': 187,
      'ON_SITE': 275
    };
    return counts[type] || 0;
  };

  const getExperienceLevelCount = (level: string) => {
    const counts: Record<string, number> = {
      'Entry': 98,
      'Junior': 145,
      'Mid-Level': 212,
      'Senior': 167,
      'Director': 42,
      'Executive': 27
    };
    return counts[level] || 0;
  };

  const getIndustryCount = (id: string) => {
    // Simulated counts - would come from API in real implementation
    return Math.floor(Math.random() * 70) + 10;
  };

  // Filter sidebar content (used for both desktop and mobile)
  const filterContent = (
    <div className="flex flex-col h-full">
      {/* Search Input */}
      <div className="p-5 border-b border-gray-100">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            className="pl-10 pr-8 py-2 border-gray-200 rounded-lg w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-gray-50/50 transition-all"
            placeholder="Search jobs..."
            value={searchInput}
            onChange={handleSearchInputChange}
          />
          {searchInput && (
            <button
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              onClick={handleClearSearch}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="p-5 space-y-6 flex-grow overflow-y-auto custom-scrollbar">
        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.jobType && filters.jobType !== 'all' && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 transition-colors cursor-pointer"
                onClick={() => handleFilterChange({ jobType: 'all', page: 1 })}
              >
                {jobTypeOptions.find(opt => opt.value === filters.jobType)?.label}
                <X className="h-3 w-3 ml-0.5" />
              </Badge>
            )}
            {filters.workLocation && filters.workLocation !== 'all' && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 transition-colors cursor-pointer"
                onClick={() => handleFilterChange({ workLocation: 'all', page: 1 })}
              >
                {workLocationOptions.find(opt => opt.value === filters.workLocation)?.label}
                <X className="h-3 w-3 ml-0.5" />
              </Badge>
            )}
            {filters.experienceLevel && filters.experienceLevel !== 'all' && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 transition-colors cursor-pointer"
                onClick={() => handleFilterChange({ experienceLevel: 'all', page: 1 })}
              >
                {experienceLevelOptions.find(opt => opt.value === filters.experienceLevel)?.label}
                <X className="h-3 w-3 ml-0.5" />
              </Badge>
            )}
            {filters.locationId && filters.locationId !== 'all' && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 transition-colors cursor-pointer"
                onClick={handleClearLocation}
              >
                {getLocationDisplayFromSelection(locationSelection)}
                <X className="h-3 w-3 ml-0.5" />
              </Badge>
            )}
            {(filters.salaryMin || (filters.salaryMax && filters.salaryMax < 1000000)) && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 transition-colors cursor-pointer"
                onClick={() => handleFilterChange({ salaryMin: null, salaryMax: null, page: 1 })}
              >
                {filters.salaryMin && filters.salaryMax
                  ? `GMD ${filters.salaryMin.toLocaleString()} - ${filters.salaryMax.toLocaleString()}`
                  : filters.salaryMin
                    ? `Min: GMD ${filters.salaryMin.toLocaleString()}`
                    : `Max: GMD ${filters.salaryMax!.toLocaleString()}`}
                <X className="h-3 w-3 ml-0.5" />
              </Badge>
            )}
            {filters.industryId && filters.industryId !== 'all' && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 transition-colors cursor-pointer"
                onClick={() => handleFilterChange({ industryId: 'all', page: 1 })}
              >
                {getIndustryLabel(filters.industryId)}
                <X className="h-3 w-3 ml-0.5" />
              </Badge>
            )}
            {activeFiltersCount > 1 && (
              <Badge
                variant="outline"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 border-gray-200 transition-colors cursor-pointer"
                onClick={handleResetFilters}
              >
                Clear All
                <X className="h-3 w-3 ml-0.5" />
              </Badge>
            )}
          </div>
        )}

        {/* Job Type Filter */}
        <FilterSection
          title="Job Type"
          defaultExpanded={true}
          onClear={() => handleFilterChange({ jobType: 'all', page: 1 })}
          showClear={filters.jobType !== 'all'}
        >
          <div className="space-y-2">
            {jobTypeOptions.map(option => (
              <FilterCheckbox
                key={option.value}
                label={option.label}
                count={getJobTypeCount(option.value)}
                checked={filters.jobType === option.value}
                onChange={() => handleFilterChange({
                  jobType: filters.jobType === option.value ? 'all' : option.value as typeof jobTypeEnum.enumValues[number],
                  page: 1
                })}
              />
            ))}
          </div>
        </FilterSection>

        {/* Experience Level Filter */}
        <FilterSection
          title="Experience Level"
          defaultExpanded={true}
          onClear={() => handleFilterChange({ experienceLevel: 'all', page: 1 })}
          showClear={filters.experienceLevel !== 'all'}
        >
          <div className="space-y-2">
            {experienceLevelOptions.map(option => (
              <FilterCheckbox
                key={option.value}
                label={option.label}
                count={getExperienceLevelCount(option.value)}
                checked={filters.experienceLevel === option.value}
                onChange={() => handleFilterChange({
                  experienceLevel: filters.experienceLevel === option.value ? 'all' : option.value as typeof experienceLevelEnum.enumValues[number],
                  page: 1
                })}
              />
            ))}
          </div>
        </FilterSection>

        {/* Salary Range Filter */}
        {/* <FilterSection 
          title="Salary Range" 
          defaultExpanded={true}
          onClear={() => handleFilterChange({ salaryMin: null, salaryMax: null, page: 1 })}
          showClear={filters.salaryMin !== null || filters.salaryMax !== null}
          maxHeight="max-h-[800px] overflow-y-auto"
        >
          <SalaryRangeFilter
            value={salaryRange}
            onChange={handleSalaryRangeChange}
            onApply={applySalaryRange}
            min={0}
            max={1000000}
            includeNegotiable={includeNegotiable}
            onIncludeNegotiableChange={handleIncludeNegotiableChange}
          />
        </FilterSection> */}

        {/* Work Location Filter */}
        <FilterSection
          title="Work Location"
          defaultExpanded={true}
          onClear={() => handleFilterChange({ workLocation: 'all', page: 1 })}
          showClear={filters.workLocation !== 'all'}
        >
          <div className="space-y-2">
            {workLocationOptions.map(option => (
              <FilterCheckbox
                key={option.value}
                label={option.label}
                count={getWorkLocationCount(option.value)}
                checked={filters.workLocation === option.value}
                onChange={() => handleFilterChange({
                  workLocation: filters.workLocation === option.value ? 'all' : option.value as typeof workLocationEnum.enumValues[number],
                  page: 1
                })}
              />
            ))}
          </div>
        </FilterSection>

        {/* Location Filter */}
        <FilterSection
          title="Location"
          defaultExpanded={false}
          onClear={handleClearLocation}
          showClear={filters.locationId !== 'all' && filters.locationId !== null}
          maxHeight="max-h-[700px]"
        >
          <div className="min-h-[200px]">
            <LocationSelector
              value={locationSelection}
              onChange={handleLocationChange}
              placeholder="Select location..."
              showSearch={true}
              allowClear={true}
              className="w-full"
              maxHeight="max-h-[500px]"
            />
          </div>
        </FilterSection>

        {/* Industry Filter */}
        <FilterSection
          title="Industry"
          defaultExpanded={false}
          onClear={() => handleFilterChange({ industryId: 'all', page: 1 })}
          showClear={filters.industryId !== 'all' && filters.industryId !== null}
        >
          <Input
            className="mb-3 border-gray-200 rounded-lg bg-gray-50/50"
            placeholder="Search industries..."
            type="text"
            value={industrySearchInput}
            onChange={(e) => setIndustrySearchInput(e.target.value)}
          />
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {filteredIndustries.length > 0 ? (
              filteredIndustries.map(industry => (
                <FilterCheckbox
                  key={industry.id}
                  label={industry.name}
                  count={getIndustryCount(industry.id)}
                  checked={filters.industryId === industry.id}
                  onChange={() => handleFilterChange({
                    industryId: filters.industryId === industry.id ? 'all' : industry.id,
                    page: 1
                  })}
                />
              ))
            ) : (
              <div className="text-sm text-gray-500 py-2">No industries match your search</div>
            )}
          </div>
        </FilterSection>

        {/* Sort By Filter */}
        <FilterSection
          title="Sort By"
          defaultExpanded={false}
          onClear={() => handleFilterChange({ sortBy: 'newest', page: 1 })}
          showClear={filters.sortBy !== 'newest'}
        >
          <div className="space-y-2">
            {sortOptions.map(option => (
              <FilterCheckbox
                key={option.value}
                label={option.label}
                checked={filters.sortBy === option.value}
                onChange={() => handleFilterChange({
                  sortBy: option.value as 'newest' | 'oldest',
                  page: 1
                })}
              />
            ))}
          </div>
        </FilterSection>
      </div>

      {/* Mobile footer actions */}
      {isMobile && (
        <div className="border-t border-gray-100 p-5 flex justify-between bg-white">
          <Button
            variant="outline"
            className="flex-1 mr-2 border-gray-200 text-gray-700 hover:bg-gray-50"
            onClick={handleResetFilters}
          >
            Clear All
          </Button>
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={toggleMobileFilter}
          >
            Apply Filters
          </Button>
        </div>
      )}
    </div>
  );

  // Mobile filter button
  const mobileFilterButton = isMobile && (
    <MobileFilterToggle
      count={activeFiltersCount}
      onClick={toggleMobileFilter}
    />
  );

  // Render based on device type
  return (
    <>
      {/* Desktop sidebar - always visible */}
      {!isMobile && (
        <div className={`relative bg-white border border-gray-200 rounded-xl shadow-sm transition-opacity duration-300 h-[calc(100vh-120px)] sticky top-[100px] ${isPending ? 'opacity-70' : 'opacity-100'}`}>
          {/* Loading overlay */}
          {isPending && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 rounded-xl backdrop-blur-sm">
              <PropagateLoader color="#3b82f6" size={10} />
            </div>
          )}
          {filterContent}
        </div>
      )}

      {/* Mobile filter button and slide-out panel */}
      {isMobile && (
        <>
          {mobileFilterButton}

          {/* Mobile filter overlay */}
          {isMobileFilterOpen && (
            <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={toggleMobileFilter}></div>
          )}

          {/* Mobile filter sidebar */}
          <div
            className={`fixed inset-y-0 left-0 w-[85%] max-w-[350px] bg-white shadow-2xl z-50 transition-transform duration-300 ease-in-out ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full'}`}
          >
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <h2 className="font-bold text-lg text-gray-900">Filters</h2>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                onClick={toggleMobileFilter}
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            {filterContent}
          </div>
        </>
      )}
    </>
  );
} 