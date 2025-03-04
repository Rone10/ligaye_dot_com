'use client';

import { ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  children: ReactNode;
  error?: string;
  className?: string;
  description?: string;
  required?: boolean;
}

export function FormField({ 
  label, 
  children, 
  error, 
  className,
  description,
  required = false
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="space-y-1">
        <Label className="flex space-x-1">
          <span>{label}</span>
          {required && <span className="text-red-500">*</span>}
        </Label>
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
      </div>
      
      {children}
      
      {error && (
        <p className="text-sm font-medium text-destructive">{error}</p>
      )}
    </div>
  );
} 