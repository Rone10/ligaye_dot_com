import Link from 'next/link'
import { FileX, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ApplicationNotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16">
      <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
        <FileX className="h-10 w-10 text-red-500" />
      </div>
      
      <h1 className="text-2xl font-bold text-[#1a1e2d] mb-3">Application Not Found</h1>
      
      <p className="text-[#9aa3bc] max-w-md mb-8">
        We couldn&apos;t find the application you&apos;re looking for. It may have been removed,
        or you might not have permission to view it.
      </p>
      
      <Link href="/candidate/applications" passHref>
        <Button className="inline-flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Applications
        </Button>
      </Link>
    </div>
  )
} 