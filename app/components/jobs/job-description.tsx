'use client';

import type { JobDetails } from '@/app/actions/jobs';

export function JobDescription({ job }: { job: JobDetails }) {
  return (
    <div className="bg-white rounded-lg border p-6">
      <h2 className="text-xl font-semibold mb-4">Job Description</h2>
      
      <div 
        className="text-gray-600 mb-6 prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: job.description }}
      />

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-3">Responsibilities:</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            {job.responsibilities.map((item, index) => (
              <li key={index}>
                {typeof item === 'string' && item.includes('<') ? (
                  <span dangerouslySetInnerHTML={{ __html: item }} />
                ) : (
                  item
                )}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3">Requirements:</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            {job.requirements.map((item, index) => (
              <li key={index}>
                {typeof item === 'string' && item.includes('<') ? (
                  <span dangerouslySetInnerHTML={{ __html: item }} />
                ) : (
                  item
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}