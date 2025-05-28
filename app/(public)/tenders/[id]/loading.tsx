import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function TenderDetailLoading() {
  return (
    <div className="container mx-auto px-xxs sm:px-xs md:px-sm lg:px-md py-lg">
      {/* Back button skeleton */}
      <div className="mb-lg">
        <div className="inline-flex items-center gap-xs">
          <ArrowLeft className="h-4 w-4 text-theme-gray" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
      
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md mb-xl">
        <Skeleton className="h-9 w-48" />
        <div className="flex gap-sm">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
      
      {/* Main Information Card skeleton */}
      <Card className="glass-card p-xl mb-xl">
        <div className="space-y-lg">
          {/* Header skeleton */}
          <div className="border-b border-theme-gray/20 pb-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-md">
              <div className="space-y-sm">
                <Skeleton className="h-8 w-96 max-w-full" />
                <div className="flex items-center gap-sm">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-5 w-48" />
                </div>
              </div>
              <div className="flex gap-sm">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          </div>

          {/* Description skeleton */}
          <div className="space-y-sm">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-xs">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        </div>
      </Card>

      {/* Details Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
        {/* Left Column skeleton */}
        <Card className="glass-card p-lg">
          <Skeleton className="h-6 w-40 mb-md" />
          <div className="space-y-md">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-sm">
                <Skeleton className="h-5 w-5 mt-xxs" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-20 mb-xs" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right Column skeleton */}
        <Card className="glass-card p-lg">
          <Skeleton className="h-6 w-48 mb-md" />
          <div className="space-y-md">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-sm">
                <Skeleton className="h-5 w-5 mt-xxs" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-xs" />
                  <Skeleton className="h-5 w-40" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
} 