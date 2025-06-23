import { Suspense } from 'react';
import { getJobById, getRelatedJobs, checkUserApplication, checkUserSavedJob } from './_queries';
import JobHeader from './_components/JobHeader';
import JobDetails from './_components/JobDetails';
import RelatedJobs from './_components/RelatedJobs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { JobActionButton } from './_components/JobActionButton';
import { getUser } from '@/lib/supabase/server';

// Remove the time-based revalidation - rely on tags + on-demand revalidation
// export const revalidate = 3600; 

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function JobDetailPage({ params, searchParams }: PageProps) {
  // Extract the job ID from params and search params
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const id = resolvedParams.id;
  
  // Check if we're coming from an application view
  const fromApplication = resolvedSearchParams.from === 'application';
  
  // OPTIMIZATION: Run all initial data fetching in parallel
  // This eliminates waterfall loading and improves performance significantly
  const [user, job] = await Promise.all([
    getUser(),
    getJobById(id, { 
      skipStatusFilter: fromApplication
    })
  ]);
  
  // OPTIMIZATION: Now that we have job data, run all remaining queries in parallel
  // This includes user-specific checks and related jobs
  const [relatedJobs, hasApplied, isSaved] = await Promise.all([
    // Related jobs query - no longer depends on job.companyId since it's handled internally
    getRelatedJobs(id, 3),
    
    // User-specific queries - only run if user exists
    user ? checkUserApplication(id, user.id) : Promise.resolve(false),
    user ? checkUserSavedJob(id, user.id) : Promise.resolve(false)
  ]);
  
  return (
    <div className="container max-w-7xl py-8 px-4 mx-auto space-y-8">
      {/* Notice when viewing from application */}
      {fromApplication && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                You&apos;re viewing this job from your application history. The job status or availability may have changed since you applied.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Job Header */}
      <JobHeader job={job} hasApplied={hasApplied} isSaved={isSaved} fromApplication={fromApplication} />
      
      {/* Add Apply Button */}
      <div className="mt-6">
        <JobActionButton 
          id={id}
          applicationMethod={job.applicationMethod}
          isLoggedIn={!!user}
          userRole={user?.user_metadata.role || null}
          hasApplied={hasApplied}
        />
      </div>
      
      <Separator className="my-6" />
      
      {/* Tabs for different sections */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="details">Job Details</TabsTrigger>
          <TabsTrigger value="company">Company Info</TabsTrigger>
          <TabsTrigger value="related">Similar Jobs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <JobDetails 
            job={job} 
            location={job.location} 
            skills={job.skills} 
            industries={job.industries} 
            hasApplied={hasApplied}
          />
        </TabsContent>
        
        <TabsContent value="company">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Card className="overflow-hidden shadow-[0_8px_32px_rgba(31,38,135,0.1)] bg-background/80 backdrop-blur-md border-[rgba(255,255,255,0.3)] rounded-2xl">
                <CardHeader className="border-b bg-gray-50/50">
                  <CardTitle>About {job.company?.companyName}</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {job.company?.companyDescription ? (
                    <div className="prose max-w-none">
                      <p className="text-gray-700">{job.company.companyDescription}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No company description available</p>
                  )}
                  
                  {job.company?.website && (
                    <div className="mt-6">
                      <a 
                        href={job.company.website} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Visit Company Website
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="related">
          <RelatedJobs relatedJobs={relatedJobs} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 