import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param currency - The currency code (default: 'USD')
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number | null | undefined, currency: string = 'USD'): string {
  if (amount === null || amount === undefined) {
    return '';
  }
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (error) {
    // Fallback for invalid currency codes
    return `${currency} ${amount.toLocaleString()}`;
  }
}

/**
 * Get initials from a full name
 * @param name - The full name to extract initials from
 * @returns The initials (1-2 characters)
 */
export function getInitials(name: string): string {
  if (!name) return '';
  
  const parts = name.split(' ').filter(Boolean);
  
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Format enum values by replacing underscores with spaces and properly capitalizing
 * @param value - The enum value to format (e.g., 'FULL_TIME', 'ON_SITE')
 * @returns Formatted string (e.g., 'Full Time', 'On Site')
 */
export function formatEnumValue(value: string): string {
  if (!value) return '';
  
  // Replace underscores with spaces and convert to lowercase
  const spacedValue = value.replace(/_/g, ' ').toLowerCase();
  
  // Capitalize each word
  return spacedValue
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
