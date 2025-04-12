'use client';

import { useState, useEffect } from 'react';
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

  // Track active filter count for mobile badge
  useEffect(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.locationId) count++;
    if (filters.jobType) count++;
    if (filters.workLocation) count++;
    if (filters.experienceLevel) count++;
    if (filters.salaryMin) count++;
    if (filters.industryId) count++;
    setActiveFiltersCount(count);
  }, [filters]);

  // Format location display
  const getLocationLabel = (locationId: string) => {
    const location = locations.find(loc => loc.id === locationId);
    return location ? `${location.city || ''}, ${location.region}` : '';
  };

  // Format industry display
  const getIndustryLabel = (industryId: string) => {
    const industry = industries.find(ind => ind.id === industryId);
    return industry ? industry.name : '';
  };

  const handleSalaryRangeChange = (value: number[]) => {
    setSalaryRange([value[0], value[1]]);
  };

  const applySalaryRange = () => {
    setFilters({
      salaryMin: salaryRange[0] > 0 ? salaryRange[0] : null,
      salaryMax: salaryRange[1] < 200000 ? salaryRange[1] : null,
    });
  };

  return (
    <div className="bg-white/70 backdrop-blur-md border border-gray-200 rounded-lg shadow-sm">
      {/* Desktop Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-500" />
          </div>
          <Input
            className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md w-full focus:border-blue-500 focus:ring focus:ring-blue-200"
            placeholder="Search job titles, keywords, or companies"
            value={filters.search || ''}
            onChange={e => setFilters({ search: e.target.value, page: 1 })}
          />
          {filters.search && (
            <button
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={() => setFilters({ search: null, page: 1 })}
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Desktop Filter Bar */}
      <div className="hidden lg:flex p-4 gap-4 flex-wrap items-center">
        {/* Location Filter */}
        <Select 
          value={filters.locationId || ''} 
          onValueChange={value => setFilters({ locationId: value === "all" ? null : value, page: 1 })}
        >
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="Location" />
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

        {/* Job Type Filter */}
        <Select 
          value={filters.jobType || 'all'} 
          onValueChange={value => setFilters({ jobType: value === "all" ? null : value, page: 1 })}
        >
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="Job Type" />
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

        {/* Work Location Filter */}
        <Select 
          value={filters.workLocation || 'all'} 
          onValueChange={value => setFilters({ workLocation: value === "all" ? null : value, page: 1 })}
        >
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="Work Location" />
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

        {/* Experience Level Filter */}
        <Select 
          value={filters.experienceLevel || 'all'} 
          onValueChange={value => setFilters({ experienceLevel: value === "all" ? null : value, page: 1 })}
        >
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="Experience Level" />
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

        {/* Industry Filter */}
        <Select 
          value={filters.industryId || 'all'} 
          onValueChange={value => setFilters({ industryId: value === "all" ? null : value, page: 1 })}
        >
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="Industry" />
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

        {/* Reset Button */}
        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            onClick={resetFilters}
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
                      onValueChange={value => setFilters({ locationId: value === "all" ? null : value, page: 1 })}
                    >
                      <SelectTrigger className="w-full bg-white">
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
                      onValueChange={value => setFilters({ jobType: value === "all" ? null : value, page: 1 })}
                    >
                      <SelectTrigger className="w-full bg-white">
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
                      onValueChange={value => setFilters({ workLocation: value === "all" ? null : value, page: 1 })}
                    >
                      <SelectTrigger className="w-full bg-white">
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
                      onValueChange={value => setFilters({ experienceLevel: value === "all" ? null : value, page: 1 })}
                    >
                      <SelectTrigger className="w-full bg-white">
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
                      onValueChange={value => setFilters({ industryId: value === "all" ? null : value, page: 1 })}
                    >
                      <SelectTrigger className="w-full bg-white">
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
              </Accordion>
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button variant="outline" className="mr-2">Cancel</Button>
              </SheetClose>
              {activeFiltersCount > 0 && (
                <Button
                  variant="destructive"
                  onClick={resetFilters}
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
            <Badge 
              variant="secondary" 
              className="flex items-center gap-1"
            >
              Search: {filters.search}
              <button onClick={() => setFilters({ search: null, page: 1 })}>
                <X className="h-3 w-3 ml-1" />
              </button>
            </Badge>
          )}
          
          {filters.locationId && (
            <Badge 
              variant="secondary" 
              className="flex items-center gap-1"
            >
              Location: {getLocationLabel(filters.locationId)}
              <button onClick={() => setFilters({ locationId: null, page: 1 })}>
                <X className="h-3 w-3 ml-1" />
              </button>
            </Badge>
          )}
          
          {filters.jobType && (
            <Badge 
              variant="secondary" 
              className="flex items-center gap-1"
            >
              Type: {jobTypeOptions.find(opt => opt.value === filters.jobType)?.label}
              <button onClick={() => setFilters({ jobType: null, page: 1 })}>
                <X className="h-3 w-3 ml-1" />
              </button>
            </Badge>
          )}
          
          {filters.workLocation && (
            <Badge 
              variant="secondary" 
              className="flex items-center gap-1"
            >
              Work Location: {workLocationOptions.find(opt => opt.value === filters.workLocation)?.label}
              <button onClick={() => setFilters({ workLocation: null, page: 1 })}>
                <X className="h-3 w-3 ml-1" />
              </button>
            </Badge>
          )}
          
          {filters.experienceLevel && (
            <Badge 
              variant="secondary" 
              className="flex items-center gap-1"
            >
              Experience: {experienceLevelOptions.find(opt => opt.value === filters.experienceLevel)?.label}
              <button onClick={() => setFilters({ experienceLevel: null, page: 1 })}>
                <X className="h-3 w-3 ml-1" />
              </button>
            </Badge>
          )}
          
          {filters.salaryMin && (
            <Badge 
              variant="secondary" 
              className="flex items-center gap-1"
            >
              Min Salary: GMD {filters.salaryMin.toLocaleString()}
              <button onClick={() => setFilters({ salaryMin: null, page: 1 })}>
                <X className="h-3 w-3 ml-1" />
              </button>
            </Badge>
          )}
          
          {filters.salaryMax && (
            <Badge 
              variant="secondary" 
              className="flex items-center gap-1"
            >
              Max Salary: GMD {filters.salaryMax.toLocaleString()}
              <button onClick={() => setFilters({ salaryMax: null, page: 1 })}>
                <X className="h-3 w-3 ml-1" />
              </button>
            </Badge>
          )}
          
          {filters.industryId && (
            <Badge 
              variant="secondary" 
              className="flex items-center gap-1"
            >
              Industry: {getIndustryLabel(filters.industryId)}
              <button onClick={() => setFilters({ industryId: null, page: 1 })}>
                <X className="h-3 w-3 ml-1" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
} 