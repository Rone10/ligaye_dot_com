# Candidate Features Implementation Plan

## Overview
This document outlines the detailed implementation plan for candidate (job seeker) features in the Gambian Job Board Platform. The plan is structured to systematically build out candidate functionality including profile management, job applications, saved jobs, and dashboard features.

## Current State Assessment
- The database schema is defined with tables for candidate profiles, jobs, applications, and saved jobs
- Basic UI components and pages have been created with mock data
- Server action files exist but are mostly empty placeholders
- Database query files exist but need implementation

## Implementation Phases

### Phase 1: Database Queries Implementation
Implement core database query functions in the following files:

#### 1. `lib/db/queries/candidates/profile.ts`
```typescript
export async function getCandidateProfileByUserId(userId: string) {
  const userProfile = await db()
    .select({
      profile: profiles,
      candidateProfile: candidateProfiles
    })
    .from(profiles)
    .leftJoin(candidateProfiles, eq(profiles.id, candidateProfiles.profileId))
    .where(eq(profiles.userId, userId))
    .limit(1);
  
  return userProfile[0] || null;
}

export async function updateCandidateProfile(
  profileId: string, 
  data: Partial<CandidateProfile>
) {
  return await db()
    .update(candidateProfiles)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(candidateProfiles.profileId, profileId))
    .returning();
}

export async function createCandidateProfile(
  data: NewCandidateProfile
) {
  return await db()
    .insert(candidateProfiles)
    .values(data)
    .returning();
}
```

#### 2. `lib/db/queries/candidates/applications.ts`
```typescript
export async function getApplicationsByUserId(userId: string) {
  return await db()
    .select({
      application: applications,
      job: jobs,
      employer: employerProfiles
    })
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .innerJoin(employerProfiles, eq(jobs.companyId, employerProfiles.id))
    .where(eq(applications.candidateId, userId))
    .orderBy(desc(applications.createdAt));
}

export async function getApplicationById(applicationId: string) {
  return await db()
    .select()
    .from(applications)
    .where(eq(applications.id, applicationId))
    .limit(1);
}

export async function createApplication(data: NewApplication) {
  return await db()
    .insert(applications)
    .values(data)
    .returning();
}
```

#### 3. `lib/db/queries/candidates/saved-jobs.ts`
```typescript
export async function getSavedJobsByUserId(userId: string) {
  return await db()
    .select({
      savedJob: savedJobs,
      job: jobs,
      employer: employerProfiles
    })
    .from(savedJobs)
    .innerJoin(jobs, eq(savedJobs.jobId, jobs.id))
    .innerJoin(employerProfiles, eq(jobs.companyId, employerProfiles.id))
    .where(eq(savedJobs.candidateId, userId))
    .orderBy(desc(savedJobs.createdAt));
}

export async function toggleSavedJob(candidateId: string, jobId: string) {
  // Check if job is already saved
  const existingSaved = await db()
    .select()
    .from(savedJobs)
    .where(
      and(
        eq(savedJobs.candidateId, candidateId),
        eq(savedJobs.jobId, jobId)
      )
    )
    .limit(1);
  
  // If job is already saved, remove it
  if (existingSaved.length > 0) {
    return await db()
      .delete(savedJobs)
      .where(eq(savedJobs.id, existingSaved[0].id))
      .returning();
  }
  
  // Otherwise, save the job
  return await db()
    .insert(savedJobs)
    .values({
      id: crypto.randomUUID(),
      candidateId,
      jobId,
      createdAt: new Date()
    })
    .returning();
}
```

#### 4. `lib/db/queries/candidates/dashboard.ts`
```typescript
export async function getDashboardStats(userId: string) {
  // Get application counts by status
  const applicationStats = await db()
    .select({
      status: applications.status,
      count: sql`count(*)::int`
    })
    .from(applications)
    .where(eq(applications.candidateId, userId))
    .groupBy(applications.status);
  
  // Get count of saved jobs
  const savedJobsCount = await db()
    .select({
      count: sql`count(*)::int`
    })
    .from(savedJobs)
    .where(eq(savedJobs.candidateId, userId));
  
  // Get count of applications in the last 7 days
  const recentApplications = await db()
    .select({
      count: sql`count(*)::int`
    })
    .from(applications)
    .where(
      and(
        eq(applications.candidateId, userId),
        gt(applications.createdAt, sql`NOW() - INTERVAL '7 days'`)
      )
    );
  
  return {
    applicationStats,
    savedJobsCount: savedJobsCount[0]?.count || 0,
    recentApplications: recentApplications[0]?.count || 0
  };
}

export async function getRecommendedJobs(userId: string, limit = 5) {
  // Get candidate's profile to extract skills and experience level
  const candidateProfile = await getCandidateProfileByUserId(userId);
  
  if (!candidateProfile?.candidateProfile) {
    return [];
  }
  
  // In a real implementation, we would use skills and experience level to find matching jobs
  // For this implementation, we'll just return recent jobs
  return await db()
    .select({
      job: jobs,
      employer: employerProfiles
    })
    .from(jobs)
    .innerJoin(employerProfiles, eq(jobs.companyId, employerProfiles.id))
    .orderBy(desc(jobs.createdAt))
    .limit(limit);
}
```

### Phase 2: Server Actions Implementation

Implement the server actions that will be called from the UI:

#### 1. `app/actions/candidate/profile.ts`
```typescript
'use server'

import { getUser } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { getCandidateProfileByUserId, updateCandidateProfile, createCandidateProfile } from '@/lib/db/queries/candidates/profile';
import { z } from 'zod';

// Create validation schema for profile updates
const profileUpdateSchema = z.object({
  title: z.string().min(3).max(100),
  experienceLevel: z.enum(['Entry', 'Junior', 'Mid-Level', 'Senior', 'Director', 'Executive']),
  skills: z.array(z.string()).min(1),
  bio: z.string().max(500).optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
});

export async function getCandidateProfile() {
  const user = await getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }
  
  return getCandidateProfileByUserId(user.id);
}

export async function updateProfile(formData: FormData) {
  const user = await getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }
  
  const profile = await getCandidateProfileByUserId(user.id);
  if (!profile) {
    throw new Error('Profile not found');
  }
  
  // Parse skills - expect a comma-separated list from form
  const skillsString = formData.get('skills') as string;
  const skills = skillsString.split(',').map(s => s.trim()).filter(Boolean);
  
  // Validate and process the form data
  const validatedData = profileUpdateSchema.parse({
    title: formData.get('title'),
    experienceLevel: formData.get('experienceLevel'),
    skills,
    bio: formData.get('bio'),
    linkedinUrl: formData.get('linkedinUrl'),
    githubUrl: formData.get('githubUrl'),
  });
  
  // Update the profile
  await updateCandidateProfile(profile.profile.id, validatedData);
  
  // Handle resume upload if provided
  const resumeFile = formData.get('resume') as File;
  if (resumeFile && resumeFile.size > 0) {
    // This would use Supabase storage to upload the file
    // Then update the resumeUrl field in the profile
  }
  
  revalidatePath('/candidate/profile');
  return { success: true };
}
```

#### 2. `app/actions/candidate/applications.ts`
```typescript
'use server'

import { getUser } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { createApplication, getApplicationsByUserId } from '@/lib/db/queries/candidates/applications';
import { z } from 'zod';

const applicationSchema = z.object({
  jobId: z.string().uuid(),
  coverLetter: z.string().max(1000).optional(),
});

export async function getApplications() {
  const user = await getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }
  
  return getApplicationsByUserId(user.id);
}

export async function applyToJob(formData: FormData) {
  const user = await getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }
  
  const validatedData = applicationSchema.parse({
    jobId: formData.get('jobId'),
    coverLetter: formData.get('coverLetter'),
  });
  
  // Create the application
  await createApplication({
    id: crypto.randomUUID(),
    candidateId: user.id,
    jobId: validatedData.jobId,
    status: 'PENDING',
    coverLetter: validatedData.coverLetter,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  
  revalidatePath('/candidate/applications');
  return { success: true };
}
```

#### 3. `app/actions/candidate/saved-jobs.ts`
```typescript
'use server'

import { getUser } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { getSavedJobsByUserId, toggleSavedJob } from '@/lib/db/queries/candidates/saved-jobs';

export async function getSavedJobs() {
  const user = await getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }
  
  return getSavedJobsByUserId(user.id);
}

export async function toggleJobSave(jobId: string) {
  const user = await getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }
  
  await toggleSavedJob(user.id, jobId);
  
  revalidatePath('/candidate/saved-jobs');
  revalidatePath('/jobs');
  return { success: true };
}
```

#### 4. `app/actions/candidate/dashboard.ts`
```typescript
'use server'

import { getUser } from '@/lib/supabase/server';
import { getDashboardStats, getRecommendedJobs } from '@/lib/db/queries/candidates/dashboard';

export async function getCandidateDashboardData() {
  const user = await getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }
  
  const stats = await getDashboardStats(user.id);
  const recommendedJobs = await getRecommendedJobs(user.id);
  
  return {
    stats,
    recommendedJobs
  };
}
```

### Phase 3: Component Implementation

Implement reusable components for candidate UI:

#### 1. `app/(dashboard)/candidate/_components/profile-form.tsx`
- Create a form component for updating candidate profile
- Include fields for personal information, skills, experience, education
- Handle file uploads for resume
- Connect to server actions for data persistence

#### 2. `app/(dashboard)/candidate/_components/application-card.tsx`
- Create a card component for displaying job applications
- Show application status, job details, and employer information
- Include actions like withdraw application, view details

#### 3. `app/(dashboard)/candidate/_components/job-card.tsx`
- Create a card component for displaying job listings
- Include details like title, company, location, salary
- Add actions like apply, save job

#### 4. `app/(dashboard)/candidate/_components/saved-job-card.tsx`
- Create a card component for displaying saved jobs
- Include actions like remove from saved, apply

### Phase 4: Page Implementation

Update the existing page components to use real data:

#### 1. `app/(dashboard)/candidate/profile/page.tsx`
- Replace mock data with data from server actions
- Implement the profile form for editing
- Add functionality for resume upload

#### 2. `app/(dashboard)/candidate/applications/page.tsx`
- Fetch real application data from server actions
- Display applications with status and filtering
- Implement pagination if needed

#### 3. `app/(dashboard)/candidate/saved-jobs/page.tsx`
- Fetch real saved job data from server actions
- Display saved jobs with relevant actions
- Implement job search and filters

#### 4. `app/(dashboard)/candidate/dashboard/page.tsx`
- Fetch real dashboard data from server actions
- Display application statistics, recent activities
- Show recommended jobs based on profile

### Phase 5: Job Application Process

Implement the job application workflow:

#### 1. `app/jobs/[id]/page.tsx`
- Add application form component
- Connect to server actions for job applications
- Handle different states (already applied, not logged in)

#### 2. `app/(dashboard)/candidate/_components/apply-job-form.tsx`
- Create form for job applications
- Include cover letter field
- Handle validation and error states

### Phase 6: Testing and Refinement

#### 1. End-to-End Testing
- Test the complete user journey from profile creation to job application
- Verify all interactions with the database
- Test error handling and edge cases

#### 2. UI/UX Refinement
- Improve loading states and transitions
- Add confirmation dialogs for important actions
- Implement responsive design improvements

#### 3. Performance Optimization
- Implement proper caching for database queries
- Use React.memo and useMemo where appropriate
- Optimize component re-renders

## Implementation Timeline

1. **Week 1**: Database Queries and Server Actions (Phases 1-2)
2. **Week 2**: Component Implementation (Phase 3)
3. **Week 3**: Page Implementation and Job Application Process (Phases 4-5)
4. **Week 4**: Testing, Refinement, and Documentation (Phase 6)

## Technical Considerations

### Authentication and Authorization
- All server actions must verify user authentication
- Candidate-specific actions should verify user role

### Error Handling
- Implement proper error boundaries in React components
- Use try/catch blocks in server actions
- Return appropriate error messages to the UI

### Data Validation
- Use Zod for form validation
- Validate all user inputs on the server side
- Handle validation errors gracefully in the UI

### Performance
- Use React Server Components where possible
- Implement client-side caching with React Query for frequently accessed data
- Use proper pagination for large datasets

## Conclusion

This implementation plan provides a structured approach to building out the candidate features for the Gambian Job Board Platform. By following this plan, we can ensure that all required functionality is implemented correctly and efficiently, providing a good user experience for job seekers.
