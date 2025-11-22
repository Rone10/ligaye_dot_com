'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatSalaryDisplay } from '../_utils/constants';
import { BookmarkIcon, MapPinIcon, BriefcaseIcon, ClockIcon, Building2 } from 'lucide-react';
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

  // Generate initials for company if no logo is available
  const companyInitial = job.companyName ? job.companyName.charAt(0).toUpperCase() : 'C';

  return (
    <div className="group bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start gap-5">
        {/* Company Logo/Initial */}
        <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden flex items-center justify-center font-bold text-xl shadow-sm border border-border"
          style={{
            backgroundColor: job.companyLogoUrl ? '#ffffff' : 'hsl(var(--muted))',
            color: job.companyLogoUrl ? 'inherit' : 'hsl(var(--muted-foreground))'
          }}>
          {job.companyLogoUrl ? (
            <Image
              src={job.companyLogoUrl}
              alt={`${job.companyName || 'Company'} logo`}
              width={56}
              height={56}
              className="object-contain p-1"
            />
          ) : (
            <span>{companyInitial}</span>
          )}
        </div>

        {/* Job Information */}
        <div className="flex-grow min-w-0">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h3 className="text-lg font-bold text-card-foreground leading-tight group-hover:text-primary transition-colors">
                <Link
                  href={`/jobs/${job.id}`}
                  className="focus:outline-none"
                >
                  {job.title}
                </Link>
              </h3>
              <div className="mt-1 flex items-center flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span className="font-medium text-foreground flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {job.companyName}
                </span>
                <span className="flex items-center gap-1">
                  <MapPinIcon className="w-3.5 h-3.5" />
                  {job.locationName || (job.workLocation === 'REMOTE' ? 'Remote' : 'Location Not Specified')}
                </span>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className={cn(
                "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-primary/20",
                saved ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary hover:bg-primary/10"
              )}
              aria-label={saved ? "Unsave job" : "Save job"}
            >
              <BookmarkIcon
                className={cn(
                  "w-5 h-5 transition-all",
                  saved ? "fill-current" : "fill-transparent"
                )}
              />
            </button>
          </div>

          {/* Tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-500/20 text-blue-700 dark:text-blue-300 border-2 border-blue-500/40 dark:border-blue-400/50 shadow-sm">
              <BriefcaseIcon className="w-3.5 h-3.5 mr-1.5" />
              {job.workLocation === 'REMOTE' ? 'Remote' : job.workLocation === 'HYBRID' ? 'Hybrid' : 'On-site'}
            </span>
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-500/20 text-green-700 dark:text-green-300 border-2 border-green-500/40 dark:border-green-400/50 shadow-sm">
              <ClockIcon className="w-3.5 h-3.5 mr-1.5" />
              {job.jobType.replace(/_/g, ' ')}
            </span>
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/20 text-purple-700 dark:text-purple-300 border-2 border-purple-500/40 dark:border-purple-400/50 shadow-sm">
              <MapPinIcon className="w-3.5 h-3.5 mr-1.5" />
              {job.locationName || (job.workLocation === 'REMOTE' ? 'Remote' : 'Location Not Specified')}
            </span>
          </div>

          {/* Salary and Details */}
          <div className="mt-5 pt-4 border-t border-border flex flex-wrap justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <div className="font-bold text-card-foreground text-base">
                {salaryDisplay}
              </div>
              <div className="text-xs text-muted-foreground font-medium">
                Posted {publishedDate}
              </div>
            </div>
            <Link href={`/jobs/${job.id}/apply`} passHref className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-semibold text-sm shadow-sm transition-all hover:shadow-md">
                Apply Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 