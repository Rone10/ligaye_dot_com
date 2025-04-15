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

// Export cache configuration for on-demand revalidation
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: PageProps) {
  // Extract the job ID from params
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  // Get the current user
  const user = await getUser();
  
  // Fetch job details - add cache tags for on-demand revalidation
  const job = await getJobById(id, { next: { tags: [`job-${id}`] } });
  
  // Fetch related jobs - add cache tags for job company
  const relatedJobs = await getRelatedJobs(id, 3, { next: { tags: [`company-${job.companyId}`] } });
  
  // Check if user has already applied
  const hasApplied = user ? await checkUserApplication(id, user.id) : false;
  
  // Check if user has saved this job
  const isSaved = user ? await checkUserSavedJob(id, user.id) : false;
  
  // Log debug info (will show in server console)
  console.log('User info:', user ? { id: user.id, role: user.user_metadata.role } : 'Not logged in');
  console.log('Job application status - hasApplied:', hasApplied);
  
  return (
    <div className="container max-w-7xl py-8 mx-auto space-y-8">
      {/* Job Header */}
      <JobHeader job={job} hasApplied={hasApplied} isSaved={isSaved} />
      
      {/* Add Apply Button */}
      <div className="mt-6">
        <JobActionButton 
          id={id}
          applicationMethod={job.applicationMethod}
          isLoggedIn={!!user}
          userRole={user?.role || null}
          hasApplied={hasApplied}
        />
      </div>
      
      <Separator className="my-6" />
      
      {/* Tabs for different sections */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="details">Job Details</TabsTrigger>
          <TabsTrigger value="company">Company Info</TabsTrigger>
          {relatedJobs.length > 0 && (
            <TabsTrigger value="related">Similar Jobs</TabsTrigger>
          )}
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
        
        {relatedJobs.length > 0 && (
          <TabsContent value="related">
            <RelatedJobs relatedJobs={relatedJobs} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
} 