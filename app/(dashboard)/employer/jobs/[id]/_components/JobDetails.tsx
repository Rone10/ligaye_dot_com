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
              <div className="whitespace-pre-wrap">{job.description}</div>
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
                  <GraduationCap className="mr-2 h-5 w-5 text-[#4a6cfa]" />
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
                  <Briefcase className="mr-2 h-5 w-5 text-[#4a6cfa]" />
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
                  <Award className="mr-2 h-5 w-5 text-[#4a6cfa]" />
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map(skill => (
                    <Badge key={skill.id} variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
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
                  <Languages className="mr-2 h-5 w-5 text-[#4a6cfa]" />
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
              <li className="flex items-start p-4">
                <MapPin className="mr-3 h-5 w-5 text-[#4a6cfa] mt-0.5" />
                <div>
                  <span className="block font-medium">Location</span>
                  <span className="text-gray-600">{locationDisplay}</span>
                </div>
              </li>
              
              <li className="flex items-start p-4">
                <Briefcase className="mr-3 h-5 w-5 text-[#4a6cfa] mt-0.5" />
                <div>
                  <span className="block font-medium">Job Type</span>
                  <span className="text-gray-600">{formatWorkType(job.jobType)}</span>
                </div>
              </li>
              
              {job.schedule && job.schedule.length > 0 && (
                <li className="flex items-start p-4">
                  <Clock className="mr-3 h-5 w-5 text-[#4a6cfa] mt-0.5" />
                  <div>
                    <span className="block font-medium">Schedule</span>
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
                <li className="flex items-start p-4">
                  <Clock className="mr-3 h-5 w-5 text-[#4a6cfa] mt-0.5" />
                  <div>
                    <span className="block font-medium">Hours</span>
                    <span className="text-gray-600">
                      {job.expectedHours} hours {job.hoursType ? `(${job.hoursType.toLowerCase()})` : ''}
                    </span>
                  </div>
                </li>
              )}
              
              <li className="flex items-start p-4">
                <Banknote className="mr-3 h-5 w-5 text-[#4a6cfa] mt-0.5" />
                <div>
                  <span className="block font-medium">Salary</span>
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
                <li className="flex items-start p-4">
                  <Users className="mr-3 h-5 w-5 text-[#4a6cfa] mt-0.5" />
                  <div>
                    <span className="block font-medium">Openings</span>
                    <span className="text-gray-600">
                      {job.numberOfOpenings} {job.numberOfOpenings === 1 ? 'position' : 'positions'}
                    </span>
                  </div>
                </li>
              )}
              
              {job.plannedStartDate && (
                <li className="flex items-start p-4">
                  <Calendar className="mr-3 h-5 w-5 text-[#4a6cfa] mt-0.5" />
                  <div>
                    <span className="block font-medium">Start Date</span>
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
              <li className="flex items-start p-4">
                <Workflow className="mr-3 h-5 w-5 text-[#4a6cfa] mt-0.5" />
                <div>
                  <span className="block font-medium">Apply Via</span>
                  <span className="text-gray-600">
                    {job.applicationMethod === 'PLATFORM' ? 'Ligaye.com Platform' :
                     job.applicationMethod === 'EMAIL' ? `Email: ${job.applicationEmail}` :
                     job.applicationMethod === 'WEBSITE' ? 'External Website' :
                     job.applicationMethod === 'PHONE' ? 'Phone' : 'In Person'}
                  </span>
                </div>
              </li>
              
              {job.applicationDeadline && (
                <li className="flex items-start p-4">
                  <Calendar className="mr-3 h-5 w-5 text-[#4a6cfa] mt-0.5" />
                  <div>
                    <span className="block font-medium">Application Deadline</span>
                    <span className="text-gray-600">{formatDate(job.applicationDeadline)}</span>
                  </div>
                </li>
              )}
              
              {industries.length > 0 && (
                <li className="flex items-start p-4">
                  <Building className="mr-3 h-5 w-5 text-[#4a6cfa] mt-0.5" />
                  <div>
                    <span className="block font-medium">Industries</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {industries.map(industry => (
                        <Badge key={industry.id} variant="outline" className="bg-gray-50">
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
                  <li className="p-4">
                    <h3 className="font-medium mb-2">Benefits:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {job.benefits.map((benefit: string, index: number) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  </li>
                )}
                
                {job.supplementalPay && job.supplementalPay.length > 0 && (
                  <li className="p-4">
                    <h3 className="font-medium mb-2">Supplemental Pay:</h3>
                    <ul className="list-disc pl-5 space-y-1">
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