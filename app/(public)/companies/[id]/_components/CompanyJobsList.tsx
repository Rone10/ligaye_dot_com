import { JobCard } from '@/app/(public)/jobs/_components/JobCard';
import type { JobListItem } from '@/app/(public)/jobs/_utils/types';
import { EmptyState } from '@/components/empty-state';
import { Briefcase } from 'lucide-react';

interface CompanyJobsListProps {
  jobs: JobListItem[];
  title: string;
  emptyMessage: string;
}

export default function CompanyJobsList({ jobs, title, emptyMessage }: CompanyJobsListProps) {
  if (jobs.length === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        title={emptyMessage}
        description="Check back later for new opportunities."
      />
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-theme-dark">{title}</h2>
      <div className="grid gap-4">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}

