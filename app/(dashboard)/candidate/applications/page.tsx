import { Suspense } from 'react'
import { Briefcase } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { getUser } from '@/lib/supabase/server'
import { getCandidateApplications } from './_queries'
import ApplicationsList from './_components/ApplicationsList'

// Force dynamic rendering since this page uses authentication
export const dynamic = 'force-dynamic'

// Helper function for authentication (outside cache scope)
async function checkApplicationsAccess(): Promise<{ user: any; hasAccess: boolean }> {
  const user = await getUser()
  if (!user) {
    return { user: null, hasAccess: false }
  }
  
  return { user, hasAccess: true }
}

// Loading skeleton component
function ApplicationsLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>
      
      {/* Filter bar skeleton */}
      <Skeleton className="h-16 w-full rounded-xl" />
      
      {/* Card skeletons */}
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-48 w-full rounded-xl" />
      ))}
    </div>
  )
}

export default async function ApplicationsPage() {
  // Step 1: Authentication check OUTSIDE cache scope
  const { user, hasAccess } = await checkApplicationsAccess()
  
  if (!hasAccess || !user) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-6">
          <h1 className="text-2xl font-bold tracking-tight text-theme-dark">Access Required</h1>
          <p className="text-theme-gray-dark mt-2">
            Please sign in to view your job applications.
          </p>
        </div>
      </div>
    )
  }

  // Step 2: Fetch cached data (no auth logic inside)
  let applicationsResult
  try {
    applicationsResult = await getCandidateApplications(user.id)
  } catch (error) {
    console.error('Error fetching applications:', error)
    applicationsResult = { data: [], error: 'Failed to load applications' }
  }
  
  const { data, error } = applicationsResult
  
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start">
        <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-blue/10 mt-1">
          <Briefcase className="h-6 w-6 text-primary-blue" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-theme-dark">My Applications</h1>
          <p className="text-theme-gray-dark mt-1">
            Track and manage all your job applications in one place
          </p>
        </div>
      </div>
      
      {/* Applications content with suspense */}
      <Suspense fallback={<ApplicationsLoading />}>
        {error ? (
          <div className="glass-card p-6 border-red-200 dark:border-red-800">
            <p className="text-red-600">{error}</p>
            <p className="text-theme-gray-dark mt-2">
              There was an error loading your applications. Please try again later.
            </p>
          </div>
        ) : (
          <ApplicationsList applications={data || []} />
        )}
      </Suspense>
    </div>
  )
} 