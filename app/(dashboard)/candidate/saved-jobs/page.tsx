import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SavedJobCard } from '../_components/saved-job-card';
import { getSavedJobs } from '@/app/actions/candidate/saved-jobs';

// Loading component for Suspense fallback
function SavedJobsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {Array(5).fill(0).map((_, i) => (
        <div key={i} className="rounded-lg border p-6 space-y-4">
          <div className="flex justify-between">
            <div>
              <Skeleton className="h-6 w-64" />
              <Skeleton className="h-4 w-40 mt-2" />
            </div>
            <Skeleton className="h-8 w-28" />
          </div>
          <Skeleton className="h-4 w-full" />
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Server component to fetch saved jobs data
async function SavedJobsContent() {
  // Fetch candidate saved jobs
  const savedJobs = await getSavedJobs();
  
  return (
    <div className="space-y-4">
      {savedJobs.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <h3 className="text-lg font-medium mb-2">No saved jobs found</h3>
          <p className="text-muted-foreground mb-4">You haven't saved any jobs yet.</p>
          <Button asChild className="mt-2">
            <a href="/jobs">Browse Jobs</a>
          </Button>
        </div>
      ) : (
        savedJobs.map((savedJob) => (
          <SavedJobCard 
            key={savedJob.savedJob.id} 
            savedJob={savedJob.savedJob}
            job={savedJob.job}
            employer={savedJob.employer}
          />
        ))
      )}
      
      {savedJobs.length > 0 && (
        <div className="flex justify-between items-center mt-8">
          <div className="text-sm text-gray-500">
            Showing {savedJobs.length} saved jobs
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SavedJobsPage() {
  return (
    <div className="container py-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Saved Jobs</h1>
        <p className="text-muted-foreground">
          Jobs you've saved for later
        </p>
      </div>
      
      <Suspense fallback={<SavedJobsLoadingSkeleton />}>
        <SavedJobsContent />
      </Suspense>
    </div>
  );
}