import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronLeft, 
  Building, 
  CalendarIcon, 
  Clock, 
  FileText, 
  MapPin,
  BriefcaseIcon,
  CalendarClockIcon,
  CheckCircle2Icon,
  XCircleIcon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { applicationStatusMap } from '@/lib/constants';
import { format } from 'date-fns';

// Define proper types for our data
type ApplicationStatus = 
  | 'PENDING'
  | 'REVIEWING'
  | 'SHORTLISTED' 
  | 'INTERVIEW_SCHEDULED'
  | 'INTERVIEWED'
  | 'OFFER_EXTENDED'
  | 'HIRED'
  | 'REJECTED';

type ApplicationData = {
  application: {
    id: string;
    status: ApplicationStatus;
    coverLetter?: string | null;
    appliedAt: Date;
    updatedAt: Date;
    interviewDate?: Date | null;
    feedback?: string | null;
  };
  job: {
    id: string;
    title: string;
    jobType?: string | null;
    salary?: string | null;
    locationName?: string | null;
  };
  employer: {
    id: string;
    companyName: string;
  };
};

// Loading component for Suspense fallback
function ApplicationDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-60" />
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <Skeleton className="h-6 w-64" />
              <Skeleton className="h-4 w-40 mt-2" />
            </div>
            <Skeleton className="h-8 w-28" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <Skeleton className="h-5 w-24" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <Skeleton className="h-5 w-32" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Server component to fetch application details
async function ApplicationDetails({ id }: { id: string }) {
  // Get the application details along with job and employer details
  const applicationData = await fetchExtendedApplicationData(id);
  
  if (!applicationData) {
    notFound();
  }
  
  const { application, job, employer } = applicationData;
  const statusColor = getStatusColor(application.status);
  const statusText = application.status ? 
    (applicationStatusMap[application.status as ApplicationStatus] || application.status) : 'Unknown';
  
  return (
    <>
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild className="mr-2">
          <Link href="/candidate/applications">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to applications
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <CardTitle className="text-xl font-semibold">
                <Link href={`/jobs/${job.id}`} className="hover:text-primary hover:underline transition-colors">
                  {job.title}
                </Link>
              </CardTitle>
              <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                <Building className="h-3.5 w-3.5" />
                <span>{employer.companyName}</span>
              </div>
            </div>
            <Badge variant={statusColor as any} className="text-sm px-3 py-1">
              {statusText}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4">
            {job.jobType && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>{job.jobType.replace(/_/g, ' ')}</span>
              </div>
            )}
            
            {job.locationName && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{job.locationName}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Applied {formatDate(application.appliedAt)}</span>
            </div>
            
            {job.salary && (
              <div className="flex items-center gap-2">
                <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
                <span>{job.salary}</span>
              </div>
            )}
            
            {application.updatedAt && (
              <div className="flex items-center gap-2">
                <CalendarClockIcon className="h-4 w-4 text-muted-foreground" />
                <span>Last updated: {formatDate(application.updatedAt)}</span>
              </div>
            )}
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Application Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Current Status</h4>
                <div className="flex items-center gap-2">
                  {application.status === 'REJECTED' ? (
                    <XCircleIcon className="h-5 w-5 text-destructive" />
                  ) : (
                    <CheckCircle2Icon className="h-5 w-5 text-primary" />
                  )}
                  <span className="font-medium">
                    {statusText}
                  </span>
                </div>
              </div>
              
              {application.interviewDate && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Interview Details</h4>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    <span>
                      {format(new Date(application.interviewDate), "PPP 'at' p")}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {application.coverLetter && (
            <>
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Cover Letter</h3>
                <div className="bg-muted/50 rounded-lg p-4 text-sm">
                  <p className="whitespace-pre-wrap">{application.coverLetter}</p>
                </div>
              </div>
            </>
          )}
          
          {application.feedback && (
            <>
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Feedback</h3>
                <div className="bg-muted/50 rounded-lg p-4 text-sm">
                  <p className="whitespace-pre-wrap">{application.feedback}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}

// Helper function to fetch extended application data including job and employer details
async function fetchExtendedApplicationData(applicationId: string): Promise<ApplicationData | null> {
  const { db } = await import('@/lib/db/db');
  const { applications, jobs, employerProfiles, locations } = await import('@/lib/db/schema');
  const { eq } = await import('drizzle-orm');
  
  // First get the application details
  const applicationResult = await db()
    .select()
    .from(applications)
    .where(eq(applications.id, applicationId))
    .limit(1);
  
  if (!applicationResult || applicationResult.length === 0) {
    return null;
  }
  
  const application = applicationResult[0];
  
  // Get job details
  const jobResult = await db()
    .select({
      job: jobs,
      employer: employerProfiles,
      location: locations
    })
    .from(jobs)
    .innerJoin(employerProfiles, eq(jobs.companyId, employerProfiles.id))
    .leftJoin(locations, eq(jobs.locationId, locations.id))
    .where(eq(jobs.id, application.jobId))
    .limit(1);
  
  if (!jobResult || jobResult.length === 0) {
    // Return basic application info with placeholder job data
    return {
      application: {
        id: application.id,
        status: application.status as ApplicationStatus,
        coverLetter: application.coverLetter,
        appliedAt: application.appliedAt,
        updatedAt: application.updatedAt,
        interviewDate: application.interviewDate,
        feedback: application.notes, // Assuming feedback is stored in notes
      },
      job: {
        id: application.jobId,
        title: 'Unknown Job', // Placeholder
        jobType: null,
        salary: null,
        locationName: null,
      },
      employer: {
        id: 'unknown',
        companyName: 'Unknown Company', // Placeholder
      }
    };
  }
  
  // Construct a properly typed response
  const jobData = jobResult[0];
  
  // Build a location string from the location object properties
  let locationName = null;
  if (jobData.location) {
    const locationParts = [
      jobData.location.town,
      jobData.location.district,
      jobData.location.region
    ].filter(Boolean);
    
    if (locationParts.length > 0) {
      locationName = locationParts.join(', ');
    }
  }
  
  return {
    application: {
      id: application.id,
      status: application.status as ApplicationStatus,
      coverLetter: application.coverLetter,
      appliedAt: application.appliedAt,
      updatedAt: application.updatedAt,
      interviewDate: application.interviewDate,
      feedback: application.notes, // Assuming feedback is stored in notes
    },
    job: {
      id: jobData.job.id,
      title: jobData.job.title,
      jobType: jobData.job.jobType,
      salary: jobData.job.salaryRangeMin && jobData.job.salaryRangeMax ? 
        `${jobData.job.salaryRangeMin} - ${jobData.job.salaryRangeMax} ${jobData.job.salaryCurrency || 'GMD'}` : null,
      locationName,
    },
    employer: {
      id: jobData.employer.id,
      companyName: jobData.employer.companyName,
    }
  };
}

// Helper function to map status to color variant
function getStatusColor(status: string): "default" | "outline" | "secondary" | "destructive" {
  switch (status) {
    case "PENDING":
    case "REVIEWING":
      return "default"
    case "SHORTLISTED":
    case "INTERVIEW_SCHEDULED":
      return "secondary"
    case "INTERVIEWED":
      return "outline"
    case "OFFER_EXTENDED":
    case "HIRED":
      return "secondary"
    case "REJECTED":
      return "destructive"
    default:
      return "default"
  }
}

// Helper function to format dates
function formatDate(dateString: string | Date) {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  return format(date, "MMM d, yyyy")
}

export default function ApplicationPage({ params }: { params: { id: string } }) {
  return (
    <div className="container py-6 max-w-4xl mx-auto">
      <Suspense fallback={<ApplicationDetailsSkeleton />}>
        <ApplicationDetails id={params.id} />
      </Suspense>
    </div>
  );
} 