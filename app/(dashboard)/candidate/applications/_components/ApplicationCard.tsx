'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistance } from 'date-fns'
import { Briefcase, Building, MapPin, CalendarClock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  formatApplicationStatus, 
  formatWorkLocation, 
  formatJobType, 
  formatDate, 
  formatSalary 
} from '../_utils/formatters'

// Define application type based on structure from applications query
type ApplicationCardProps = {
  application: {
    id: string
    status: string
    appliedAt: Date | string
    interviewDate?: Date | string | null
    notes?: string | null
    resumeUrl?: string | null
    coverLetterUrl?: string | null
  }
  job: {
    id: string
    title: string
    workLocation: string
    jobType: string
    experienceLevel?: string | null
    status: string
    publishedAt?: Date | string | null
    expiresAt?: Date | string | null
    salaryCurrency?: string | null
    salaryRangeMin?: number | null
    salaryRangeMax?: number | null
    salaryFrequency?: string | null
    salaryDisplayType?: string | null
  }
  employer: {
    id: string
    companyName: string
    companyLogoUrl?: string | null
  }
}

export default function ApplicationCard({ application, job, employer }: ApplicationCardProps) {
  const [expanded, setExpanded] = useState(false)
  
  // Format application status
  const status = formatApplicationStatus(application.status)
  
  // Format time since application
  const timeAgo = application.appliedAt 
    ? formatDistance(new Date(application.appliedAt), new Date(), { addSuffix: true })
    : 'Unknown'
  
  // Format work location and job type
  const workLocation = formatWorkLocation(job.workLocation)
  const jobType = formatJobType(job.jobType)
  
  // Format salary information
  const salary = formatSalary(
    job.salaryRangeMin || null,
    job.salaryRangeMax || null,
    job.salaryCurrency || 'GMD',
    job.salaryDisplayType || 'RANGE',
    job.salaryFrequency || 'YEAR'
  )
  
  // Get company initials for avatar fallback
  const companyInitials = employer.companyName
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
  
  return (
    <div className="bg-white/70 backdrop-blur-md rounded-xl border border-[rgba(255,255,255,0.3)] overflow-hidden shadow-[0_8px_32px_rgba(31,38,135,0.1)] transition-all duration-200 hover:translate-y-[-2px] hover:shadow-[0_12px_36px_rgba(31,38,135,0.15)]">
      <div className="p-6">
        {/* Application status & timestamp */}
        <div className="flex justify-between items-center mb-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
            {status.label}
          </span>
          <span className="text-xs text-gray-500">Applied {timeAgo}</span>
        </div>
        
        {/* Job title and company */}
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 rounded-md border border-gray-100 flex-shrink-0">
            <AvatarImage src={employer.companyLogoUrl || ''} alt={employer.companyName} />
            <AvatarFallback className="bg-[#4a6cfa]/10 text-[#4a6cfa] rounded-md">
              {companyInitials}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h3 className="text-lg font-semibold text-[#1a1e2d] line-clamp-1">{job.title}</h3>
            <p className="text-sm text-[#9aa3bc] mb-2 line-clamp-1">{employer.companyName}</p>
            
            {/* Job details */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-sm text-[#1a1e2d]">
              <div className="flex items-center">
                <Building className="h-4 w-4 mr-1.5 text-[#4a6cfa]" />
                <span>{jobType}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1.5 text-[#4a6cfa]" />
                <span>{workLocation}</span>
              </div>
              <div className="flex items-center">
                <Briefcase className="h-4 w-4 mr-1.5 text-[#4a6cfa]" />
                <span>{salary}</span>
              </div>
              
              {application.interviewDate && (
                <div className="flex items-center w-full mt-1">
                  <CalendarClock className="h-4 w-4 mr-1.5 text-[#4a6cfa]" />
                  <span className="font-medium">Interview: {formatDate(application.interviewDate)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Expanded content - will show when expanded state is true */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            {application.notes && (
              <div className="mb-3">
                <h4 className="text-sm font-medium mb-1">Employer Notes:</h4>
                <p className="text-sm text-[#1a1e2d]">{application.notes}</p>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 mt-3">
              {application.resumeUrl && (
                <a 
                  href={application.resumeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-1 px-3 rounded-full transition-colors"
                >
                  View Resume
                </a>
              )}
              
              {application.coverLetterUrl && (
                <a 
                  href={application.coverLetterUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-1 px-3 rounded-full transition-colors"
                >
                  View Cover Letter
                </a>
              )}
            </div>
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-xs"
          >
            {expanded ? 'Show Less' : 'Show More'}
          </Button>
          
          <div className="flex gap-2">
            <Link href={`/jobs/${job.id}`} passHref>
              <Button variant="ghost" size="sm" className="text-xs">
                View Job
              </Button>
            </Link>
            
            <Link href={`/candidate/applications/${application.id}`} passHref>
              <Button size="sm" className="text-xs bg-[#4a6cfa] hover:bg-[#3a5be9] text-white">
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 