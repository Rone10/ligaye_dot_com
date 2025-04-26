import { db } from '@/lib/db';
import { 
    applications, 
    jobs, 
    candidateProfiles, 
    profiles, 
    employerProfiles, 
    applicationStatusEnum, // Import the enum
    jobStatusEnum // Import job status enum
} from '@/lib/db/schema';
import { and, eq, desc, ne } from 'drizzle-orm'; // Import ne for 'not equal'
import { getUser } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

// Use the enum's type for ApplicationStatus
type ApplicationStatus = typeof applicationStatusEnum.enumValues[number];

export type ApplicationWithCandidateDetails = {
    id: string;
    status: ApplicationStatus;
    appliedAt: Date;
    candidateName: string | null;
    candidateTitle: string | null;
    candidateAvatarUrl: string | null;
    resumeUrl: string | null;
    resumeFilename: string | null;
    // Add other relevant fields you might need from Application or CandidateProfile/Profile
};

export type JobApplicationsData = {
    job: {
        id: string;
        title: string;
        status: typeof jobStatusEnum.enumValues[number]; // Use job status type
    };
    applications: ApplicationWithCandidateDetails[];
};

export async function getJobApplicationsData(jobId: string): Promise<JobApplicationsData> {
    const user = await getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const jobData = await db().query.jobs.findFirst({
        where: and(
            eq(jobs.id, jobId),
            // Check that job status is NOT 'DELETED' instead of a 'deleted' field
            ne(jobs.status, 'DELETED') 
        ),
        with: {
            company: {
                columns: {},
                with: {
                    profile: { 
                        columns: {
                            userId: true
                        }
                    }
                }
            },
            applications: {
                 // Assuming applications also use status 'DELETED' or a boolean 'deleted'
                 // Let's assume 'deleted' boolean for applications based on schema.ts
                where: eq(applications.deleted, false), 
                orderBy: desc(applications.appliedAt),
                columns: {
                    id: true,
                    status: true,
                    appliedAt: true,
                },
                with: {
                    candidateProfile: {
                        columns: {
                            title: true,
                            resumeUrl: true,
                            resumeFilename: true,
                        },
                        with: {
                            profile: {
                                columns: {
                                    fullName: true,
                                    avatarUrl: true,
                                }
                            }
                        }
                    }
                }
            }
        },
        columns: {
            id: true,
            title: true,
            status: true,
            companyId: true, 
        }
    });

    if (!jobData) {
        notFound();
    }

    if (jobData.company?.profile?.userId !== user.id) {
        notFound();
    }

    const applicationsResult: ApplicationWithCandidateDetails[] = jobData.applications.map(app => ({
        id: app.id,
        status: app.status,
        appliedAt: app.appliedAt,
        candidateName: app.candidateProfile?.profile?.fullName ?? null,
        candidateTitle: app.candidateProfile?.title ?? null,
        candidateAvatarUrl: app.candidateProfile?.profile?.avatarUrl ?? null,
        resumeUrl: app.candidateProfile?.resumeUrl ?? null,
        resumeFilename: app.candidateProfile?.resumeFilename ?? null,
    }));

    return {
        job: {
            id: jobData.id,
            title: jobData.title,
            status: jobData.status,
        },
        applications: applicationsResult,
    };
} 