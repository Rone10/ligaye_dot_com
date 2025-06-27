import { getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EditJobForm from './_components/EditJobForm'
import { 
  getEmployerProfile, 
  getJobById,
  checkJobOwnership,
  getJobSkills,
  getJobIndustries
} from './_queries'

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  // Get job ID from params
  const { id: jobId } = await params
  
  // Fetch current user
  const user = await getUser()

  if (!user) {
    redirect(`/sign-in?redirect=/employer/jobs/${jobId}/edit`)
  }

  // Check if user is employer
  const employerProfile = await getEmployerProfile(user.id)
  
  if (!employerProfile) {
    redirect('/employer/profile')
  }
  
  // First wave: Get job and check ownership in parallel
  const [job, isOwner] = await Promise.all([
    getJobById(jobId),
    checkJobOwnership(jobId, employerProfile.id)
  ])
  
  if (!job) {
    redirect('/employer/jobs?error=job-not-found')
  }
  
  if (!isOwner) {
    redirect('/employer/jobs?error=unauthorized')
  }
  
  // Second wave: Fetch job skills and industries in parallel
  const [jobSkills, jobIndustries] = await Promise.all([
    getJobSkills(jobId),
    getJobIndustries(jobId)
  ])
  
  return (
    <div className="container max-w-4xl py-10 mx-auto">
      <h1 className="text-2xl md:text-3xl font-semibold mb-2 text-[#1a1e2d]">Edit Job</h1>
      <p className="text-[#9aa3bc] mb-8">Update your job posting</p>
      <EditJobForm 
        job={job} 
        jobSkills={jobSkills} 
        jobIndustries={jobIndustries} 
      />
    </div>
  )
} 