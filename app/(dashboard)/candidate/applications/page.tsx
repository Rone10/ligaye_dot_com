import { Suspense } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ApplicationCard } from '../_components/application-card';
import { getApplications } from '@/app/actions/candidate/applications';

// Loading component for Suspense fallback
function ApplicationsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Skeleton className="h-10 w-full sm:w-80" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
      
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
            <Skeleton className="h-8 w-20" />
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

// Server component to fetch applications data
async function ApplicationsContent() {
  // Fetch candidate applications
  const applications = await getApplications();
  
  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <Input
          placeholder="Search applications..."
          className="sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
            All
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
            Pending
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
            Interview
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
            Rejected
          </Badge>
        </div>
      </div>
      
      <div className="space-y-4">
        {applications.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <h3 className="text-lg font-medium mb-2">No applications found</h3>
            <p className="text-muted-foreground mb-4">You haven't applied for any jobs yet.</p>
            <Button asChild className="mt-2">
              <a href="/jobs">Browse Jobs</a>
            </Button>
          </div>
        ) : (
          applications.map((application) => (
            <ApplicationCard 
              key={application.application.id} 
              application={application.application}
              job={application.job}
              employer={application.employer}
            />
          ))
        )}
      </div>
      
      {applications.length > 0 && (
        <div className="flex justify-between items-center mt-8">
          <div className="text-sm text-gray-500">
            Showing {applications.length} applications
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
    </>
  );
}

export default function ApplicationsPage() {
  return (
    <div className="container py-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">My Applications</h1>
        <p className="text-muted-foreground">
          Track and manage your job applications
        </p>
      </div>
      
      <Suspense fallback={<ApplicationsLoadingSkeleton />}>
        <ApplicationsContent />
      </Suspense>
    </div>
  );
}