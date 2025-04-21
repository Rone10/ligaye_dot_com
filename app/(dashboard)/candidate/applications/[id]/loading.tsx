import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import RingLoaderSpinner from '@/components/loaders/ring-loader'
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
      <div className='flex justify-center items-center h-screen container mx-auto'>
      <RingLoaderSpinner />
    </div>    
    </div>
  )
} 