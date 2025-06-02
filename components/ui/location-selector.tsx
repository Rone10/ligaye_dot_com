'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, MapPin, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocations } from '@/lib/hooks/use-locations';
import { LocationSelection } from '@/lib/types/locations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LocationSelectorProps {
  value?: LocationSelection;
  onChange?: (selection: LocationSelection) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: string;
  showSearch?: boolean;
  allowClear?: boolean;
  maxHeight?: string;
}

export function LocationSelector({
  value,
  onChange,
  placeholder = "Select location...",
  className,
  disabled = false,
  error,
  showSearch = true,
  allowClear = true,
  maxHeight = "max-h-[500px]",
}: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStep, setActiveStep] = useState<'region' | 'district' | 'city'>('region');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    regions,
    currentRegionData,
    searchResults,
    regionsLoading,
    regionDataLoading,
    searchLoading,
    loadRegionData,
    searchLocations,
    clearSearch,
    selection,
    setSelection,
    getLocationDisplay,
  } = useLocations();

  // Sync internal selection with props
  useEffect(() => {
    console.log('Value prop changed:', value);
    if (value) {
      console.log('Setting selection from value prop:', value);
      setSelection(value);
    } else if (value === undefined) {
      console.log('Value is undefined, clearing selection');
      // Handle when value becomes undefined (cleared from parent)
      setSelection({
        regionId: undefined,
        region: undefined,
        districtId: undefined,
        district: undefined,
        cityId: undefined,
        city: undefined,
      });
    }
  }, [value, setSelection]);

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
        clearSearch();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [clearSearch]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && showSearch && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen, showSearch]);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim()) {
      searchLocations(searchQuery);
    } else {
      clearSearch();
    }
  }, [searchQuery, searchLocations, clearSearch]);

  const handleRegionSelect = (regionId: string, regionName: string, regionSlug: string) => {
    const newSelection = {
      regionId,
      region: regionName,
      districtId: undefined,
      district: undefined,
      cityId: undefined,
      city: undefined,
    };
    
    setSelection(newSelection);
    loadRegionData(regionSlug);
    setActiveStep('district');
    setSearchQuery('');
    clearSearch();
  };

  const handleDistrictSelect = (districtId: string, districtName: string) => {
    const newSelection = {
      ...selection,
      districtId,
      district: districtName,
      cityId: undefined,
      city: undefined,
    };
    
    setSelection(newSelection);
    setActiveStep('city');
  };

  const handleCitySelect = (cityId: string, cityName: string) => {
    const newSelection = {
      ...selection,
      cityId,
      city: cityName,
    };
    
    setSelection(newSelection);
    onChange?.(newSelection);
    setIsOpen(false);
    setSearchQuery('');
    clearSearch();
  };

  const handleSearchResultSelect = (result: any) => {
    const newSelection = {
      regionId: '', // Would need to map back from region name
      region: result.region,
      districtId: '', // Would need to map back from district name  
      district: result.district,
      cityId: result.id,
      city: result.city,
    };
    
    setSelection(newSelection);
    onChange?.(newSelection);
    setIsOpen(false);
    setSearchQuery('');
    clearSearch();
  };

  const handleClear = () => {
    console.log('handleClear called');
    const emptySelection: LocationSelection = {
      regionId: undefined,
      region: undefined,
      districtId: undefined,
      district: undefined,
      cityId: undefined,
      city: undefined,
    };
    console.log('Clearing selection:', emptySelection);
    setSelection(emptySelection);
    onChange?.(emptySelection);
    setActiveStep('region');
    setSearchQuery('');
    clearSearch();
  };

  const handleBackToRegions = () => {
    setActiveStep('region');
    setSelection({
      regionId: undefined,
      region: undefined,
      districtId: undefined,
      district: undefined,
      cityId: undefined,
      city: undefined,
    });
  };

  const handleBackToDistricts = () => {
    setActiveStep('district');
    setSelection({
      ...selection,
      districtId: undefined,
      district: undefined,
      cityId: undefined,
      city: undefined,
    });
  };

  const displayValue = getLocationDisplay();
  const hasValue = displayValue.length > 0;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Trigger Button */}
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={isOpen}
        className={cn(
          "w-full justify-between h-12 px-md text-left font-normal bg-theme-light border-theme-gray hover:bg-theme-gray/10 focus:border-primary-blue focus:shadow-focus duration-standard",
          !hasValue && "text-theme-gray-dark",
          hasValue && "text-theme-dark",
          error && "border-red-300 focus:border-red-500",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <div className="flex items-center gap-sm min-w-0 flex-1">
          <MapPin className="h-4 w-4 text-theme-gray-dark flex-shrink-0" />
          <span className="truncate">
            {hasValue ? displayValue : placeholder}
          </span>
        </div>
        <div className="flex items-center gap-xs">
          {hasValue && allowClear && !disabled && (
            <button
              type="button"
              className="flex items-center justify-center h-6 w-6 hover:bg-theme-gray/20 rounded-sm duration-fast"
              onClick={(e) => {
                console.log('X button clicked');
                e.preventDefault();
                e.stopPropagation();
                handleClear();
              }}
            >
              <X className="h-4 w-4 text-theme-gray-dark hover:text-theme-dark duration-fast" />
            </button>
          )}
          <ChevronDown className={cn(
            "h-4 w-4 text-theme-gray-dark duration-standard",
            isOpen && "rotate-180"
          )} />
        </div>
      </Button>

      {/* Error Message */}
      {error && (
        <p className="mt-xs text-sm text-red-600">{error}</p>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-xs glass-card rounded-lg shadow-level-4 backdrop-blur-lg animate-appear-zoom">
          {/* Search Input */}
          {showSearch && (
            <div className="p-md border-b border-theme-gray/30">
              <div className="relative">
                <Search className="absolute left-md top-1/2 transform -translate-y-1/2 h-4 w-4 text-theme-gray-dark" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 bg-theme-light/50 border-theme-gray/50 focus:border-primary-blue focus:shadow-focus duration-standard placeholder:text-theme-gray-dark"
                />
              </div>
            </div>
          )}

          <ScrollArea className={cn("max-h-[400px] overflow-y-auto overscroll-contain", maxHeight)}>
            {/* Search Results */}
            {searchQuery.trim() && (
              <div className="p-sm">
                {searchLoading ? (
                  <div className="p-lg text-center text-theme-gray-dark">
                    <div className="animate-pulse">Searching...</div>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-xs">
                    <div className="px-sm py-xs text-xs font-medium text-theme-gray-dark uppercase tracking-wide">
                      Search Results
                    </div>
                    {searchResults.map((result) => (
                      <button
                        type="button"
                        key={result.id}
                        className="w-full px-md py-sm text-left hover:bg-primary-blue/10 hover:text-primary-blue rounded-md duration-fast transition-all group"
                        onClick={() => handleSearchResultSelect(result)}
                      >
                        <div className="font-medium text-theme-dark group-hover:text-primary-blue duration-fast">{result.city}</div>
                        <div className="text-sm text-theme-gray-dark group-hover:text-primary-blue/70 duration-fast">
                          {result.district}, {result.region}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-lg text-center">
                    <div className="text-theme-gray-dark">No locations found</div>
                    <div className="text-xs text-theme-gray-dark mt-xs">Try a different search term</div>
                  </div>
                )}
              </div>
            )}

            {/* Step Navigation */}
            {!searchQuery.trim() && (
              <div className="p-sm">
                {/* Breadcrumb */}
                <div className="flex items-center gap-xs mb-md px-sm py-xs bg-theme-light/30 rounded-md">
                  <button
                    type="button"
                    className={cn(
                      "text-xs font-medium px-sm py-xs rounded-sm duration-fast",
                      activeStep === 'region' 
                        ? "bg-primary-blue text-white" 
                        : "text-theme-gray-dark hover:text-primary-blue hover:bg-primary-blue/10"
                    )}
                    onClick={handleBackToRegions}
                  >
                    Region
                  </button>
                  {selection.region && (
                    <>
                      <span className="text-theme-gray-dark">/</span>
                      <button
                        type="button"
                        className={cn(
                          "text-xs font-medium px-sm py-xs rounded-sm duration-fast",
                          activeStep === 'district' 
                            ? "bg-primary-blue text-white" 
                            : "text-theme-gray-dark hover:text-primary-blue hover:bg-primary-blue/10"
                        )}
                        onClick={handleBackToDistricts}
                      >
                        District
                      </button>
                    </>
                  )}
                  {selection.district && (
                    <>
                      <span className="text-theme-gray-dark">/</span>
                      <span className="text-xs font-medium px-sm py-xs bg-primary-blue text-white rounded-sm">
                        City
                      </span>
                    </>
                  )}
                </div>

                {/* Region Selection */}
                {activeStep === 'region' && (
                  <div className="space-y-xs">
                    <div className="px-sm py-xs text-xs font-medium text-theme-gray-dark uppercase tracking-wide">
                      Select Region
                    </div>
                    {regionsLoading ? (
                      <div className="p-lg text-center text-theme-gray-dark">
                        <div className="animate-pulse">Loading regions...</div>
                      </div>
                    ) : (
                      <div className="space-y-xs">
                        {regions.map((region) => (
                          <button
                            type="button"
                            key={region.id}
                            className={cn(
                              "w-full px-md py-sm text-left rounded-md duration-fast transition-all group",
                              selection.regionId === region.id
                                ? "bg-primary-blue text-white"
                                : "hover:bg-primary-blue/10 hover:text-primary-blue text-theme-dark"
                            )}
                            onClick={() => handleRegionSelect(region.id, region.name, region.slug)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{region.name}</span>
                              {selection.regionId === region.id && (
                                <Check className="h-4 w-4" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* District Selection */}
                {activeStep === 'district' && selection.region && (
                  <div className="space-y-xs">
                    <div className="px-sm py-xs text-xs font-medium text-theme-gray-dark uppercase tracking-wide">
                      Select District in {selection.region}
                    </div>
                    {regionDataLoading ? (
                      <div className="p-lg text-center text-theme-gray-dark">
                        <div className="animate-pulse">Loading districts...</div>
                      </div>
                    ) : currentRegionData?.districts ? (
                      <div className="space-y-xs">
                        {currentRegionData.districts.map((district) => (
                          <button
                            type="button"
                            key={district.id}
                            className={cn(
                              "w-full px-md py-sm text-left rounded-md duration-fast transition-all group",
                              selection.districtId === district.id
                                ? "bg-primary-blue text-white"
                                : "hover:bg-primary-blue/10 hover:text-primary-blue text-theme-dark"
                            )}
                            onClick={() => handleDistrictSelect(district.id, district.name)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{district.name}</span>
                              {selection.districtId === district.id && (
                                <Check className="h-4 w-4" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-lg text-center text-theme-gray-dark">
                        No districts available
                      </div>
                    )}
                  </div>
                )}

                {/* City Selection */}
                {activeStep === 'city' && selection.district && (
                  <div className="space-y-xs">
                    <div className="px-sm py-xs text-xs font-medium text-theme-gray-dark uppercase tracking-wide">
                      Select City in {selection.district}
                    </div>
                    {regionDataLoading ? (
                      <div className="p-lg text-center text-theme-gray-dark">
                        <div className="animate-pulse">Loading cities...</div>
                      </div>
                    ) : currentRegionData?.districts ? (
                      <div className="space-y-xs">
                        {currentRegionData.districts
                          .find(d => d.id === selection.districtId)
                          ?.cities?.map((city) => (
                            <button
                              type="button"
                              key={city.id}
                              className={cn(
                                "w-full px-md py-sm text-left rounded-md duration-fast transition-all group",
                                selection.cityId === city.id
                                  ? "bg-primary-blue text-white"
                                  : "hover:bg-primary-blue/10 hover:text-primary-blue text-theme-dark"
                              )}
                              onClick={() => handleCitySelect(city.id, city.name)}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{city.name}</span>
                                {selection.cityId === city.id && (
                                  <Check className="h-4 w-4" />
                                )}
                              </div>
                            </button>
                          )) || (
                          <div className="p-lg text-center text-theme-gray-dark">
                            No cities available
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-lg text-center text-theme-gray-dark">
                        No cities available
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
} 