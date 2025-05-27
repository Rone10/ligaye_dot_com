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

  // Generate initials for company if no logo is available
  const companyInitial = job.companyName ? job.companyName.charAt(0).toUpperCase() : 'C';

  return (
    <div className=" backdrop-blur-[10px] border border-[rgba(255,255,255,0.3)] rounded-[16px] p-7 shadow-[0_8px_32px_rgba(31,38,135,0.1)] transition-all duration-300 hover:shadow-[0_15px_35px_rgba(31,38,135,0.15)] hover:translate-y-[-2px]">
      <div className="flex items-start gap-5">
        {/* Company Logo/Initial */}
        <div className="flex-shrink-0 w-16 h-16 rounded-[12px] overflow-hidden flex items-center justify-center  font-semibold text-xl" 
             style={{ 
               backgroundColor: job.companyLogoUrl ? '#f8faff' : job.companyName?.toLowerCase().includes('google') ? '#4285F4' : 
                               job.companyName?.toLowerCase().includes('amazon') ? '#FF9900' : '#4a6cfa'
             }}>
          {job.companyLogoUrl ? (
            <Image 
              src={job.companyLogoUrl}
              alt={`${job.companyName || 'Company'} logo`}
              width={64}
              height={64}
              className="object-contain"
            />
          ) : (
            companyInitial
          )}
        </div>

        {/* Job Information */}
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold ">
                <Link 
                  href={`/jobs/${job.id}`}
                  className="hover:text-[#4a6cfa] transition-colors"
                >
                  {job.title}
                </Link>
              </h3>
              <div className="mt-1.5  font-medium">{job.companyName} • {job.locationName || (job.workLocation === 'REMOTE' ? 'Remote' : 'Location Not Specified')}</div>
            </div>
            
            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className={cn(
                "flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-colors",
                saved ? "text-[#4a6cfa]" : "text-[#9aa3bc] hover:text-primary-blue-light"
              )}
              aria-label={saved ? "Unsave job" : "Save job"}
            >
              <BookmarkIcon 
                className={cn(
                  "w-6 h-6 transition-all",
                  saved ? "fill-[#4a6cfa] stroke-[#4a6cfa]" : "fill-transparent"
                )}
              />
            </button>
          </div>

          {/* Tags */}
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-medium bg-[rgba(74,108,250,0.1)] text-[#4a6cfa]">
              {job.workLocation === 'REMOTE' ? 'Remote' : job.workLocation === 'HYBRID' ? 'Hybrid' : 'On-site'}
            </span>
            <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-medium bg-[rgba(74,108,250,0.1)] text-[#4a6cfa]">
              {job.jobType.replace(/_/g, ' ')}
            </span>
            <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-medium bg-[rgba(74,108,250,0.1)] text-[#4a6cfa]">
              {job.title.includes('Senior') ? 'Senior Level' : job.title.includes('Junior') ? 'Junior Level' : job.title.includes('Mid') ? 'Mid Level' : 'Any Level'}
            </span>
          </div>

          {/* Salary and Details */}
          <div className="mt-6 flex flex-wrap justify-between items-center gap-3">
            <div>
              <div className="text-[#9aa3bc]">
                <span className="font-semibold text-[#1a1e2d] text-base">{salaryDisplay}</span>
              </div>
              <div className="text-sm text-[#9aa3bc] mt-1.5">
                Posted {publishedDate}
              </div>
            </div>
            <Link href={`/jobs/${job.id}/apply`} passHref>
                      <Button className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-[10px] font-semibold text-base">
          Apply Now
        </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 