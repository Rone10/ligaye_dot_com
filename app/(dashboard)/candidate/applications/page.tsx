import { Suspense } from 'react'
import { Briefcase } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { getCandidateApplications } from './_queries'
import ApplicationsList from './_components/ApplicationsList'

// Loading skeleton component
function ApplicationsLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>
      
      {/* Filter bar skeleton */}
      <Skeleton className="h-16 w-full rounded-xl" />
      
      {/* Card skeletons */}
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-48 w-full rounded-xl" />
      ))}
    </div>
  )
}

export default async function ApplicationsPage() {
  // Fetch applications
  const { data, error } = await getCandidateApplications()
  
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start">
        <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#4a6cfa]/10 mt-1">
          <Briefcase className="h-6 w-6 text-[#4a6cfa]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1a1e2d]">My Applications</h1>
          <p className="text-[#9aa3bc] mt-1">
            Track and manage all your job applications in one place
          </p>
        </div>
      </div>
      
      {/* Applications content with suspense */}
      <Suspense fallback={<ApplicationsLoading />}>
        {error ? (
          <div className="bg-white/70 backdrop-blur-md rounded-xl border border-red-200 p-6 shadow-[0_8px_32px_rgba(31,38,135,0.1)]">
            <p className="text-red-600">{error}</p>
            <p className="text-[#9aa3bc] mt-2">
              There was an error loading your applications. Please try again later.
            </p>
          </div>
        ) : (
          <ApplicationsList applications={data || []} />
        )}
      </Suspense>
    </div>
  )
} 