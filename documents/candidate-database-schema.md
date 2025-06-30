# Candidate Database Schema for Mobile App

This document contains all database tables related to candidates that are needed for the mobile app development. The schema is implemented using Drizzle ORM with PostgreSQL.

## Core Tables

### 1. profiles
Base user information table that links to Supabase Auth.

```typescript
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique(), // Link to Supabase Auth user
  fullName: text('full_name').notNull(),
  avatarUrl: text('avatar_url'), // URL to Supabase Storage
  role: userRoleEnum('role').notNull(),
  deleted: boolean('deleted').default(false).notNull(), // Standard soft delete
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    userIdIdx: index('profiles_user_id_idx').on(table.userId),
    roleIdx: index('profiles_role_idx').on(table.role),
    deletedIdx: index('profiles_deleted_idx').on(table.deleted)
  };
});
```

### 2. candidateProfiles
Specific profile information for candidates.

```typescript
export const candidateProfiles = pgTable('candidate_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().unique().references(() => profiles.id, { onDelete: 'cascade' }),
  title: text('title'), // Nullable initially, e.g., "Software Engineer"
  experienceLevel: experienceLevelEnum('experience_level'), // Nullable initially
  resumeUrl: text('resume_url'), // URL to Supabase Storage
  resumeFilename: text('resume_filename'), // Store original filename
  linkedinUrl: text('linkedin_url'),
  githubUrl: text('github_url'),
  portfolioUrl: text('portfolio_url'), // Added portfolio
  bio: text('bio'),
  deleted: boolean('deleted').default(false).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    profileIdIdx: index('candidate_profiles_profile_id_idx').on(table.profileId),
    experienceLevelIdx: index('candidate_profiles_experience_level_idx').on(table.experienceLevel),
    titleIdx: index('candidate_profiles_title_idx').on(table.title),
    deletedIdx: index('candidate_profiles_deleted_idx').on(table.deleted)
  };
});
```

## Skills Tables

### 3. skills
Master list of all available skills.

```typescript
export const skills = pgTable('skills', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  deleted: boolean('deleted').default(false).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    nameIdx: index('skills_name_idx').on(table.name),
    deletedIdx: index('skills_deleted_idx').on(table.deleted)
  };
});
```

### 4. candidateSkills
Junction table linking candidates to their skills.

```typescript
export const candidateSkills = pgTable('candidate_skills', {
  id: uuid('id').primaryKey().defaultRandom(),
  candidateProfileId: uuid('candidate_profile_id').notNull().references(() => candidateProfiles.id, { onDelete: 'cascade' }),
  skillId: uuid('skill_id').notNull().references(() => skills.id, { onDelete: 'cascade' }),
  deleted: boolean('deleted').default(false).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => {
  return {
    candidateIdIdx: index('candidate_skills_candidate_profile_id_idx').on(table.candidateProfileId),
    skillIdIdx: index('candidate_skills_skill_id_idx').on(table.skillId),
    uniqueCandidateSkill: uniqueIndex('candidate_skill_unique_idx').on(table.candidateProfileId, table.skillId),
    deletedIdx: index('candidate_skills_deleted_idx').on(table.deleted)
  };
});
```

## Education & Experience

### 5. education
Candidate's educational history.

```typescript
export const education = pgTable('education', {
    id: uuid('id').primaryKey().defaultRandom(),
    candidateProfileId: uuid('candidate_profile_id').notNull().references(() => candidateProfiles.id, { onDelete: 'cascade' }),
    institution: text('institution').notNull(),
    degree: text('degree').notNull(),
    fieldOfStudy: text('field_of_study'),
    startDate: timestamp('start_date'),
    endDate: timestamp('end_date'),
    description: text('description'),
    deleted: boolean('deleted').default(false).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
    return {
        candidateProfileIdIdx: index('education_candidate_profile_id_idx').on(table.candidateProfileId),
        deletedIdx: index('education_deleted_idx').on(table.deleted)
    };
});
```

### 6. experience
Candidate's work experience history.

```typescript
export const experience = pgTable('experience', {
    id: uuid('id').primaryKey().defaultRandom(),
    candidateProfileId: uuid('candidate_profile_id').notNull().references(() => candidateProfiles.id, { onDelete: 'cascade' }),
    jobTitle: text('job_title').notNull(),
    companyName: text('company_name').notNull(),
    location: text('location'), // Free text
    startDate: timestamp('start_date'),
    endDate: timestamp('end_date'), // Null if current job
    isCurrent: boolean('is_current').default(false),
    description: text('description'),
    deleted: boolean('deleted').default(false).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
    return {
        candidateProfileIdIdx: index('experience_candidate_profile_id_idx').on(table.candidateProfileId),
        deletedIdx: index('experience_deleted_idx').on(table.deleted)
    };
});
```

## Job-Related Tables

### 7. jobs (Partial - Needed for candidates)
Jobs that candidates can view and apply to.

```typescript
export const jobs = pgTable('jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => employerProfiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  locationId: uuid('location_id').references(() => locations.id),
  workLocation: workLocationEnum('work_location').notNull(), // ON_SITE, HYBRID, REMOTE
  
  // Job details
  jobLanguage: text('job_language').default('English'),
  numberOfOpenings: integer('number_of_openings').default(1),
  displayAddress: boolean('display_address').default(true),
  
  // Requirements
  educationRequirements: text('education_requirements').notNull().default(''),
  experienceRequirements: text('experience_requirements').notNull().default(''),
  experienceLevel: experienceLevelEnum('experience_level'),
  
  // Language requirements
  languageRequirements: text('language_requirements').array(),
  languageTrainingProvided: boolean('language_training_provided').default(false),
  
  // Job type and schedule
  jobType: jobTypeEnum('job_type').notNull(),
  schedule: scheduleTypeEnum('schedule').array(),
  expectedHours: integer('expected_hours'),
  hoursType: text('hours_type').default('FIXED'),
  
  // Contract details
  contractLength: integer('contract_length'),
  contractPeriod: contractPeriodEnum('contract_period'),
  
  // Start date
  plannedStartDate: timestamp('planned_start_date'),
  
  // Salary
  salaryRangeMin: real('salary_range_min'),
  salaryRangeMax: real('salary_range_max'),
  salaryCurrency: text('salary_currency').default('GMD').notNull(),
  salaryFrequency: salaryFrequencyEnum('salary_frequency'),
  salaryDisplayType: salaryDisplayTypeEnum('salary_display_type').default('NEGOTIABLE'),
  
  // Supplemental pay & Benefits
  supplementalPay: text('supplemental_pay').array(),
  benefits: text('benefits').array(),
  
  // Application settings
  applicationMethod: applicationMethodEnum('application_method').default('PLATFORM'),
  applicationInstructions: text('application_instructions'),
  applicationUrl: text('application_url'),
  applicationEmail: text('application_email'),
  resumeRequired: boolean('resume_required').default(true),
  allowCandidateContact: boolean('allow_candidate_contact').default(false),
  applicationDeadline: timestamp('application_deadline'),
  
  // Job post metadata
  status: jobStatusEnum('status').default('DRAFT').notNull(),
  publishedAt: timestamp('published_at'),
  expiresAt: timestamp('expires_at'),
  slug: text('slug').unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    companyIdIdx: index('jobs_company_id_idx').on(table.companyId),
    titleIdx: index('jobs_title_idx').on(table.title),
    locationIdIdx: index('jobs_location_id_idx').on(table.locationId),
    workLocationIdx: index('jobs_work_location_idx').on(table.workLocation),
    jobTypeIdx: index('jobs_job_type_idx').on(table.jobType),
    experienceLevelIdx: index('jobs_experience_level_idx').on(table.experienceLevel),
    statusIdx: index('jobs_status_idx').on(table.status),
    expiresAtIdx: index('jobs_expires_at_idx').on(table.expiresAt),
    applicationDeadlineIdx: index('jobs_application_deadline_idx').on(table.applicationDeadline),
    plannedStartDateIdx: index('jobs_planned_start_date_idx').on(table.plannedStartDate),
    slugIdx: index('jobs_slug_idx').on(table.slug),
    statusExpiresAtIdx: index('jobs_status_expires_at_idx').on(table.status, table.expiresAt),
    jobTypeExpLevelIdx: index('jobs_job_type_exp_level_idx').on(table.jobType, table.experienceLevel),
    salaryRangeIdx: index('jobs_salary_range_idx').on(table.salaryRangeMin, table.salaryRangeMax)
  };
});
```

### 8. applications
Job applications submitted by candidates.

```typescript
export const applications = pgTable('applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  candidateProfileId: uuid('candidate_profile_id').notNull().references(() => candidateProfiles.id, { onDelete: 'cascade' }),
  status: applicationStatusEnum('status').default('APPLIED').notNull(),
  resumeUrl: text('resume_url'), // Specific resume used for this application
  resumeFilename: text('resume_filename'), // Filename for specific resume
  coverLetterUrl: text('cover_letter_url'), // Optional cover letter file
  coverLetterFilename: text('cover_letter_filename'),
  coverLetterText: text('cover_letter_text'), // Option for pasting cover letter text
  notes: text('notes'), // Employer notes on the application
  interviewDate: timestamp('interview_date'), // If status is INTERVIEW_SCHEDULED
  deleted: boolean('deleted').default(false).notNull(),
  appliedAt: timestamp('applied_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    jobIdIdx: index('applications_job_id_idx').on(table.jobId),
    candidateIdIdx: index('applications_candidate_profile_id_idx').on(table.candidateProfileId),
    statusIdx: index('applications_status_idx').on(table.status),
    appliedAtIdx: index('applications_applied_at_idx').on(table.appliedAt),
    deletedIdx: index('applications_deleted_idx').on(table.deleted),
    jobCandidateUniqueIdx: uniqueIndex('applications_job_candidate_unique_idx').on(table.jobId, table.candidateProfileId)
  };
});
```

### 9. savedJobs
Jobs saved by candidates for later viewing.

```typescript
export const savedJobs = pgTable('saved_jobs', {
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  jobId: uuid('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  deleted: boolean('deleted').default(false).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId, table.jobId] }),
    userIdIdx: index('saved_jobs_user_id_idx').on(table.userId),
    jobIdIdx: index('saved_jobs_job_id_idx').on(table.jobId),
    deletedIdx: index('saved_jobs_deleted_idx').on(table.deleted)
  };
});
```

### 10. jobSkills
Skills required for jobs (junction table).

```typescript
export const jobSkills = pgTable('job_skills', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  skillId: uuid('skill_id').notNull().references(() => skills.id, { onDelete: 'cascade' }),
  deleted: boolean('deleted').default(false).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => {
  return {
    jobIdIdx: index('job_skills_job_id_idx').on(table.jobId),
    skillIdIdx: index('job_skills_skill_id_idx').on(table.skillId),
    uniqueJobSkill: uniqueIndex('job_skill_unique_idx').on(table.jobId, table.skillId),
    deletedIdx: index('job_skills_deleted_idx').on(table.deleted)
  };
});
```

## Supporting Tables

### 11. locations
Structured location data for The Gambia.

```typescript
export const locations = pgTable('locations', {
  id: uuid('id').primaryKey().defaultRandom(),
  region: text('region').notNull(), // e.g., Greater Banjul Area, West Coast Region
  district: text('district'), // e.g., Kombo North, Kanifing
  city: text('city'), // e.g., Banjul, Serekunda, Brikama
  deleted: boolean('deleted').default(false).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    regionIdx: index('locations_region_idx').on(table.region),
    cityIdx: index('locations_city_idx').on(table.city),
    deletedIdx: index('locations_deleted_idx').on(table.deleted)
  };
});
```

### 12. industries
Industry categories for jobs and employers.

```typescript
export const industries = pgTable('industries', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  deleted: boolean('deleted').default(false).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    nameIdx: index('industries_name_idx').on(table.name),
    deletedIdx: index('industries_deleted_idx').on(table.deleted)
  };
});
```

### 13. jobIndustries
Industries associated with jobs (junction table).

```typescript
export const jobIndustries = pgTable('job_industries', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  industryId: uuid('industry_id').notNull().references(() => industries.id, { onDelete: 'cascade' }),
  deleted: boolean('deleted').default(false).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    jobIdIdx: index('job_industries_job_id_idx').on(table.jobId),
    industryIdIdx: index('job_industries_industry_id_idx').on(table.industryId),
    uniqueJobIndustry: uniqueIndex('job_industry_unique_idx').on(table.jobId, table.industryId),
    deletedIdx: index('job_industries_deleted_idx').on(table.deleted)
  };
});
```

### 14. employerProfiles (Partial - Needed for job display)
Basic employer information needed for job listings.

```typescript
export const employerProfiles = pgTable('employer_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().unique().references(() => profiles.id, { onDelete: 'cascade' }),
  companyName: text('company_name').notNull(),
  companySize: companySizeEnum('company_size'),
  industryId: uuid('industry_id').references(() => industries.id),
  companyDescription: text('company_description'),
  website: text('website'),
  locationId: uuid('location_id').references(() => locations.id),
  hqAddressDisplay: text('hq_address_display'),
  companyLogoUrl: text('company_logo_url'),
  deleted: boolean('deleted').default(false).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    profileIdIdx: index('employer_profiles_profile_id_idx').on(table.profileId),
    companyNameIdx: index('employer_profiles_company_name_idx').on(table.companyName),
    industryIdIdx: index('employer_profiles_industry_id_idx').on(table.industryId),
    locationIdIdx: index('employer_profiles_location_id_idx').on(table.locationId),
    deletedIdx: index('employer_profiles_deleted_idx').on(table.deleted)
  };
});
```

## Enums

### User Role Enum
```typescript
export const userRoleEnum = pgEnum('user_role', ['employer', 'candidate', 'admin']);
```

### Experience Level Enum
```typescript
export const experienceLevelEnum = pgEnum('experience_level', ['Entry', 'Junior', 'Mid-Level', 'Senior', 'Director', 'Executive']);
```

### Work Location Enum
```typescript
export const workLocationEnum = pgEnum('work_location', ['REMOTE', 'HYBRID', 'ON_SITE']);
```

### Job Type Enum
```typescript
export const jobTypeEnum = pgEnum('job_type', [
  'FULL_TIME',
  'PART_TIME',
  'PERMANENT',
  'FIXED_TERM_CONTRACT',
  'CASUAL',
  'SEASONAL',
  'FREELANCE',
  'APPRENTICESHIP',
  'INTERNSHIP'
]);
```

### Job Status Enum
```typescript
export const jobStatusEnum = pgEnum('job_status', [
  'DRAFT',
  'PENDING_PAYMENT',
  'ACTIVE',
  'EXPIRED',
  'FILLED',
  'DELETED'
]);
```

### Application Status Enum
```typescript
export const applicationStatusEnum = pgEnum('application_status', [
  'APPLIED',
  'REVIEWING',
  'SHORTLISTED',
  'INTERVIEW_SCHEDULED',
  'INTERVIEWED',
  'OFFER_EXTENDED',
  'HIRED',
  'REJECTED',
  'WITHDRAWN'
]);
```

### Schedule Type Enum
```typescript
export const scheduleTypeEnum = pgEnum('schedule_type', [
  'MONDAY_TO_FRIDAY',
  'WEEKENDS',
  'EIGHT_HOUR_SHIFT',
  'DAY_SHIFT',
  'EVENING_SHIFT',
  'NIGHT_SHIFT',
  'MORNING_SHIFT',
  'OVERTIME',
  'ON_CALL'
]);
```

### Salary Frequency Enum
```typescript
export const salaryFrequencyEnum = pgEnum('salary_frequency', ['HOUR', 'DAY', 'WEEK', 'MONTH', 'YEAR']);
```

### Salary Display Type Enum
```typescript
export const salaryDisplayTypeEnum = pgEnum('salary_display_type', ['RANGE', 'FIXED', 'STARTING_AMOUNT', 'MAXIMUM_AMOUNT', 'NEGOTIABLE']);
```

### Contract Period Enum
```typescript
export const contractPeriodEnum = pgEnum('contract_period', ['DAYS', 'WEEKS', 'MONTHS', 'YEARS']);
```

### Application Method Enum
```typescript
export const applicationMethodEnum = pgEnum('application_method', ['EMAIL', 'WEBSITE', 'PHONE', 'IN_PERSON', 'PLATFORM']);
```

### Company Size Enum
```typescript
export const companySizeEnum = pgEnum('company_size', ['1-10', '11-50', '51-200', '201-500', '500+']);
```

## Type Definitions

```typescript
// Profile Types
export type Profile = InferSelectModel<typeof profiles>;
export type NewProfile = InferInsertModel<typeof profiles>;

// Candidate Types
export type CandidateProfile = InferSelectModel<typeof candidateProfiles>;
export type NewCandidateProfile = InferInsertModel<typeof candidateProfiles>;

// Skill Types
export type Skill = InferSelectModel<typeof skills>;
export type NewSkill = InferInsertModel<typeof skills>;

// Education Types
export type Education = InferSelectModel<typeof education>;
export type NewEducation = InferInsertModel<typeof education>;

// Experience Types
export type Experience = InferSelectModel<typeof experience>;
export type NewExperience = InferInsertModel<typeof experience>;

// Application Types
export type Application = InferSelectModel<typeof applications>;
export type NewApplication = InferInsertModel<typeof applications>;

// Saved Job Types
export type SavedJob = InferSelectModel<typeof savedJobs>;
export type NewSavedJob = InferInsertModel<typeof savedJobs>;

// Job Types
export type Job = InferSelectModel<typeof jobs>;
export type NewJob = InferInsertModel<typeof jobs>;

// Location Types
export type Location = InferSelectModel<typeof locations>;
export type NewLocation = InferInsertModel<typeof locations>;

// Industry Types
export type Industry = InferSelectModel<typeof industries>;
export type NewIndustry = InferInsertModel<typeof industries>;
```

## Relations

### Candidate Profile Relations
```typescript
export const candidateProfilesRelations = relations(candidateProfiles, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [candidateProfiles.profileId],
    references: [profiles.id],
    relationName: 'candidateBaseProfile'
  }),
  skills: many(candidateSkills),
  applications: many(applications),
  education: many(education),
  experience: many(experience)
}));
```

### Profile Relations (Candidate-specific)
```typescript
export const profilesRelations = relations(profiles, ({ one, many }) => ({
  candidateProfile: one(candidateProfiles, {
    fields: [profiles.id],
    references: [candidateProfiles.profileId],
  }),
  savedJobs: many(savedJobs),
  submittedApplications: many(applications),
}));
```

## Important Notes

1. **Soft Deletes**: All tables use a `deleted` boolean field for soft deletes instead of actually removing records.

2. **Timestamps**: All tables include `createdAt` and `updatedAt` timestamps that are automatically managed.

3. **Indexes**: Tables include appropriate indexes for common query patterns and foreign key relationships.

4. **Unique Constraints**: Junction tables (like `candidateSkills`, `savedJobs`) have unique constraints to prevent duplicate relationships.

5. **Cascade Deletes**: Foreign key relationships use `onDelete: 'cascade'` to automatically clean up related records when a parent record is deleted.

6. **Nullable Fields**: Many fields are nullable to allow for progressive profile completion by candidates.

7. **Array Fields**: Some fields like `schedule`, `benefits`, `supplementalPay`, and `languageRequirements` use PostgreSQL array types.