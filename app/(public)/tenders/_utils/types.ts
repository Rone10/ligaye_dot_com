import type { Tender, Sector, Location } from '@/lib/db/schema';

export interface TenderListItem extends Tender {
  sector?: Pick<Sector, 'id' | 'name'>;
  location?: Pick<Location, 'id' | 'region' | 'city'>;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
}

export interface TenderFilters {
  sectorId?: string;
  locationId?: string;
  status?: string;
  search?: string;
}

export interface TendersTableProps {
  tenders: TenderListItem[];
  currentUserId?: string;
  pagination: PaginationInfo;
}

export interface TenderFiltersProps {
  sectors: Sector[];
  locations: Location[];
  currentFilters: TenderFilters;
} 