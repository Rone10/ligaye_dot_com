import { getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getEmployerApplications, getApplicationCounts } from './_queries'
import ApplicationsDataTable from './_components/ApplicationsDataTable'
import ApplicationFilters, { ApplicationFiltersClearButton } from './_components/ApplicationFilters'
import { Search } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{
    status?: string
    q?: string
    sort?: 'newest' | 'oldest'
  }>
}

export default async function EmployerApplicationsPage({ searchParams }: PageProps) {
  // Await the searchParams
  const params = await searchParams
  
  // Check authentication
  const user = await getUser()
  if (!user) {
    redirect('/sign-in')
  }
  
  // Parse filters from search params
  const filters = {
    status: params.status || undefined,
    searchTerm: params.q || undefined,
    sort: params.sort || 'newest',
    jobId: undefined // Not used in this page but needed for the query
  }
  
  // Fetch applications and counts in parallel with filters
  const [applicationsResult, countsResult] = await Promise.all([
    getEmployerApplications(filters),
    getApplicationCounts()
  ])
  
  // Handle errors
  if (applicationsResult.error || countsResult.error) {
    if (applicationsResult.error === 'Employer profile not found' || 
        countsResult.error === 'Employer profile not found') {
      redirect('/employer/profile')
    }
  }
  
  const applications = applicationsResult.applications || []
  const counts = countsResult.counts || {
    all: 0,
    applied: 0,
    reviewing: 0,
    shortlisted: 0,
    interview: 0,
    interviewed: 0,
    offered: 0,
    hired: 0,
    rejected: 0,
    withdrawn: 0
  }
  
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-theme-dark">Job Applications</h1>
        <p className="text-theme-gray-dark mt-1">Manage and track candidates applying to your job postings</p>
      </div>
      
      {/* Filter component that handles client-side interactions */}
      <ApplicationFilters 
        counts={counts} 
        currentStatus={params.status} 
        currentSearchTerm={params.q} 
        currentSort={filters.sort}
      />
      
      {/* Display applications or empty state */}
      <div className="mt-6">
        {applications.length > 0 ? (
          <ApplicationsDataTable applications={applications} />
        ) : (
          <div className="glass-card p-10 text-center">
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 bg-primary-blue/10 rounded-full flex items-center justify-center mb-4">
                <Search className="text-primary-blue" size={24} />
              </div>
              <h3 className="text-theme-dark font-medium text-lg mb-2">No applications found</h3>
              <p className="text-theme-gray-dark max-w-md mb-6">There are no applications matching your current filters. Try changing your search terms or filter criteria.</p>
              <ApplicationFiltersClearButton />
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 