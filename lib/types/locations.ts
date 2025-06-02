export interface Region {
  id: string;
  name: string;
  slug: string;
}

export interface City {
  id: string;
  name: string;
}

export interface District {
  id: string;
  name: string;
  cities: City[];
}

export interface RegionWithData {
  region: Region;
  districts: District[];
}

export interface SearchIndexItem {
  id: string;
  city: string;
  district: string;
  region: string;
  searchText: string;
}

export interface LocationSelection {
  regionId?: string;
  districtId?: string;
  cityId?: string;
  region?: string;
  district?: string;
  city?: string;
}

export interface LocationStats {
  totalLocations: number;
  totalRegions: number;
  totalSearchableItems: number;
  popularRegions: string[];
  generatedAt: string;
  filesSizes: Record<string, number>;
} 