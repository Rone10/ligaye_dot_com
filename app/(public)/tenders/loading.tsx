import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function TendersLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e9efff] to-[#f4f7ff] py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
        </div>

        {/* Filters Skeleton */}
        <Card className="bg-white/70 backdrop-blur-lg border border-white/30 rounded-2xl shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Results Summary Skeleton */}
        <div className="mb-4">
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Table Skeleton */}
        <Card className="bg-white/70 backdrop-blur-lg border border-white/30 rounded-2xl shadow-lg">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-full">
                {/* Table Header */}
                <div className="border-b border-gray-200 bg-gray-50/50">
                  <div className="grid grid-cols-7 gap-4 p-4">
                    {['Title', 'Organization', 'Sector', 'Location', 'Deadline', 'Status', 'Actions'].map((header) => (
                      <Skeleton key={header} className="h-4 w-full" />
                    ))}
                  </div>
                </div>
                
                {/* Table Rows */}
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="border-b border-gray-100 last:border-b-0">
                    <div className="grid grid-cols-7 gap-4 p-4">
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <div className="flex items-center justify-end gap-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pagination Skeleton */}
        <div className="flex items-center justify-between text-sm text-gray-600 mt-4">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
} 