import { Suspense } from 'react';
import { Header } from '@/app/components/header';
import { SearchSection } from '@/app/components/search-section';
import { Filters } from '@/app/components/filters';
import { JobCard } from '@/app/components/job-card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal } from 'lucide-react';
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent } from '@/components/ui/select'
import { JobPosting, JobType, WorkLocation, ExperienceLevel } from '@/app/types';
import { getJobs, JobSortOption } from '@/app/actions/jobs';

function JobCardSkeleton() {
  return (
    <div className="bg-card rounded-lg p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-8 w-8" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-24" />
      </div>
      <Skeleton className="h-16 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="pt-4 border-t flex justify-between items-center">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  );
}

// Helper function to convert Drizzle enum values to frontend types
function mapJobTypeToFrontend(dbType: string): JobType {
  const mapping: Record<string, JobType> = {
    'FULL_TIME': 'Full-Time',
    'PART_TIME': 'Part-Time',
    'CONTRACT': 'Contract',
    'INTERNSHIP': 'Internship',
    // Add more mappings as needed
  };
  return mapping[dbType] || 'Full-Time';
}

function mapWorkLocationToFrontend(dbLocation: string): WorkLocation {
  const mapping: Record<string, WorkLocation> = {
    'REMOTE': 'Remote',
    'HYBRID': 'Hybrid',
    'ON_SITE': 'On-site',
  };
  return mapping[dbLocation] || 'Remote';
}

function mapExperienceLevelToFrontend(dbLevel: string): ExperienceLevel {
  const mapping: Record<string, ExperienceLevel> = {
    'Entry': 'Entry',
    'Junior': 'Mid',
    'Mid-Level': 'Mid',
    'Senior': 'Senior',
    'Director': 'Senior',
    'Executive': 'Senior',
  };
  return mapping[dbLevel] || 'Mid';
}

async function JobsContent({
  page = 1,
  sortBy = 'recent'
}: {
  page?: number;
  sortBy?: string;
}) {
  // Convert sortBy to sort options
  let sort: JobSortOption = { field: 'createdAt', direction: 'desc' };
  
  if (sortBy === 'relevant') {
    sort = { field: 'title', direction: 'asc' };
  } else if (sortBy === 'salary') {
    sort = { field: 'salaryRangeMin', direction: 'desc' };
  }

  // Fetch jobs with pagination and sorting
  const { jobs: dbJobs, pagination } = await getJobs({
    page,
    pageSize: 10,
    sort
  });

  // Map DB jobs to frontend JobPosting type
  const jobs: JobPosting[] = dbJobs.map(job => ({
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    type: mapJobTypeToFrontend(job.type),
    workLocation: mapWorkLocationToFrontend(job.workLocation),
    experienceLevel: mapExperienceLevelToFrontend(job.experienceLevel),
    description: job.description,
    skills: job.skills,
    salaryRange: {
      min: job.salaryRange.min,
      max: job.salaryRange.max
    },
    postedDate: job.postedDate
  }));

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          Found {pagination.total} Jobs
        </h2>
        <Select defaultValue={sortBy}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="relevant">Most Relevant</SelectItem>
            <SelectItem value="salary">Highest Salary</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Job Listings */}
      <div className="space-y-4">
        {jobs.length > 0 ? (
          jobs.map((job, index) => (
            <JobCard key={job.id} job={job} index={index} />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No jobs found matching your criteria</p>
          </div>
        )}
        
        {/* Pagination */}
        {pagination.pageCount > 0 && (
          <div className="flex justify-center mt-8 gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="w-10 h-10"
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {Array.from({ length: Math.min(pagination.pageCount, 5) }, (_, i) => {
              const pageNumber = i + 1;
              return (
                <Button 
                  key={pageNumber}
                  variant={pageNumber === pagination.page ? "default" : "outline"} 
                  size="icon" 
                  className={`w-10 h-10 ${pageNumber === pagination.page ? 'bg-blue-600' : ''}`}
                >
                  {pageNumber}
                </Button>
              );
            })}
            
            <Button 
              variant="outline" 
              size="icon" 
              className="w-10 h-10"
              disabled={pagination.page >= pagination.pageCount}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

export default function JobsPage({
  searchParams
}: {
  searchParams: { page?: string; sort?: string }
}) {
  const page = Number(searchParams.page) || 1;
  const sortBy = searchParams.sort || 'recent';
  
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      <main className="container mx-auto py-8">
        <SearchSection />
        
        <div className="mt-8 flex gap-6">
          {/* Desktop Filters */}
          <div className="hidden md:block">
            <Filters />
          </div>

          <div className="flex-1">
            {/* Mobile Filters */}
            <div className="md:hidden mb-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80vh]">
                  <Filters />
                </SheetContent>
              </Sheet>
            </div>

            {/* Job Listings with Suspense */}
            <Suspense fallback={
              <div className="space-y-4">
                <JobCardSkeleton />
                <JobCardSkeleton />
                <JobCardSkeleton />
              </div>
            }>
              <JobsContent page={page} sortBy={sortBy} />
            </Suspense>
          </div>
        </div>
      </main>
    </div> 
  );
}