'use client';

import { useState } from 'react';
import { TenderFilters } from './TenderFilters';
import { TenderList } from './TenderList';
import type { TenderWithRelations } from '../_queries';
import type { Sector, Location } from '@/lib/db/schema';

interface TendersPageClientProps {
  tenders: TenderWithRelations[];
  totalCount: number;
  currentPage: number;
  limit: number;
  sectors: Sector[];
  locations: Location[];
}

export function TendersPageClient({
  tenders,
  totalCount,
  currentPage,
  limit,
  sectors,
  locations,
}: TendersPageClientProps) {
  const [isFiltering, setIsFiltering] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-xl">
      {/* Filter Sidebar */}
      <div className="lg:sticky lg:top-xl lg:h-fit">
        <TenderFilters 
          sectors={sectors} 
          locations={locations}
          onFilteringChange={setIsFiltering}
        />
      </div>
      
      {/* Tender Listings */}
      <div className="space-y-xl">
        <TenderList
          tenders={tenders}
          totalCount={totalCount}
          currentPage={currentPage}
          limit={limit}
          isFiltering={isFiltering}
        />
      </div>
    </div>
  );
} 