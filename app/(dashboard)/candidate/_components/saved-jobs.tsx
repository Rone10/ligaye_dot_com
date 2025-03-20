'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

// Define the shape of the props
type SavedJobsProps = {
  items?: Array<{
    savedJob: {
      id: string;
      userId: string;
      jobId: string;
      createdAt: Date;
    };
    job: {
      id: string;
      title: string;
      companyId: string;
      // other job properties
    };
    employer: {
      id: string;
      companyName: string;
      // other employer properties
    };
  }>;
}

export function SavedJobs({ items }: SavedJobsProps) {
  // Handle if no items are provided
  const savedJobsCount = items?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border p-6"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Saved Jobs</h2>
        <Badge>{savedJobsCount} saved</Badge>
      </div>
      
      {savedJobsCount > 0 ? (
        <>
          <p className="text-sm text-gray-600 mb-4">
            You have {savedJobsCount} saved jobs. Don't forget to apply before they expire!
          </p>
          
          {/* Preview a few saved jobs if available */}
          {items && items.length > 0 && (
            <div className="space-y-3 mb-4">
              {items.slice(0, 2).map((savedJob) => (
                <div key={savedJob.savedJob.id} className="text-sm border-b pb-2">
                  <div className="font-medium">{savedJob.job.title}</div>
                  <div className="text-gray-600">{savedJob.employer.companyName}</div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-gray-600 mb-4">
          You haven't saved any jobs yet. Save jobs to keep track of opportunities you're interested in.
        </p>
      )}
      
      <Button variant="link" className="text-blue-600 p-0" asChild>
        <Link href="/candidate/saved-jobs">
          View {savedJobsCount > 0 ? 'All ' : ''}Saved Jobs →
        </Link>
      </Button>
    </motion.div>
  );
}