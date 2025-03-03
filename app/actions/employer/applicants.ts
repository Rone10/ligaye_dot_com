'use server'

import { getUser } from '@/lib/supabase/server';
import { 
  getApplicantStats, 
  getApplicants, 
  getDepartments, 
  getExperienceLevels,
  updateApplicationStatus
} from '@/lib/db/queries/employer/applicants';
import { revalidatePath } from 'next/cache';

// Types for the applicants page
export interface Applicant {
  id: string;
  jobTitle: string;
  candidateName: string;
  candidateEmail: string;
  candidateAvatar: string | null;
  candidateTitle: string;
  candidateSkills: string[] | null;
  candidateExperienceLevel: string;
  status: string;
  resumeUrl: string | null;
  coverLetter: string | null;
  appliedAt: Date;
  interviewDate: Date | null;
}

export interface ApplicantStats {
  total: number;
  pending: number;
  shortlisted: number;
  rejected: number;
}

// Get applicant stats for the current employer
export async function fetchApplicantStats(): Promise<ApplicantStats | null> {
  try {
    const user = await getUser();
    if (!user) return null;
    
    return await getApplicantStats(user.id);
  } catch (error) {
    console.error('Error fetching applicant stats:', error);
    return null;
  }
}

// Get all applicants for the current employer
export async function fetchApplicants(): Promise<Applicant[] | null> {
  try {
    const user = await getUser();
    if (!user) return null;
    
    const applicants = await getApplicants(user.id);
    return applicants.map(applicant => ({
      id: applicant.id,
      jobTitle: applicant.jobTitle,
      candidateName: applicant.candidateName,
      candidateEmail: applicant.candidateEmail,
      candidateAvatar: applicant.candidateAvatar,
      candidateTitle: applicant.candidateTitle,
      candidateSkills: applicant.candidateSkills,
      candidateExperienceLevel: applicant.candidateExperienceLevel,
      status: applicant.status || 'PENDING',
      resumeUrl: applicant.resumeUrl,
      coverLetter: applicant.coverLetter,
      appliedAt: applicant.appliedAt,
      interviewDate: applicant.interviewDate,
    }));
  } catch (error) {
    console.error('Error fetching applicants:', error);
    return null;
  }
}

// Get all departments (job titles) for filtering
export async function fetchDepartments(): Promise<string[] | null> {
  try {
    const user = await getUser();
    if (!user) return null;
    
    return await getDepartments(user.id);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return null;
  }
}

// Get all experience levels for filtering
export async function fetchExperienceLevels(): Promise<string[] | null> {
  try {
    return await getExperienceLevels();
  } catch (error) {
    console.error('Error fetching experience levels:', error);
    return null;
  }
}

// Update application status
export async function updateApplicantStatus(applicationId: string, status: string): Promise<boolean> {
  try {
    const user = await getUser();
    if (!user) return false;
    
    await updateApplicationStatus(applicationId, status);
    revalidatePath('/employer/applicants');
    return true;
  } catch (error) {
    console.error('Error updating application status:', error);
    return false;
  }
}
