/**
 * Formatting utilities for applications
 */

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

// Format work location
export function formatWorkLocation(location: string): string {
  switch (location) {
    case 'REMOTE':
      return 'Remote'
    case 'HYBRID':
      return 'Hybrid'
    case 'ON_SITE':
      return 'On-site'
    default:
      return location
  }
}

// Format job type
export function formatJobType(type: string): string {
  switch (type) {
    case 'FULL_TIME':
      return 'Full-time'
    case 'PART_TIME':
      return 'Part-time'
    case 'PERMANENT':
      return 'Permanent'
    case 'FIXED_TERM_CONTRACT':
      return 'Fixed-term Contract'
    case 'CASUAL':
      return 'Casual'
    case 'SEASONAL':
      return 'Seasonal'
    case 'FREELANCE':
      return 'Freelance'
    case 'APPRENTICESHIP':
      return 'Apprenticeship'
    case 'INTERNSHIP':
      return 'Internship'
    default:
      return type
  }
}

// Format date for display
export function formatDate(date: Date | string | null): string {
  if (!date) return 'N/A'
  
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short', 
    year: 'numeric'
  })
}

// Format salary for display
export function formatSalary(
  salaryMin: number | null, 
  salaryMax: number | null, 
  currency: string = 'GMD',
  displayType: string = 'RANGE',
  frequency: string = 'YEAR'
): string {
  // Handle missing salary data
  if (!salaryMin && !salaryMax) return 'Salary not specified'
  
  // Currency formatter
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'GMD',
    maximumFractionDigits: 0,
  })
  
  // Format by display type
  switch (displayType) {
    case 'RANGE':
      if (salaryMin && salaryMax) {
        return `${currencyFormatter.format(salaryMin)} - ${currencyFormatter.format(salaryMax)} per ${formatFrequency(frequency)}`
      } else if (salaryMin) {
        return `From ${currencyFormatter.format(salaryMin)} per ${formatFrequency(frequency)}`
      } else if (salaryMax) {
        return `Up to ${currencyFormatter.format(salaryMax)} per ${formatFrequency(frequency)}`
      }
      break
    case 'FIXED':
      if (salaryMin) {
        return `${currencyFormatter.format(salaryMin)} per ${formatFrequency(frequency)}`
      }
      break
    case 'STARTING_AMOUNT':
      if (salaryMin) {
        return `Starting from ${currencyFormatter.format(salaryMin)} per ${formatFrequency(frequency)}`
      }
      break
    case 'MAXIMUM_AMOUNT':
      if (salaryMax) {
        return `Up to ${currencyFormatter.format(salaryMax)} per ${formatFrequency(frequency)}`
      }
      break
    case 'NEGOTIABLE':
      return 'Negotiable'
    default:
      if (salaryMin) {
        return `${currencyFormatter.format(salaryMin)} per ${formatFrequency(frequency)}`
      }
  }
  
  return 'Salary not specified'
}

// Format salary frequency
function formatFrequency(frequency: string): string {
  switch (frequency) {
    case 'HOUR':
      return 'hour'
    case 'DAY':
      return 'day'
    case 'WEEK':
      return 'week' 
    case 'MONTH':
      return 'month'
    case 'YEAR':
      return 'year'
    default:
      return frequency.toLowerCase()
  }
} 