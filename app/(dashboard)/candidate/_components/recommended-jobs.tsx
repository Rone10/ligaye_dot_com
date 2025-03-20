'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

// Define the shape of the props
type RecommendedJobsProps = {
  jobs?: Array<{
    job: {
      id: string;
      title: string;
      description?: string | null;
      jobType?: string | null;
      location?: string | null;
      locationId?: string | null;
      createdAt?: Date | null;
      updatedAt?: Date | null;
      [key: string]: any; // Allow other properties
    };
    employer: {
      id: string;
      companyName?: string | null;
      [key: string]: any; // Allow other properties
    };
  }>;
}

export function RecommendedJobs({ jobs }: RecommendedJobsProps) {
  // If no jobs provided or empty array, show fallback UI
  if (!jobs || jobs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border p-6"
      >
        <h2 className="text-lg font-semibold mb-6">Recommended Jobs</h2>
        <div className="text-center py-6 text-gray-500">
          No recommended jobs at the moment. Complete your profile to get better job matches.
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border p-6"
    >
      <h2 className="text-lg font-semibold mb-6">Recommended Jobs</h2>
      <div className="space-y-6">
        {jobs.map((item, index) => {
          const job = item.job;
          const employer = item.employer;
          
          // Calculate how recent the job is
          const isNew = job.createdAt && 
            new Date(job.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;
          
          return (
            <div key={job.id} className="border-b last:border-0 pb-6 last:pb-0">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">{job.title}</h3>
                  <div className="text-sm text-gray-600">
                    {employer.companyName || 'Company'} • {job.location || 'Location'}
                  </div>
                </div>
                {isNew && (
                  <Badge className="bg-blue-50 text-blue-600">
                    New
                  </Badge>
                )}
                {job.jobType && (
                  <Badge className="bg-gray-50 text-gray-600 ml-2">
                    {job.jobType}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {job.description ? 
                  job.description.length > 150 
                    ? `${job.description.substring(0, 150)}...` 
                    : job.description
                  : 'No description provided'}
              </p>
              <Button variant="outline" className="text-blue-600" asChild>
                <Link href={`/jobs/${job.id}`}>View Job</Link>
              </Button>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 text-center">
        <Button variant="link" asChild>
          <Link href="/jobs">View All Jobs</Link>
        </Button>
      </div>
    </motion.div>
  );
}