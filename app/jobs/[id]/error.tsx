'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorComponentProps {
  error: Error;
  reset: () => void;
}

export default function JobDetailError({ error, reset }: ErrorComponentProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Job detail error:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center">
      <div className="bg-white/70 backdrop-blur-md border border-gray-200 rounded-lg p-8 shadow-sm max-w-lg w-full text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Job</h2>
        <p className="text-gray-700 mb-6">
          {error.message || 'Sorry, we encountered a problem loading this job posting.'}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Try Again
          </button>
          
          <Link
            href="/jobs"
            className="inline-flex items-center justify-center px-4 py-2 border border-blue-600 text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View All Jobs
          </Link>
        </div>
      </div>
    </div>
  );
} 