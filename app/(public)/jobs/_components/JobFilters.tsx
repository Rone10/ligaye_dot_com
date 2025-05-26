'use client';

import { useState, useEffect, useTransition } from 'react';
import { useJobFilters } from '../_hooks/useJobFilters';
import { 
  jobTypeOptions, 
  workLocationOptions, 
  experienceLevelOptions 
} from '../_utils/constants';
import { Search, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Slider
} from '@/components/ui/slider';
import RiseLoaderSpinner from '@/components/loaders/rise-loader';
import PropagateLoader from 'react-spinners/PropagateLoader';

interface FilterProps {
  locations: { id: string; region: string; city: string | null }[];
  industries: { id: string; name: string }[];
}

export function JobFilters({ locations, industries }: FilterProps) {
  const { filters, setFilters, resetFilters } = useJobFilters();
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [salaryRange, setSalaryRange] = useState<[number, number]>([
    filters.salaryMin || 0,
    filters.salaryMax || 200000
  ]);
  const [isPending, startTransition] = useTransition();
  
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

  const handleSalaryRangeChange = (value: number[]) => {
    setSalaryRange([value[0], value[1]]);
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
  // --- End wrapped functions ---

  return (
    <div className={`relative bg-[rgba(255,255,255,0.7)] backdrop-blur-[10px] border border-[rgba(255,255,255,0.3)] rounded-[16px] shadow-[0_8px_32px_rgba(31,38,135,0.1)] transition-opacity duration-300 max-w-3xl mx-auto ${isPending ? 'opacity-70' : 'opacity-100'}`}>
      {/* Conditionally render spinner overlay */}
      {isPending && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 rounded-[16px]">
          <PropagateLoader color="#0041A2" size={15} />
        </div>
      )}

      {/* Desktop Search Bar */}
      <div className="p-5 border-b border-[rgba(255,255,255,0.5)]">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
                          className="pl-10 pr-4 py-2 bg-card border border-border rounded-[10px] w-full focus:border-primary focus:ring focus:ring-primary/15"
            placeholder="Search job titles, keywords, or companies"
            value={filters.search || ''}
            onChange={e => handleFilterChange({ search: e.target.value, page: 1 })}
          />
          {filters.search && (
            <button
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={() => handleFilterChange({ search: null, page: 1 })}
            >
                              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Desktop Filter Bar */}
      <div className="hidden lg:flex p-5 gap-4 flex-wrap items-center justify-center">
        {/* Location Filter */}
        <Select 
          value={filters.locationId || 'all'} 
          onValueChange={value => handleFilterChange({ locationId: value as string, page: 1 })}
        >
          <SelectTrigger className="w-[160px] bg-card border-border rounded-[10px]">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent className="rounded-[10px]">
            <SelectItem value="all">Any Location</SelectItem>
            {locations.map(location => (
              <SelectItem key={location.id} value={location.id}>
                {location.city ? `${location.city}, ${location.region}` : location.region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Job Type Filter */}
        <Select 
          value={filters.jobType || 'all'} 
          onValueChange={value => handleFilterChange({ jobType: value as any, page: 1 })}
        >
          <SelectTrigger className="w-[160px] bg-card border-border rounded-[10px]">
            <SelectValue placeholder="Job Type" />
          </SelectTrigger>
          <SelectContent className="rounded-[10px]">
            <SelectItem value="all">Any Type</SelectItem>
            {jobTypeOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Work Location Filter */}
        <Select 
          value={filters.workLocation || 'all'} 
          onValueChange={value => handleFilterChange({ workLocation: value as any, page: 1 })}
        >
          <SelectTrigger className="w-[160px] bg-card border-border rounded-[10px]">
            <SelectValue placeholder="Work Location" />
          </SelectTrigger>
          <SelectContent className="rounded-[10px]">
            <SelectItem value="all">Any Work Location</SelectItem>
            {workLocationOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Experience Level Filter */}
        <Select 
          value={filters.experienceLevel || 'all'} 
          onValueChange={value => handleFilterChange({ experienceLevel: value as any, page: 1 })}
        >
          <SelectTrigger className="w-[160px] bg-card border-border rounded-[10px]">
            <SelectValue placeholder="Experience Level" />
          </SelectTrigger>
          <SelectContent className="rounded-[10px]">
            <SelectItem value="all">Any Experience Level</SelectItem>
            {experienceLevelOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Industry Filter */}
        <Select 
          value={filters.industryId || 'all'} 
          onValueChange={value => handleFilterChange({ industryId: value as string, page: 1 })}
        >
          <SelectTrigger className="w-[160px] bg-card border-border rounded-[10px]">
            <SelectValue placeholder="Industry" />
          </SelectTrigger>
          <SelectContent className="rounded-[10px]">
            <SelectItem value="all">Any Industry</SelectItem>
            {industries.map(industry => (
              <SelectItem key={industry.id} value={industry.id}>
                {industry.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Sort By Filter */}
        <Select 
          value={filters.sortBy || 'newest'} 
          onValueChange={value => handleFilterChange({ sortBy: value as 'newest' | 'oldest', page: 1 })}
        >
          <SelectTrigger className="w-[160px] bg-card border-border rounded-[10px]">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent className="rounded-[10px]">
            {sortOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Reset Button */}
        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            onClick={handleResetFilters}
            className="ml-auto"
          >
            Clear All Filters
          </Button>
        )}
      </div>

      {/* Mobile Filter Button */}
      <div className="lg:hidden flex justify-between items-center p-4">
        <div className="flex items-center space-x-2">
          <div className="text-sm font-medium">Filters:</div>
          {activeFiltersCount > 0 ? (
            <Badge variant="secondary">{activeFiltersCount} active</Badge>
          ) : (
            <span className="text-sm text-gray-500">None</span>
          )}
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[300px] sm:w-[350px]">
            <SheetHeader>
              <SheetTitle>Job Filters</SheetTitle>
            </SheetHeader>
            <div className="py-4">
              <Accordion type="single" collapsible className="w-full" defaultValue="location">
                <AccordionItem value="location">
                  <AccordionTrigger>Location</AccordionTrigger>
                  <AccordionContent>
                    <Select 
                      value={filters.locationId || 'all'} 
                      onValueChange={value => handleFilterChange({ locationId: value as string, page: 1 })}
                    >
                      <SelectTrigger className="w-full bg-card">
                        <SelectValue placeholder="Any Location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Location</SelectItem>
                        {locations.map(location => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.city ? `${location.city}, ${location.region}` : location.region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="jobType">
                  <AccordionTrigger>Job Type</AccordionTrigger>
                  <AccordionContent>
                    <Select 
                      value={filters.jobType || 'all'} 
                      onValueChange={value => handleFilterChange({ jobType: value as any, page: 1 })}
                    >
                      <SelectTrigger className="w-full bg-card">
                        <SelectValue placeholder="Any Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Type</SelectItem>
                        {jobTypeOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="workLocation">
                  <AccordionTrigger>Work Location</AccordionTrigger>
                  <AccordionContent>
                    <Select 
                      value={filters.workLocation || 'all'} 
                      onValueChange={value => handleFilterChange({ workLocation: value as any, page: 1 })}
                    >
                      <SelectTrigger className="w-full bg-card">
                        <SelectValue placeholder="Any Work Location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Work Location</SelectItem>
                        {workLocationOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="experienceLevel">
                  <AccordionTrigger>Experience Level</AccordionTrigger>
                  <AccordionContent>
                    <Select 
                      value={filters.experienceLevel || 'all'} 
                      onValueChange={value => handleFilterChange({ experienceLevel: value as any, page: 1 })}
                    >
                      <SelectTrigger className="w-full bg-card">
                        <SelectValue placeholder="Any Experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Experience Level</SelectItem>
                        {experienceLevelOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="salary">
                  <AccordionTrigger>Salary Range</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">GMD {salaryRange[0].toLocaleString()}</span>
                        <span className="text-sm font-medium">GMD {salaryRange[1].toLocaleString()}</span>
                      </div>
                      <Slider
                        defaultValue={[salaryRange[0], salaryRange[1]]}
                        min={0}
                        max={200000}
                        step={5000}
                        onValueChange={handleSalaryRangeChange}
                        className="my-6"
                      />
                      <Button 
                        onClick={applySalaryRange}
                        size="sm" 
                        className="w-full"
                      >
                        Apply Salary Range
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="industry">
                  <AccordionTrigger>Industry</AccordionTrigger>
                  <AccordionContent>
                    <Select 
                      value={filters.industryId || 'all'} 
                      onValueChange={value => handleFilterChange({ industryId: value as string, page: 1 })}
                    >
                      <SelectTrigger className="w-full bg-card">
                        <SelectValue placeholder="Any Industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Industry</SelectItem>
                        {industries.map(industry => (
                          <SelectItem key={industry.id} value={industry.id}>
                            {industry.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="sortBy">
                  <AccordionTrigger>Sort By</AccordionTrigger>
                  <AccordionContent>
                    <Select 
                      value={filters.sortBy || 'newest'} 
                      onValueChange={value => handleFilterChange({ sortBy: value as 'newest' | 'oldest', page: 1 })}
                    >
                      <SelectTrigger className="w-full bg-white">
                        <SelectValue placeholder="Sort By" />
                      </SelectTrigger>
                      <SelectContent>
                        {sortOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button variant="outline" className="mr-2">Cancel</Button>
              </SheetClose>
              {activeFiltersCount > 0 && (
                <Button
                  variant="destructive"
                  onClick={handleResetFilters}
                  size="sm"
                >
                  Clear All Filters
                </Button>
              )}
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="px-4 py-2 border-t border-gray-200 flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: {filters.search}
              <button onClick={() => handleFilterChange({ search: null, page: 1 })} className="disabled:opacity-50">
                <X className="h-3 w-3 ml-1" />
              </button>
            </Badge>
          )}
          
          {filters.locationId && filters.locationId !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Location: {getLocationLabel(filters.locationId)}
              <button onClick={() => handleFilterChange({ locationId: 'all' as string, page: 1 })} className="disabled:opacity-50">
                <X className="h-3 w-3 ml-1" />
              </button>
            </Badge>
          )}
          
          {filters.jobType && filters.jobType !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Type: {jobTypeOptions.find(opt => opt.value === filters.jobType)?.label}
              <button onClick={() => handleFilterChange({ jobType: 'all' as any, page: 1 })} className="disabled:opacity-50">
                <X className="h-3 w-3 ml-1" />
              </button>
            </Badge>
          )}
          
          {filters.workLocation && filters.workLocation !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Work Location: {workLocationOptions.find(opt => opt.value === filters.workLocation)?.label}
              <button onClick={() => handleFilterChange({ workLocation: 'all' as any, page: 1 })} className="disabled:opacity-50">
                <X className="h-3 w-3 ml-1" />
              </button>
            </Badge>
          )}
          
          {filters.experienceLevel && filters.experienceLevel !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Experience: {experienceLevelOptions.find(opt => opt.value === filters.experienceLevel)?.label}
              <button onClick={() => handleFilterChange({ experienceLevel: 'all' as any, page: 1 })} className="disabled:opacity-50">
                <X className="h-3 w-3 ml-1" />
              </button>
            </Badge>
          )}
          
          {filters.salaryMin && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Min Salary: GMD {filters.salaryMin.toLocaleString()}
              <button onClick={() => handleFilterChange({ salaryMin: null, page: 1 })} className="disabled:opacity-50">
                <X className="h-3 w-3 ml-1" />
              </button>
            </Badge>
          )}
          
          {filters.salaryMax && filters.salaryMax < 200000 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Max Salary: GMD {filters.salaryMax.toLocaleString()}
              <button onClick={() => handleFilterChange({ salaryMax: null, page: 1 })} className="disabled:opacity-50">
                <X className="h-3 w-3 ml-1" />
              </button>
            </Badge>
          )}
          
          {filters.industryId && filters.industryId !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Industry: {getIndustryLabel(filters.industryId)}
              <button onClick={() => handleFilterChange({ industryId: 'all' as string, page: 1 })} className="disabled:opacity-50">
                <X className="h-3 w-3 ml-1" />
              </button>
            </Badge>
          )}
          
          {filters.sortBy && filters.sortBy !== 'newest' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Sort: {sortOptions.find(opt => opt.value === filters.sortBy)?.label}
              <button onClick={() => handleFilterChange({ sortBy: 'newest', page: 1 })} className="disabled:opacity-50">
                <X className="h-3 w-3 ml-1" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
} 