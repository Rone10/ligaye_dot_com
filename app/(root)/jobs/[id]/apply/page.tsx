import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getJobById } from '@/app/actions/jobs';
import { getUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { JobApplyForm } from './job-apply-form';


// Loading component for apply page
function ApplyPageSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center">
        <Skeleton className="h-10 w-32" />
      </div>
      
      <Skeleton className="h-16 w-full" />
      
      <div className="border rounded-lg p-6 space-y-6">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-2/3" />
        
        {/* Editor skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" /> {/* Toolbar */}
          <Skeleton className="h-64 w-full" /> {/* Editor content area */}
        </div>
        
        <div className="flex justify-end gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
}

async function ApplyPageContent({ id }: { id: string }) {
  // Fetch job details
  const job = await getJobById(id);
  
  if (!job) {
    notFound();
  }
  
  // Extract company name for the form
  const companyName = job?.company?.name || 'this company';
  
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/jobs/${id}`} className="flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" />
            Back to job details
          </Link>
        </Button>
      </div>
      
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-2">
          Apply for {job.title}
        </h1>
        <p className="text-muted-foreground mb-8">
          Complete your application for {job.title} at {companyName}
        </p>
        
        <JobApplyForm jobId={id} jobTitle={job.title} />
      </div>
    </div>
  );
}

interface Params {
  params: Promise<{ id: string }>;
}

export default async function ApplyPage({ params }: Params) {
  // Ensure params.id is awaited
  const { id } = await params;
  
  // Check authentication status
  const user = await getUser();
  
  // If not authenticated, redirect to login page
  if (!user) {
    redirect(`/sign-in?redirect=/jobs/${id}/apply`);
  }
  
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8 px-4">
      <Suspense fallback={<ApplyPageSkeleton />}>
        <ApplyPageContent id={id} />
      </Suspense>
    </div>
  );
} 