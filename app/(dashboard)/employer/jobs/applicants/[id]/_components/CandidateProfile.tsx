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
import { Linkedin, Github, Globe, FileText } from 'lucide-react'

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
  }
}

export default function CandidateProfile({ candidate }: CandidateProfileProps) {
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