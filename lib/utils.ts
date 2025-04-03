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
