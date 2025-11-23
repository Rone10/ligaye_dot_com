'use client';

import { useTransition, useState, useEffect } from 'react';
import { useQueryState } from 'nuqs';
import { Search, Filter, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LocationSelector } from '@/components/ui/location-selector';
import type { Sector } from '@/lib/db/schema';
import type { LocationSelection } from '@/lib/types/locations';

interface TenderFiltersProps {
  sectors: Sector[];
  onFilteringChange?: (isFiltering: boolean) => void;
}

export function TenderFilters({ sectors, onFilteringChange }: TenderFiltersProps) {
  const [isPending, startTransition] = useTransition();

  // Local state for immediate UI feedback
  const [searchInput, setSearchInput] = useState('');
  const [isSearchPending, setIsSearchPending] = useState(false);

  const [search, setSearch] = useQueryState('search', {
    defaultValue: '',
    shallow: false,
    startTransition
  });
  const [sectorId, setSectorId] = useQueryState('sector', {
    defaultValue: '',
    shallow: false,
    startTransition
  });
  const [locationId, setLocationId] = useQueryState('location', {
    defaultValue: '',
    shallow: false,
    startTransition
  });
  const [status, setStatus] = useQueryState('status', {
    defaultValue: '',
    shallow: false,
    startTransition
  });
  const [page, setPage] = useQueryState('page', {
    defaultValue: '1',
    shallow: false,
    startTransition
  });

  // Local state for LocationSelector
  const [locationSelection, setLocationSelection] = useState<LocationSelection>({});

  // Sync local search input with URL state
  useEffect(() => {
    setSearchInput(search || '');
  }, [search]);

  // Convert locationId from URL to LocationSelection format
  useEffect(() => {
    if (!locationId && getLocationIdFromSelection(locationSelection)) {
      setLocationSelection({});
    }
  }, [locationId, locationSelection]);

  // Helper function to get the most specific location ID from selection
  const getLocationIdFromSelection = (selection: LocationSelection): string => {
    return selection.cityId || selection.districtId || selection.regionId || '';
  };

  // Helper function to get display text for location selection
  const getLocationDisplayText = (selection: LocationSelection): string => {
    if (selection.city && selection.district) {
      return `${selection.city}, ${selection.district}`;
    }
    if (selection.district && selection.region) {
      return `${selection.district}, ${selection.region}`;
    }
    if (selection.region) {
      return selection.region;
    }
    return '';
  };

  // Debounce search input
  useEffect(() => {
    if (searchInput !== (search || '')) {
      setIsSearchPending(true);
      const timer = setTimeout(() => {
        setSearch(searchInput || null);
        setPage('1'); // Reset to first page when search changes
        setIsSearchPending(false);
      }, 500);

      return () => {
        clearTimeout(timer);
        setIsSearchPending(false);
      };
    } else {
      setIsSearchPending(false);
    }
  }, [searchInput, search, setSearch, setPage]);

  // Notify parent component of filtering state changes
  useEffect(() => {
    onFilteringChange?.(isPending);
  }, [isPending, onFilteringChange]);

  const hasActiveFilters = search || sectorId || locationId || status;

  const clearAllFilters = () => {
    setSearchInput(''); // Clear local input immediately
    setSearch(null);
    setSectorId(null);
    setLocationId(null); // This will trigger the useEffect to clear locationSelection
    setStatus(null);
    setPage('1'); // Reset to first page when clearing filters
  };

  // Handle location selection change
  const handleLocationChange = (selection: LocationSelection) => {
    setLocationSelection(selection);
    const newLocationId = getLocationIdFromSelection(selection);
    setLocationId(newLocationId || null);
    setPage('1'); // Reset to first page when location changes
  };

  // Handle select value changes to convert "all" back to empty string
  // Also reset page to 1 when filters change
  const handleSectorChange = (value: string) => {
    setSectorId(value === 'all' ? null : value);
    setPage('1'); // Reset to first page when filter changes
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value); // Update local state immediately for UI responsiveness
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              {isPending ? (
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
              ) : (
                <Filter className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-semibold text-foreground">Filter Tenders</h3>
              {isPending && (
                <span className="text-sm text-muted-foreground bg-primary/10 px-2 py-1 rounded-full">
                  Updating...
                </span>
              )}
            </div>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              disabled={isPending}
              className="gap-1 text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              Clear all
            </Button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="space-y-6">
          {/* Search */}
          <div className="space-y-2">
            <label htmlFor="search" className="text-sm font-medium text-foreground">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search tenders..."
                value={searchInput}
                onChange={handleSearchChange}
                disabled={isPending}
                className="pl-10 bg-muted/50 border-border focus:border-primary focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {(isPending || isSearchPending) && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Sector Filter */}
          <div className="space-y-2">
            <label htmlFor="sector" className="text-sm font-medium text-foreground">
              Sector
            </label>
            <Select value={sectorId || 'all'} onValueChange={handleSectorChange} disabled={isPending}>
              <SelectTrigger className="bg-muted/50 border-border focus:border-primary focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                <SelectValue placeholder="All sectors" />
                {isPending && <Loader2 className="h-4 w-4 text-primary animate-spin ml-auto" />}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sectors</SelectItem>
                {sectors.map((sector) => (
                  <SelectItem key={sector.id} value={sector.id}>
                    {sector.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location Filter - New LocationSelector */}
          <div className="space-y-2">
            <label htmlFor="location" className="text-sm font-medium text-foreground">
              Location
            </label>
            <LocationSelector
              value={locationSelection}
              onChange={handleLocationChange}
              placeholder="All locations"
              disabled={isPending}
              showSearch={true}
              allowClear={true}
              className={isPending ? "opacity-50" : ""}
            />
          </div>
        </div>

        {/* Active filters summary */}
        {hasActiveFilters && (
          <div className="pt-6 border-t border-border">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Active Filters:</p>
              <div className="flex flex-wrap gap-2">
                {search && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm border border-primary/20">
                    Search: &quot;{search}&quot;
                    <button
                      onClick={() => {
                        setSearchInput('');
                        setSearch(null);
                        setPage('1');
                      }}
                      disabled={isPending}
                      className="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {sectorId && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-sm border border-green-500/20">
                    Sector: {sectors.find(s => s.id === sectorId)?.name}
                    <button
                      onClick={() => setSectorId(null)}
                      disabled={isPending}
                      className="ml-1 hover:bg-green-500/20 rounded-full p-0.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {locationId && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm border border-border">
                    Location: {getLocationDisplayText(locationSelection)}
                    <button
                      onClick={() => {
                        setLocationSelection({});
                        setLocationId(null);
                      }}
                      disabled={isPending}
                      className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {status && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-full text-sm border border-orange-500/20">
                    Status: {status}
                    <button
                      onClick={() => setStatus(null)}
                      className="ml-1 hover:bg-orange-500/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 