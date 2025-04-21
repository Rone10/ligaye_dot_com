import { format, formatDistance } from 'date-fns'

// Format date to display format
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'N/A'
  
  const dateObj = date instanceof Date ? date : new Date(date)
  return format(dateObj, 'MMM d, yyyy')
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
      return { label: 'Active', color: 'bg-green-100 text-green-800 border-green-300' }
    case 'DRAFT':
      return { label: 'Draft', color: 'bg-gray-100 text-gray-800 border-gray-300' }
    case 'PENDING_PAYMENT':
      return { label: 'Pending Payment', color: 'bg-amber-100 text-amber-800 border-amber-300' }
    case 'EXPIRED':
      return { label: 'Expired', color: 'bg-gray-100 text-gray-800 border-gray-300' }
    case 'FILLED':
      return { label: 'Filled', color: 'bg-blue-100 text-blue-800 border-blue-300' }
    case 'DELETED':
      return { label: 'Deleted', color: 'bg-red-100 text-red-800 border-red-300' }
    default:
      return { label: status, color: 'bg-gray-100 text-gray-800 border-gray-300' }
  }
}

// Format application status
export function formatApplicationStatus(status: string): { label: string; color: string } {
  switch (status) {
    case 'APPLIED':
      return { label: 'Applied', color: 'bg-gray-100 text-gray-800 border-gray-300' }
    case 'REVIEWING':
      return { label: 'Reviewing', color: 'bg-blue-100 text-blue-800 border-blue-300' }
    case 'SHORTLISTED':
      return { label: 'Shortlisted', color: 'bg-purple-100 text-purple-800 border-purple-300' }
    case 'INTERVIEW_SCHEDULED':
      return { label: 'Interview Scheduled', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' }
    case 'INTERVIEWED':
      return { label: 'Interviewed', color: 'bg-cyan-100 text-cyan-800 border-cyan-300' }
    case 'OFFER_EXTENDED':
      return { label: 'Offer Extended', color: 'bg-amber-100 text-amber-800 border-amber-300' }
    case 'HIRED':
      return { label: 'Hired', color: 'bg-green-100 text-green-800 border-green-300' }
    case 'REJECTED':
      return { label: 'Rejected', color: 'bg-red-100 text-red-800 border-red-300' }
    case 'WITHDRAWN':
      return { label: 'Withdrawn', color: 'bg-rose-100 text-rose-800 border-rose-300' }
    default:
      return { label: status, color: 'bg-gray-100 text-gray-800 border-gray-300' }
  }
} 