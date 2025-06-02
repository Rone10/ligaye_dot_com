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
    if (value) {
      setSelection(value);
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
    const emptySelection = {};
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
        variant="outline"
        role="combobox"
        aria-expanded={isOpen}
        className={cn(
          "w-full justify-between h-12 px-4 text-left font-normal",
          !hasValue && "text-gray-500",
          error && "border-red-300 focus:border-red-500",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span className="truncate">
            {hasValue ? displayValue : placeholder}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {hasValue && allowClear && !disabled && (
            <X
              className="h-4 w-4 text-gray-400 hover:text-gray-600"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
            />
          )}
          <ChevronDown className={cn(
            "h-4 w-4 text-gray-400 transition-transform",
            isOpen && "rotate-180"
          )} />
        </div>
      </Button>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          {/* Search Input */}
          {showSearch && (
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
            </div>
          )}

          <ScrollArea className="max-h-80">
            {/* Search Results */}
            {searchQuery.trim() && (
              <div className="p-2">
                {searchLoading ? (
                  <div className="p-4 text-center text-gray-500">
                    Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-1">
                    <div className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Search Results
                    </div>
                    {searchResults.map((result) => (
                      <button
                        key={result.id}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
                        onClick={() => handleSearchResultSelect(result)}
                      >
                        <div className="font-medium text-gray-900">{result.city}</div>
                        <div className="text-sm text-gray-500">
                          {result.district}, {result.region}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No locations found
                  </div>
                )}
              </div>
            )}

            {/* Hierarchical Selection */}
            {!searchQuery.trim() && (
              <div className="p-2">
                {/* Breadcrumb Navigation */}
                {activeStep !== 'region' && (
                  <div className="flex items-center gap-2 px-2 py-1 mb-2 text-sm text-gray-600">
                    <button
                      onClick={handleBackToRegions}
                      className="hover:text-blue-600 transition-colors"
                    >
                      Regions
                    </button>
                    {activeStep === 'city' && (
                      <>
                        <span>/</span>
                        <button
                          onClick={handleBackToDistricts}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {selection.region}
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Region Selection */}
                {activeStep === 'region' && (
                  <div className="space-y-1">
                    <div className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Select Region
                    </div>
                    {regionsLoading ? (
                      <div className="p-4 text-center text-gray-500">
                        Loading regions...
                      </div>
                    ) : (
                      regions.map((region) => (
                        <button
                          key={region.id}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
                          onClick={() => handleRegionSelect(region.id, region.name, region.slug)}
                        >
                          {region.name}
                        </button>
                      ))
                    )}
                  </div>
                )}

                {/* District Selection */}
                {activeStep === 'district' && currentRegionData && (
                  <div className="space-y-1">
                    <div className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Select District in {selection.region}
                    </div>
                    {regionDataLoading ? (
                      <div className="p-4 text-center text-gray-500">
                        Loading districts...
                      </div>
                    ) : (
                      currentRegionData.districts.map((district) => (
                        <button
                          key={district.id}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
                          onClick={() => handleDistrictSelect(district.id, district.name)}
                        >
                          {district.name}
                        </button>
                      ))
                    )}
                  </div>
                )}

                {/* City Selection */}
                {activeStep === 'city' && currentRegionData && selection.districtId && (
                  <div className="space-y-1">
                    <div className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Select City in {selection.district}
                    </div>
                    {(() => {
                      const district = currentRegionData.districts.find(d => d.id === selection.districtId);
                      if (!district) return null;
                      
                      return district.cities.map((city) => (
                        <button
                          key={city.id}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors flex items-center justify-between"
                          onClick={() => handleCitySelect(city.id, city.name)}
                        >
                          <span>{city.name}</span>
                          {selection.cityId === city.id && (
                            <Check className="h-4 w-4 text-blue-600" />
                          )}
                        </button>
                      ));
                    })()}
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