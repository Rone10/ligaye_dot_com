'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatSalaryDisplay } from '../_utils/constants';
import { BookmarkIcon, MapPinIcon, BriefcaseIcon, ClockIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { JobListItem } from '../_utils/types';

interface JobCardProps {
  job: JobListItem;
  onSave?: (jobId: string) => Promise<void>;
  isSaved?: boolean;
}

export function JobCard({ job, onSave, isSaved = false }: JobCardProps) {
  const [saved, setSaved] = useState(isSaved);
  const [saving, setSaving] = useState(false);

  const publishedDate = job.publishedAt 
    ? new Date(job.publishedAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : 'Recently';

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!onSave || saving) return;
    
    setSaving(true);
    try {
      await onSave(job.id);
      setSaved(!saved);
    } catch (error) {
      console.error('Error saving job:', error);
    } finally {
      setSaving(false);
    }
  };

  const salaryDisplay = formatSalaryDisplay({
    min: job.salaryRangeMin,
    max: job.salaryRangeMax,
    currency: job.salaryCurrency,
    frequency: job.salaryFrequency,
    displayType: job.salaryDisplayType
  });

  return (
    <div className="bg-white/70 backdrop-blur-md border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-2px]">
      <div className="flex items-start gap-4">
        {/* Company Logo */}
        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center text-gray-400">
          {job.companyLogoUrl ? (
            <Image 
              src={job.companyLogoUrl}
              alt={`${job.companyName || 'Company'} logo`}
              width={48}
              height={48}
              className="object-contain"
            />
          ) : (
            <BriefcaseIcon className="w-6 h-6" />
          )}
        </div>

        {/* Job Information */}
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <div>
              <Link 
                href={`/jobs/${job.id}`}
                className="text-xl font-semibold text-blue-700 hover:text-blue-800 hover:underline transition-colors"
              >
                {job.title}
              </Link>
              <div className="mt-1 text-gray-700 font-medium">{job.companyName}</div>
            </div>
            
            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                saved ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
              )}
              aria-label={saved ? "Unsave job" : "Save job"}
            >
              <BookmarkIcon 
                className={cn(
                  "w-5 h-5 transition-all",
                  saved ? "fill-blue-600 stroke-blue-600" : "fill-transparent"
                )}
              />
            </button>
          </div>

          {/* Location and Job Type */}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-600">
            {job.locationName && (
              <div className="flex items-center gap-1">
                <MapPinIcon className="w-4 h-4" />
                <span>{job.locationName}</span>
                {job.workLocation === 'HYBRID' && <span>(Hybrid)</span>}
              </div>
            )}
            {!job.locationName && job.workLocation === 'REMOTE' && (
              <div className="flex items-center gap-1">
                <MapPinIcon className="w-4 h-4" />
                <span>Remote</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <BriefcaseIcon className="w-4 h-4" />
              <span>{job.jobType.replace(/_/g, ' ').toLowerCase()}</span>
            </div>
            <div className="flex items-center gap-1">
              <ClockIcon className="w-4 h-4" />
              <span>Posted {publishedDate}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {job.workLocation}
            </span>
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {job.jobType.replace(/_/g, ' ')}
            </span>
          </div>

          {/* Salary and Apply Button */}
          <div className="mt-5 flex flex-wrap justify-between items-center gap-3">
            <div>
              <div className="text-sm text-gray-500">Salary</div>
              <div className="font-semibold text-gray-900">{salaryDisplay}</div>
            </div>
            <Link href={`/jobs/${job.id}/apply`} passHref>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Apply Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 