'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'

export function SavedJobsLoading() {
  return (
    <div className="space-y-4">
      {Array(3).fill(0).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-md" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-16 rounded-full" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Skeleton className="h-9 w-28 rounded-md" />
            <Skeleton className="h-9 w-28 rounded-md" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
} 