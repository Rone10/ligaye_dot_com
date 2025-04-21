import { Briefcase } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import RingLoaderSpinner from '@/components/loaders/ring-loader'

export default function ApplicationsLoading() {
  return (
    <div className='flex justify-center items-center h-screen container mx-auto'>
    <RingLoaderSpinner />
  </div>
  )
} 