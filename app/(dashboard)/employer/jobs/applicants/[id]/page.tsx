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
          <CandidateProfile candidate={application.candidate} />
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