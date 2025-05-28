'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TenderCard } from './TenderCard';
import { deleteTenderAction } from '../_actions';
import type { TenderWithRelations } from '../_queries';

interface TenderListProps {
  tenders: TenderWithRelations[];
  currentUserId?: string;
  totalCount: number;
  currentPage: number;
  limit: number;
}

export function TenderList({
  tenders,
  currentUserId,
  totalCount,
  currentPage,
  limit,
}: TenderListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (tenderId: string) => {
    setDeletingId(tenderId);
    try {
      const result = await deleteTenderAction(tenderId);
      if (!result.success) {
        console.error('Delete failed:', result.error);
        // You might want to show a toast notification here
      }
      // The page will revalidate automatically due to revalidatePath in the action
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages = Math.ceil(totalCount / limit);

  if (tenders.length === 0) {
    return (
      <Card className="glass-card p-2xl rounded-xl shadow-level-2">
        <CardContent className="flex flex-col items-center justify-center py-2xl">
          <div className="text-center space-y-lg">
            <div className="space-y-sm">
              <h3 className="text-2xl font-semibold text-theme-dark">No tenders found</h3>
              <p className="text-theme-gray-dark text-lg">
                There are no tenders matching your current filters.
              </p>
            </div>
            {currentUserId && (
              <Button asChild className="shadow-level-2 hover:shadow-level-3 duration-standard">
                <Link href="/tenders/new" className="gap-xs">
                  <Plus className="h-4 w-4" />
                  Create New Tender
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-xl">
   
      
      {/* Tender Cards */}
      <div className="max-w-5xl mx-auto space-y-lg">
        {tenders.map(tender => (
          <TenderCard 
            key={tender.id} 
            tender={tender} 
            currentUserId={currentUserId}
            onDelete={handleDelete}
          />
        ))}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-2xl">
          <div className="flex items-center gap-sm">
            {currentPage > 1 && (
              <Button variant="outline" asChild>
                <Link 
                  href={{
                    pathname: '/tenders',
                    query: { 
                      page: (currentPage - 1).toString(),
                      limit: limit.toString()
                    }
                  }}
                  className="gap-xs"
                >
                  Previous
                </Link>
              </Button>
            )}
            
            <span className="px-lg py-sm text-sm text-theme-gray-dark bg-theme-light/50 rounded-md border border-theme-gray/30">
              Page {currentPage} of {totalPages}
            </span>
            
            {currentPage < totalPages && (
              <Button variant="outline" asChild>
                <Link 
                  href={{
                    pathname: '/tenders',
                    query: { 
                      page: (currentPage + 1).toString(),
                      limit: limit.toString()
                    }
                  }}
                  className="gap-xs"
                >
                  Next
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
         {/* Results Summary */}
         <div className="text-center">
        <p className="text-theme-gray-dark text-sm">
          {totalCount} {totalCount === 1 ? 'tender' : 'tenders'} found • Page {currentPage} of {totalPages}
        </p>
      </div>
    </div>
  );
} 