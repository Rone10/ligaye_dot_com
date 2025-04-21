import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ApplicationLoading() {
  return (
    <div className="container max-w-3xl mx-auto py-10">
      <div className="mb-8">
        <Skeleton className="h-8 w-3/4 mb-2" />
        <Skeleton className="h-5 w-1/2" />
      </div>
      
      <Card className="p-6">
        <div className="space-y-8">
          <div>
            <Skeleton className="h-6 w-1/6 mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          </div>
          
          <div>
            <Skeleton className="h-6 w-1/4 mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </Card>
    </div>
  )
} 