'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { JobList } from './JobList';
import { toggleSaveJob } from '../_actions';
import type { JobListItem } from '../_utils/types';

interface JobListWithSavingProps {
  jobs: JobListItem[];
  totalCount: number;
  currentPage: number;
  pageCount: number;
  savedJobIds?: string[];
}

export function JobListWithSaving({
  jobs,
  totalCount,
  currentPage,
  pageCount,
  savedJobIds = []
}: JobListWithSavingProps) {
  const [localSavedJobIds, setLocalSavedJobIds] = useState<string[]>(savedJobIds);
  const [savingJobId, setSavingJobId] = useState<string | null>(null);
  
  const handleSaveJob = async (jobId: string) => {
    if (savingJobId) return; // Prevent multiple simultaneous saves
    
    setSavingJobId(jobId);
    
    try {
      await toggleSaveJob(jobId);
      
      // Update local state immediately for optimistic UI
      setLocalSavedJobIds(prev => {
        return prev.includes(jobId)
          ? prev.filter(id => id !== jobId)
          : [...prev, jobId];
      });
      
      // Show success toast
      const isSaving = !localSavedJobIds.includes(jobId);
      toast.success(
        isSaving 
          ? 'Job saved to your profile' 
          : 'Job removed from saved jobs'
      );
      
    } catch (error) {
      // Show error toast
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Failed to save job. Please try again.'
      );
    } finally {
      setSavingJobId(null);
    }
  };
  
  return (
    <JobList
      jobs={jobs}
      totalCount={totalCount}
      currentPage={currentPage}
      pageCount={pageCount}
      onSaveJob={handleSaveJob}
      savedJobIds={localSavedJobIds}
    />
  );
} 