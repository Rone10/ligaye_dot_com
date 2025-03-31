import { and, count, desc, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { applications, applicationStatusEnum, candidateProfiles, jobs, profiles } from '@/lib/db/schema';
import { User } from '@supabase/supabase-js';

// Get applicant stats for an employer
export async function getApplicantStats(userId: string) {
  const totalApplicantsQuery = db()
    .select({ count: count() })
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .where(
      and(
        eq(jobs.employerId, userId),
        eq(applications.deleted, false),
        eq(jobs.deleted, false)
      )
    );

  const pendingApplicantsQuery = db()
    .select({ count: count() })
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .where(
      and(
        eq(jobs.employerId, userId),
        eq(applications.status, 'PENDING'),
        eq(applications.deleted, false),
        eq(jobs.deleted, false)
      )
    );

  const shortlistedApplicantsQuery = db()
    .select({ count: count() })
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .where(
      and(
        eq(jobs.employerId, userId),
        eq(applications.status, 'SHORTLISTED'),
        eq(applications.deleted, false),
        eq(jobs.deleted, false)
      )
    );

  const rejectedApplicantsQuery = db()
    .select({ count: count() })
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .where(
      and(
        eq(jobs.employerId, userId),
        eq(applications.status, 'REJECTED'),
        eq(applications.deleted, false),
        eq(jobs.deleted, false)
      )
    );

  const [totalResult, pendingResult, shortlistedResult, rejectedResult] = await Promise.all([
    totalApplicantsQuery,
    pendingApplicantsQuery,
    shortlistedApplicantsQuery,
    rejectedApplicantsQuery,
  ]);

  return {
    total: totalResult[0]?.count || 0,
    pending: pendingResult[0]?.count || 0,
    shortlisted: shortlistedResult[0]?.count || 0,
    rejected: rejectedResult[0]?.count || 0,
  };
}

// Get all applicants for an employer
export async function getApplicants(userId: string) {
  return db()
    .select({
      id: applications.id,
      jobId: applications.jobId,
      candidateId: applications.candidateId,
      status: applications.status,
      resumeUrl: applications.resumeUrl,
      coverLetter: applications.coverLetter,
      appliedAt: applications.appliedAt,
      interviewDate: applications.interviewDate,
      // Job details
      jobTitle: jobs.title,
      // Candidate details
      candidateName: profiles.fullName,
      candidateEmail: profiles.email,
      candidateAvatar: profiles.avatarUrl,
      candidateTitle: candidateProfiles.title,
      candidateSkills: candidateProfiles.skills,
      candidateExperienceLevel: candidateProfiles.experienceLevel,
    })
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .innerJoin(profiles, eq(applications.candidateId, profiles.id))
    .innerJoin(candidateProfiles, eq(profiles.id, candidateProfiles.profileId))
    .where(
      and(
        eq(jobs.employerId, userId),
        eq(applications.deleted, false),
        eq(jobs.deleted, false)
      )
    )
    .orderBy(desc(applications.appliedAt));
}

// Get all departments (job titles) for filtering
export async function getDepartments(userId: string) {
  const result = await db()
    .select({
      title: jobs.title,
    })
    .from(jobs)
    .where(
      and(
        eq(jobs.employerId, userId),
        eq(jobs.deleted, false)
      )
    )
    .groupBy(jobs.title);

  return result.map((item: { title: string }) => item.title);
}

// Get all experience levels for filtering
export async function getExperienceLevels() {
  return Object.values(applicationStatusEnum.enumValues);
}

// Update application status
export async function updateApplicationStatus(applicationId: string, status: string) {
  return db()
    .update(applications)
    .set({
      status: status as any,
      updatedAt: new Date(),
    })
    .where(eq(applications.id, applicationId));
}
