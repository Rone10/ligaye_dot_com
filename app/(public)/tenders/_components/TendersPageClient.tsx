'use client';

import { useState } from 'react';
import { TenderFilters } from './TenderFilters';
import { TenderList } from './TenderList';
import type { TenderWithRelations } from '../_queries';
import type { Sector } from '@/lib/db/schema';
import type { User } from '@supabase/supabase-js';

interface TendersPageClientProps {
  tenders: TenderWithRelations[];
  totalCount: number;
  currentPage: number;
  limit: number;
  sectors: Sector[];
  user: User | null;
}

export function TendersPageClient({
  tenders,
  totalCount,
  currentPage,
  limit,
  sectors,
  user,
}: TendersPageClientProps) {
  const [isFiltering, setIsFiltering] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-xl">
      {/* Filter Sidebar */}
      <div className="lg:sticky lg:top-xl lg:h-fit">
        <TenderFilters 
          sectors={sectors} 
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
          user={user}
        />
      </div>
    </div>
  );
} 