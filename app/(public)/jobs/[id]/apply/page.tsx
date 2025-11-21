import { redirect } from "next/navigation"
import { getUser } from "@/lib/supabase/server"
import { ApplicationForm } from "./_components/ApplicationForm"
import { getApplicationContextData } from "./_queries"

type ApplicationPageProps = {
  params: Promise<{ id: string }>
}

export default async function ApplicationPage({ params }: ApplicationPageProps) {
  const { id } = await params
  const user = await getUser()
  
  // Redirect if not logged in
  if (!user) {
    redirect(`/sign-in?redirect=/jobs/${id}/apply`)
  }
  
  // Redirect if not a candidate
  if (user.user_metadata.role !== 'candidate') {
    redirect(`/jobs/${id}?error=notCandidate`)
  }
  
  // Fetch application context data (job and candidate info)
  const { job, candidateProfile, existingApplication } = await getApplicationContextData(id, user.id)
  
  // Redirect if job not found
  if (!job) {
    redirect('/jobs?error=jobNotFound')
  }
  
  // Redirect if user has already applied
  if (existingApplication) {
    redirect(`/jobs/${id}?error=alreadyApplied`)
  }
  
  // Redirect if job doesn't allow platform applications
  if (job.applicationMethod !== 'PLATFORM') {
    redirect(`/jobs/${id}?error=externalApplication`)
  }

  // Redirect if candidate profile doesn't exist
  if (!candidateProfile) {
    redirect(`/candidate/profile?error=profileIncomplete&redirect=/jobs/${id}/apply`)
  }

  // Prepare job data with proper types for the form
  const jobData = {
    id: job.id,
    title: job.title,
    companyName: job.companyName || 'Company',
    resumeRequired: job.resumeRequired || false
  }
  
  return (
    <div className="container max-w-3xl mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">Apply for: {job.title}</h1>
        <p className="text-gray-dark">at {job.companyName || 'Company'}</p>
      </div>
      
      <ApplicationForm 
        job={jobData}
        candidateProfile={candidateProfile}
      />
    </div>
  )
} 