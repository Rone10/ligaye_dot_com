'use client'

import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { getInitials } from '@/lib/utils'
import { Linkedin, Github, Globe, FileText, Briefcase, GraduationCap, CalendarIcon, Building } from 'lucide-react'
import { format } from 'date-fns'

interface Education {
  id: string
  institution: string
  degree: string
  fieldOfStudy: string | null
  startDate: string | null
  endDate: string | null
  description: string | null
}

interface Experience {
  id: string
  jobTitle: string
  companyName: string
  location: string | null
  startDate: string | null
  endDate: string | null
  isCurrent: boolean
  description: string | null
}

interface CandidateProfileProps {
  candidate: {
    id: string
    fullName: string
    title: string | null
    experienceLevel: string | null
    avatarUrl: string | null
    resumeUrl: string | null
    linkedinUrl: string | null
    githubUrl: string | null
    portfolioUrl: string | null
    bio: string | null
    education?: Education[]
    experience?: Experience[]
  }
}

export default function CandidateProfile({ candidate }: CandidateProfileProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Present';
    return format(new Date(dateString), 'MMM yyyy');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Candidate Profile</CardTitle>
        <CardDescription>Profile information for the applicant</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            {candidate.avatarUrl ? (
              <AvatarImage src={candidate.avatarUrl} alt={candidate.fullName} />
            ) : null}
            <AvatarFallback className="text-xl">{getInitials(candidate.fullName)}</AvatarFallback>
          </Avatar>
          
          <div>
            <h2 className="text-xl font-semibold">{candidate.fullName}</h2>
            {candidate.title && (
              <p className="text-gray-600">{candidate.title}</p>
            )}
            {candidate.experienceLevel && (
              <Badge variant="outline" className="mt-2">
                {candidate.experienceLevel}
              </Badge>
            )}
          </div>
        </div>
        
        {candidate.bio && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">Bio</h3>
            <p className="text-sm">{candidate.bio}</p>
          </div>
        )}
        
        {/* Education Section */}
        {candidate.education && candidate.education.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <GraduationCap size={16} className="text-blue-600" />
              Education
            </h3>
            <div className="space-y-4">
              {candidate.education.map((edu) => (
                <div key={edu.id} className="border-l-2 border-blue-100 pl-4 py-1">
                  <h4 className="font-medium">{edu.degree}</h4>
                  <p className="text-sm text-gray-700">{edu.institution}</p>
                  {edu.fieldOfStudy && (
                    <p className="text-sm text-gray-600">{edu.fieldOfStudy}</p>
                  )}
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <CalendarIcon size={12} className="mr-1" />
                    <span>
                      {edu.startDate ? formatDate(edu.startDate) : 'N/A'} - {formatDate(edu.endDate)}
                    </span>
                  </div>
                  {edu.description && (
                    <p className="text-sm mt-1 text-gray-600">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Work Experience Section */}
        {candidate.experience && candidate.experience.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Briefcase size={16} className="text-blue-600" />
              Work Experience
            </h3>
            <div className="space-y-4">
              {candidate.experience.map((exp) => (
                <div key={exp.id} className="border-l-2 border-blue-100 pl-4 py-1">
                  <h4 className="font-medium">{exp.jobTitle}</h4>
                  <div className="flex items-center gap-1 text-sm text-gray-700">
                    <Building size={12} />
                    <span>{exp.companyName}</span>
                  </div>
                  {exp.location && (
                    <p className="text-sm text-gray-600">{exp.location}</p>
                  )}
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <CalendarIcon size={12} className="mr-1" />
                    <span>
                      {exp.startDate ? formatDate(exp.startDate) : 'N/A'} - {exp.isCurrent ? 'Present' : formatDate(exp.endDate)}
                    </span>
                    {exp.isCurrent && (
                      <Badge variant="outline" className="ml-2 text-[10px] py-0 h-4">Current</Badge>
                    )}
                  </div>
                  {exp.description && (
                    <p className="text-sm mt-1 text-gray-600">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500">Profile Links</h3>
          <div className="flex flex-wrap gap-3">
            {candidate.resumeUrl && (
              <a 
                href={candidate.resumeUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:underline text-sm"
              >
                <FileText size={14} /> Resume
              </a>
            )}
            
            {candidate.linkedinUrl && (
              <a 
                href={candidate.linkedinUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:underline text-sm"
              >
                <Linkedin size={14} /> LinkedIn
              </a>
            )}
            
            {candidate.githubUrl && (
              <a 
                href={candidate.githubUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:underline text-sm"
              >
                <Github size={14} /> GitHub
              </a>
            )}
            
            {candidate.portfolioUrl && (
              <a 
                href={candidate.portfolioUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:underline text-sm"
              >
                <Globe size={14} /> Portfolio
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 