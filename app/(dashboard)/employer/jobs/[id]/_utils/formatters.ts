import { format, formatDistance } from 'date-fns'

// Format date to display format
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'N/A'
  
  const dateObj = date instanceof Date ? date : new Date(date)
  return format(dateObj, 'dd MMM yyyy')
}

// Format relative time
export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return 'N/A'
  
  const dateObj = date instanceof Date ? date : new Date(date)
  return formatDistance(dateObj, new Date(), { addSuffix: true })
}

// Format salary display
export function formatSalary(
  min?: number | null, 
  max?: number | null, 
  currency = 'GMD', 
  frequency?: string | null,
  displayType?: string | null
): string {
  if (displayType === 'NEGOTIABLE') {
    return 'Negotiable'
  }
  
  // If no salary data
  if (!min && !max) {
    return 'Not specified'
  }
  
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'GMD',
      maximumFractionDigits: 0,
    }).format(value)
  }
  
  // Format based on display type
  switch (displayType) {
    case 'RANGE':
      if (min && max) {
        return `${formatCurrency(min)} - ${formatCurrency(max)}${frequency ? ` per ${formatFrequency(frequency)}` : ''}`
      }
      break
    case 'FIXED':
      if (min) {
        return `${formatCurrency(min)}${frequency ? ` per ${formatFrequency(frequency)}` : ''}`
      }
      break
    case 'STARTING_AMOUNT':
      if (min) {
        return `Starting at ${formatCurrency(min)}${frequency ? ` per ${formatFrequency(frequency)}` : ''}`
      }
      break
    case 'MAXIMUM_AMOUNT':
      if (max) {
        return `Up to ${formatCurrency(max)}${frequency ? ` per ${formatFrequency(frequency)}` : ''}`
      }
      break
    default:
      // Default to range if both values exist
      if (min && max) {
        return `${formatCurrency(min)} - ${formatCurrency(max)}${frequency ? ` per ${formatFrequency(frequency)}` : ''}`
      } else if (min) {
        return `From ${formatCurrency(min)}${frequency ? ` per ${formatFrequency(frequency)}` : ''}`
      } else if (max) {
        return `Up to ${formatCurrency(max)}${frequency ? ` per ${formatFrequency(frequency)}` : ''}`
      }
  }
  
  return 'Not specified'
}

// Format salary frequency
function formatFrequency(frequency: string): string {
  switch (frequency) {
    case 'HOUR': return 'hour'
    case 'DAY': return 'day'
    case 'WEEK': return 'week'
    case 'MONTH': return 'month'
    case 'YEAR': return 'year'
    default: return frequency.toLowerCase()
  }
}

// Format job status for display
export function formatJobStatus(status: string): { label: string; color: string } {
  switch (status) {
    case 'ACTIVE':
      return { label: 'Active', color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700' }
    case 'DRAFT':
      return { label: 'Draft', color: 'bg-muted text-muted-foreground border-border' }
    case 'PENDING_PAYMENT':
      return { label: 'Pending Payment', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700' }
    case 'EXPIRED':
      return { label: 'Expired', color: 'bg-muted text-muted-foreground border-border' }
    case 'FILLED':
      return { label: 'Filled', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700' }
    case 'DELETED':
      return { label: 'Deleted', color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700' }
    default:
      return { label: status, color: 'bg-muted text-muted-foreground border-border' }
  }
}

// Format application status
export function formatApplicationStatus(status: string): { label: string; color: string } {
  switch (status) {
    case 'APPLIED':
      return { label: 'Applied', color: 'bg-muted text-muted-foreground border-border' }
    case 'REVIEWING':
      return { label: 'Reviewing', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700' }
    case 'SHORTLISTED':
      return { label: 'Shortlisted', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700' }
    case 'INTERVIEW_SCHEDULED':
      return { label: 'Interview Scheduled', color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700' }
    case 'INTERVIEWED':
      return { label: 'Interviewed', color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700' }
    case 'OFFER_EXTENDED':
      return { label: 'Offer Extended', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700' }
    case 'HIRED':
      return { label: 'Hired', color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700' }
    case 'REJECTED':
      return { label: 'Rejected', color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700' }
    case 'WITHDRAWN':
      return { label: 'Withdrawn', color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700' }
    default:
      return { label: status, color: 'bg-muted text-muted-foreground border-border' }
  }
} 