import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, MapPin } from 'lucide-react'
import { jobTypeLabels } from '../../_utils/constants'

interface RelatedJobsProps {
  relatedJobs: any[]
}

export default function RelatedJobs({ relatedJobs }: RelatedJobsProps) {
  if (!relatedJobs || relatedJobs.length === 0) {
    return (
      <Card className="overflow-hidden shadow-[0_8px_32px_rgba(31,38,135,0.1)] bg-background/80 backdrop-blur-md border-[rgba(255,255,255,0.3)] rounded-2xl">
        <CardHeader className="border-b bg-gray-50/50">
          <CardTitle>Similar Jobs</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-gray-500 italic">No similar jobs found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden shadow-[0_8px_32px_rgba(31,38,135,0.1)] bg-background/80 backdrop-blur-md border-[rgba(255,255,255,0.3)] rounded-2xl">
      <CardHeader className="border-b bg-gray-50/50">
        <CardTitle>Similar Jobs</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {relatedJobs.map(job => (
            <div key={job.id} className="p-4 hover:bg-blue-50/50 transition-colors">
              <h3 className="font-medium text-lg mb-1">
                <Link href={`/jobs/${job.slug || job.id}`} className="text-blue-600 hover:text-blue-800">
                  {job.title}
                </Link>
              </h3>
              <div className="flex flex-wrap gap-3 mt-2 text-sm">
                {job.jobType && (
                  <div className="flex items-center">
                    <Briefcase className="mr-1.5 h-4 w-4 text-[#4a6cfa]" />
                    <span className="text-gray-600">{jobTypeLabels[job.jobType]}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <MapPin className="mr-1.5 h-4 w-4 text-[#4a6cfa]" />
                  <span className="text-gray-600">{job.locationName || 'Remote'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 