'use client';

import { useQueryState } from 'nuqs';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import type { Sector, Location } from '@/lib/db/schema';
import { tenderStatusEnum } from '@/lib/db/schema';

interface TenderFiltersProps {
  sectors: Sector[];
  locations: Location[];
}

export function TenderFilters({ sectors, locations }: TenderFiltersProps) {
  const [search, setSearch] = useQueryState('search', { defaultValue: '' });
  const [sectorId, setSectorId] = useQueryState('sector', { defaultValue: '' });
  const [locationId, setLocationId] = useQueryState('location', { defaultValue: '' });
  const [status, setStatus] = useQueryState('status', { defaultValue: '' });

  const hasActiveFilters = search || sectorId || locationId || status;

  const clearAllFilters = () => {
    setSearch('');
    setSectorId('');
    setLocationId('');
    setStatus('');
  };

  const formatLocationName = (location: Location) => {
    return location.city ? `${location.city}, ${location.region}` : location.region;
  };

  // Handle select value changes to convert "all" back to empty string
  const handleSectorChange = (value: string) => {
    setSectorId(value === 'all' ? '' : value);
  };

  const handleLocationChange = (value: string) => {
    setLocationId(value === 'all' ? '' : value);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value === 'all' ? '' : value);
  };

  return (
    <Card className="   backdrop-blur-lg border border-white/30 rounded-2xl shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filter Tenders</h3>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="ml-auto"
            >
              <X className="h-4 w-4 mr-1" />
              Clear all
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="space-y-2">
            <label htmlFor="search" className="text-sm font-medium text-gray-700">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search tenders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Sector Filter */}
          <div className="space-y-2">
            <label htmlFor="sector" className="text-sm font-medium text-gray-700">
              Sector
            </label>
            <Select value={sectorId || 'all'} onValueChange={handleSectorChange}>
              <SelectTrigger>
                <SelectValue placeholder="All sectors" />
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
          <div className="space-y-2">
            <label htmlFor="location" className="text-sm font-medium text-gray-700">
              Location
            </label>
            <Select value={locationId || 'all'} onValueChange={handleLocationChange}>
              <SelectTrigger>
                <SelectValue placeholder="All locations" />
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
          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium text-gray-700">
              Status
            </label>
            <Select value={status || 'all'} onValueChange={handleStatusChange}>
              <SelectTrigger>
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
          </div>
        </div>

        {/* Active filters summary */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {search && (
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Search: &quot;{search}&quot;
                  <button
                    onClick={() => setSearch('')}
                    className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {sectorId && (
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  Sector: {sectors.find(s => s.id === sectorId)?.name}
                  <button
                    onClick={() => setSectorId('')}
                    className="ml-1 hover:bg-green-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {locationId && (
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  Location: {formatLocationName(locations.find(l => l.id === locationId)!)}
                  <button
                    onClick={() => setLocationId('')}
                    className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {status && (
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                  Status: {status}
                  <button
                    onClick={() => setStatus('')}
                    className="ml-1 hover:bg-orange-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 