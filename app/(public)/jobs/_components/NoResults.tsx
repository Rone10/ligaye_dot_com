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
    <div className="glass-card p-12 text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-primary/10 rounded-full p-4">
          <SearchX className="h-12 w-12 text-primary" />
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-foreground mb-3">
        No jobs found
      </h3>
      
      <p className="text-muted-foreground mb-6">
        {customMessage || 'We couldn\'t find any jobs matching your current filters. Try adjusting your search criteria.'}
      </p>
      
      {showResetButton && (
        <Button 
          onClick={resetFilters}
          variant="outline"
          className="border-primary text-primary hover:bg-primary/10"
        >
          Clear All Filters
        </Button>
      )}
    </div>
  );
} 