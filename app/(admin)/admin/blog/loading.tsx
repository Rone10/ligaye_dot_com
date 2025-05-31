export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-bg p-xl">
      <div className="max-w-7xl mx-auto">
        <div className="glass-card p-xl rounded-lg shadow-level-2 animate-pulse">
          <div className="flex items-center justify-between mb-lg">
            <div>
              <div className="h-8 bg-theme-gray/20 rounded w-48 mb-xs"></div>
              <div className="h-4 bg-theme-gray/20 rounded w-64"></div>
            </div>
            <div className="h-10 bg-theme-gray/20 rounded w-36"></div>
          </div>
          
          <div className="space-y-md">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-theme-light rounded-lg border border-theme-gray p-md">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-theme-gray/20 rounded w-1/3 mb-xs"></div>
                    <div className="h-3 bg-theme-gray/20 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 bg-theme-gray/20 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 