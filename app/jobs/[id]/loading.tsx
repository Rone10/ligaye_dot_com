export default function JobDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb skeleton */}
      <div className="mb-6">
        <div className="h-6 bg-gray-200 animate-pulse rounded w-1/4"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content skeleton */}
        <div className="lg:col-span-2">
          {/* Job header section */}
          <div className="bg-white/70 backdrop-blur-md border border-gray-200 rounded-lg p-6 shadow-sm mb-8">
            <div className="h-8 bg-gray-200 animate-pulse rounded w-3/4 mb-6"></div>
            
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-300 animate-pulse rounded-full flex-shrink-0"></div>
              <div className="ml-4 flex-1">
                <div className="h-6 bg-gray-200 animate-pulse rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 animate-pulse rounded w-1/3"></div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 animate-pulse rounded w-full"></div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <div className="h-10 bg-blue-200 animate-pulse rounded w-32"></div>
            </div>
          </div>

          {/* Job description skeleton */}
          <div className="bg-white/70 backdrop-blur-md border border-gray-200 rounded-lg p-6 shadow-sm mb-8">
            <div className="h-6 bg-gray-200 animate-pulse rounded w-1/4 mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 animate-pulse rounded w-full"></div>
              <div className="h-4 bg-gray-200 animate-pulse rounded w-full"></div>
              <div className="h-4 bg-gray-200 animate-pulse rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 animate-pulse rounded w-full"></div>
              <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4"></div>
            </div>
          </div>

          {/* Job requirements skeleton */}
          <div className="bg-white/70 backdrop-blur-md border border-gray-200 rounded-lg p-6 shadow-sm mb-8">
            <div className="h-6 bg-gray-200 animate-pulse rounded w-1/4 mb-6"></div>
            <div className="space-y-6">
              <div>
                <div className="h-5 bg-gray-200 animate-pulse rounded w-1/5 mb-3"></div>
                <div className="h-4 bg-gray-200 animate-pulse rounded w-full"></div>
              </div>
              <div>
                <div className="h-5 bg-gray-200 animate-pulse rounded w-1/5 mb-3"></div>
                <div className="h-4 bg-gray-200 animate-pulse rounded w-full"></div>
              </div>
              <div>
                <div className="h-5 bg-gray-200 animate-pulse rounded w-1/5 mb-3"></div>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-8 bg-blue-100 animate-pulse rounded-full w-24"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Application section skeleton */}
          <div className="bg-white/70 backdrop-blur-md border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="h-6 bg-gray-200 animate-pulse rounded w-1/4 mb-6"></div>
            <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4 mb-6"></div>
            <div className="h-10 bg-blue-200 animate-pulse rounded w-40"></div>
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div className="lg:col-span-1">
          {/* Company information skeleton */}
          <div className="bg-white/70 backdrop-blur-md border border-gray-200 rounded-lg p-6 shadow-sm mb-8">
            <div className="h-6 bg-gray-200 animate-pulse rounded w-3/4 mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 animate-pulse rounded w-full"></div>
              <div className="h-4 bg-gray-200 animate-pulse rounded w-full"></div>
              <div className="h-4 bg-gray-200 animate-pulse rounded w-2/3"></div>
            </div>
          </div>
          
          {/* Job details skeleton */}
          <div className="bg-white/70 backdrop-blur-md border border-gray-200 rounded-lg p-6 shadow-sm mb-8">
            <div className="h-6 bg-gray-200 animate-pulse rounded w-1/2 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-1/3 mb-2"></div>
                  <div className="h-5 bg-gray-200 animate-pulse rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Similar jobs skeleton */}
          <div className="bg-white/70 backdrop-blur-md border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="h-6 bg-gray-200 animate-pulse rounded w-1/2 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border-b border-gray-200 pb-3 last:border-b-0">
                  <div className="h-5 bg-gray-200 animate-pulse rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 