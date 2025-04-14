'use client'

import { formatApplicationStatus } from '../../_utils/formatters'

interface ApplicationStatusBadgeProps {
  status: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function ApplicationStatusBadge({ 
  status, 
  className = '',
  size = 'md'
}: ApplicationStatusBadgeProps) {
  const statusInfo = formatApplicationStatus(status)
  
  // Determine size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  }
  
  return (
    <span 
      className={`inline-flex items-center rounded-full font-medium ${statusInfo.color} ${sizeClasses[size]} ${className}`}
    >
      {statusInfo.label}
    </span>
  )
} 