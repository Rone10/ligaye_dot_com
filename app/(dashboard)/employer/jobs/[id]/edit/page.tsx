import { notFound } from 'next/navigation';
import { getPageDataAction } from './_actions';
import { EditJobForm } from './_components/EditJobForm';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface PageProps {
  params: Promise<{ id: string }>;
}

function EditJobFormSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-10 w-1/4" />
      <Skeleton className="h-10 w-1/2" />
      <Skeleton className="h-10 w-24" />
    </div>
  );
}

export default async function EditJobPage({ params }: PageProps) {
  console.log('--- EditJobPage Start ---');
  const jobId = (await params).id;
  console.log('Job ID from params:', jobId);

  // Call the server action to get page data and perform authorization
  const { job, formData, error } = await getPageDataAction(jobId);

  // Check if the action returned an error (unauthorized, not found, etc.)
  if (error || !job || !formData) {
    console.log(`Action returned error or missing data: ${error || 'Data missing'}. Triggering 404.`);
    notFound();
  }

  console.log('Action successful. Fetched Job:', { id: job.id, title: job.title });
  console.log('Action successful. Fetched FormData:', { locations: !!formData.locations, industries: !!formData.industries, skills: !!formData.skills });

  // Destructure form data - ensured not null by the check above
  const { locations, industries, skills } = formData;

  console.log('--- Rendering EditJobForm ---');
  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">Edit Job Posting</h1>
      <Suspense fallback={<EditJobFormSkeleton />}>
        <EditJobForm
          job={job}
          locations={locations}
          industries={industries}
          skills={skills}
        />
      </Suspense>
    </div>
  );
} 