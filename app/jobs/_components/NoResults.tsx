import { SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useJobFilters } from '../_hooks/useJobFilters';

interface NoResultsProps {
  customMessage?: string;
  showResetButton?: boolean;
}

export function NoResults({ 
  customMessage,
  showResetButton = true 
}: NoResultsProps) {
  const { resetFilters } = useJobFilters();

  return (
    <div className="bg-white/70 backdrop-blur-md border border-gray-200 rounded-lg p-12 shadow-sm text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-blue-50 rounded-full p-4">
          <SearchX className="h-12 w-12 text-blue-500" />
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-3">
        No jobs found
      </h3>
      
      <p className="text-gray-600 mb-6">
        {customMessage || 'We couldn\'t find any jobs matching your current filters. Try adjusting your search criteria.'}
      </p>
      
      {showResetButton && (
        <Button 
          onClick={resetFilters}
          variant="outline"
          className="border-blue-300 text-blue-700 hover:bg-blue-50"
        >
          Clear All Filters
        </Button>
      )}
    </div>
  );
} 