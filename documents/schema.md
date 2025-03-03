# Drizzle ORM Schema for Gambian Job Board

This schema defines the database tables for a job board application built with Next.js, Drizzle ORM, and Supabase. It incorporates best practices for data modeling, including normalization, enums, and relationships.

**Key Considerations for Cursor AI:**

*   **Enums:** The schema heavily uses PostgreSQL enums (`pgEnum`). Ensure Cursor AI understands and correctly generates these.
*   **UUIDs:** Primary keys are UUIDs (`uuid`).
*   **Timestamps:**  `createdAt` and `updatedAt` are essential for auditing.
*   **Relationships:** Drizzle's `relations` are used to define relationships between tables.  Pay *close attention* to how Cursor AI handles these.  You might need to manually adjust the generated code to ensure the relationships are correctly defined.
*   **Type Safety (VERY IMPORTANT):**
    *   **Infer Types Directly from the Schema:** The BEST approach is to use Drizzle's `InferModel` and `InferInsertModel` utilities to derive TypeScript types *directly* from your schema. This ensures 100% type safety and avoids mismatches.  DO NOT manually define types that duplicate the schema.
        ```typescript
        // Example (DO THIS)
        import { InferModel, InferInsertModel } from 'drizzle-orm';
        import { jobs } from './schema';

        export type Job = InferModel<typeof jobs>; // Type for selecting a job
        export type NewJob = InferInsertModel<typeof jobs>; // Type for inserting a job
        ```
    *   **Communicate this to Cursor AI:** In your prompts to Cursor AI, *explicitly* state that you want to use `InferModel` and `InferInsertModel` to derive types from the Drizzle schema.  Provide examples.  This is the *most critical* aspect of avoiding type mismatches.
*   **PostgreSQL Specifics:**  The schema is designed for PostgreSQL.  Make sure Cursor AI is configured for PostgreSQL.

```typescript
import {
    pgTable,
    uuid,
    text,
    timestamp,
    boolean,
    integer,
    pgEnum,
    primaryKey
  } from 'drizzle-orm/pg-core';
import { relations, InferInsertModel, InferModel } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['employer', 'candidate']);
export const jobTypeEnum = pgEnum('job_type', ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY']);
export const workLocationEnum = pgEnum('work_location', ['REMOTE', 'HYBRID', 'ON_SITE']);
export const salaryFrequencyEnum = pgEnum('salary_frequency', ['HOUR', 'DAY', 'WEEK', 'MONTH', 'YEAR']);
export const applicationStatusEnum = pgEnum('application_status', [
  'PENDING',
  'REVIEWING',
  'SHORTLISTED',
  'INTERVIEW_SCHEDULED',
  'INTERVIEWED',
  'OFFER_EXTENDED',
  'HIRED',
  'REJECTED'
]);
export const tenderType = pgEnum('tender_type', ['TENDER', 'PUBLIC_NOTICE']);
export const tenderStatus = pgEnum('tender_status', ['DRAFT', 'PUBLISHED', 'CLOSED', 'CANCELLED']);
export const companySizeEnum = pgEnum('company_size', ['1-10', '11-50', '51-200', '201-500', '500+']);
export const experienceLevelEnum = pgEnum('experience_level', ['Entry', 'Junior', 'Mid-Level', 'Senior', 'Director', 'Executive']);

// --- Tables ---

// Profiles (Base User Information)
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique(), // Link to Supabase Auth user
  fullName: text('full_name').notNull(),
  email: text('email').notNull(), // Ensure this is unique if not using Supabase Auth email
  avatarUrl: text('avatar_url'), // URL to Supabase Storage
  role: userRoleEnum('role').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Employer Profiles
export const employerProfiles = pgTable('employer_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().unique().references(() => profiles.id),
  companyName: text('company_name').notNull(),
  companySize: companySizeEnum('company_size').notNull(),
  industry: text('industry').notNull(), // Consider a separate industries table (many-to-many)
  companyDescription: text('company_description'),
  website: text('website'),
  location: text('location').notNull(),
   createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Candidate Profiles
export const candidateProfiles = pgTable('candidate_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().unique().references(() => profiles.id),
  title: text('title').notNull(),
  experienceLevel: experienceLevelEnum('experience_level').notNull(),
  skills: text('skills').array(), // Will be replaced by a many-to-many relationship
  resumeUrl: text('resume_url'), // URL to Supabase Storage
  linkedinUrl: text('linkedin_url'),
  githubUrl: text('github_url'),
  bio: text('bio'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Locations (Structured for The Gambia)
export const locations = pgTable('locations', {
  id: uuid('id').primaryKey().defaultRandom(),
  region: text('region').notNull(),
  district: text('district'),
  town: text('town'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
      updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Jobs
export const jobs = pgTable('jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  employerId: uuid('employer_id').notNull().references(() => profiles.id),
  companyId: uuid('company_id').notNull().references(() => employerProfiles.id), // Reference to employerProfiles
  title: text('title').notNull(),
  locationId: uuid('location_id').references(() => locations.id), // Foreign key to locations
  description: text('description').notNull(),
  educationRequirements: text('education_requirements').array().default([]),
  experienceRequirements: text('experience_requirements').array().default([]),
  salaryRangeMin: integer('salary_range_min'),
  salaryRangeMax: integer('salary_range_max'),
  salaryCurrency: text('salary_currency').default('GMD'),
  salaryFrequency: salaryFrequencyEnum('salary_frequency').notNull(),
  jobType: jobTypeEnum('job_type').notNull(),
  workLocation: workLocationEnum('work_location').notNull(),
    experienceLevel: experienceLevelEnum('experience_level').notNull(),
  benefits: text('benefits').array(),
  skillsRequired: text('skills_required').array(), // Will be replaced with jobSkills
    slug: text('slug'),
  isActive: boolean('is_active').default(true),
  deleted: boolean('deleted').default(false), // Soft delete
  expiresAt: timestamp('expires_at'),
  applicationDeadline: timestamp('application_deadline'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Applications
export const applications = pgTable('applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').notNull().references(() => jobs.id),
  candidateId: uuid('candidate_id').notNull().references(() => profiles.id),
  status: applicationStatusEnum('status').default('PENDING'),
  resumeUrl: text('resume_url'), // URL to Supabase Storage
  coverLetterUrl: text('cover_letter_url'), // URL to Supabase Storage
    usedProfileCv: boolean('used_profile_cv').default(false),
  coverLetter: text('cover_letter'),
  notes: text('notes'),
  interviewDate: timestamp('interview_date'),
   appliedAt: timestamp('applied_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Saved Jobs
export const savedJobs = pgTable('saved_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id),
  jobId: uuid('job_id').notNull().references(() => jobs.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Tenders
export const tenders = pgTable('tenders', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  organizationName: text('organization_name').notNull(), // Could link to an organizations table
  tenderType: tenderType('tender_type').notNull(),
  sector: text('sector'), // Consider a separate sectors table
  location: text('location'), // Could link to the locations table
  deadline: timestamp('deadline', { withTimezone: true }),
  budgetRange: text('budget_range'),
  contactInformation: text('contact_information'),
  externalLink: text('external_link'),
  status: tenderStatus('status').notNull().default('DRAFT'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
});

// Skills (Many-to-Many with Jobs)
export const skills = pgTable('skills', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(), // Make skill names unique
    createdAt: timestamp('created_at').notNull().defaultNow(),
      updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Job Skills (Join Table)
export const jobSkills = pgTable('job_skills', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').notNull().references(() => jobs.id),
  skillId: uuid('skill_id').notNull().references(() => skills.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => {
    return {
      pk: primaryKey(table.jobId, table.skillId) //Composite primary key
    }
  });

    // Industries (Many-to-Many with Jobs) - Optional, but recommended
export const industries = pgTable('industries', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
   createdAt: timestamp('created_at').notNull().defaultNow(),
      updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Job Industries (Join Table) - Optional
export const jobIndustries = pgTable('job_industries', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').notNull().references(() => jobs.id),
  industryId: uuid('industry_id').notNull().references(() => industries.id),
  createdAt: timestamp('created_at').defaultNow(),
   updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
    return {
      pk: primaryKey(table.jobId, table.industryId) //Composite primary key
    }
  });

// --- Relations ---
export const profilesRelations = relations(profiles, ({ many, one }) => ({
  candidateProfile: one(candidateProfiles, {
    fields: [profiles.id],
    references: [candidateProfiles.profileId],
  }),
  employerProfile: one(employerProfiles, {
    fields: [profiles.id],
    references: [employerProfiles.profileId],
  }),
  applications: many(applications, {
    relationName: 'candidate_applications'
  }),
  jobs: many(jobs),
  savedJobs: many(savedJobs)
}));

export const candidateProfilesRelations = relations(candidateProfiles, ({ one }) => ({
  profile: one(profiles, {
    fields: [candidateProfiles.profileId],
    references: [profiles.id],
  })
}));

export const employerProfilesRelations = relations(employerProfiles, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [employerProfiles.profileId],
    references: [profiles.id],
  }),
    jobs: many(jobs)
}));

export const tenderRelations = relations(tenders, ({ one }) => ({
    user: one(profiles, {
        fields: [tenders.userId],
        references: [profiles.id],
    }),
}));

export const jobRelations = relations(jobs, ({ many, one }) => ({
	skills: many(jobSkills),
    industries: many(jobIndustries),
	employer: one(employerProfiles, {
		fields: [jobs.employerId],
		references: [employerProfiles.profileId],
	}),
	applications: many(applications),
    location: one(locations, {
      fields: [jobs.locationId],
      references: [locations.id]
    })
}));

export const skillsRelations = relations(skills, ({ many }) => ({
	jobs: many(jobSkills),
}));

export const jobSkillsRelations = relations(jobSkills, ({ one }) => ({
	job: one(jobs, {
		fields: [jobSkills.jobId],
		references: [jobs.id],
	}),
	skill: one(skills, {
		fields: [jobSkills.skillId],
		references: [skills.id],
	}),
}));

// --- Type Definitions (IMPORTANT FOR CURSOR AI) ---
//  Tell Cursor AI to use InferModel and InferInsertModel to derive types.
//  Provide these examples:

export type UserRole = InferModel<typeof profiles, 'role'>;
export type Job = InferModel<typeof jobs>;
export type NewJob = InferInsertModel<typeof jobs>;
export type Application = InferModel<typeof applications>;
export type NewApplication = InferInsertModel<typeof applications>;
export type SavedJob = InferModel<typeof savedJobs>;
export type NewSavedJob = InferInsertModel<typeof savedJobs>;
// ... and so on for other tables ...