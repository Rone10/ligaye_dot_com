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
            "data-[state=checked]:bg-[#4a6cfa] data-[state=checked]:border-[#4a6cfa]",
            "focus-visible:ring-[#4a6cfa]"
          )}
        />
        <label
          htmlFor={`filter-${label.toLowerCase().replace(/\s+/g, '-')}`}
          className={cn(
            "text-sm font-medium cursor-pointer",
            checked ? "text-[#1a1e2d]" : "text-[#505973]",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {label}
        </label>
      </div>
      {count !== undefined && (
        <span className="text-xs text-[#9aa3bc] bg-[#f0f2f8] px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </div>
  );
} 