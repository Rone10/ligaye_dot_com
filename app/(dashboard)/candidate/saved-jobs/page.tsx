import { Suspense } from 'react'
import { getSavedJobs } from './_queries'
import { SavedJobsContent } from './_components/saved-jobs-content'
import { EmptyState } from '@/components/empty-state'
import { EmptySavedJobs } from './_components/empty-saved-jobs'
import { PageHeading } from '@/components/page-heading'
import { SavedJobsLoading } from './_components/saved-jobs-loading'

// Force dynamic rendering since this page uses authentication
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Saved Jobs | Ligaye',
  description: 'View and manage your saved jobs on Ligaye',
}

export default async function SavedJobsPage() {
  const { data, error } = await getSavedJobs()
  
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