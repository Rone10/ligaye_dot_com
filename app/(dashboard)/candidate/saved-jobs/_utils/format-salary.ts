interface SalaryInfo {
  salaryCurrency: string | null
  salaryRangeMin: number | null
  salaryRangeMax: number | null
  salaryFrequency: string | null
  salaryDisplayType: string | null
}

/**
 * Formats salary information in a user-friendly way
 */
export function formatSalary(salary: SalaryInfo): string {
  if (!salary.salaryRangeMin && !salary.salaryRangeMax) {
    return 'Salary not specified'
  }

  // Handle different display types
  if (salary.salaryDisplayType === 'EXACT') {
    // For exact salary display
    const amount = salary.salaryRangeMin?.toLocaleString() || '0'
    const currency = salary.salaryCurrency || 'USD'
    const frequency = salary.salaryFrequency ? `/${salary.salaryFrequency.toLowerCase()}` : ''
    
    return `${currency} ${amount}${frequency}`
  } else if (salary.salaryDisplayType === 'COMPETITIVE') {
    // For competitive salary display
    return 'Competitive salary'
  } else {
    // Default range display
    const currency = salary.salaryCurrency || 'USD'
    const min = salary.salaryRangeMin?.toLocaleString() || 'N/A'
    const max = salary.salaryRangeMax?.toLocaleString() || 'N/A'
    const frequency = salary.salaryFrequency ? `/${salary.salaryFrequency.toLowerCase()}` : ''

    return `${currency} ${min} - ${max}${frequency}`
  }
} 