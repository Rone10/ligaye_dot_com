'use client';

import { useTransition } from 'react';
import { useQueryState, useQueryStates } from 'nuqs';
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
import type { Sector, Location } from '@/lib/db/schema';
import { tenderStatusEnum } from '@/lib/db/schema';

interface TenderFiltersProps {
  sectors: Sector[];
  locations: Location[];
}

export function TenderFilters({ sectors, locations }: TenderFiltersProps) {
  const [isPending, startTransition] = useTransition();
  
  const [search, setSearch] = useQueryState('search', { 
    defaultValue: '', 
    shallow: false,
    throttleMs: 500, // Debounce search input
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

  const hasActiveFilters = search || sectorId || locationId || status;

  const clearAllFilters = () => {
    setSearch('');
    setSectorId('');
    setLocationId('');
    setStatus('');
    setPage('1'); // Reset to first page when clearing filters
  };

  const formatLocationName = (location: Location) => {
    return location.city ? `${location.city}, ${location.region}` : location.region;
  };

  // Handle select value changes to convert "all" back to empty string
  // Also reset page to 1 when filters change
  const handleSectorChange = (value: string) => {
    setSectorId(value === 'all' ? '' : value);
    setPage('1'); // Reset to first page when filter changes
  };

  const handleLocationChange = (value: string) => {
    setLocationId(value === 'all' ? '' : value);
    setPage('1'); // Reset to first page when filter changes
  };

  const handleStatusChange = (value: string) => {
    setStatus(value === 'all' ? '' : value);
    setPage('1'); // Reset to first page when filter changes
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage('1'); // Reset to first page when search changes
  };

  return (
    <div className="glass-card p-xl rounded-xl shadow-level-2 hover:shadow-level-3 duration-standard">
      <div className="space-y-lg">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-sm">
            <div className="p-sm bg-primary-blue/10 rounded-lg">
              {isPending ? (
                <Loader2 className="h-5 w-5 text-primary-blue animate-spin" />
              ) : (
                <Filter className="h-5 w-5 text-primary-blue" />
              )}
            </div>
            <div className="flex items-center gap-sm">
              <h3 className="text-xl font-semibold text-theme-dark">Filter Tenders</h3>
              {isPending && (
                <span className="text-sm text-theme-gray-dark bg-primary-blue/10 px-sm py-xs rounded-full">
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
              className="gap-xs text-theme-gray-dark hover:text-theme-dark disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              Clear all
            </Button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="space-y-lg">
          {/* Search */}
          <div className="space-y-sm">
            <label htmlFor="search" className="text-sm font-medium text-theme-dark">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-md top-1/2 transform -translate-y-1/2 h-4 w-4 text-theme-gray-dark" />
              <Input
                id="search"
                placeholder="Search tenders..."
                value={search}
                onChange={handleSearchChange}
                disabled={isPending}
                className="pl-10 bg-theme-light/50 border-theme-gray/30 focus:border-primary-blue focus:shadow-focus duration-standard disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {isPending && (
                <div className="absolute right-md top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 text-primary-blue animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Sector Filter */}
          <div className="space-y-sm">
            <label htmlFor="sector" className="text-sm font-medium text-theme-dark">
              Sector
            </label>
            <Select value={sectorId || 'all'} onValueChange={handleSectorChange} disabled={isPending}>
              <SelectTrigger className="bg-theme-light/50 border-theme-gray/30 focus:border-primary-blue focus:shadow-focus duration-standard disabled:opacity-50 disabled:cursor-not-allowed">
                <SelectValue placeholder="All sectors" />
                {isPending && <Loader2 className="h-4 w-4 text-primary-blue animate-spin ml-auto" />}
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

          {/* Location Filter */}
          <div className="space-y-sm">
            <label htmlFor="location" className="text-sm font-medium text-theme-dark">
              Location
            </label>
            <Select value={locationId || 'all'} onValueChange={handleLocationChange} disabled={isPending}>
              <SelectTrigger className="bg-theme-light/50 border-theme-gray/30 focus:border-primary-blue focus:shadow-focus duration-standard disabled:opacity-50 disabled:cursor-not-allowed">
                <SelectValue placeholder="All locations" />
                {isPending && <Loader2 className="h-4 w-4 text-primary-blue animate-spin ml-auto" />}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {formatLocationName(location)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          {/* <div className="space-y-sm">
            <label htmlFor="status" className="text-sm font-medium text-theme-dark">
              Status
            </label>
            <Select value={status || 'all'} onValueChange={handleStatusChange}>
              <SelectTrigger className="bg-theme-light/50 border-theme-gray/30 focus:border-primary-blue focus:shadow-focus duration-standard">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {tenderStatusEnum.enumValues.map((statusValue) => (
                  <SelectItem key={statusValue} value={statusValue}>
                    {statusValue}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div> */}
        </div>

        {/* Active filters summary */}
        {hasActiveFilters && (
          <div className="pt-lg border-t border-theme-gray/30">
            <div className="space-y-sm">
              <p className="text-sm font-medium text-theme-dark">Active Filters:</p>
              <div className="flex flex-wrap gap-sm">
                {search && (
                  <div className="inline-flex items-center gap-xs px-md py-xs bg-primary-blue/10 text-primary-blue rounded-full text-sm border border-primary-blue/20">
                    Search: &quot;{search}&quot;
                    <button
                      onClick={() => setSearch('')}
                      disabled={isPending}
                      className="ml-xs hover:bg-primary-blue/20 rounded-full p-xs duration-standard disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {sectorId && (
                  <div className="inline-flex items-center gap-xs px-md py-xs bg-secondary-green/10 text-secondary-green rounded-full text-sm border border-secondary-green/20">
                    Sector: {sectors.find(s => s.id === sectorId)?.name}
                    <button
                      onClick={() => setSectorId('')}
                      disabled={isPending}
                      className="ml-xs hover:bg-secondary-green/20 rounded-full p-xs duration-standard disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {locationId && (
                  <div className="inline-flex items-center gap-xs px-md py-xs bg-theme-gray/20 text-theme-gray-dark rounded-full text-sm border border-theme-gray/30">
                    Location: {formatLocationName(locations.find(l => l.id === locationId)!)}
                    <button
                      onClick={() => setLocationId('')}
                      disabled={isPending}
                      className="ml-xs hover:bg-theme-gray/30 rounded-full p-xs duration-standard disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {status && (
                  <div className="inline-flex items-center gap-xs px-md py-xs bg-orange-500/10 text-orange-600 rounded-full text-sm border border-orange-500/20">
                    Status: {status}
                    <button
                      onClick={() => setStatus('')}
                      className="ml-xs hover:bg-orange-500/20 rounded-full p-xs duration-standard"
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