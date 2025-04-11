export default function JobsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-8 bg-gray-200 animate-pulse rounded w-1/3 mb-6"></div>
      
      {/* Filters skeleton */}
      <div className="bg-white/70 backdrop-blur-md border border-gray-200 rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2"></div>
              <div className="h-10 bg-gray-200 animate-pulse rounded w-full"></div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <div className="h-10 bg-blue-200 animate-pulse rounded w-24 mr-3"></div>
          <div className="h-10 bg-gray-200 animate-pulse rounded w-24"></div>
        </div>
      </div>
      
      {/* Results count skeleton */}
      <div className="mb-4">
        <div className="h-5 bg-gray-200 animate-pulse rounded w-48"></div>
      </div>
      
      {/* Job cards skeleton */}
      <div className="space-y-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="bg-white/70 backdrop-blur-md border border-gray-200 rounded-lg p-6 shadow-sm"
          >
            <div className="h-6 bg-gray-200 animate-pulse rounded w-2/3 mb-3"></div>
            <div className="h-5 bg-gray-200 animate-pulse rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 animate-pulse rounded w-1/3 mb-4"></div>
            
            <div className="flex gap-2 mb-4">
              <div className="h-7 bg-blue-100 animate-pulse rounded-md w-20"></div>
              <div className="h-7 bg-blue-100 animate-pulse rounded-md w-16"></div>
            </div>
            
            <div className="flex justify-between">
              <div className="h-5 bg-gray-200 animate-pulse rounded w-1/4"></div>
              <div className="h-5 bg-gray-200 animate-pulse rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination skeleton */}
      <div className="mt-8 flex justify-center">
        <div className="h-10 bg-gray-200 animate-pulse rounded w-64"></div>
      </div>
    </div>
  );
} 