import { Skeleton } from '@/components/ui/skeleton'
import { 
  Card,
  CardContent,
  CardHeader
} from '@/components/ui/card'

export default function ApplicationDetailLoading() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-10 w-72 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-1" />
              <Skeleton className="h-4 w-72" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-5 w-60" />
                <div className="mt-2 flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-5 w-40" />
                </div>
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-5 w-40" />
                </div>
              </div>
              
              <div>
                <Skeleton className="h-4 w-40 mb-3" />
                <Skeleton className="h-5 w-48" />
              </div>
              
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-1" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div>
                  <Skeleton className="h-7 w-48 mb-2" />
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
              
              <div>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-20 w-full" />
              </div>
              
              <div>
                <Skeleton className="h-4 w-24 mb-3" />
                <div className="flex gap-3">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <Skeleton className="h-6 w-40 mb-4" />
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-10 w-full" />
          </div>
          
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-4 w-64 mb-2" />
            <Skeleton className="h-10 w-full mb-2" />
            <Skeleton className="h-5 w-60 mb-4" />
            <Skeleton className="h-10 w-full" />
          </div>
          
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-32 w-full mb-4" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
} 