import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/supabase/server'
import { getApplicationById } from '../_queries'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import ApplicationDetails from './_components/ApplicationDetails'
import CandidateProfile from './_components/CandidateProfile'
import StatusUpdateForm from './_components/StatusUpdateForm'
import NotesForm from './_components/NotesForm'
import InterviewScheduler from './_components/InterviewScheduler'

// Define interfaces matching those in CandidateProfile.tsx
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

interface FormattedCandidate {
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

interface PageParams {
  id: string
}

interface PageProps {
  params: Promise<PageParams>
}

export default async function ApplicationDetailPage({ params }: PageProps) {
  const { id: applicationId } = await params
  const user = await getUser()
  
  if (!user) {
    redirect('/sign-in')
  }
  
  const { application, error } = await getApplicationById(applicationId)
  
  if (error) {
    if (error === 'Employer profile not found') {
      redirect('/employer/profile')
    }
    
    if (error === 'Application not found or you do not have permission to view it') {
      redirect('/employer/jobs/applicants')
    }
    
    // For other errors, display an error message or redirect
    redirect('/employer/jobs/applicants')
  }
  
  if (!application) {
    redirect('/employer/jobs/applicants')
  }
  
  // Transform database data to match component expectations
  const formattedEducation: Education[] = application.candidate.education?.map(edu => ({
    id: edu.id,
    institution: edu.institution,
    degree: edu.degree,
    fieldOfStudy: edu.fieldOfStudy,
    startDate: edu.startDate ? edu.startDate.toISOString() : null,
    endDate: edu.endDate ? edu.endDate.toISOString() : null,
    description: edu.description
  })) || [];
  
  const formattedExperience: Experience[] = application.candidate.experience?.map(exp => ({
    id: exp.id,
    jobTitle: exp.jobTitle,
    companyName: exp.companyName,
    location: exp.location,
    startDate: exp.startDate ? exp.startDate.toISOString() : null,
    endDate: exp.endDate ? exp.endDate.toISOString() : null,
    isCurrent: exp.isCurrent === true,
    description: exp.description
  })) || [];
  
  const formattedCandidate: FormattedCandidate = {
    id: application.candidate.id,
    fullName: application.candidate.fullName,
    title: application.candidate.title,
    experienceLevel: application.candidate.experienceLevel,
    avatarUrl: application.candidate.avatarUrl,
    resumeUrl: application.candidate.resumeUrl,
    linkedinUrl: application.candidate.linkedinUrl,
    githubUrl: application.candidate.githubUrl,
    portfolioUrl: application.candidate.portfolioUrl,
    bio: application.candidate.bio,
    education: formattedEducation,
    experience: formattedExperience
  };
  
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <Link href="/employer/jobs/applicants">
          <Button variant="ghost" className="mb-4">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Applications
          </Button>
        </Link>
        
        <h1 className="text-2xl md:text-3xl font-semibold text-[#1a1e2d]">
          Application Details
        </h1>
        <p className="text-[#9aa3bc] mt-1">
          Review and manage candidate application
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ApplicationDetails 
            application={application.application} 
            job={application.job} 
          />
          <CandidateProfile candidate={formattedCandidate} />
        </div>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <StatusUpdateForm 
              applicationId={applicationId} 
              currentStatus={application.application.status} 
            />
          </div>
          
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <InterviewScheduler
              applicationId={applicationId}
              currentInterviewDate={application.application.interviewDate}
            />
          </div>
          
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <NotesForm
              applicationId={applicationId}
              currentNotes={application.application.notes}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 