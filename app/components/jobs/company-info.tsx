'use client';

import { Globe, Linkedin } from 'lucide-react';
import type { JobDetails } from '@/app/actions/jobs';

export function CompanyInfo({ company }: { company: JobDetails['company'] }) {
  return (
    <div className="bg-white rounded-lg border p-6">
      <h2 className="text-xl font-semibold mb-4">About {company.name}</h2>
      <p className="text-gray-600 mb-6">{company.description}</p>

      <div className="flex gap-4">
        <a
          href={company.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
        >
          <Globe className="w-4 h-4" />
          Company Website
        </a>
        <a
          href={company.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
        >
          <Linkedin className="w-4 h-4" />
          LinkedIn
        </a>
      </div>
    </div>
  );
}