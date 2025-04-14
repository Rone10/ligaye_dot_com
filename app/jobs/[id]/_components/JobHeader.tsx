import Link from 'next/link'
import { Calendar, Clock, MapPin, Building, Briefcase, User, BookmarkPlus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatSalaryDisplay, jobTypeLabels, workLocationLabels, experienceLevelLabels } from '../../_utils/constants'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

interface JobHeaderProps {
  job: any
  hasApplied?: boolean
}

export default function JobHeader({ job, hasApplied = false }: JobHeaderProps) {
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
                  className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 whitespace-nowrap" 
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
        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 whitespace-nowrap"
      >
        Apply Now
      </Link>
    );
  };
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Link 
              href="/jobs"
              className="text-gray-600 hover:text-blue-600 text-sm"
            >
              ← Back to Jobs
            </Link>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold text-[#1a1e2d] sm:text-3xl">{job.title}</h1>
            {job.status && job.status === 'ACTIVE' && (
              <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 border-green-200">
                Active
              </Badge>
            )}
          </div>
          
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0 overflow-hidden">
              {job.company?.companyLogoUrl ? (
                <img src={job.company.companyLogoUrl} alt={job.company.companyName || 'Company logo'} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  {job.company?.companyName?.charAt(0) || 'C'}
                </div>
              )}
            </div>
            <div className="ml-3">
              <h2 className="text-lg font-semibold text-gray-800">{job.company?.companyName}</h2>
              <p className="text-gray-600">{locationDisplay}</p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 mt-4 md:mt-0">
          {renderApplyButton()}
          <Button 
            variant="outline" 
            className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-md border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 whitespace-nowrap h-auto"
          >
            <BookmarkPlus className="h-4 w-4 text-[#4a6cfa] mr-2" />
            <span>Save Job</span>
          </Button>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-3 text-sm bg-gray-50/70 p-2.5 rounded-lg border border-gray-100 shadow-sm">
        {job.jobType && (
          <div className="flex items-center px-2.5 py-1 rounded-full bg-white border border-gray-200">
            <Briefcase className="mr-1.5 h-4 w-4 text-[#4a6cfa]" />
            <span className="font-medium">{jobTypeLabels[job.jobType]}</span>
          </div>
        )}
        
        {job.workLocation && (
          <div className="flex items-center px-2.5 py-1 rounded-full bg-white border border-gray-200">
            <MapPin className="mr-1.5 h-4 w-4 text-[#4a6cfa]" />
            <span className="font-medium">{workLocationLabels[job.workLocation]}</span>
          </div>
        )}
        
        {job.experienceLevel && (
          <div className="flex items-center px-2.5 py-1 rounded-full bg-white border border-gray-200">
            <User className="mr-1.5 h-4 w-4 text-[#4a6cfa]" />
            <span className="font-medium">{experienceLevelLabels[job.experienceLevel]}</span>
          </div>
        )}
        
        {(job.salaryRangeMin || job.salaryRangeMax) && (
          <div className="flex items-center px-2.5 py-1 rounded-full bg-white border border-gray-200">
            <div className="bg-blue-100 text-blue-800 rounded-full h-5 w-auto px-1.5 text-xs font-bold flex items-center justify-center mr-1.5">
              {job.salaryCurrency || 'GMD'}
            </div>
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
          <div className="flex items-center px-2.5 py-1 rounded-full bg-white border border-gray-200">
            <Calendar className="mr-1.5 h-4 w-4 text-[#4a6cfa]" />
            <span className="font-medium">Posted: {new Date(job.publishedAt).toLocaleDateString()}</span>
          </div>
        )}
        
        {job.applicationDeadline && (
          <div className="flex items-center px-2.5 py-1 rounded-full bg-white border border-gray-200">
            <Clock className="mr-1.5 h-4 w-4 text-[#4a6cfa]" />
            <span className="font-medium">Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}</span>
          </div>
        )}
      </div>
    </div>
  )
} 