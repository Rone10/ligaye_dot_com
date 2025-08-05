import { Suspense } from 'react';
import { Metadata } from 'next';
import { getJobById, getRelatedJobs, checkUserApplication, checkUserSavedJob } from './_queries';
import JobHeader from './_components/JobHeader';
import JobDetails from './_components/JobDetails';
import RelatedJobs from './_components/RelatedJobs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { JobActionButton } from './_components/JobActionButton';
import { getUser, getCachedUser } from '@/lib/supabase/server';
import { generateJobMetadata } from '@/lib/seo/metadata';
import { generateJobPostingSchema } from '@/lib/seo/structured-data';
import StructuredData from '@/components/StructuredData';

// Remove the time-based revalidation - rely on tags + on-demand revalidation
// export const revalidate = 3600; 

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  try {
    // First, check if this is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return {
        title: 'Job Not Found | Ligaye.com',
        description: 'The requested job posting could not be found.',
      };
    }
    
    // Import db and query directly to avoid notFound() call in generateMetadata
    const { db } = await import('@/lib/db');
    const { jobs } = await import('@/lib/db/schema');
    const { eq } = await import('drizzle-orm');
    
    const database = await db();
    const jobData = await database.query.jobs.findFirst({
      where: eq(jobs.id, id),
      with: {
        company: true,
        location: true,
      },
    });
    
    if (!jobData || !jobData.company) {
      return {
        title: 'Job Not Found | Ligaye.com',
        description: 'The requested job posting could not be found.',
      };
    }
    
    return generateJobMetadata({
      jobTitle: jobData.title,
      companyName: jobData.company?.companyName || 'Company',
      location: jobData.location ? (jobData.location.city || jobData.location.district || jobData.location.region) : undefined,
      salary: {
        min: jobData.salaryRangeMin || undefined,
        max: jobData.salaryRangeMax || undefined,
        currency: jobData.salaryCurrency || 'GMD',
      },
      jobType: jobData.jobType,
      experienceLevel: jobData.experienceLevel || undefined,
      description: jobData.description,
      jobId: id,
      publishedDate: jobData.publishedAt ? new Date(jobData.publishedAt) : new Date(jobData.createdAt),
      updatedDate: new Date(jobData.updatedAt),
    });
  } catch (error) {
    console.error('Error generating job metadata:', error);
    return {
      title: 'Job Posting | Ligaye.com',
      description: 'View job details and apply for positions in Gambia.',
    };
  }
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
    getCachedUser(),
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
  
  // Generate structured data for SEO
  const jobPostingSchema = generateJobPostingSchema({
    title: job.title,
    description: job.description,
    company: {
      name: job.company?.companyName || 'Company',
      website: job.company?.website || undefined,
      description: job.company?.companyDescription || undefined,
    },
    location: job.location ? {
      name: job.location.city || job.location.district || job.location.region,
      country: 'Gambia',
    } : undefined,
    salary: (job.salaryRangeMin || job.salaryRangeMax) ? {
      min: job.salaryRangeMin || undefined,
      max: job.salaryRangeMax || undefined,
      currency: job.salaryCurrency || 'GMD',
      frequency: job.salaryFrequency || undefined,
    } : undefined,
    jobType: job.jobType,
    experienceLevel: job.experienceLevel || undefined,
    datePosted: job.publishedAt ? new Date(job.publishedAt) : new Date(job.createdAt),
    validThrough: job.expiresAt ? new Date(job.expiresAt) : undefined,
    applicationMethod: job.applicationMethod,
    employmentType: job.jobType ? [job.jobType] : undefined,
    workLocation: job.workLocation,
  });
  
  return (
    <div className="container max-w-7xl py-8 px-4 mx-auto space-y-8">
      <StructuredData data={jobPostingSchema} />
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