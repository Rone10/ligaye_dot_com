'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TenderCard } from './TenderCard';
import { deleteTenderAction } from '../_actions';
import type { TenderWithRelations } from '../_queries';
import { User } from '@supabase/supabase-js';
import { TenderPagination } from './TenderPagination';

interface TenderListProps {
  tenders: TenderWithRelations[];
  totalCount: number;
  currentPage: number;
  limit: number;
  isFiltering?: boolean;
  user: User | null;
}

export function TenderList({
  tenders,
  totalCount,
  currentPage,
  limit,
  isFiltering = false,
  user,
}: TenderListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const handleDelete = async (tenderId: string) => {
    setDeletingId(tenderId);
    try {
      const result = await deleteTenderAction(tenderId);
      if (!result.success) {
        console.error('Delete failed:', result.error);
      }
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages = Math.ceil(totalCount / limit);

  if (tenders.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-sm">
        <h3 className="text-xl font-semibold text-foreground">No tenders found</h3>
        <p className="text-muted-foreground max-w-md">
          There are no tenders matching your current filters. Try adjusting your search criteria.
        </p>
        {user && user.user_metadata.role === 'employer' && (
          <Button asChild className="mt-4">
            <Link href="/tenders/new" className="gap-2">
              <Plus className="h-4 w-4" />
              Create New Tender
            </Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Loading Banner */}
      {isFiltering && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-center justify-center gap-3">
          <Loader2 className="h-5 w-5 text-primary animate-spin" />
          <p className="text-sm font-medium text-primary">Updating results...</p>
        </div>
      )}

      {/* Tender Cards */}
      <div className={`space-y-4 ${isFiltering ? 'opacity-60 pointer-events-none' : ''}`}>
        {tenders.map(tender => (
          <TenderCard
            key={tender.id}
            tender={tender}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <TenderPagination
          currentPage={currentPage}
          totalPages={totalPages}
        />
      )}

      {/* Results Summary */}
      <div className="text-center pt-4">
        <p className="text-muted-foreground text-sm">
          {totalCount} {totalCount === 1 ? 'tender' : 'tenders'} found
        </p>
      </div>
    </div>
  );
} 