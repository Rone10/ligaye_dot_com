'use client';

import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MobileFilterToggleProps {
  count: number;
  onClick: () => void;
}

export function MobileFilterToggle({ count, onClick }: MobileFilterToggleProps) {
  return (
    <div className="fixed top-20 right-6 z-30">
      <Button
        onClick={onClick}
        className="rounded-full w-14 h-14 shadow-level-2 bg-primary hover:bg-primary/90 text-white relative"
        size="icon"
        aria-label="Filter jobs"
      >
        <Filter className="h-5 w-5" />
        {count > 0 && (
          <Badge
            className="absolute -top-2 -right-2 h-6 min-w-6 rounded-full bg-secondary text-white border-2 border-background text-xs flex items-center justify-center p-0"
          >
            {count}
          </Badge>
        )}
      </Button>
    </div>
  );
} 