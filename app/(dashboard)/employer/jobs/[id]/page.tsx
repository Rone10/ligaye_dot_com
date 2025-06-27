import { getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { 
  getEmployerProfile, 
  getJobById, 
  checkJobOwnership,
  getJobSkills,
  getJobIndustries,
  getApplicationStats,
  getRecentApplications
} from './_queries'
import JobHeader from './_components/JobHeader'
import JobDetails from './_components/JobDetails'
import ApplicationsSummary from './_components/ApplicationsSummary'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Get job ID from params
  const { id: jobId } = await params
  
  // Fetch current user
  const user = await getUser()

  if (!user) {
    redirect('/sign-in')
  }

  // Check if user is employer
  const employerProfile = await getEmployerProfile(user.id)
  
  if (!employerProfile) {
    redirect('/employer/profile')
  }
  
  // First, fetch job data and check ownership in parallel
  const [jobData, isOwner] = await Promise.all([
    getJobById(jobId),
    checkJobOwnership(jobId, employerProfile.id)
  ])
  
  if (!jobData) {
    redirect('/employer/jobs?error=job-not-found')
  }
  
  if (!isOwner) {
    redirect('/employer/jobs?error=unauthorized')
  }
  
  // Extract job and location from joined result
  const { job, location } = jobData
  
  // Fetch all related data in parallel
  const [jobSkills, jobIndustries, applicationStats, recentApplications] = await Promise.all([
    getJobSkills(jobId),
    getJobIndustries(jobId),
    getApplicationStats(jobId),
    getRecentApplications(jobId)
  ])
  
  return (
    <div className="container max-w-7xl py-8 mx-auto space-y-8">
      {/* Job Header */}
      <JobHeader job={job} applicationsCount={applicationStats.total} />
      
      <Separator className="my-6" />
      
      {/* Tabs for different sections */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="details">Job Details</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-6">
          <JobDetails 
            job={job} 
            location={location} 
            skills={jobSkills} 
            industries={jobIndustries} 
          />
        </TabsContent>
        
        <TabsContent value="applications">
          <ApplicationsSummary 
            jobId={job.id}
            applicationStats={applicationStats}
            recentApplications={recentApplications}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
} 