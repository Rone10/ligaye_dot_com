import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { fetchLocations } from '@/app/actions/employer/locations';
import { CreateJobForm } from './_components/create-job-form';
import { getUser } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Create Job | Ligaye',
  description: 'Create a new job listing',
};

export default async function NewJobPage() {
  const user = await getUser();
  
  if (!user) {
    redirect('/login?callbackUrl=/employer/jobs/new');
  }
  
  const locations = await fetchLocations();
  
  return (
    <div className="container max-w-4xl py-8 mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create New Job</h1>
        <p className="text-muted-foreground mt-2">
          Fill out the form below to create a new job listing.
        </p>
      </div>
      
      <CreateJobForm locations={locations || []} />
    </div>
  );
}
