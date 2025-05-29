import { salaryFrequencyEnum, salaryDisplayTypeEnum } from '@/lib/db/schema';

/**
 * Convert salary to annual amount for comparison
 * All salaries are normalized to yearly amounts for filtering
 */
export function normalizeToAnnual(
  amount: number,
  frequency: typeof salaryFrequencyEnum.enumValues[number] | null
): number {
  if (!frequency) return amount; // Assume annual if no frequency specified
  
  switch (frequency) {
    case 'HOUR':
      return amount * 40 * 52; // 40 hours/week * 52 weeks/year
    case 'DAY':
      return amount * 5 * 52; // 5 days/week * 52 weeks/year
    case 'WEEK':
      return amount * 52;
    case 'MONTH':
      return amount * 12;
    case 'YEAR':
    default:
      return amount;
  }
}

/**
 * Get effective salary range for filtering based on display type
 * Returns [min, max] that should be used for comparison
 */
export function getEffectiveSalaryRange(
  salaryMin: number | null,
  salaryMax: number | null,
  displayType: typeof salaryDisplayTypeEnum.enumValues[number] | null,
  frequency: typeof salaryFrequencyEnum.enumValues[number] | null
): [number | null, number | null] {
  if (!salaryMin && !salaryMax) return [null, null];
  
  // Normalize to annual amounts
  const normalizedMin = salaryMin ? normalizeToAnnual(salaryMin, frequency) : null;
  const normalizedMax = salaryMax ? normalizeToAnnual(salaryMax, frequency) : null;
  
  switch (displayType) {
    case 'RANGE':
      return [normalizedMin, normalizedMax];
    
    case 'FIXED':
      // For fixed salary, use the min value as both min and max
      return [normalizedMin, normalizedMin];
    
    case 'STARTING_AMOUNT':
      // Starting amount means this is the minimum, no upper limit from this job
      return [normalizedMin, null];
    
    case 'MAXIMUM_AMOUNT':
      // Maximum amount means this is the upper limit, no lower limit from this job
      return [null, normalizedMax];
    
    case 'NEGOTIABLE':
      // Negotiable salaries should be included in all searches
      return [null, null];
    
    default:
      return [normalizedMin, normalizedMax];
  }
}

/**
 * Check if a job's salary matches the filter criteria
 */
export function doesSalaryMatchFilter(
  jobSalaryMin: number | null,
  jobSalaryMax: number | null,
  jobDisplayType: typeof salaryDisplayTypeEnum.enumValues[number] | null,
  jobFrequency: typeof salaryFrequencyEnum.enumValues[number] | null,
  filterMin: number | null,
  filterMax: number | null,
  includeNegotiable: boolean = true
): boolean {
  // If job has negotiable salary and we include negotiable, it matches
  if (jobDisplayType === 'NEGOTIABLE' && includeNegotiable) {
    return true;
  }
  
  // Get the effective salary range for this job
  const [effectiveMin, effectiveMax] = getEffectiveSalaryRange(
    jobSalaryMin,
    jobSalaryMax,
    jobDisplayType,
    jobFrequency
  );
  
  // If job has no salary info and it's not negotiable, exclude it
  if (effectiveMin === null && effectiveMax === null && jobDisplayType !== 'NEGOTIABLE') {
    return false;
  }
  
  // Check if job salary range overlaps with filter range
  if (filterMin !== null && effectiveMax !== null && effectiveMax < filterMin) {
    return false; // Job's max is below filter's min
  }
  
  if (filterMax !== null && effectiveMin !== null && effectiveMin > filterMax) {
    return false; // Job's min is above filter's max
  }
  
  return true;
}

/**
 * Format salary for display with proper frequency and currency
 */
export function formatSalaryDisplay(
  salaryMin: number | null,
  salaryMax: number | null,
  currency: string = 'GMD',
  frequency: typeof salaryFrequencyEnum.enumValues[number] | null,
  displayType: typeof salaryDisplayTypeEnum.enumValues[number] | null
): string {
  if (displayType === 'NEGOTIABLE') {
    return 'Negotiable';
  }
  
  if (!salaryMin && !salaryMax) {
    return 'Salary not specified';
  }
  
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const frequencyLabel = frequency ? ` per ${frequency.toLowerCase()}` : '';
  
  switch (displayType) {
    case 'RANGE':
      if (salaryMin && salaryMax) {
        return `${formatAmount(salaryMin)} - ${formatAmount(salaryMax)}${frequencyLabel}`;
      } else if (salaryMin) {
        return `From ${formatAmount(salaryMin)}${frequencyLabel}`;
      } else if (salaryMax) {
        return `Up to ${formatAmount(salaryMax)}${frequencyLabel}`;
      }
      break;
    
    case 'FIXED':
      if (salaryMin) {
        return `${formatAmount(salaryMin)}${frequencyLabel}`;
      }
      break;
    
    case 'STARTING_AMOUNT':
      if (salaryMin) {
        return `Starting from ${formatAmount(salaryMin)}${frequencyLabel}`;
      }
      break;
    
    case 'MAXIMUM_AMOUNT':
      if (salaryMax) {
        return `Up to ${formatAmount(salaryMax)}${frequencyLabel}`;
      }
      break;
    
    default:
      if (salaryMin && salaryMax) {
        return `${formatAmount(salaryMin)} - ${formatAmount(salaryMax)}${frequencyLabel}`;
      } else if (salaryMin) {
        return `From ${formatAmount(salaryMin)}${frequencyLabel}`;
      } else if (salaryMax) {
        return `Up to ${formatAmount(salaryMax)}${frequencyLabel}`;
      }
  }
  
  return 'Salary not specified';
} 