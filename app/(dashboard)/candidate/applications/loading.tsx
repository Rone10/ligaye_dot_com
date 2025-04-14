import { Briefcase } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function ApplicationsLoading() {
  return (
    <div className="space-y-6">
      {/* Page header skeleton */}
      <div className="flex items-start">
        <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#4a6cfa]/10 mt-1">
          <Briefcase className="h-6 w-6 text-[#4a6cfa]" />
        </div>
        <div>
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
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