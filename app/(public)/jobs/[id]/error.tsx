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
      <div className="glass-card border-red-200 dark:border-red-800 p-8 max-w-lg w-full text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Job</h2>
        <p className="text-muted-foreground mb-6">
          {error.message || 'Sorry, we encountered a problem loading this job posting.'}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Try Again
          </button>
          
          <Link
            href="/jobs"
            className="inline-flex items-center justify-center px-4 py-2 border border-primary text-base font-medium rounded-md text-primary bg-background hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            View All Jobs
          </Link>
        </div>
      </div>
    </div>
  );
} 