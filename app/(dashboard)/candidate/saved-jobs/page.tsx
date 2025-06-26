import { Suspense } from 'react'
import { getUser } from '@/lib/supabase/server'
import { getSavedJobs } from './_queries'
import { SavedJobsContent } from './_components/saved-jobs-content'
import { EmptyState } from '@/components/empty-state'
import { EmptySavedJobs } from './_components/empty-saved-jobs'
import { PageHeading } from '@/components/page-heading'
import { SavedJobsLoading } from './_components/saved-jobs-loading'

// Force dynamic rendering since this page uses authentication
export const dynamic = 'force-dynamic'

// Helper function for authentication (outside cache scope)
async function checkSavedJobsAccess(): Promise<{ user: any; hasAccess: boolean }> {
  const user = await getUser()
  if (!user) {
    return { user: null, hasAccess: false }
  }
  
  return { user, hasAccess: true }
}

export const metadata = {
  title: 'Saved Jobs | Ligaye',
  description: 'View and manage your saved jobs on Ligaye',
}

export default async function SavedJobsPage() {
  // Step 1: Authentication check OUTSIDE cache scope
  const { user, hasAccess } = await checkSavedJobsAccess()
  
  if (!hasAccess || !user) {
    return (
      <div className="container mx-auto max-w-5xl py-8 space-y-6">
        <PageHeading
          title="Saved Jobs"
          description="Jobs you've saved for later application"
        />
        <EmptyState
          title="Access Required"
          description="Please sign in to view your saved jobs."
          icon="AlertCircle"
        />
      </div>
    )
  }

  // Step 2: Fetch cached data (no auth logic inside)
  let savedJobsResult
  try {
    savedJobsResult = await getSavedJobs(user.id)
  } catch (error) {
    console.error('Error fetching saved jobs:', error)
    savedJobsResult = { data: [], error: 'Failed to load saved jobs' }
  }
  
  const { data, error } = savedJobsResult
  
  return (
    <div className="container mx-auto max-w-5xl py-8 space-y-6">
      <PageHeading
        title="Saved Jobs"
        description="Jobs you've saved for later application"
      />
      
      <Suspense fallback={<SavedJobsLoading />}>
        {error ? (
          <EmptyState
            title="Error loading saved jobs"
            description={error}
            icon="AlertCircle"
          />
        ) : data && data.length > 0 ? (
          <SavedJobsContent savedJobs={data as any} />
        ) : (
          <EmptySavedJobs />
        )}
      </Suspense>
    </div>
  )
} 