import {
  Banknote,
  Briefcase,
  Building,
  Calendar,
  Clock,
  Globe,
  GraduationCap,
  Languages,
  MapPin,
  Award,
  User,
  Users,
  Workflow
} from 'lucide-react'
import { 
  formatDate, 
  formatSalary 
} from '../_utils/formatters'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'

interface JobDetailsProps {
  job: any
  location: any
  skills: Array<{ id: string; name: string }>
  industries: Array<{ id: string; name: string }>
}

export default function JobDetails({ job, location, skills, industries }: JobDetailsProps) {
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
    
  // Parse HTML and extract text content
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
              {typeof job.educationRequirements === 'string' && job.educationRequirements.trim() ? (
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
              {typeof job.experienceRequirements === 'string' && job.experienceRequirements.trim() ? (
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
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Job Details Summary */}
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
              
              {job.workLocation && (
                <li className="flex items-start p-4 bg-blue-50/30 hover:bg-blue-50/50 transition-colors">
                  <Globe className="mr-3 h-5 w-5 text-[#4a6cfa] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="block font-medium text-[#1a1e2d]">Work Location</span>
                    <span className="text-gray-600">
                      {job.workLocation.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </span>
                  </div>
                </li>
              )}
              
              {job.schedule && job.schedule.length > 0 && (
                <li className="flex items-start p-4 hover:bg-blue-50/50 transition-colors">
                  <Clock className="mr-3 h-5 w-5 text-[#4a6cfa] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="block font-medium text-[#1a1e2d]">Schedule</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {job.schedule.map((schedule: string, index: number) => (
                        <Badge key={index} variant="outline" className="bg-gray-50">
                          {schedule.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </li>
              )}
              
              {job.expectedHours && (
                <li className="flex items-start p-4 bg-blue-50/30 hover:bg-blue-50/50 transition-colors">
                  <Clock className="mr-3 h-5 w-5 text-[#4a6cfa] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="block font-medium text-[#1a1e2d]">Hours</span>
                    <span className="text-gray-600">
                      {job.expectedHours} hours {job.hoursType ? `(${job.hoursType.toLowerCase()})` : ''}
                    </span>
                  </div>
                </li>
              )}
              
              <li className="flex items-start p-4 hover:bg-blue-50/50 transition-colors">
                <Banknote className="mr-3 h-5 w-5 text-[#4a6cfa] mt-0.5 flex-shrink-0" />
                <div>
                  <span className="block font-medium text-[#1a1e2d]">Salary</span>
                  <span className="text-gray-600">
                    {formatSalary(
                      job.salaryRangeMin, 
                      job.salaryRangeMax, 
                      job.salaryCurrency, 
                      job.salaryFrequency,
                      job.salaryDisplayType
                    )}
                  </span>
                </div>
              </li>
              
              {job.numberOfOpenings && (
                <li className="flex items-start p-4 bg-blue-50/30 hover:bg-blue-50/50 transition-colors">
                  <Users className="mr-3 h-5 w-5 text-[#4a6cfa] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="block font-medium text-[#1a1e2d]">Openings</span>
                    <span className="text-gray-600">
                      {job.numberOfOpenings} {job.numberOfOpenings === 1 ? 'position' : 'positions'}
                    </span>
                  </div>
                </li>
              )}
              
              {job.plannedStartDate && (
                <li className="flex items-start p-4 hover:bg-blue-50/50 transition-colors">
                  <Calendar className="mr-3 h-5 w-5 text-[#4a6cfa] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="block font-medium text-[#1a1e2d]">Start Date</span>
                    <span className="text-gray-600">{formatDate(job.plannedStartDate)}</span>
                  </div>
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
        
        {/* Application Info */}
        <Card className="overflow-hidden shadow-[0_8px_32px_rgba(31,38,135,0.1)] bg-background/80 backdrop-blur-md border-[rgba(255,255,255,0.3)] rounded-2xl">
          <CardHeader className="border-b bg-gray-50/50">
            <CardTitle>Application Settings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y">
              <li className="flex items-start p-4 bg-purple-50/30 hover:bg-purple-50/50 transition-colors">
                <Workflow className="mr-3 h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="block font-medium text-[#1a1e2d]">Apply Via</span>
                  <span className="text-gray-600">
                    {job.applicationMethod === 'PLATFORM' ? 'Ligaye.com Platform' :
                     job.applicationMethod === 'EMAIL' ? `Email: ${job.applicationEmail}` :
                     job.applicationMethod === 'WEBSITE' ? 'External Website' :
                     job.applicationMethod === 'PHONE' ? 'Phone' : 'In Person'}
                  </span>
                </div>
              </li>
              
              {job.resumeRequired !== undefined && (
                <li className="flex items-start p-4 hover:bg-purple-50/50 transition-colors">
                  <User className="mr-3 h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="block font-medium text-[#1a1e2d]">Resume Required</span>
                    <Badge variant={job.resumeRequired ? "default" : "secondary"} className={`mt-1 ${job.resumeRequired ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' : ''}`}>
                      {job.resumeRequired ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </li>
              )}
              
              {job.allowCandidateContact !== undefined && (
                <li className="flex items-start p-4 bg-purple-50/30 hover:bg-purple-50/50 transition-colors">
                  <User className="mr-3 h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="block font-medium text-[#1a1e2d]">Allow Candidate Contact</span>
                    <Badge variant={job.allowCandidateContact ? "default" : "secondary"} className={`mt-1 ${job.allowCandidateContact ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' : ''}`}>
                      {job.allowCandidateContact ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </li>
              )}
              
              {job.applicationDeadline && (
                <li className="flex items-start p-4 hover:bg-purple-50/50 transition-colors">
                  <Calendar className="mr-3 h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="block font-medium text-[#1a1e2d]">Application Deadline</span>
                    <span className="text-gray-600">{formatDate(job.applicationDeadline)}</span>
                  </div>
                </li>
              )}
              
              {job.applicationInstructions && (
                <li className="flex items-start p-4 bg-purple-50/30 hover:bg-purple-50/50 transition-colors">
                  <User className="mr-3 h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="block font-medium text-[#1a1e2d]">Application Instructions</span>
                    <div className="text-gray-600 mt-1 whitespace-pre-wrap">{job.applicationInstructions}</div>
                  </div>
                </li>
              )}
              
              {industries.length > 0 && (
                <li className="flex items-start p-4 bg-purple-50/30 hover:bg-purple-50/50 transition-colors">
                  <Building className="mr-3 h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="block font-medium text-[#1a1e2d]">Industries</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {industries.map(industry => (
                        <Badge key={industry.id} variant="outline" className="bg-purple-50 text-purple-800 border-purple-200 py-1">
                          {industry.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
        
        {/* Benefits & Pay */}
        <Card className="overflow-hidden shadow-[0_8px_32px_rgba(31,38,135,0.1)] bg-background/80 backdrop-blur-md border-[rgba(255,255,255,0.3)] rounded-2xl">
          <CardHeader className="border-b bg-green-50/70">
            <CardTitle className="flex items-center">
              <Banknote className="mr-2 h-5 w-5 text-green-600" />
              Benefits & Pay
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y">
              {job.benefits && job.benefits.length > 0 && (
                <li className="p-5 hover:bg-green-50/30 transition-colors">
                  <h3 className="font-medium mb-3 text-[#1a1e2d] flex items-center">
                    <Award className="mr-2 h-4 w-4 text-green-600" />
                    Benefits
                  </h3>
                  <div className="flex flex-wrap gap-2 ml-1">
                    {job.benefits.map((benefit: string, index: number) => (
                      <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200 py-1.5">
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </li>
              )}
              
              {job.supplementalPay && job.supplementalPay.length > 0 && (
                <li className="p-5 bg-green-50/20 hover:bg-green-50/40 transition-colors">
                  <h3 className="font-medium mb-3 text-[#1a1e2d] flex items-center">
                    <Banknote className="mr-2 h-4 w-4 text-green-600" />
                    Supplemental Pay
                  </h3>
                  <div className="flex flex-wrap gap-2 ml-1">
                    {job.supplementalPay.map((pay: string, index: number) => (
                      <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200 py-1.5">
                        {pay}
                      </Badge>
                    ))}
                  </div>
                </li>
              )}
              
              {(!job.benefits || job.benefits.length === 0) && 
               (!job.supplementalPay || job.supplementalPay.length === 0) && (
                <li className="p-5 text-center text-gray-500 italic">
                  No benefits or supplemental pay information provided
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 