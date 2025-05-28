import {
  Award,
  Banknote,
  Briefcase,
  Building,
  Calendar,
  Clock,
  Globe,
  GraduationCap,
  Languages,
  MapPin,
  User,
  Users,
  Workflow
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { format } from 'date-fns';
interface JobDetailsProps {
  job: any
  location?: any
  skills?: any[]
  industries?: any[]
  hasApplied?: boolean
}

export default function JobDetails({ job, location, skills = [], industries = [], hasApplied = false }: JobDetailsProps) {
  // Format location display
  const formatLocation = () => {
    if (!location) return 'Remote'
    
    const parts = []
    if (location.city) parts.push(location.city)
    if (location.region) parts.push(location.region)
    
    return parts.join(', ') || 'Location not specified'
  }
  
  // Format work type display
  const formatWorkType = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }
  
  const locationDisplay = 
    job.workLocation === 'REMOTE' ? 'Remote' : 
    job.workLocation === 'HYBRID' ? `Hybrid - ${formatLocation()}` : 
    formatLocation()
    
  // Parse HTML and extract text content for safer rendering
  const parseJobDescription = (description: string) => {
    if (!description) return '';
    
    // Replace HTML entities first
    let parsedText = description
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&nbsp;/g, ' ');
    
    // Replace paragraph tags with appropriate markup
    parsedText = parsedText
      .replace(/<p\s*[^>]*>/g, '<div class="mb-4">')
      .replace(/<\/p>/g, '</div>')
      .replace(/<br\s*\/?>/g, '<br />');
    
    // Handle headers with proper styling
    parsedText = parsedText
      .replace(/<h1\s*[^>]*>(.*?)<\/h1>/g, '<div class="text-3xl font-bold mb-4">$1</div>')
      .replace(/<h2\s*[^>]*>(.*?)<\/h2>/g, '<div class="text-2xl font-bold mb-3">$1</div>')
      .replace(/<h3\s*[^>]*>(.*?)<\/h3>/g, '<div class="text-xl font-bold mb-2">$1</div>')
      .replace(/<h4\s*[^>]*>(.*?)<\/h4>/g, '<div class="text-lg font-semibold mb-2">$1</div>')
      .replace(/<h5\s*[^>]*>(.*?)<\/h5>/g, '<div class="text-base font-semibold mb-1">$1</div>')
      .replace(/<h6\s*[^>]*>(.*?)<\/h6>/g, '<div class="text-sm font-semibold mb-1">$1</div>');
    
    // Preserve text formatting
    parsedText = parsedText
      .replace(/<strong\s*[^>]*>(.*?)<\/strong>/g, '<span class="font-bold">$1</span>')
      .replace(/<b\s*[^>]*>(.*?)<\/b>/g, '<span class="font-bold">$1</span>')
      .replace(/<em\s*[^>]*>(.*?)<\/em>/g, '<span class="italic">$1</span>')
      .replace(/<i\s*[^>]*>(.*?)<\/i>/g, '<span class="italic">$1</span>')
      .replace(/<u\s*[^>]*>(.*?)<\/u>/g, '<span class="underline">$1</span>');
    
    // Handle lists
    parsedText = parsedText
      .replace(/<ul\s*[^>]*>/g, '<div class="pl-6 mb-4 space-y-1">')
      .replace(/<\/ul>/g, '</div>')
      .replace(/<ol\s*[^>]*>/g, '<div class="pl-6 mb-4 space-y-1 list-decimal">')
      .replace(/<\/ol>/g, '</div>')
      .replace(/<li\s*[^>]*>(.*?)<\/li>/g, '<div class="flex"><span class="mr-2">•</span><span>$1</span></div>');
    
    // Clean up any potentially unsafe tags while keeping our safe ones
    const safeTagsRegex = /<(?!\/?(div|span|br)(?!\w)[^>]*>)([^>]*)>/g;
    parsedText = parsedText.replace(safeTagsRegex, '');
    
    return parsedText;
  };

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
                <button 
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 opacity-70 cursor-not-allowed"
                  disabled
                >
                  Already Applied
                </button>
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
      <a
        href={`/jobs/${job.id}/apply`}
        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Apply on Platform
      </a>
    );
  };
  
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Main content */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="overflow-hidden shadow-[0_8px_32px_rgba(31,38,135,0.1)] bg-background/80 backdrop-blur-md border-[rgba(255,255,255,0.3)] rounded-2xl">
          <CardHeader className="border-b bg-gray-50/50">
            <CardTitle>Job Description</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="prose-rich-text max-w-none">
              <div 
                className="text-gray-800" 
                dangerouslySetInnerHTML={{ __html: parseJobDescription(job.description) }}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Requirements section */}
        <Card className="overflow-hidden shadow-[0_8px_32px_rgba(31,38,135,0.1)] bg-background/80 backdrop-blur-md border-[rgba(255,255,255,0.3)] rounded-2xl">
          <CardHeader className="border-b bg-gray-50/50">
            <CardTitle>Requirements</CardTitle>
          </CardHeader>
          <CardContent className="p-6 divide-y">
            {/* Education */}
            <div className="py-4 first:pt-0 last:pb-0">
              <h3 className="text-lg font-medium flex items-center mb-3">
                <GraduationCap className="mr-2.5 h-5 w-5 text-[#4a6cfa]" />
                Education
              </h3>
              {job.educationRequirements ? (
                <div 
                  className="prose-rich-text max-w-none"
                  dangerouslySetInnerHTML={{ __html: parseJobDescription(job.educationRequirements) }}
                />
              ) : (
                <p className="text-gray-500">No specific education requirements specified</p>
              )}
            </div>
            
            {/* Experience */}
            <div className="py-4 first:pt-0 last:pb-0">
              <h3 className="text-lg font-medium flex items-center mb-3">
                <Briefcase className="mr-2.5 h-5 w-5 text-[#4a6cfa]" />
                Experience
              </h3>
              {job.experienceLevel && (
                <p className="mb-2">
                  <span className="font-medium">Level:</span> {job.experienceLevel.replace(/_/g, ' ')}
                </p>
              )}
              {job.experienceRequirements ? (
                <div 
                  className="prose-rich-text max-w-none"
                  dangerouslySetInnerHTML={{ __html: parseJobDescription(job.experienceRequirements) }}
                />
              ) : (
                <p className="text-gray-500">No specific experience requirements specified</p>
              )}
            </div>
            
            {/* Skills */}
            {skills.length > 0 && (
              <div className="py-4 first:pt-0 last:pb-0">
                <h3 className="text-lg font-medium flex items-center mb-3">
                  <Award className="mr-2.5 h-5 w-5 text-[#4a6cfa]" />
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map(skill => (
                    <Badge key={skill.id} variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 py-1.5">
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Languages */}
            {job.languageRequirements && job.languageRequirements.length > 0 && (
              <div className="py-4 first:pt-0 last:pb-0">
                <h3 className="text-lg font-medium flex items-center mb-3">
                  <Languages className="mr-2.5 h-5 w-5 text-[#4a6cfa]" />
                  Language Requirements
                </h3>
                <ul className="list-disc pl-10 space-y-1">
                  {job.languageRequirements.map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
                {job.languageTrainingProvided && (
                  <p className="mt-2 text-green-600">Language training will be provided</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Application section */}
        <Card id="apply" className="overflow-hidden shadow-[0_8px_32px_rgba(31,38,135,0.1)] bg-background/80 backdrop-blur-md border-[rgba(255,255,255,0.3)] rounded-2xl">
          <CardHeader className="border-b bg-gray-50/50">
            <CardTitle>How to Apply</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {job.applicationInstructions && (
              <div className="mb-4">
                <p className="text-gray-700">{job.applicationInstructions}</p>
              </div>
            )}
            
            {job.resumeRequired && (
              <div className="mb-4 text-amber-700 bg-amber-50 p-3 rounded-md border border-amber-200">
                <p className="font-medium">Resume Required</p>
              </div>
            )}
            
            <div className="mt-4">
              {job.applicationMethod === 'EMAIL' && job.applicationEmail && (
                <a
                  href={`mailto:${job.applicationEmail}?subject=Application for ${job.title}`}
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Apply via Email
                </a>
              )}
              
              {job.applicationMethod === 'WEBSITE' && job.applicationUrl && (
                <a
                  href={job.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Apply on Company Website
                </a>
              )}
              
              {job.applicationMethod === 'PLATFORM' && renderApplyButton()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Company information */}
        <Card className="overflow-hidden shadow-[0_8px_32px_rgba(31,38,135,0.1)] bg-background/80 backdrop-blur-md border-[rgba(255,255,255,0.3)] rounded-2xl">
          <CardHeader className="border-b bg-gray-50/50">
            <CardTitle>About the Company</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {job.company?.companyDescription ? (
              <p className="text-gray-700">{job.company.companyDescription}</p>
            ) : (
              <p className="text-gray-500 italic">No company description available</p>
            )}
            
            {job.company?.website && (
              <div className="mt-4">
                <a 
                  href={job.company.website} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Visit Website
                </a>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Job details */}
        <Card className="overflow-hidden shadow-[0_8px_32px_rgba(31,38,135,0.1)] bg-background/80 backdrop-blur-md border-[rgba(255,255,255,0.3)] rounded-2xl">
          <CardHeader className="border-b bg-gray-50/50">
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y">
              <li className="flex items-start p-4 bg-blue-50/30 hover:bg-blue-50/50 transition-colors">
                <MapPin className="mr-3 h-5 w-5 text-[#4a6cfa] mt-0.5 flex-shrink-0" />
                <div>
                  <span className="block font-medium text-[#1a1e2d]">Location</span>
                  <span className="text-gray-600">{locationDisplay}</span>
                </div>
              </li>
              
              <li className="flex items-start p-4 hover:bg-blue-50/50 transition-colors">
                <Briefcase className="mr-3 h-5 w-5 text-[#4a6cfa] mt-0.5 flex-shrink-0" />
                <div>
                  <span className="block font-medium text-[#1a1e2d]">Job Type</span>
                  <span className="text-gray-600">{formatWorkType(job.jobType)}</span>
                </div>
              </li>
              
              {industries.length > 0 && (
                <li className="flex items-start p-4 bg-blue-50/30 hover:bg-blue-50/50 transition-colors">
                  <Building className="mr-3 h-5 w-5 text-[#4a6cfa] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="block font-medium text-[#1a1e2d]">Industry</span>
                    <div className="text-gray-600">
                      {industries.map((industry, index) => (
                        <div key={industry.id}>
                          {industry.name}
                          {index < industries.length - 1 && ', '}
                        </div>
                      ))}
                    </div>
                  </div>
                </li>
              )}
              
              {job.numberOfOpenings && (
                <li className="flex items-start p-4 hover:bg-blue-50/50 transition-colors">
                  <Users className="mr-3 h-5 w-5 text-[#4a6cfa] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="block font-medium text-[#1a1e2d]">Openings</span>
                    <span className="text-gray-600">{job.numberOfOpenings} position{job.numberOfOpenings > 1 ? 's' : ''}</span>
                  </div>
                </li>
              )}
              
              {job.publishedAt && (
                <li className="flex items-start p-4 bg-blue-50/30 hover:bg-blue-50/50 transition-colors">
                  <Calendar className="mr-3 h-5 w-5 text-[#4a6cfa] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="block font-medium text-[#1a1e2d]">Date Posted</span>
                      <span className="text-gray-600">{format(new Date(job.publishedAt), 'dd/MM/yyyy')}</span>
                  </div>
                </li>
              )}
              
              {job.applicationDeadline && (
                <li className="flex items-start p-4 hover:bg-blue-50/50 transition-colors">
                  <Clock className="mr-3 h-5 w-5 text-[#4a6cfa] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="block font-medium text-[#1a1e2d]">Application Deadline</span>
                    <span className="text-gray-600">{format(new Date(job.applicationDeadline), 'dd/MM/yyyy')}</span>
                  </div>
                </li>
              )}
              
              {job.salaryRangeMin || job.salaryRangeMax ? (
                <li className="flex items-start p-4 bg-blue-50/30 hover:bg-blue-50/50 transition-colors">
                  <Banknote className="mr-3 h-5 w-5 text-[#4a6cfa] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="block font-medium text-[#1a1e2d]">Salary</span>
                    <span className="text-gray-600">
                      {job.salaryDisplayType === 'RANGE' && `${job.salaryCurrency || 'GMD'} ${job.salaryRangeMin?.toLocaleString()} - ${job.salaryRangeMax?.toLocaleString()} ${job.salaryFrequency?.toLowerCase() || 'per year'}`}
                      {job.salaryDisplayType === 'FIXED' && `${job.salaryCurrency || 'GMD'} ${job.salaryRangeMin?.toLocaleString()}/${job.salaryFrequency?.toLowerCase() || 'per year'}`}
                      {job.salaryDisplayType === 'STARTING_AMOUNT' && `Starting at ${job.salaryCurrency || 'GMD'} ${job.salaryRangeMin?.toLocaleString()}/${job.salaryFrequency?.toLowerCase() || 'per year'}`}
                      {job.salaryDisplayType === 'MAXIMUM_AMOUNT' && `Up to ${job.salaryCurrency || 'GMD'} ${job.salaryRangeMax?.toLocaleString()}/${job.salaryFrequency?.toLowerCase() || 'per year'}`}
                      {job.salaryDisplayType === 'NEGOTIABLE' && 'Salary Negotiable'}
                      {job.salaryDisplayType === 'NULL' && `${job.salaryCurrency || 'GMD'} ${job.salaryRangeMin?.toLocaleString()}/${job.salaryFrequency?.toLowerCase() || 'per year'}`}
                      {!job.salaryDisplayType && `${job.salaryCurrency || 'GMD'} ${job.salaryRangeMin?.toLocaleString() || ''} ${job.salaryRangeMax ? `- ${job.salaryRangeMax?.toLocaleString()}` : ''} ${job.salaryFrequency?.toLowerCase() || 'per month'}`}
                    </span>
                  </div>
                </li>
              ) : null}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 