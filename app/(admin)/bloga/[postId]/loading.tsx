export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-bg p-xl">
      <div className="max-w-4xl mx-auto space-y-lg animate-pulse">
        {/* Header skeleton */}
        <div className="glass-card p-lg rounded-lg shadow-level-2">
          <div className="flex items-center justify-between">
            <div className="h-10 bg-theme-gray/20 rounded w-32"></div>
            <div className="flex gap-sm">
              <div className="h-10 bg-theme-gray/20 rounded w-24"></div>
              <div className="h-10 bg-theme-gray/20 rounded w-20"></div>
              <div className="h-10 bg-theme-gray/20 rounded w-16"></div>
              <div className="h-10 bg-theme-gray/20 rounded w-20"></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          {/* Main content skeleton */}
          <div className="lg:col-span-2 space-y-lg">
            {/* Title and meta skeleton */}
            <div className="glass-card p-xl rounded-lg shadow-level-2">
              <div className="h-8 bg-theme-gray/20 rounded w-3/4 mb-xs"></div>
              <div className="h-4 bg-theme-gray/20 rounded w-1/2 mb-lg"></div>
              
              <div className="flex gap-lg mb-lg">
                <div className="h-4 bg-theme-gray/20 rounded w-24"></div>
                <div className="h-4 bg-theme-gray/20 rounded w-32"></div>
                <div className="h-4 bg-theme-gray/20 rounded w-28"></div>
              </div>
              
              <div className="bg-theme-gray/10 rounded-md p-md">
                <div className="h-4 bg-theme-gray/20 rounded w-full mb-xs"></div>
                <div className="h-4 bg-theme-gray/20 rounded w-5/6"></div>
              </div>
            </div>

            {/* Featured image skeleton */}
            <div className="glass-card p-xl rounded-lg shadow-level-2">
              <div className="h-6 bg-theme-gray/20 rounded w-32 mb-md"></div>
              <div className="h-64 bg-theme-gray/20 rounded"></div>
            </div>

            {/* Content skeleton */}
            <div className="glass-card p-xl rounded-lg shadow-level-2">
              <div className="h-6 bg-theme-gray/20 rounded w-24 mb-lg"></div>
              <div className="space-y-md">
                <div className="h-4 bg-theme-gray/20 rounded w-full"></div>
                <div className="h-4 bg-theme-gray/20 rounded w-5/6"></div>
                <div className="h-4 bg-theme-gray/20 rounded w-4/5"></div>
                <div className="h-4 bg-theme-gray/20 rounded w-full"></div>
                <div className="h-4 bg-theme-gray/20 rounded w-3/4"></div>
              </div>
            </div>
          </div>

          {/* Sidebar skeleton */}
          <div className="space-y-lg">
            {/* Quick Actions skeleton */}
            <div className="glass-card border border-theme-gray p-lg rounded-lg">
              <div className="h-6 bg-theme-gray/20 rounded w-24 mb-md"></div>
              <div className="h-10 bg-theme-gray/20 rounded w-full"></div>
            </div>

            {/* Post Details skeleton */}
            <div className="glass-card border border-theme-gray p-lg rounded-lg">
              <div className="h-6 bg-theme-gray/20 rounded w-20 mb-md"></div>
              <div className="space-y-sm">
                <div className="flex justify-between">
                  <div className="h-4 bg-theme-gray/20 rounded w-16"></div>
                  <div className="h-4 bg-theme-gray/20 rounded w-12"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 bg-theme-gray/20 rounded w-20"></div>
                  <div className="h-4 bg-theme-gray/20 rounded w-16"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 bg-theme-gray/20 rounded w-18"></div>
                  <div className="h-4 bg-theme-gray/20 rounded w-10"></div>
                </div>
              </div>
            </div>

            {/* SEO Information skeleton */}
            <div className="glass-card border border-theme-gray p-lg rounded-lg">
              <div className="h-6 bg-theme-gray/20 rounded w-28 mb-md"></div>
              <div className="space-y-sm">
                <div className="h-4 bg-theme-gray/20 rounded w-16 mb-xs"></div>
                <div className="h-6 bg-theme-gray/20 rounded w-full"></div>
                <div className="h-4 bg-theme-gray/20 rounded w-20 mb-xs"></div>
                <div className="h-4 bg-theme-gray/20 rounded w-16"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 