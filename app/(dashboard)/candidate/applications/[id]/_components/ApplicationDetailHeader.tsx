'use client'

import { Briefcase, Building, MapPin, Calendar, BarChart, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { formatDistance } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import ApplicationStatusBadge from './ApplicationStatusBadge'
import { 
  formatWorkLocation, 
  formatJobType, 
  formatDate, 
  formatSalary 
} from '../../_utils/formatters'

interface ApplicationDetailHeaderProps {
  application: {
    id: string
    status: string
    appliedAt: Date | string
    interviewDate?: Date | string | null
  }
  job: {
    id: string
    title: string
    workLocation: string
    jobType: string
    experienceLevel?: string | null
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
    companyDescription?: string | null
    companyLogoUrl?: string | null
    website?: string | null
  }
}

export default function ApplicationDetailHeader({ 
  application, 
  job, 
  employer 
}: ApplicationDetailHeaderProps) {
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
    <div className="bg-white/70 backdrop-blur-md rounded-xl border border-[rgba(255,255,255,0.3)] overflow-hidden shadow-[0_8px_32px_rgba(31,38,135,0.1)]">
      <div className="px-6 py-5 md:px-8 md:py-6">
        {/* Application status and date */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <ApplicationStatusBadge status={application.status} />
          <div className="text-sm text-[#9aa3bc]">
            Applied {timeAgo}
          </div>
        </div>
        
        {/* Job title and company */}
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 rounded-md border border-gray-100 flex-shrink-0">
            <AvatarImage src={employer.companyLogoUrl || ''} alt={employer.companyName} />
            <AvatarFallback className="bg-[#4a6cfa]/10 text-[#4a6cfa] rounded-md text-xl">
              {companyInitials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-[#1a1e2d] line-clamp-2">{job.title}</h1>
            <div className="flex items-center mt-1">
              <span className="text-lg text-[#9aa3bc] line-clamp-1">{employer.companyName}</span>
              {employer.website && (
                <a
                  href={employer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 inline-flex items-center text-sm text-[#4a6cfa] hover:text-[#3a5be9]"
                >
                  <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
                  <span>Website</span>
                </a>
              )}
            </div>
          </div>
        </div>
        
        {/* Job details */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-6 sm:grid-cols-4">
          <div className="flex items-center">
            <Building className="h-5 w-5 mr-2 text-[#4a6cfa]" />
            <div>
              <p className="text-xs text-[#9aa3bc]">Job Type</p>
              <p className="text-sm font-medium text-[#1a1e2d]">{jobType}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-[#4a6cfa]" />
            <div>
              <p className="text-xs text-[#9aa3bc]">Location</p>
              <p className="text-sm font-medium text-[#1a1e2d]">{workLocation}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <Briefcase className="h-5 w-5 mr-2 text-[#4a6cfa]" />
            <div>
              <p className="text-xs text-[#9aa3bc]">Salary</p>
              <p className="text-sm font-medium text-[#1a1e2d]">{salary}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-[#4a6cfa]" />
            <div>
              <p className="text-xs text-[#9aa3bc]">Applied On</p>
              <p className="text-sm font-medium text-[#1a1e2d]">{formatDate(application.appliedAt)}</p>
            </div>
          </div>
          
          {application.interviewDate && (
            <div className="flex items-center col-span-2">
              <BarChart className="h-5 w-5 mr-2 text-[#4a6cfa]" />
              <div>
                <p className="text-xs text-[#9aa3bc]">Interview Scheduled</p>
                <p className="text-sm font-medium text-[#1a1e2d]">{formatDate(application.interviewDate)}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-gray-100">
          <Link href={`/jobs/${job.id}`} passHref>
            <Button variant="outline">
              View Job Listing
            </Button>
          </Link>
          
          <Link href="/candidate/applications" passHref>
            <Button variant="ghost">
              Back to Applications
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 