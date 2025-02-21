import { Suspense } from 'react';
import { Header } from './components/header';
import { SearchSection } from './components/search-section';
import { Filters } from './components/filters';
import { JobCard } from './components/job-card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal } from 'lucide-react';
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent } from '@/components/ui/select'

// Mock data for demonstration
const mockJobs = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    type: 'Full-Time',
    workLocation: 'Remote',
    experienceLevel: 'Senior',
    description: 'We are looking for a Senior Frontend Developer to join our team and help build amazing user experiences.',
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind'],
    salaryRange: { min: 120000, max: 180000 },
    postedDate: new Date('2024-03-20'),
  },
  {
    id: '2',
    title: 'Full Stack Engineer',
    company: 'StartupX',
    location: 'New York, NY',
    type: 'Full-Time',
    workLocation: 'Hybrid',
    experienceLevel: 'Mid',
    description: 'Join our fast-growing startup as a Full Stack Engineer and work on cutting-edge technologies.',
    skills: ['Node.js', 'React', 'PostgreSQL', 'AWS'],
    salaryRange: { min: 100000, max: 150000 },
    postedDate: new Date('2024-03-21'),
  },
] as const;

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

export default function Home() {
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Found 235 Jobs</h2>
              <Select defaultValue="recent">
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

          {/* Job Listings */}
          <div className="space-y-4">
            <Suspense fallback={
              <div className="space-y-4">
                <JobCardSkeleton />
                <JobCardSkeleton />
                <JobCardSkeleton />
              </div>
            }>
              {mockJobs.map((job, index) => (
                <JobCard key={job.id} job={job} index={index} />
              ))}
              <div className="flex justify-center mt-8 gap-2">
                <Button variant="outline" size="icon" className="w-10 h-10">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="default" size="icon" className="w-10 h-10 bg-blue-600">1</Button>
                <Button variant="outline" size="icon" className="w-10 h-10">2</Button>
                <Button variant="outline" size="icon" className="w-10 h-10">3</Button>
                <Button variant="outline" size="icon" className="w-10 h-10">4</Button>
                <Button variant="outline" size="icon" className="w-10 h-10">5</Button>
                <Button variant="outline" size="icon" className="w-10 h-10">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </Suspense>
          </div>
          </div>
        </div>
      </main>
    </div> 
  );
}