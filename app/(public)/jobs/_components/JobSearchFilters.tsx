'use client';

import { useState, useEffect, useTransition } from 'react';
import { useJobFilters } from '../_hooks/useJobFilters';
import { useMediaQuery } from '../_hooks/useMediaQuery';
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
    filters.salaryMax || 200000
  ]);
  const [isPending, startTransition] = useTransition();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  
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
    if (filters.salaryMax && filters.salaryMax < 200000) count++;
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

  // --- Wrapped state update functions ---
  const handleFilterChange = (update: Parameters<typeof setFilters>[0]) => {
    startTransition(() => {
      setFilters(update);
    });
  };

  const handleResetFilters = () => {
    startTransition(() => {
      resetFilters();
    });
  };

  const applySalaryRange = () => {
    startTransition(() => {
      setFilters({
        salaryMin: salaryRange[0] > 0 ? salaryRange[0] : null,
        salaryMax: salaryRange[1] < 200000 ? salaryRange[1] : null,
        page: 1
      });
    });
  };
  
  const handleSalaryRangeChange = (value: [number, number]) => {
    setSalaryRange(value);
  };
  
  const toggleMobileFilter = () => {
    setIsMobileFilterOpen(prev => !prev);
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
            className="pl-10 pr-4 py-2 bg-white/70 border border-[rgba(255,255,255,0.5)] rounded-[10px] w-full focus:border-[#4a6cfa] focus:ring focus:ring-[rgba(74,108,250,0.15)]"
            placeholder="Search job titles, keywords, or companies"
            value={filters.search || ''}
            onChange={e => handleFilterChange({ search: e.target.value, page: 1 })}
          />
          {filters.search && (
            <button
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={() => handleFilterChange({ search: null, page: 1 })}
            >
              <X className="h-4 w-4 text-[#9aa3bc]" />
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e1e5f2] hover:bg-[#d2d8ea]"
                onClick={() => handleFilterChange({ jobType: 'all', page: 1 })}
              >
                {jobTypeOptions.find(opt => opt.value === filters.jobType)?.label}
                <X className="h-3 w-3" />
              </Badge>
            )}
            {filters.workLocation && filters.workLocation !== 'all' && (
              <Badge 
                variant="secondary" 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e1e5f2] hover:bg-[#d2d8ea]"
                onClick={() => handleFilterChange({ workLocation: 'all', page: 1 })}
              >
                {workLocationOptions.find(opt => opt.value === filters.workLocation)?.label}
                <X className="h-3 w-3" />
              </Badge>
            )}
            {filters.experienceLevel && filters.experienceLevel !== 'all' && (
              <Badge 
                variant="secondary" 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e1e5f2] hover:bg-[#d2d8ea]"
                onClick={() => handleFilterChange({ experienceLevel: 'all', page: 1 })}
              >
                {experienceLevelOptions.find(opt => opt.value === filters.experienceLevel)?.label}
                <X className="h-3 w-3" />
              </Badge>
            )}
            {filters.locationId && filters.locationId !== 'all' && (
              <Badge 
                variant="secondary" 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e1e5f2] hover:bg-[#d2d8ea]"
                onClick={() => handleFilterChange({ locationId: 'all', page: 1 })}
              >
                {getLocationLabel(filters.locationId)}
                <X className="h-3 w-3" />
              </Badge>
            )}
            {(filters.salaryMin || (filters.salaryMax && filters.salaryMax < 200000)) && (
              <Badge 
                variant="secondary" 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e1e5f2] hover:bg-[#d2d8ea]"
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e1e5f2] hover:bg-[#d2d8ea]"
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
        <FilterSection 
          title="Salary Range" 
          defaultExpanded={true}
          onClear={() => handleFilterChange({ salaryMin: null, salaryMax: null, page: 1 })}
          showClear={filters.salaryMin !== null || filters.salaryMax !== null}
        >
          <SalaryRangeFilter
            value={salaryRange}
            onChange={handleSalaryRangeChange}
            onApply={applySalaryRange}
            min={0}
            max={200000}
          />
        </FilterSection>

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
            className="mb-3 bg-white/70 border border-[rgba(255,255,255,0.5)] rounded-[10px]"
            placeholder="Search locations..."
            type="text"
          />
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {locations.map(location => (
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
            ))}
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
            className="mb-3 bg-white/70 border border-[rgba(255,255,255,0.5)] rounded-[10px]"
            placeholder="Search industries..."
            type="text"
          />
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {industries.map(industry => (
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
            ))}
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
            className="flex-1 bg-[#4a6cfa] hover:bg-[#3a5de9] text-white"
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
        <div className={`relative bg-[rgba(255,255,255,0.7)] backdrop-blur-[10px] border border-[rgba(255,255,255,0.3)] rounded-[16px] shadow-[0_8px_32px_rgba(31,38,135,0.1)] transition-opacity duration-300 h-[calc(100vh-180px)] sticky top-[100px] ${isPending ? 'opacity-70' : 'opacity-100'}`}>
          {/* Loading overlay */}
          {isPending && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 rounded-[16px]">
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
              <h2 className="font-semibold text-[#1a1e2d]">Filters</h2>
              <button 
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#e1e5f2]"
                onClick={toggleMobileFilter}
              >
                <X className="h-5 w-5 text-[#1a1e2d]" />
              </button>
            </div>
            {filterContent}
          </div>
        </>
      )}
    </>
  );
} 