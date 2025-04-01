# Ligaye.com Profile Features Implementation Plan

This document outlines the implementation plan for the profile management features of Ligaye.com, following the Vertical Slice Architecture (VSA) pattern. The plan covers three main profile management features: Candidate Profile Management, Employer Profile Management, and Admin User Profile Management.

## 1. Candidate Profile Management

### Feature Overview
This feature allows candidates (job seekers) to create, view, and update their professional profiles, including personal information, education, experience, skills, and resume uploads.

### Route Segment: `app/(dashboard)/candidate/profile/`

#### Files Structure

```
app/
└── (dashboard)/
    └── candidate/
        └── profile/
            ├── page.tsx                         # Server Component - Main profile view
            ├── _components/                     # Client Components for profile editing
            │   ├── profile-form.tsx             # Main profile form 
            │   ├── basic-info-section.tsx       # Basic profile info section
            │   ├── education-section.tsx        # Education management section
            │   ├── experience-section.tsx       # Experience management section
            │   ├── skills-section.tsx           # Skills management section
            │   ├── resume-upload.tsx            # Resume upload component
            │   ├── education-item.tsx           # Individual education item
            │   ├── experience-item.tsx          # Individual experience item
            │   ├── education-form-dialog.tsx    # Dialog for adding/editing education
            │   └── experience-form-dialog.tsx   # Dialog for adding/editing experience
            ├── _actions.ts                      # Server Actions for all profile mutations
            ├── _queries.ts                      # Database query functions
            └── _utils/
                ├── validation.ts                # Zod schemas for form validation
                └── profile-transformers.ts      # Helper functions for data transformation
```

#### Data Flow

##### Read Flow
1. `page.tsx` (Server Component) calls `getCandidateProfile(userId)` from `./_queries.ts`
2. `_queries.ts` fetches data from the database using Drizzle ORM, joining across `profiles`, `candidateProfiles`, `education`, `experience`, and `candidateSkills` (with `skills`) tables
3. Data is passed to client components for rendering the profile form

##### Write Flow
1. Client Components (`_components/*`) use React Hook Form with Zod schemas from `_utils/validation.ts`
2. Form submissions trigger Server Actions in `_actions.ts`
3. Server Actions validate input, then call mutation functions in `_queries.ts`
4. For file uploads, actions handle Supabase Storage interactions, then update database records with file URLs

#### Key Components and Functions

##### `page.tsx`
```typescript
interface PageProps {
  params: Promise<{}>
}

export default async function CandidateProfilePage({ params }: PageProps) {
  // Get logged-in user
  const user = await getUser();
  
  // Handle unauthorized access
  if (!user || user.role !== 'candidate') {
    redirect('/login');
  }
  
  // Fetch candidate profile data
  const profileData = await getCandidateProfile(user.id);
  
  // Check if profile exists, if not show creation form
  const hasProfile = !!profileData?.candidateProfile;
  
  return (
    <div>
      <h1>Your Professional Profile</h1>
      {hasProfile ? (
        <ProfileForm initialData={profileData} />
      ) : (
        <ProfileForm />
      )}
    </div>
  );
}
```

##### `_queries.ts`
```typescript
import { db } from '@/lib/db';
import { profiles, candidateProfiles, education, experience, candidateSkills, skills } from '@/lib/db/schema';
import type { Profile, CandidateProfile, Education, Experience, Skill } from '@/lib/db/schema';

interface CandidateProfileData {
  profile: Profile;
  candidateProfile: CandidateProfile | null;
  education: Education[];
  experience: Experience[];
  skills: (Skill & { candidateSkillId: string })[];
}

// Main query to fetch complete candidate profile
export async function getCandidateProfile(userId: string): Promise<CandidateProfileData | null> {
  // Implementation using Drizzle with proper joins
}

// Create or update candidate profile details
export async function upsertCandidateProfile(profileData: Partial<CandidateProfile> & { userId: string }): Promise<CandidateProfile> {
  // Implementation 
}

// Education record mutations
export async function addEducationRecord(educationData: Omit<Education, 'id' | 'createdAt' | 'updatedAt' | 'deleted'>): Promise<Education> {
  // Implementation
}

export async function updateEducationRecord(id: string, educationData: Partial<Education>): Promise<Education> {
  // Implementation
}

export async function deleteEducationRecord(id: string): Promise<{ success: boolean }> {
  // Implementation (soft delete)
}

// Similar functions for experience records

// Skills management
export async function getAvailableSkills(): Promise<Skill[]> {
  // Fetch all skills for selection
}

export async function updateCandidateSkills(candidateProfileId: string, skillIds: string[]): Promise<{ success: boolean }> {
  // Implementation to sync candidate skills (add new ones, remove deselected ones)
}
```

##### `_actions.ts`
```typescript
'use server'

import { revalidatePath } from 'next/cache';
import { getUser } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/server';
import { upsertCandidateProfile, addEducationRecord, updateEducationRecord, deleteEducationRecord, updateCandidateSkills } from './_queries';
import { validateProfileData, validateEducationData, validateExperienceData } from './_utils/validation';

// Basic profile update action
export async function updateBasicProfileInfo(formData: FormData) {
  const user = await getUser();
  if (!user || user.role !== 'candidate') {
    throw new Error('Unauthorized');
  }
  
  // Extract and validate data
  const data = Object.fromEntries(formData.entries());
  const validatedData = validateProfileData(data);
  
  // Update profile in database
  await upsertCandidateProfile({
    userId: user.id,
    ...validatedData
  });
  
  revalidatePath('/candidate/profile');
  return { success: true };
}

// Resume upload action
export async function handleResumeUpload(formData: FormData) {
  const user = await getUser();
  if (!user || user.role !== 'candidate') {
    throw new Error('Unauthorized');
  }
  
  const resumeFile = formData.get('resume') as File;
  if (!resumeFile) {
    throw new Error('No file provided');
  }
  
  // Upload to Supabase Storage
  const supabase = await createClient();
  const fileName = `${user.id}-${Date.now()}-${resumeFile.name}`;
  const { data, error } = await supabase.storage
    .from('resumes')
    .upload(fileName, resumeFile);
    
  if (error) throw new Error('File upload failed');
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('resumes')
    .getPublicUrl(fileName);
  
  // Update profile with resume URL
  await upsertCandidateProfile({
    userId: user.id,
    resumeUrl: publicUrl,
    resumeFilename: resumeFile.name
  });
  
  revalidatePath('/candidate/profile');
  return { success: true, url: publicUrl };
}

// Similar actions for education, experience and skills management
```

##### `_utils/validation.ts`
```typescript
import { z } from 'zod';

// Validation schema for basic profile information
export const profileSchema = z.object({
  title: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
  experienceLevel: z.enum(['Entry', 'Junior', 'Mid-Level', 'Senior', 'Director', 'Executive']).optional(),
});

// Validation schema for education
export const educationSchema = z.object({
  institution: z.string().min(2).max(100),
  degree: z.string().min(2).max(100),
  fieldOfStudy: z.string().min(2).max(100).optional(),
  startDate: z.string().pipe(z.coerce.date()),
  endDate: z.string().pipe(z.coerce.date()).optional(),
  description: z.string().max(500).optional(),
});

// Validation function for profile data
export function validateProfileData(data: Record<string, any>) {
  return profileSchema.parse(data);
}

// Validation function for education data
export function validateEducationData(data: Record<string, any>) {
  return educationSchema.parse(data);
}

// Similar validation for experience data
```

##### `_components/profile-form.tsx`
```typescript
'use client'

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema } from '../_utils/validation';
import { Form } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BasicInfoSection from './basic-info-section';
import EducationSection from './education-section';
import ExperienceSection from './experience-section';
import SkillsSection from './skills-section';
import ResumeUpload from './resume-upload';

export default function ProfileForm({ initialData = {} }) {
  const [activeTab, setActiveTab] = useState('basic');

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: initialData?.candidateProfile || {},
  });

  return (
    <Form {...form}>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="resume">Resume</TabsTrigger>
        </TabsList>
        <TabsContent value="basic">
          <BasicInfoSection form={form} />
        </TabsContent>
        <TabsContent value="education">
          <EducationSection education={initialData?.education || []} />
        </TabsContent>
        <TabsContent value="experience">
          <ExperienceSection experience={initialData?.experience || []} />
        </TabsContent>
        <TabsContent value="skills">
          <SkillsSection candidateSkills={initialData?.skills || []} />
        </TabsContent>
        <TabsContent value="resume">
          <ResumeUpload resumeUrl={initialData?.candidateProfile?.resumeUrl} resumeFilename={initialData?.candidateProfile?.resumeFilename} />
        </TabsContent>
      </Tabs>
    </Form>
  );
}
```

## 2. Employer Profile Management

### Feature Overview
This feature allows employers to create, view, and update their company profiles, including company details, industry selection, location information, and logo uploads.

### Route Segment: `app/(dashboard)/employer/profile/`

#### Files Structure

```
app/
└── (dashboard)/
    └── employer/
        └── profile/
            ├── page.tsx                      # Server Component - Main profile view
            ├── _components/                  # Client Components for profile editing
            │   ├── employer-profile-form.tsx # Main employer profile form
            │   ├── company-details.tsx       # Company details section
            │   ├── industry-selector.tsx     # Industry selection component
            │   ├── location-selector.tsx     # Location selection component
            │   └── logo-upload.tsx           # Company logo upload component
            ├── _actions.ts                   # Server Actions for all profile mutations
            ├── _queries.ts                   # Database query functions
            └── _utils/
                ├── validation.ts             # Zod schemas for form validation
                └── location-helpers.ts       # Helper functions for location data
```

#### Data Flow

##### Read Flow
1. `page.tsx` (Server Component) calls `getEmployerProfile(userId)` from `./_queries.ts`
2. `_queries.ts` fetches data from the database using Drizzle ORM, joining across `profiles`, `employerProfiles`, `industries`, and `locations` tables
3. Data is passed to client components for rendering the profile form

##### Write Flow
1. Client Components (`_components/*`) use React Hook Form with Zod schemas from `_utils/validation.ts`
2. Form submissions trigger Server Actions in `_actions.ts`
3. Server Actions validate input, then call mutation functions in `_queries.ts`
4. For logo uploads, actions handle Supabase Storage interactions, then update database records with file URLs

#### Key Components and Functions

##### `_queries.ts`
```typescript
import { db } from '@/lib/db';
import { profiles, employerProfiles, industries, locations } from '@/lib/db/schema';
import type { Profile, EmployerProfile, Industry, Location } from '@/lib/db/schema';

interface EmployerProfileData {
  profile: Profile;
  employerProfile: EmployerProfile | null;
  industry: Industry | null;
  location: Location | null;
}

// Main query to fetch complete employer profile
export async function getEmployerProfile(userId: string): Promise<EmployerProfileData | null> {
  // Implementation with joins across tables
}

// Get all industries for selection
export async function getAllIndustries(): Promise<Industry[]> {
  // Implementation
}

// Get all locations for selection
export async function getAllLocations(): Promise<Location[]> {
  // Implementation
}

// Create or update employer profile
export async function upsertEmployerProfile(profileData: Partial<EmployerProfile> & { userId: string }): Promise<EmployerProfile> {
  // Implementation
}
```

##### `_actions.ts`
```typescript
'use server'

import { revalidatePath } from 'next/cache';
import { getUser } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/server';
import { upsertEmployerProfile } from './_queries';
import { validateEmployerProfileData } from './_utils/validation';

// Update employer profile
export async function updateEmployerProfileDetails(formData: FormData) {
  const user = await getUser();
    if (!user) {
    throw new Error('Unauthorized');
  }
  
   // Check if user has a profile
  const profile = await db()
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1)
    .then(res => res[0]);
  if (!profile) {
    throw new Error('Profile not found');
  }

  // Compare Profile ID with Employer ID 
  const employerProfileId = await db()
    .select()
    .from(employerProfiles)
    .where(eq(employerProfiles.profileId, profile.id))
    .limit(1)
    .then(res => res[0]);
  if (!employerProfileId) {
    throw new Error('Employer profile not found');
  }
  
  // Extract and validate data
  const data = Object.fromEntries(formData.entries());
  const validatedData = validateEmployerProfileData(data);
  
  // Update profile in database
  await upsertEmployerProfile({
    userId: user.id,
    ...validatedData
  });
  
  revalidatePath('/employer/profile');
  return { success: true };
}

// Logo upload action
export async function handleLogoUpload(formData: FormData) {
    const user = await getUser();
    if (!user) {
    throw new Error('Unauthorized');
  }
  
   // Check if user has a profile
  const profile = await db()
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1)
    .then(res => res[0]);
  if (!profile) {
    throw new Error('Profile not found');
  }

  // Compare Profile ID with Employer ID 
  const employerProfileId = await db()
    .select()
    .from(employerProfiles)
    .where(eq(employerProfiles.profileId, profile.id))
    .limit(1)
    .then(res => res[0]);
  if (!employerProfileId) {
    throw new Error('Employer profile not found');
  }
  
  const logoFile = formData.get('logo') as File;
  if (!logoFile) {
    throw new Error('No file provided');
  }
  
  // Upload to Supabase Storage
  const supabase = await createClient();
  const fileName = `${user.id}-${Date.now()}-${logoFile.name}`;
  const { data, error } = await supabase.storage
    .from('company-logos')
    .upload(fileName, logoFile);
    
  if (error) throw new Error('File upload failed');
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('company-logos')
    .getPublicUrl(fileName);
  
  // Update profile with logo URL
  await upsertEmployerProfile({
    userId: user.id,
    companyLogoUrl: publicUrl
  });
  
  revalidatePath('/employer/profile');
  return { success: true, url: publicUrl };
}
```

##### `_utils/validation.ts`
```typescript
import { z } from 'zod';

// Validation schema for employer profile
export const employerProfileSchema = z.object({
  companyName: z.string().min(2).max(100),
  companySize: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']).optional(),
  industryId: z.string().uuid().optional(),
  companyDescription: z.string().max(1000).optional(),
  website: z.string().url().optional().or(z.literal('')),
  locationId: z.string().uuid().optional(),
  hqAddressDisplay: z.string().max(200).optional(),
});

// Validation function for employer profile data
export function validateEmployerProfileData(data: Record<string, any>) {
  return employerProfileSchema.parse(data);
}
```

## 3. Admin User Profile Management

### Feature Overview
This feature allows administrators to view, edit, and manage all user profiles (both candidates and employers) in the system.

### Route Segment: `app/(admin)/users/[id]/`

#### Files Structure

```
app/
└── (admin)/
    ├── users/
    │   ├── page.tsx                 # Server Component - User listing
    │   ├── _components/             # Client Components for users listing
    │   │   └── users-table.tsx      # Table of all users
    │   ├── _actions.ts              # Server Actions for bulk operations
    │   └── _queries.ts              # Database queries for user listing
    └── users/[id]/
        ├── page.tsx                 # Server Component - User profile detail view
        ├── _components/             # Client Components for profile editing
        │   ├── admin-profile-view.tsx       # Main container component
        │   ├── profile-header.tsx           # User profile header section
        │   ├── candidate-profile-editor.tsx # Candidate profile editing (conditional)
        │   ├── employer-profile-editor.tsx  # Employer profile editing (conditional)
        │   ├── education-manager.tsx        # Education records management
        │   ├── experience-manager.tsx       # Experience records management
        │   ├── skills-manager.tsx           # Skills management
        │   ├── confirmation-dialog.tsx      # Confirmation for destructive actions
        │   └── activity-log.tsx             # Profile activity tracking
        ├── _actions.ts              # Server Actions for admin operations
        ├── _queries.ts              # Database queries for profile management
        └── _utils/
            └── validation.ts        # Zod schemas for form validation
```

#### Data Flow

##### Read Flow
1. `page.tsx` extracts the user `id` from the route parameter
2. `page.tsx` (Server Component) calls `getAdminUserProfileView(id)` from `./_queries.ts`
3. `_queries.ts` fetches data from the database with a dynamic query that adapts based on the user's role
4. Data is passed to client components for rendering the appropriate profile view

##### Write Flow
1. Client Components (`_components/*`) use React Hook Form with Zod schemas for editing different profile sections
2. Form submissions trigger Server Actions in `_actions.ts`
3. Server Actions validate admin permissions, then validate input and call mutation functions in `_queries.ts`
4. Database operations are performed via `_queries.ts` functions

#### Key Components and Functions

##### `page.tsx`
```typescript
interface PageProps {
  params: Promise<{id: string}>
}

export default async function AdminUserProfilePage({ params }: PageProps) {
  // Get logged-in admin user
      const user = await getUser();
    if (!user) {
    throw new Error('Unauthorized');
  }
  
   // Check if user has a profile
  const profile = await db()
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1)
    .then(res => res[0]);
  if (!profile) {
    throw new Error('Profile not found');
  }
  if (profile.role !== 'admin'){
    throw new Error('Access denied!');
  }
  
  // Get user ID from params
  const id = await params.id;
  
  // Fetch user profile data
  const userData = await getAdminUserProfileView(id);
  
  if (!userData) {
    notFound();
  }
  
  return (
    <div>
      <h1>User Profile: {userData.profile.fullName}</h1>
      <AdminProfileView userData={userData} />
    </div>
  );
}
```

##### `_queries.ts`
```typescript
import { db } from '@/lib/db';
import { profiles, candidateProfiles, employerProfiles, education, experience, candidateSkills, skills, industries, locations } from '@/lib/db/schema';
import type { Profile, CandidateProfile, EmployerProfile, Education, Experience, Skill, Industry, Location } from '@/lib/db/schema';

// Main query that adapts based on the user role
export async function getAdminUserProfileView(id: string) {
  // Fetch the basic profile first
  const profile = await db()
    .select()
    .from(profiles)
    .where(eq(profiles.id, id))
    .first();
  
  if (!profile) return null;
  
  // Depending on role, fetch the appropriate related data
  if (profile.role === 'candidate') {
    // Fetch candidate profile and related data
    // Similar to the candidate profile query but with more detail for admin
    
    return {
      profile,
      roleSpecificData: {
        candidateProfile: /* fetched data */,
        education: /* fetched data */,
        experience: /* fetched data */,
        skills: /* fetched data */,
      }
    };
  } 
  else if (profile.role === 'employer') {
    // Fetch employer profile and related data
    // Similar to the employer profile query but with more detail for admin
    
    return {
      profile,
      roleSpecificData: {
        employerProfile: /* fetched data */,
        industry: /* fetched data */,
        location: /* fetched data */,
      }
    };
  }
  
  // Default case
  return { profile, roleSpecificData: null };
}

// CRUD operations for admin
export async function updateProfile(id: string, data: Partial<Profile>): Promise<Profile> {
  // Implementation
}

export async function updateCandidateProfile(id: string, data: Partial<CandidateProfile>): Promise<CandidateProfile> {
  // Implementation
}

export async function updateEmployerProfile(id: string, data: Partial<EmployerProfile>): Promise<EmployerProfile> {
  // Implementation
}

// Methods for education, experience, skills management
// Similar to candidate profile but with admin context
```

##### `_actions.ts`
```typescript
'use server'

import { revalidatePath } from 'next/cache';
import { getUser } from '@/lib/supabase/server';
import { updateProfile, updateCandidateProfile, updateEmployerProfile } from './_queries';
import { validateProfileData, validateCandidateProfileData, validateEmployerProfileData } from './_utils/validation';

// Update basic profile information 
export async function updateUserProfileAdmin(id: string, formData: FormData) {
     const user = await getUser();
    if (!user) {
    throw new Error('Unauthorized');
  }
  
   // Check if user has a profile
  const profile = await db()
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1)
    .then(res => res[0]);
  if (!profile) {
    throw new Error('Profile not found');
  }
  if (profile.role !== 'admin'){
    throw new Error('Access denied!');
  }
  
  // Extract and validate data
  const data = Object.fromEntries(formData.entries());
  const validatedData = validateProfileData(data);
  
  // Update profile in database
  await updateProfile(id, validatedData);
  
  revalidatePath(`/admin/users/${id}`);
  return { success: true };
}

// Conditional actions based on user role
export async function updateUserRoleSpecificData(id: string, role: 'candidate' | 'employer', formData: FormData) {
    const user = await getUser();
    if (!user) {
    throw new Error('Unauthorized');
  }
  
   // Check if user has a profile
  const profile = await db()
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1)
    .then(res => res[0]);
  if (!profile) {
    throw new Error('Profile not found');
  }
  if (profile.role !== 'admin'){
    throw new Error('Access denied!');
  }
  
  const data = Object.fromEntries(formData.entries());
  
  if (role === 'candidate') {
    const validatedData = validateCandidateProfileData(data);
    await updateCandidateProfile(id, validatedData);
  } else if (role === 'employer') {
    const validatedData = validateEmployerProfileData(data);
    await updateEmployerProfile(id, validatedData);
  }
  
  revalidatePath(`/admin/users/${id}`);
  return { success: true };
}

// Additional admin-specific actions for full CRUD operations
// Including the ability to delete profiles or change user roles
```

##### `_components/admin-profile-view.tsx`
```typescript
'use client'

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileHeader from './profile-header';
import CandidateProfileEditor from './candidate-profile-editor';
import EmployerProfileEditor from './employer-profile-editor';

export default function AdminProfileView({ userData }) {
  const { profile, roleSpecificData } = userData;
  const [activeTab, setActiveTab] = useState('basic');

  return (
    <div>
      <ProfileHeader profile={profile} />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          {profile.role === 'candidate' && (
            <>
              <TabsTrigger value="candidate">Candidate Details</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
            </>
          )}
          {profile.role === 'employer' && (
            <>
              <TabsTrigger value="employer">Company Details</TabsTrigger>
            </>
          )}
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic">
          {/* Basic profile editing form */}
        </TabsContent>
        
        {profile.role === 'candidate' && (
          <>
            <TabsContent value="candidate">
              <CandidateProfileEditor data={roleSpecificData.candidateProfile} profileId={profile.id} />
            </TabsContent>
            <TabsContent value="education">
              {/* Education management */}
            </TabsContent>
            <TabsContent value="experience">
              {/* Experience management */}
            </TabsContent>
            <TabsContent value="skills">
              {/* Skills management */}
            </TabsContent>
          </>
        )}
        
        {profile.role === 'employer' && (
          <TabsContent value="employer">
            <EmployerProfileEditor data={roleSpecificData.employerProfile} profileId={profile.id} />
          </TabsContent>
        )}
        
        <TabsContent value="activity">
          {/* Activity log */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

## 4. Shared Components

### Supabase Storage Helper

While each feature slice should remain independent, file upload logic is similar across slices. We'll implement this functionality directly in the server actions of each slice rather than creating a shared utility, to maintain slice independence.

### Form Component Patterns

Each slice will implement its own form components using React Hook Form and Zod validation, following these consistent patterns:

1. Use Shadcn UI form components
2. Implement form sections as separate components
3. Use tabs for organizing complex forms
4. Implement proper validation using Zod schemas
5. Show appropriate loading and error states
6. Use React 19's `useActionState` for server action state management:
   ```typescript
   // @ts-ignore - useActionState is available in React 19 but TypeScript definitions may be outdated
   import { useActionState } from 'react';
   
   // Initial state for form submission
   const initialState = {
     success: false,
     message: undefined
   };
   
   // Use useActionState to track server action state
   const [state, formAction] = useActionState(updateProfileAction, initialState);
   ```

## 5. Implementation Steps

1. Create the directory structure for each feature slice
2. Implement the database query functions in each `_queries.ts` file
3. Set up Zod validation schemas in each slice's `_utils/validation.ts`
4. Implement server actions in each `_actions.ts` file
5. Create the UI components, starting with the container components and then individual form sections
6. Implement file upload functionality for resumes and logos
7. Create the admin view components with dynamic rendering based on user role
8. Test each feature thoroughly in isolation

## 6. Considerations and Challenges

1. **File Storage**: Ensure proper file organization in Supabase Storage buckets ('resumes', 'company-logos')
2. **Form Complexity**: Consider breaking down complex forms into multiple sections or steps
3. **Data Validation**: Implement comprehensive validation at both frontend and server action levels
4. **Skills Management**: Implement an efficient UI for searching and selecting skills from a potentially large list
5. **Role-Based Access Control**: Ensure proper checks in both UI and server actions to prevent unauthorized access
6. **Performance**: Optimize database queries to minimize joins and fetch only necessary data
7. **User Experience**: Implement optimistic updates where appropriate to improve perceived performance
