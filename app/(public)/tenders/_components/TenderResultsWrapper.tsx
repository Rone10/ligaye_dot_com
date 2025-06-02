'use client';

import { Loader2 } from 'lucide-react';
import { useFilterContext } from './FilterContext';

interface TenderResultsWrapperProps {
  children: React.ReactNode;
}

export function TenderResultsWrapper({ children }: TenderResultsWrapperProps) {
  const { isFiltering } = useFilterContext();

  return (
    <div className="relative">
      {children}
      
      {/* Loading Overlay */}
      {isFiltering && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
          <div className="glass-card p-lg rounded-xl shadow-level-3 flex items-center gap-md">
            <Loader2 className="h-6 w-6 text-primary-blue animate-spin" />
            <div className="text-center">
              <p className="text-lg font-semibold text-theme-dark">Updating results...</p>
              <p className="text-sm text-theme-gray-dark">Applying your filters</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 