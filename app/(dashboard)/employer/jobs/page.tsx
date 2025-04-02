import { getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getEmployerJobs, getEmployerJobCounts } from './_queries'
import EmployerJobsTable from './_components/EmployerJobsTable'
import JobFilters from './_components/JobFilters'
import { Button } from '@/components/ui/button'

interface PageProps {
  searchParams: Promise<{ 
    status?: string;
    q?: string;
    sort?: 'newest' | 'oldest';
  }>
}

export default async function EmployerJobsPage({ searchParams }: PageProps) {
    const params = await searchParams
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Parse filters from search params
  const filters = {
    status: params.status || 'ALL',
    searchTerm: params.q || '',
    sort: params.sort || 'newest'
  }
  
  // Fetch job listings and counts
  const [jobsResult, countsResult] = await Promise.all([
    getEmployerJobs(filters),
    getEmployerJobCounts()
  ])
  
  // Handle errors
  if (jobsResult.error || countsResult.error) {
    // If it's a profile not found error, redirect to create profile
    if (jobsResult.error === 'Employer profile not found' || 
        countsResult.error === 'Employer profile not found') {
      redirect('/employer/profile')
    }
  }
  
  const jobListings = jobsResult.jobListings || []
  const counts = countsResult.counts || {
    all: 0,
    draft: 0,
    pending: 0,
    active: 0,
    expired: 0,
    filled: 0
  }
  
  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-[#1a1e2d]">My Job Postings</h1>
          <p className="text-[#9aa3bc] mt-1">
            Manage and monitor all your job listings
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button asChild className="bg-[#4a6cfa] hover:bg-[#7b90ff] text-white">
            <Link href="/employer/jobs/new">Post a New Job</Link>
          </Button>
        </div>
      </div>
      
      <JobFilters counts={counts} currentFilters={filters} />
      
      <div className="mt-6">
        <EmployerJobsTable jobs={jobListings} />
      </div>
    </div>
  )
} 