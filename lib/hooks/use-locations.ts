'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Region, RegionWithData, SearchIndexItem, LocationSelection } from '@/lib/types/locations';

interface UseLocationsReturn {
  // Data
  regions: Region[];
  currentRegionData: RegionWithData | null;
  searchResults: SearchIndexItem[];
  
  // Loading states
  regionsLoading: boolean;
  regionDataLoading: boolean;
  searchLoading: boolean;
  
  // Actions
  loadRegionData: (regionSlug: string) => Promise<void>;
  searchLocations: (query: string) => void;
  clearSearch: () => void;
  
  // Selection
  selection: LocationSelection;
  setSelection: (selection: LocationSelection) => void;
  
  // Utils
  getLocationDisplay: () => string;
  getLocationById: (id: string) => SearchIndexItem | null;
}

interface LocationCache {
  regions?: Region[];
  popularRegions?: RegionWithData[];
  searchIndex?: SearchIndexItem[];
  regionData: Record<string, RegionWithData>;
}

const cache: LocationCache = {
  regionData: {}
};

export function useLocations(): UseLocationsReturn {
  const [regions, setRegions] = useState<Region[]>([]);
  const [currentRegionData, setCurrentRegionData] = useState<RegionWithData | null>(null);
  const [searchResults, setSearchResults] = useState<SearchIndexItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [regionsLoading, setRegionsLoading] = useState(false);
  const [regionDataLoading, setRegionDataLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  
  const [selection, setSelection] = useState<LocationSelection>({});

  // Load regions on mount
  useEffect(() => {
    loadRegions();
    loadPopularRegions(); // Preload popular regions
  }, []);

  const loadRegions = useCallback(async () => {
    if (cache.regions) {
      setRegions(cache.regions);
      return;
    }

    setRegionsLoading(true);
    try {
      const response = await fetch('/data/locations/regions.json');
      if (!response.ok) throw new Error('Failed to load regions');
      
      const data: Region[] = await response.json();
      cache.regions = data;
      setRegions(data);
    } catch (error) {
      console.error('Error loading regions:', error);
    } finally {
      setRegionsLoading(false);
    }
  }, []);

  const loadPopularRegions = useCallback(async () => {
    if (cache.popularRegions) return;

    try {
      const response = await fetch('/data/locations/popular-regions.json');
      if (!response.ok) throw new Error('Failed to load popular regions');
      
      const data: RegionWithData[] = await response.json();
      cache.popularRegions = data;
      
      // Cache individual popular regions
      data.forEach(regionData => {
        cache.regionData[regionData.region.slug] = regionData;
      });
    } catch (error) {
      console.error('Error loading popular regions:', error);
    }
  }, []);

  const loadRegionData = useCallback(async (regionSlug: string) => {
    // Check cache first
    if (cache.regionData[regionSlug]) {
      setCurrentRegionData(cache.regionData[regionSlug]);
      return;
    }

    setRegionDataLoading(true);
    try {
      const response = await fetch(`/data/locations/districts/${regionSlug}.json`);
      if (!response.ok) throw new Error(`Failed to load region data for ${regionSlug}`);
      
      const data: RegionWithData = await response.json();
      cache.regionData[regionSlug] = data;
      setCurrentRegionData(data);
    } catch (error) {
      console.error('Error loading region data:', error);
    } finally {
      setRegionDataLoading(false);
    }
  }, []);

  const loadSearchIndex = useCallback(async (): Promise<SearchIndexItem[]> => {
    if (cache.searchIndex) {
      return cache.searchIndex;
    }

    try {
      const response = await fetch('/data/locations/search-index.json');
      if (!response.ok) throw new Error('Failed to load search index');
      
      const data: SearchIndexItem[] = await response.json();
      cache.searchIndex = data;
      return data;
    } catch (error) {
      console.error('Error loading search index:', error);
      return [];
    }
  }, []);

  const searchLocations = useCallback(async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const searchIndex = await loadSearchIndex();
      const lowerQuery = query.toLowerCase();
      
      const results = searchIndex.filter(item => 
        item.searchText.includes(lowerQuery)
      ).slice(0, 50); // Limit results for performance
      
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching locations:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, [loadSearchIndex]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  const getLocationDisplay = useCallback((): string => {
    const parts: string[] = [];
    
    if (selection.city) parts.push(selection.city);
    if (selection.district && selection.district !== selection.city) parts.push(selection.district);
    if (selection.region && selection.region !== selection.district) parts.push(selection.region);
    
    return parts.join(', ') || '';
  }, [selection]);

  const getLocationById = useCallback((id: string): SearchIndexItem | null => {
    if (!cache.searchIndex) return null;
    return cache.searchIndex.find(item => item.id === id) || null;
  }, []);

  // Memoized current region for efficiency
  const currentRegion = useMemo(() => {
    if (!selection.regionId || !regions.length) return null;
    return regions.find(r => r.id === selection.regionId) || null;
  }, [selection.regionId, regions]);

  // Auto-load region data when region is selected
  useEffect(() => {
    if (currentRegion && !currentRegionData) {
      loadRegionData(currentRegion.slug);
    }
  }, [currentRegion, currentRegionData, loadRegionData]);

  return {
    // Data
    regions,
    currentRegionData,
    searchResults,
    
    // Loading states
    regionsLoading,
    regionDataLoading,
    searchLoading,
    
    // Actions
    loadRegionData,
    searchLocations,
    clearSearch,
    
    // Selection
    selection,
    setSelection,
    
    // Utils
    getLocationDisplay,
    getLocationById
  };
} 