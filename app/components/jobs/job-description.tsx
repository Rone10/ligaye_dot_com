'use client';

import type { JobDetails } from '@/app/actions/jobs';

export function JobDescription({ job }: { job: JobDetails }) {
  return (
    <div className="bg-white rounded-lg border p-6">
      <h2 className="text-xl font-semibold mb-4">Job Description</h2>
      
      <div className="text-gray-600 mb-6">
        <div
          dangerouslySetInnerHTML={{ 
            __html: job.description
              // Ensure double line breaks become proper paragraph breaks
              .replace(/<p>\s*<\/p>/g, '<div class="h-4"></div>')
              // Make sure <br><br> creates visible spacing
              .replace(/<br\s*\/?>\s*<br\s*\/?>/g, '<br class="block mb-4" />')
          }}
          className="prose prose-sm max-w-none prose-p:mb-4 prose-p:mt-4 [&>div.h-4]:my-4 [&>p:empty]:h-4 [&>p:empty]:block"
        />
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-3">Responsibilities:</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            {job.responsibilities.map((item, index) => (
              <li key={index}>
                {typeof item === 'string' && item.includes('<') ? (
                  <span 
                    dangerouslySetInnerHTML={{ 
                      __html: item
                        .replace(/<p>\s*<\/p>/g, '<div class="h-2"></div>')
                        .replace(/<br\s*\/?>\s*<br\s*\/?>/g, '<br class="block mb-2" />') 
                    }}
                    className="prose prose-sm max-w-none"
                  />
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
                  <span 
                    dangerouslySetInnerHTML={{ 
                      __html: item
                        .replace(/<p>\s*<\/p>/g, '<div class="h-2"></div>')
                        .replace(/<br\s*\/?>\s*<br\s*\/?>/g, '<br class="block mb-2" />') 
                    }}
                    className="prose prose-sm max-w-none"
                  />
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