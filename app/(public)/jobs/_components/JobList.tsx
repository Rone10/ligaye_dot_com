'use client';

import { JobCard } from './JobCard';
import { NoResults } from './NoResults';
import { JobPagination } from './JobPagination';
import type { JobListItem } from '../_utils/types';

interface JobListProps {
  jobs: JobListItem[];
  totalCount: number;
  currentPage: number;
  pageCount: number;
  onSaveJob?: (jobId: string) => Promise<void>;
  savedJobIds?: string[];
}

export function JobList({
  jobs,
  totalCount,
  currentPage,
  pageCount,
  onSaveJob,
  savedJobIds = []
}: JobListProps) {

  if (jobs.length === 0) {
    return <NoResults />;
  }

  return (
    <div className="space-y-8">


      <div className="max-w-3xl mx-auto space-y-6">
        {jobs.map(job => (
          <JobCard
            key={job.id}
            job={job}
            onSave={onSaveJob}
            isSaved={savedJobIds.includes(job.id)}
          />
        ))}
      </div>

      {pageCount >= 1 && (
        <div className="mt-10 max-w-3xl mx-auto">
          <JobPagination
            currentPage={currentPage}
            totalPages={pageCount}
          />
        </div>
      )}
    </div>
  );
} 