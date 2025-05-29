'use client';

import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  onClear?: () => void;
  showClear?: boolean;
  maxHeight?: string; // Allow custom max height
}

export function FilterSection({
  title,
  children,
  defaultExpanded = false,
  onClear,
  showClear = false,
  maxHeight = "max-h-[500px]" // Default max height
}: FilterSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    setIsExpanded(prev => !prev);
  };

  return (
    <div className="rounded-[12px] overflow-hidden">
      <div 
        className="flex items-center justify-between p-3 cursor-pointer"
        onClick={toggleExpanded}
      >
        <h3 className="font-semibold">{title}</h3>
        <div className="flex items-center gap-2">
          {showClear && onClear && (
            <button
              className="hover:text-[#1a1e2d] transition-colors p-1 rounded-full"
              onClick={(e) => {
                e.stopPropagation(); // Prevent section from collapsing when clearing
                onClear();
              }}
              aria-label={`Clear ${title} filters`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <ChevronDown 
            className={cn(
              "w-5 h-5 transition-transform duration-200",
              isExpanded && "transform rotate-180"
            )} 
          />
        </div>
      </div>
      
      <div 
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isExpanded ? `${maxHeight} opacity-100` : "max-h-0 opacity-0"
        )}
      >
        <div className="p-3 pt-0 border-t border-[rgba(255,255,255,0.15)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
} 