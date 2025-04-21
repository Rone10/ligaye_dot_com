'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useJobFilters } from '../_hooks/useJobFilters';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface JobPaginationProps {
  currentPage: number;
  totalPages: number;
}

export function JobPagination({ currentPage, totalPages }: JobPaginationProps) {
  const { filters, setFilters } = useJobFilters();
  const router = useRouter();
  const pathname = usePathname();
  
  // Calculate which page buttons to show
  const [visiblePages, setVisiblePages] = useState<(number | null)[]>([]);

  useEffect(() => {
    // Logic to determine which page numbers to show
    const calculateVisiblePages = () => {
      const pages: (number | null)[] = [];
      
      // Always show first page
      pages.push(1);
      
      // Show dots if there's a gap after page 1
      if (currentPage > 3) {
        pages.push(null); // represents dots
      }
      
      // Show pages around current page
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust start and end to always show 3 pages if possible
      if (start === 2 && totalPages > 4) {
        end = Math.min(4, totalPages - 1);
      }
      if (end === totalPages - 1 && totalPages > 4) {
        start = Math.max(2, totalPages - 3);
      }
      
      // Add the range of pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Show dots if there's a gap before the last page
      if (currentPage < totalPages - 2) {
        pages.push(null); // represents dots
      }
      
      // Always show last page if more than 1 page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
      
      return pages;
    };
    
    setVisiblePages(calculateVisiblePages());
  }, [currentPage, totalPages]);

  const handlePageChange = (page: number) => {
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Update URL state
    setFilters({ page });
  };

  return (
    <nav aria-label="Pagination" className="flex justify-center my-8">
      <ul className="flex items-center space-x-2">
        {/* Previous Page Button */}
        <li>
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            aria-label="Previous page"
            className="h-9 w-9 rounded-md"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </li>
        
        {/* Page Numbers */}
        {visiblePages.map((page, index) => 
          page === null ? (
            <li key={`dots-${index}`} className="px-2">
              <MoreHorizontal className="h-5 w-5 text-gray-400" />
            </li>
          ) : (
            <li key={page}>
              <Button
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
                className={`h-9 w-9 rounded-md ${
                  page === currentPage 
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "text-gray-700"
                }`}
                aria-current={page === currentPage ? "page" : undefined}
              >
                {page}
              </Button>
            </li>
          )
        )}
        
        {/* Next Page Button */}
        <li>
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            aria-label="Next page"
            className="h-9 w-9 rounded-md"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </li>
      </ul>
    </nav>
  );
} 