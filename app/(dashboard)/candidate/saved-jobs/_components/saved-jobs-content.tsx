'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { Bookmark, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { unsaveJob } from '../_actions'
import { formatSalary } from '../_utils/format-salary'
import { SavedJob } from '../_utils/types'
import { formatJobType, formatWorkLocation } from '@/app/(dashboard)/candidate/applications/_utils/formatters'

interface SavedJobsContentProps {
  savedJobs: SavedJob[]
}

export function SavedJobsContent({ savedJobs }: SavedJobsContentProps) {
  const [jobs, setJobs] = useState<SavedJob[]>(savedJobs)

  const handleUnsave = async (jobId: string) => {
    try {
      const { success, error } = await unsaveJob(jobId)
      
      if (success) {
        setJobs(jobs.filter(job => job.job.id !== jobId))
        toast.success("Job removed from saved list")
      } else {
        toast.error(error || "Failed to remove job")
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  return (
    <div className="space-y-4">
      {jobs.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">
          No saved jobs remaining
        </p>
      ) : (
        jobs.map((item) => (
          <Card key={item.job.id} className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                {item.employer.companyLogoUrl ? (
                  <Image
                    src={item.employer.companyLogoUrl}
                    alt={item.employer.companyName}
                    width={48}
                    height={48}
                    className="rounded-md object-contain bg-background"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center">
                    <span className="text-lg font-semibold text-muted-foreground">
                      {item.employer.companyName.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-lg">{item.job.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.employer.companyName} • Saved {formatDistanceToNow(new Date(item.savedJob.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <p className="text-sm text-muted-foreground mb-3">
                {formatSalary(item.job)}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{formatJobType(item.job.jobType)}</Badge>
                <Badge variant="outline">{formatWorkLocation(item.job.workLocation)}</Badge>
                {item.job.experienceLevel && (
                  <Badge variant="outline">{item.job.experienceLevel}</Badge>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUnsave(item.job.id)}
              >
                <Bookmark className="h-4 w-4 mr-2" />
                Unsave
              </Button>
              <Button asChild size="sm">
                <Link href={`/jobs/${item.job.id}`}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Job
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))
      )}
    </div>
  )
} 