import { 
  jobTypeEnum, 
  workLocationEnum, 
  experienceLevelEnum,
  applicationMethodEnum,
  salaryFrequencyEnum
} from '@/lib/db/schema';

// Display labels for job types
export const jobTypeLabels: Record<string, string> = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  PERMANENT: 'Permanent',
  FIXED_TERM_CONTRACT: 'Fixed Term Contract',
  CASUAL: 'Casual',
  SEASONAL: 'Seasonal',
  FREELANCE: 'Freelance',
  APPRENTICESHIP: 'Apprenticeship',
  INTERNSHIP: 'Internship'
};

// Display labels for work locations
export const workLocationLabels: Record<string, string> = {
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
  ON_SITE: 'On-site'
};

// Display labels for experience levels
export const experienceLevelLabels: Record<string, string> = {
  Entry: 'Entry Level',
  Junior: 'Junior',
  'Mid-Level': 'Mid-Level',
  Senior: 'Senior',
  Director: 'Director',
  Executive: 'Executive'
};

// Display labels for application methods
export const applicationMethodLabels: Record<string, string> = {
  EMAIL: 'Apply via Email',
  WEBSITE: 'Apply on Company Website',
  PHONE: 'Apply via Phone',
  IN_PERSON: 'Apply in Person',
  PLATFORM: 'Apply on Ligaye.com'
};

// Display labels for salary frequencies
export const salaryFrequencyLabels: Record<string, string> = {
  HOUR: 'per hour',
  DAY: 'per day',
  WEEK: 'per week',
  MONTH: 'per month',
  YEAR: 'per year'
};

// Options arrays for dropdowns
export const jobTypeOptions = Object.entries(jobTypeLabels).map(([value, label]) => ({
  value,
  label
}));

export const workLocationOptions = Object.entries(workLocationLabels).map(([value, label]) => ({
  value,
  label
}));

export const experienceLevelOptions = Object.entries(experienceLevelLabels).map(([value, label]) => ({
  value,
  label
}));

// Format currency value
export function formatCurrency(amount: number, currency: string = 'GMD'): string {
  // Ensure currency is not empty, default to GMD
  const currencyCode = currency && currency.trim() ? currency : 'GMD';
  
  return new Intl.NumberFormat('en-GM', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0
  }).format(amount);
}

// Format salary display based on range and preferences
export function formatSalaryDisplay({
  min,
  max,
  currency = 'GMD',
  frequency,
  displayType
}: {
  min: number | null;
  max: number | null;
  currency?: string;
  frequency: typeof salaryFrequencyEnum.enumValues[number] | null;
  displayType: string;
}): string {
  const frequencyLabel = frequency ? salaryFrequencyLabels[frequency] : '';
  
  switch (displayType) {
    case 'RANGE':
      if (min && max) {
        return `${formatCurrency(min, currency)} - ${formatCurrency(max, currency)} ${frequencyLabel}`;
      }
      break;
    case 'FIXED':
      if (min) {
        return `${formatCurrency(min, currency)} ${frequencyLabel}`;
      }
      break;
    case 'STARTING_AMOUNT':
      if (min) {
        return `From ${formatCurrency(min, currency)} ${frequencyLabel}`;
      }
      break;
    case 'MAXIMUM_AMOUNT':
      if (max) {
        return `Up to ${formatCurrency(max, currency)} ${frequencyLabel}`;
      }
      break;
    case 'NEGOTIABLE':
    default:
      return 'Negotiable';
  }
  
  // Fallback for incomplete data
  if (min) {
    return `From ${formatCurrency(min, currency)} ${frequencyLabel}`;
  }
  if (max) {
    return `Up to ${formatCurrency(max, currency)} ${frequencyLabel}`;
  }
  
  return 'Salary Negotiable';
} 