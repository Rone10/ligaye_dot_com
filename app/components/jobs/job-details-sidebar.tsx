'use client';

import { Badge } from '@/components/ui/badge';
import type { JobDetails } from '@/app/actions/jobs';

export function JobDetailsSidebar({ job }: { job: JobDetails }) {
  return (
    <div className="bg-white rounded-lg border p-6">
      <h2 className="text-xl font-semibold mb-6">Job Details</h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-3">Required Skills</h3>
          <div className="flex flex-wrap gap-2">
            {job.skills.map((skill) => (
              <Badge
                key={skill}
                className="bg-blue-50 text-blue-600 hover:bg-blue-100"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Experience Level</h3>
          <p className="text-gray-600">{job.experienceLevel}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Education</h3>
          <p className="text-gray-600">{job.education}</p>
        </div>
      </div>
    </div>
  );
}