'use client';

import { MapPin } from 'lucide-react';
import type { JobPosting } from '@/app/types';

export function SimilarJobs({ jobs }: { jobs: JobPosting[] }) {
  return (
    <div className="bg-white rounded-lg border p-6">
      <h2 className="text-xl font-semibold mb-6">Similar Jobs</h2>

      <div className="space-y-4">
        {jobs.map((job) => (
          <div key={job.id} className="pb-4 border-b last:border-0 last:pb-0">
            <a href={`/jobs/${job.id}`} className="block group">
              <h3 className="text-blue-600 group-hover:text-blue-700 font-medium">
                {job.title}
              </h3>
              <p className="text-gray-600 mt-1">{job.company}</p>
              <div className="flex items-center gap-4 mt-2 text-gray-500 text-sm">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{job.location}</span>
                </div>
                <span>${job.salaryRange.min.toLocaleString()} - ${job.salaryRange.max.toLocaleString()}</span>
              </div>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}