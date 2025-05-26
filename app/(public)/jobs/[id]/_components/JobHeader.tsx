'use client';

import Link from 'next/link'
import { Calendar, Clock, MapPin, Building, Briefcase, User, BookmarkPlus, Bookmark, BookmarkCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatSalaryDisplay, jobTypeLabels, workLocationLabels, experienceLevelLabels } from '../../_utils/constants'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { toggleSaveJob } from '../_actions'
import { useState } from 'react'
import Image from 'next/image';
import { format } from 'date-fns';

interface JobHeaderProps {
  job: any
  hasApplied?: boolean
  isSaved?: boolean
  fromApplication?: boolean
}

export default function JobHeader({ job, hasApplied = false, isSaved = false, fromApplication = false }: JobHeaderProps) {
  // Local state to handle optimistic updates
  const [isSaving, setIsSaving] = useState(false)
  const [savedState, setSavedState] = useState(isSaved)

  // Format the location display
  const formatLocation = () => {
    if (!job.location) return workLocationLabels[job.workLocation] || 'Location not specified'
    
    const parts = []
    if (job.location.city) parts.push(job.location.city)
    if (job.location.region) parts.push(job.location.region)
    
    return parts.join(', ') || workLocationLabels[job.workLocation] || 'Location not specified'
  }
  
  const locationDisplay = 
    job.workLocation === 'REMOTE' ? 'Remote' : 
    job.workLocation === 'HYBRID' ? `Hybrid - ${formatLocation()}` : 
    formatLocation()
  
  // Render application button based on application status
  const renderApplyButton = () => {
    if (job.applicationMethod !== 'PLATFORM') {
      return null;
    }
    
    if (hasApplied) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button 
                  className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-md text-white bg-primary-blue hover:bg-primary-blue-light whitespace-nowrap" 
                  disabled={true}
                >
                  Already Applied
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>You have already applied for this job</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    return (
      <Link
        href={`/jobs/${job.id}/apply`}
        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-blue hover:bg-primary-blue-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 whitespace-nowrap"
      >
        Apply Now
      </Link>
    );
  };

  // Toggle job saved state
  const handleToggleSave = async () => {
    try {
      setIsSaving(true)
      // Optimistic update
      setSavedState(!savedState)
      
      // Call the server action
      await toggleSaveJob(job.id)
    } catch (error) {
      // Revert on error
      setSavedState(savedState)
      console.error('Failed to save job:', error)
    } finally {
      setIsSaving(false)
    }
  }
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Link 
              href="/jobs"
              className="text-theme-gray-dark hover:text-primary-blue text-sm"
            >
              ← Back to Jobs
            </Link>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold text-theme-dark sm:text-3xl">{job.title}</h1>
            {job.status && job.status === 'ACTIVE' && (
              <Badge variant="outline" className="ml-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700">
                Active
              </Badge>
            )}
            {job.status && job.status !== 'ACTIVE' && fromApplication && (
              <Badge variant="outline" className="ml-2 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-700">
                {job.status === 'EXPIRED' ? 'Expired' : 
                 job.status === 'FILLED' ? 'Position Filled' : 
                 job.status === 'DELETED' ? 'No Longer Available' : 
                 job.status}
              </Badge>
            )}
            {fromApplication && job.expiresAt && new Date(job.expiresAt) < new Date() && job.status === 'ACTIVE' && (
              <Badge variant="outline" className="ml-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700">
                Expired
              </Badge>
            )}
          </div>
          
          <div className="flex items-center">
            <div className="w-10 h-10 bg-muted rounded-full flex-shrink-0 overflow-hidden">
              {job.company?.companyLogoUrl ? (
                <Image 
                  src={job.company.companyLogoUrl} 
                  alt={job.company.companyName || 'Company logo'} 
                  className="w-full h-full object-cover" 
                  width={40}
                  height={40}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  {job.company?.companyName?.charAt(0) || 'C'}
                </div>
              )}
            </div>
            <div className="ml-3">
              <h2 className="text-lg font-semibold text-theme-dark">{job.company?.companyName}</h2>
              <p className="text-theme-gray-dark">{locationDisplay}</p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 mt-4 md:mt-0">
          {renderApplyButton()}
          <Button 
            variant="outline" 
            className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-md border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 whitespace-nowrap h-auto"
            onClick={handleToggleSave}
            disabled={isSaving}
          >
            {savedState ? (
              <BookmarkCheck className="h-4 w-4 text-green-600 mr-2" />
            ) : (
              <BookmarkPlus className="h-4 w-4 text-primary-blue mr-2" />
            )}
            <span>{savedState ? 'Saved' : 'Save Job'}</span>
          </Button>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-3 text-sm bg-muted/70 p-2.5 rounded-lg border border-border shadow-sm">
        {job.jobType && (
          <div className="flex items-center px-2.5 py-1 rounded-full bg-background border border-border">
            <Briefcase className="mr-1.5 h-4 w-4 text-primary-blue" />
            <span className="font-medium">{jobTypeLabels[job.jobType]}</span>
          </div>
        )}
        
        {job.workLocation && (
          <div className="flex items-center px-2.5 py-1 rounded-full bg-background border border-border">
            <MapPin className="mr-1.5 h-4 w-4 text-primary-blue" />
            <span className="font-medium">{workLocationLabels[job.workLocation]}</span>
          </div>
        )}
        
        {job.experienceLevel && (
          <div className="flex items-center px-2.5 py-1 rounded-full bg-background border border-border">
            <User className="mr-1.5 h-4 w-4 text-primary-blue" />
            <span className="font-medium">{experienceLevelLabels[job.experienceLevel]}</span>
          </div>
        )}
        
        {(job.salaryRangeMin || job.salaryRangeMax) && (
          <div className="flex items-center px-2.5 py-1 rounded-full bg-background border border-border">
            {/* <div className="bg-blue-100 text-blue-800 rounded-full h-5 w-auto px-1.5 text-xs font-bold flex items-center justify-center mr-1.5">
              {job.salaryCurrency || 'GMD'}
            </div> */}
            <span className="font-medium">
              {formatSalaryDisplay({
                min: job.salaryRangeMin,
                max: job.salaryRangeMax,
                currency: job.salaryCurrency || 'GMD',
                frequency: job.salaryFrequency,
                displayType: job.salaryDisplayType
              })}
            </span>
          </div>
        )}
        
        {job.publishedAt && (
          <div className="flex items-center px-2.5 py-1 rounded-full bg-background border border-border">
            <Calendar className="mr-1.5 h-4 w-4 text-primary-blue" />
            <span className="font-medium">Posted: {format(new Date(job.publishedAt), 'dd/MM/yyyy')}</span>
          </div>
        )}
        
        {job.applicationDeadline && (
          <div className="flex items-center px-2.5 py-1 rounded-full bg-background border border-border">
            <Clock className="mr-1.5 h-4 w-4 text-primary-blue" />
            <span className="font-medium">Deadline: {format(new Date(job.applicationDeadline), 'dd/MM/yyyy')}</span>
          </div>
        )}
      </div>
    </div>
  )
} 