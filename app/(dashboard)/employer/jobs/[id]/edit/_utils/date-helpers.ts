/**
 * Converts a Date object to a string format suitable for date input fields (YYYY-MM-DD)
 */
export function dateToInputFormat(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0') // getMonth is 0-indexed
  const day = String(date.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
} 