'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface FilterCheckboxProps {
  label: string;
  count?: number;
  checked?: boolean;
  onChange?: () => void;
  disabled?: boolean;
}

export function FilterCheckbox({
  label,
  count,
  checked = false,
  onChange,
  disabled = false
}: FilterCheckboxProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`filter-${label.toLowerCase().replace(/\s+/g, '-')}`}
          checked={checked}
          onCheckedChange={onChange}
          disabled={disabled}
          className={cn(
            "data-[state=checked]:bg-primary data-[state=checked]:border-primary",
            "focus-visible:ring-primary border-border"
          )}
        />
        <label
          htmlFor={`filter-${label.toLowerCase().replace(/\s+/g, '-')}`}
          className={cn(
            "text-sm font-medium cursor-pointer",
            checked ? "text-foreground" : "text-muted-foreground",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {label}
        </label>
      </div>
      {/* SHOW COUNT NEXT TO FILTER */}
      {/* {count !== undefined && (
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {count}
        </span>
      )} */}
    </div>
  );
} 