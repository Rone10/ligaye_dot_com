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
    
    // Simple HTML tag removal, preserving line breaks
    return description
      .replace(/<[^>]*>/g, '') // Remove all HTML tags
      .replace(/&lt;/g, '<')    // Replace HTML entities
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");
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
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap">{parseJobDescription(job.description)}</div>
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
            {job.educationRequirements && job.educationRequirements.length > 0 && (
              <div className="py-4 first:pt-0 last:pb-0">
                <h3 className="text-lg font-medium flex items-center mb-3">
                  <GraduationCap className="mr-2.5 h-5 w-5 text-[#4a6cfa]" />
                  Education
                </h3>
                <ul className="list-disc pl-10 space-y-1">
                  {job.educationRequirements.map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Experience */}
            {job.experienceRequirements && job.experienceRequirements.length > 0 && (
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
                <ul className="list-disc pl-10 space-y-1">
                  {job.experienceRequirements.map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            
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
              
              {job.schedule && job.schedule.length > 0 && (
                <li className="flex items-start p-4 bg-blue-50/30 hover:bg-blue-50/50 transition-colors">
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
                <li className="flex items-start p-4 hover:bg-blue-50/50 transition-colors">
                  <Clock className="mr-3 h-5 w-5 text-[#4a6cfa] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="block font-medium text-[#1a1e2d]">Hours</span>
                    <span className="text-gray-600">
                      {job.expectedHours} hours {job.hoursType ? `(${job.hoursType.toLowerCase()})` : ''}
                    </span>
                  </div>
                </li>
              )}
              
              <li className="flex items-start p-4 bg-blue-50/30 hover:bg-blue-50/50 transition-colors">
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
                <li className="flex items-start p-4 hover:bg-blue-50/50 transition-colors">
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
                <li className="flex items-start p-4 bg-blue-50/30 hover:bg-blue-50/50 transition-colors">
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
              
              {job.applicationDeadline && (
                <li className="flex items-start p-4 hover:bg-purple-50/50 transition-colors">
                  <Calendar className="mr-3 h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="block font-medium text-[#1a1e2d]">Application Deadline</span>
                    <span className="text-gray-600">{formatDate(job.applicationDeadline)}</span>
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
        
        {/* Supplementary info */}
        {(job.supplementalPay?.length > 0 || job.benefits?.length > 0) && (
          <Card className="overflow-hidden shadow-[0_8px_32px_rgba(31,38,135,0.1)] bg-background/80 backdrop-blur-md border-[rgba(255,255,255,0.3)] rounded-2xl">
            <CardHeader className="border-b bg-gray-50/50">
              <CardTitle>Benefits & Pay</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y">
                {job.benefits && job.benefits.length > 0 && (
                  <li className="p-4 hover:bg-green-50/30 transition-colors">
                    <h3 className="font-medium mb-2 text-[#1a1e2d]">Benefits:</h3>
                    <ul className="list-disc pl-5 space-y-1 text-gray-600">
                      {job.benefits.map((benefit: string, index: number) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  </li>
                )}
                
                {job.supplementalPay && job.supplementalPay.length > 0 && (
                  <li className="p-4 bg-green-50/30 hover:bg-green-50/40 transition-colors">
                    <h3 className="font-medium mb-2 text-[#1a1e2d]">Supplemental Pay:</h3>
                    <ul className="list-disc pl-5 space-y-1 text-gray-600">
                      {job.supplementalPay.map((pay: string, index: number) => (
                        <li key={index}>{pay}</li>
                      ))}
                    </ul>
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 