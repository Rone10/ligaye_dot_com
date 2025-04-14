import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default function ApplicationDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb navigation */}
      <Link 
        href="/candidate/applications" 
        className="inline-flex items-center text-sm text-[#9aa3bc] hover:text-[#4a6cfa] mb-2"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Applications
      </Link>
      
      {/* Application header skeleton */}
      <div className="bg-white/70 backdrop-blur-md rounded-xl border border-[rgba(255,255,255,0.3)] overflow-hidden shadow-[0_8px_32px_rgba(31,38,135,0.1)]">
        <div className="px-6 py-5 md:px-8 md:py-6">
          {/* Application status and date */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-4 w-36" />
          </div>
          
          {/* Job title and company */}
          <div className="flex items-start gap-4">
            <Skeleton className="h-16 w-16 rounded-md flex-shrink-0" />
            
            <div className="flex-1 min-w-0">
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-6 w-1/2" />
            </div>
          </div>
          
          {/* Job details */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-6 sm:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center">
                <Skeleton className="h-10 w-10 rounded-full mr-2" />
                <div>
                  <Skeleton className="h-3 w-16 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
          
          {/* Actions */}
          <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-gray-100">
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Documents section skeleton */}
          <div className="bg-white/70 backdrop-blur-md rounded-xl border border-[rgba(255,255,255,0.3)] overflow-hidden shadow-[0_8px_32px_rgba(31,38,135,0.1)]">
            <div className="p-6">
              <Skeleton className="h-6 w-48 mb-6" />
              
              <div className="space-y-5">
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            </div>
          </div>
          
          {/* Employer feedback skeleton */}
          <div className="bg-white/70 backdrop-blur-md rounded-xl border border-[rgba(255,255,255,0.3)] overflow-hidden shadow-[0_8px_32px_rgba(31,38,135,0.1)]">
            <div className="p-6">
              <Skeleton className="h-6 w-48 mb-6" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Application status & actions skeleton */}
          <div className="bg-white/70 backdrop-blur-md rounded-xl border border-[rgba(255,255,255,0.3)] overflow-hidden shadow-[0_8px_32px_rgba(31,38,135,0.1)]">
            <div className="p-6">
              <Skeleton className="h-6 w-48 mb-6" />
              
              <div className="space-y-4">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 