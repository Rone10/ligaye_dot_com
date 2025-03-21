import { Suspense } from 'react';
import { JobHeader } from '@/app/components/jobs/job-header';
import { JobDescription } from '@/app/components/jobs/job-description';
import { CompanyInfo } from '@/app/components/jobs/company-info';
import { JobDetailsSidebar } from '@/app/components/jobs/job-details-sidebar';
import { SimilarJobs } from '@/app/components/jobs/similar-jobs';
import { Skeleton } from '@/components/ui/skeleton';
import { getJobById, getSimilarJobs } from '@/app/actions/jobs';
import { notFound } from 'next/navigation';
import { ApplySection } from './apply-section';

function JobDetailsLoading() {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
      <div className="lg:w-1/3 space-y-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}

interface Props {
  params: {
    id: string;
  };
}

// This function generates the static paths at build time
export async function generateStaticParams() {
  // For now, we'll just pre-render the mock job
  // When we have a database, we'll fetch all job IDs here
  return [
    { id: '1' },
  ];
}

// Enable ISR with 1 hour revalidation
export const revalidate = 3600;

interface Params {
  params: Promise<{ id: string }>;
}

export default async function JobDetailsPage({ params }: Params) {
  // Ensure params.id is awaited
  const {id} = await params;
  
  let jobDetails;
  let similarJobs;

  try {
    // Use proper caching strategy with revalidation
    [jobDetails, similarJobs] = await Promise.all([
      getJobById(id),
      getSimilarJobs(id)
    ]);
  } catch (error) {
    notFound();
  }

  // Extract company name for the apply section
  const companyName = jobDetails?.company?.name || 'this company';

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Suspense fallback={<JobDetailsLoading />}>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Content */}
            <div className="flex-1 space-y-6">
              <JobHeader job={jobDetails} />
              <JobDescription job={jobDetails} />
              <CompanyInfo company={jobDetails.company} />
            </div>

            {/* Sidebar */}
            <div className="lg:w-1/3 space-y-6">
              <JobDetailsSidebar job={jobDetails} />
              <ApplySection jobId={id} jobTitle={jobDetails.title} companyName={companyName} />
              <SimilarJobs jobs={similarJobs} />
            </div>
          </div>
        </Suspense>
      </div>
    </div>
  );
}