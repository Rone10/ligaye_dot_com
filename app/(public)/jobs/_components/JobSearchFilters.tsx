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
import PropagateLoader from 'react-spinners/PropagateLoader';
import { jobTypeEnum, workLocationEnum, experienceLevelEnum } from '@/lib/db/schema';

interface FilterProps {
  locations: { id: string; region: string; city: string | null }[];
  industries: { id: string; name: string }[];
}

export function JobSearchFilters({ locations, industries }: FilterProps) {
  const { filters, setFilters, resetFilters } = useJobFilters();
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
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
  
  // Local state for location and industry search
  const [locationSearchInput, setLocationSearchInput] = useState('');
  const [industrySearchInput, setIndustrySearchInput] = useState('');
  const [includeNegotiable, setIncludeNegotiable] = useState(filters.includeNegotiable ?? true);
  
  // Filtered locations and industries based on search input
  const filteredLocations = locationSearchInput 
    ? locations.filter(location => {
        const locationText = (location.city ? location.city.toLowerCase() : '') + ' ' + location.region.toLowerCase();
        return locationText.includes(locationSearchInput.toLowerCase());
      })
    : locations;
    
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

  // Format location display
  const getLocationLabel = (locationId: string) => {
    if (locationId === 'all') return 'Any Location';
    const location = locations.find(loc => loc.id === locationId);
    return location ? `${location.city || ''}, ${location.region}` : '';
  };

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
      setLocationSearchInput('');
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
  
  const getLocationCount = (id: string) => {
    // Simulated counts - would come from API in real implementation
    return Math.floor(Math.random() * 50) + 5; 
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
      <div className="p-5 border-b border-[rgba(255,255,255,0.5)]">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-[#9aa3bc]" />
          </div>
          <Input
            className="pl-10 pr-4 py-2  border border-[rgba(255,255,255,0.5)] rounded-[10px] w-full focus:border-[#4a6cfa] focus:ring focus:ring-[rgba(74,108,250,0.15)]"
            placeholder="Search job titles, keywords, or companies"
            value={searchInput}
            onChange={handleSearchInputChange}
          />
          {searchInput && (
            <button
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={handleClearSearch}
            >
              <X className="h-4 w-4 " />
            </button>
          )}
        </div>
      </div>

      <div className="p-5 space-y-6 flex-grow overflow-y-auto">
        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.jobType && filters.jobType !== 'all' && (
              <Badge 
                variant="secondary" 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full "
                onClick={() => handleFilterChange({ jobType: 'all', page: 1 })}
              >
                {jobTypeOptions.find(opt => opt.value === filters.jobType)?.label}
                <X className="h-3 w-3" />
              </Badge>
            )}
            {filters.workLocation && filters.workLocation !== 'all' && (
              <Badge 
                variant="secondary" 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full "
                onClick={() => handleFilterChange({ workLocation: 'all', page: 1 })}
              >
                {workLocationOptions.find(opt => opt.value === filters.workLocation)?.label}
                <X className="h-3 w-3" />
              </Badge>
            )}
            {filters.experienceLevel && filters.experienceLevel !== 'all' && (
              <Badge 
                variant="secondary" 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full "
                onClick={() => handleFilterChange({ experienceLevel: 'all', page: 1 })}
              >
                {experienceLevelOptions.find(opt => opt.value === filters.experienceLevel)?.label}
                <X className="h-3 w-3" />
              </Badge>
            )}
            {filters.locationId && filters.locationId !== 'all' && (
              <Badge 
                variant="secondary" 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full "
                onClick={() => handleFilterChange({ locationId: 'all', page: 1 })}
              >
                {getLocationLabel(filters.locationId)}
                <X className="h-3 w-3" />
              </Badge>
            )}
            {(filters.salaryMin || (filters.salaryMax && filters.salaryMax < 1000000)) && (
              <Badge 
                variant="secondary" 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full "
                onClick={() => handleFilterChange({ salaryMin: null, salaryMax: null, page: 1 })}
              >
                {filters.salaryMin && filters.salaryMax 
                  ? `GMD ${filters.salaryMin.toLocaleString()} - ${filters.salaryMax.toLocaleString()}`
                  : filters.salaryMin 
                    ? `Min: GMD ${filters.salaryMin.toLocaleString()}`
                    : `Max: GMD ${filters.salaryMax!.toLocaleString()}`}
                <X className="h-3 w-3" />
              </Badge>
            )}
            {filters.industryId && filters.industryId !== 'all' && (
              <Badge 
                variant="secondary" 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full "
                onClick={() => handleFilterChange({ industryId: 'all', page: 1 })}
              >
                {getIndustryLabel(filters.industryId)}
                <X className="h-3 w-3" />
              </Badge>
            )}
            {activeFiltersCount > 1 && (
              <Badge 
                variant="destructive" 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer"
                onClick={handleResetFilters}
              >
                Clear All
                <X className="h-3 w-3" />
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
          onClear={() => handleFilterChange({ locationId: 'all', page: 1 })}
          showClear={filters.locationId !== 'all' && filters.locationId !== null}
        >
          <Input
            className="mb-3  border border-[rgba(255,255,255,0.5)] rounded-[10px]"
            placeholder="Search locations..."
            type="text"
            value={locationSearchInput}
            onChange={(e) => setLocationSearchInput(e.target.value)}
          />
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {filteredLocations.length > 0 ? (
              filteredLocations.map(location => (
                <FilterCheckbox
                  key={location.id}
                  label={location.city ? `${location.city}, ${location.region}` : location.region}
                  count={getLocationCount(location.id)}
                  checked={filters.locationId === location.id}
                  onChange={() => handleFilterChange({ 
                    locationId: filters.locationId === location.id ? 'all' : location.id, 
                    page: 1 
                  })}
                />
              ))
            ) : (
              <div className="text-sm text-muted-foreground py-2">No locations match your search</div>
            )}
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
            className="mb-3  border border-[rgba(255,255,255,0.5)] rounded-[10px]"
            placeholder="Search industries..."
            type="text"
            value={industrySearchInput}
            onChange={(e) => setIndustrySearchInput(e.target.value)}
          />
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
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
              <div className="text-sm text-muted-foreground py-2">No industries match your search</div>
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
        <div className="border-t border-[rgba(255,255,255,0.5)] p-5 flex justify-between">
          <Button
            variant="outline"
            className="flex-1 mr-2"
            onClick={handleResetFilters}
          >
            Clear All
          </Button>
          <Button
            className="flex-1 bg-primary hover:bg-primary/90 text-white"
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
        <div className={`relative  backdrop-blur-[10px] border border-[rgba(255,255,255,0.3)] rounded-[16px] shadow-[0_8px_32px_rgba(31,38,135,0.1)] transition-opacity duration-300 h-[calc(100vh-180px)] sticky top-[100px] ${isPending ? 'opacity-70' : 'opacity-100'}`}>
          {/* Loading overlay */}
          {isPending && (
            <div className="absolute inset-0  flex items-center justify-center z-10 rounded-[16px]">
              <PropagateLoader color="#4a6cfa" size={15} />
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
            <div className="fixed inset-0 bg-black/50 z-40" onClick={toggleMobileFilter}></div>
          )}
          
          {/* Mobile filter sidebar */}
          <div 
            className={`fixed inset-y-0 left-0 w-[85%] max-w-[350px] bg-[rgba(255,255,255,0.95)] backdrop-blur-[10px] shadow-[0_8px_32px_rgba(31,38,135,0.15)] z-50 transition-transform duration-300 ease-in-out ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full'}`}
          >
            <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.5)] p-5">
              <h2 className="font-semibold text-foreground">Filters</h2>
              <button 
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted"
                onClick={toggleMobileFilter}
              >
                                  <X className="h-5 w-5 text-foreground" />
              </button>
            </div>
            {filterContent}
          </div>
        </>
      )}
    </>
  );
} 