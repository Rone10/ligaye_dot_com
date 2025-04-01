```typescript

// NEW VERSION
import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  pgEnum,
  primaryKey,
  index,
  unique,
  uniqueIndex,
  foreignKey // Ensure foreignKey is imported if needed for explicit constraints, though references implies it.
} from 'drizzle-orm/pg-core';
import { relations, InferInsertModel, InferSelectModel } from 'drizzle-orm'; // Use InferSelectModel for select types

// --- Enums ---

// Core Enums
export const userRoleEnum = pgEnum('user_role', ['employer', 'candidate']);
export const workLocationEnum = pgEnum('work_location', ['REMOTE', 'HYBRID', 'ON_SITE']);
export const salaryFrequencyEnum = pgEnum('salary_frequency', ['HOUR', 'DAY', 'WEEK', 'MONTH', 'YEAR']);
export const companySizeEnum = pgEnum('company_size', ['1-10', '11-50', '51-200', '201-500', '500+']);
export const experienceLevelEnum = pgEnum('experience_level', ['Entry', 'Junior', 'Mid-Level', 'Senior', 'Director', 'Executive']);

// Job Specific Enums (Refined)
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
export const jobStatusEnum = pgEnum('job_status', [ // New: Replacing isActive/deleted
  'DRAFT',
  'PENDING_PAYMENT',
  'ACTIVE',
  'EXPIRED',
  'FILLED',
  'DELETED' // Soft delete status
]);
export const contractPeriodEnum = pgEnum('contract_period', ['DAYS', 'WEEKS', 'MONTHS', 'YEARS']);
export const applicationMethodEnum = pgEnum('application_method', ['EMAIL', 'WEBSITE', 'PHONE', 'IN_PERSON', 'PLATFORM']); // Added PLATFORM
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
export const salaryDisplayTypeEnum = pgEnum('salary_display_type', ['RANGE', 'FIXED', 'STARTING_AMOUNT', 'MAXIMUM_AMOUNT', 'NEGOTIABLE']);

// Application Enum
export const applicationStatusEnum = pgEnum('application_status', [
  'APPLIED', // Changed from PENDING for clarity
  'REVIEWING',
  'SHORTLISTED',
  'INTERVIEW_SCHEDULED',
  'INTERVIEWED',
  'OFFER_EXTENDED',
  'HIRED',
  'REJECTED',
  'WITHDRAWN' // Added candidate withdrawal
]);

// Tender Enums
export const tenderTypeEnum = pgEnum('tender_type', ['TENDER', 'PUBLIC_NOTICE']);
export const tenderStatusEnum = pgEnum('tender_status', ['DRAFT', 'PUBLISHED', 'CLOSED', 'CANCELLED', 'DELETED']); // Added DELETED status

// Country enum (if needed globally, otherwise maybe just Gambia focus)
// export const countryEnum = pgEnum('country', ['GAMBIA', 'SENEGAL', 'NIGERIA', 'GHANA', 'CANADA', 'USA', 'UK', 'OTHER']);


// --- Tables ---

// Profiles (Base User Information - Simplified)
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique(), // Link to Supabase Auth user
  fullName: text('full_name').notNull(),
  // email removed - rely on Supabase Auth
  avatarUrl: text('avatar_url'), // URL to Supabase Storage
  role: userRoleEnum('role').notNull(),
  deleted: boolean('deleted').default(false).notNull(), // Standard soft delete
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    // emailIdx removed
    userIdIdx: index('profiles_user_id_idx').on(table.userId),
    roleIdx: index('profiles_role_idx').on(table.role),
    deletedIdx: index('profiles_deleted_idx').on(table.deleted) // Index soft delete flag
  };
});

// Locations (Structured for The Gambia - Keep as is, good structure)
export const locations = pgTable('locations', {
  id: uuid('id').primaryKey().defaultRandom(),
  region: text('region').notNull(), // e.g., Greater Banjul Area, West Coast Region
  district: text('district'), // e.g., Kombo North, Kanifing
  // town: text('town'), // Less common top-level identifier in Gambia context?
  city: text('city'), // e.g., Banjul, Serekunda, Brikama
  deleted: boolean('deleted').default(false).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    regionIdx: index('locations_region_idx').on(table.region),
    // townIdx: index('locations_town_idx').on(table.town), // Keep if useful
    cityIdx: index('locations_city_idx').on(table.city),
    deletedIdx: index('locations_deleted_idx').on(table.deleted)
  };
});

// Industries Table (Normalized)
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

// Sectors Table (Normalized - for Tenders primarily)
export const sectors = pgTable('sectors', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  deleted: boolean('deleted').default(false).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    nameIdx: index('sectors_name_idx').on(table.name),
    deletedIdx: index('sectors_deleted_idx').on(table.deleted)
  };
});


// Employer Profiles (Normalized Location/Industry)
export const employerProfiles = pgTable('employer_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().unique().references(() => profiles.id, { onDelete: 'cascade' }),
  companyName: text('company_name').notNull(),
  companySize: companySizeEnum('company_size'), // Nullable initially
  industryId: uuid('industry_id').references(() => industries.id), // Nullable initially, FK
  companyDescription: text('company_description'),
  website: text('website'), // Consider URL validation at app level
  locationId: uuid('location_id').references(() => locations.id), // Nullable initially, FK for structured HQ location
  hqAddressDisplay: text('hq_address_display'), // Optional free text address
  companyLogoUrl: text('company_logo_url'), // Renamed from avatarUrl for clarity
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

// Candidate Profiles (Skills field removed)
export const candidateProfiles = pgTable('candidate_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().unique().references(() => profiles.id, { onDelete: 'cascade' }),
  title: text('title'), // Nullable initially, e.g., "Software Engineer"
  experienceLevel: experienceLevelEnum('experience_level'), // Nullable initially
  // skills array removed
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

// Skills Table (Normalized - Master List)
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

// Jobs Table (Revised Status, FKs, Nullability)
export const jobs = pgTable('jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  // employerId removed
  companyId: uuid('company_id').notNull().references(() => employerProfiles.id, { onDelete: 'cascade' }), // Direct link to employer profile
  title: text('title').notNull(),
  description: text('description').notNull(), // Consider text type if very long descriptions needed
  locationId: uuid('location_id').references(() => locations.id), // Nullable (for Remote jobs)
  workLocation: workLocationEnum('work_location').notNull(), // ON_SITE, HYBRID, REMOTE

  // Job post language (from Indeed)
  jobLanguage: text('job_language').default('English'),
  numberOfOpenings: integer('number_of_openings').default(1),
  displayAddress: boolean('display_address').default(true), // Show specific address tied to locationId if ON_SITE/HYBRID?

  // Requirements
  educationRequirements: text('education_requirements').array().default([]), // Free text for now, could normalize later
  experienceRequirements: text('experience_requirements').array().default([]), // Free text
  experienceLevel: experienceLevelEnum('experience_level'), // Nullable? Or default to Entry? Consider if always required.

  // Language requirements
  languageRequirements: text('language_requirements').array(),
  languageTrainingProvided: boolean('language_training_provided').default(false),

  // Job type and schedule
  jobType: jobTypeEnum('job_type').notNull(),
  schedule: scheduleTypeEnum('schedule').array(),
  expectedHours: integer('expected_hours'), // e.g., 40
  hoursType: text('hours_type').default('FIXED'), // e.g., FIXED, MAXIMUM

  // Contract details
  contractLength: integer('contract_length'), // Only if jobType = FIXED_TERM_CONTRACT
  contractPeriod: contractPeriodEnum('contract_period'), // Only if jobType = FIXED_TERM_CONTRACT

  // Start date
  plannedStartDate: timestamp('planned_start_date'),

  // Salary - Add CHECK constraint possibility
  // CHECK (salaryRangeMax >= salaryRangeMin)
  salaryRangeMin: integer('salary_range_min'),
  salaryRangeMax: integer('salary_range_max'),
  salaryCurrency: text('salary_currency').default('GMD').notNull(),
  salaryFrequency: salaryFrequencyEnum('salary_frequency'), // Nullable if salary not specified
  salaryDisplayType: salaryDisplayTypeEnum('salary_display_type').default('NEGOTIABLE'), // Default to Negotiable

  // Supplemental pay & Benefits
  supplementalPay: text('supplemental_pay').array(),
  benefits: text('benefits').array(),

  // Skills required array removed - use jobSkills junction table

  // Application settings
  applicationMethod: applicationMethodEnum('application_method').default('PLATFORM'), // Default to applying via board
  applicationInstructions: text('application_instructions'),
  applicationUrl: text('application_url'), // URL if applicationMethod is WEBSITE
  applicationEmail: text('application_email'), // Email if applicationMethod is EMAIL
  resumeRequired: boolean('resume_required').default(true), // Default to requiring resume
  allowCandidateContact: boolean('allow_candidate_contact').default(false),
  applicationDeadline: timestamp('application_deadline'),

  // Job post metadata
  status: jobStatusEnum('status').default('DRAFT').notNull(), // New status enum
  // isActive removed
  // deleted removed (use status = 'DELETED')
  publishedAt: timestamp('published_at'), // Set when status becomes ACTIVE
  expiresAt: timestamp('expires_at'), // Set based on payment tier duration
  slug: text('slug').unique(), // Make slug unique for URLs
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    // Indexes from original schema, adjusted/added
    companyIdIdx: index('jobs_company_id_idx').on(table.companyId),
    titleIdx: index('jobs_title_idx').on(table.title), // Useful for keyword search if using standard index
    locationIdIdx: index('jobs_location_id_idx').on(table.locationId),
    workLocationIdx: index('jobs_work_location_idx').on(table.workLocation),
    jobTypeIdx: index('jobs_job_type_idx').on(table.jobType),
    experienceLevelIdx: index('jobs_experience_level_idx').on(table.experienceLevel),
    statusIdx: index('jobs_status_idx').on(table.status), // Index new status field
    expiresAtIdx: index('jobs_expires_at_idx').on(table.expiresAt), // Keep for expiry check
    applicationDeadlineIdx: index('jobs_application_deadline_idx').on(table.applicationDeadline),
    plannedStartDateIdx: index('jobs_planned_start_date_idx').on(table.plannedStartDate),
    slugIdx: index('jobs_slug_idx').on(table.slug),

    // Composite indexes for common filtering patterns
    statusExpiresAtIdx: index('jobs_status_expires_at_idx').on(table.status, table.expiresAt), // For finding active jobs
    jobTypeExpLevelIdx: index('jobs_job_type_exp_level_idx').on(table.jobType, table.experienceLevel),
    salaryRangeIdx: index('jobs_salary_range_idx').on(table.salaryRangeMin, table.salaryRangeMax)
    // Consider full-text search index on title/description later
  };
});

// Job Skills (Junction Table - Updated soft delete)
export const jobSkills = pgTable('job_skills', {
  id: uuid('id').primaryKey().defaultRandom(), // Optional PK, composite is fine too
  jobId: uuid('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  skillId: uuid('skill_id').notNull().references(() => skills.id, { onDelete: 'cascade' }),
  deleted: boolean('deleted').default(false).notNull(), // Use standard soft delete
  createdAt: timestamp('created_at').notNull().defaultNow(),
  // No updatedAt needed unless tracking changes to the relationship itself
}, (table) => {
  // Primary key can be composite to enforce uniqueness directly
  // primaryKey({ columns: [table.jobId, table.skillId] }) // Alternative to unique index + separate PK
  return {
    jobIdIdx: index('job_skills_job_id_idx').on(table.jobId),
    skillIdIdx: index('job_skills_skill_id_idx').on(table.skillId),
    uniqueJobSkill: uniqueIndex('job_skill_unique_idx').on(table.jobId, table.skillId), // Ensures pair uniqueness
    deletedIdx: index('job_skills_deleted_idx').on(table.deleted)
  };
});

// Candidate Skills (Junction Table - Updated soft delete)
export const candidateSkills = pgTable('candidate_skills', {
  id: uuid('id').primaryKey().defaultRandom(), // Optional PK
  candidateProfileId: uuid('candidate_profile_id').notNull().references(() => candidateProfiles.id, { onDelete: 'cascade' }),
  skillId: uuid('skill_id').notNull().references(() => skills.id, { onDelete: 'cascade' }),
  deleted: boolean('deleted').default(false).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => {
  // primaryKey({ columns: [table.candidateProfileId, table.skillId] }) // Alternative PK
  return {
    candidateIdIdx: index('candidate_skills_candidate_profile_id_idx').on(table.candidateProfileId),
    skillIdIdx: index('candidate_skills_skill_id_idx').on(table.skillId),
    uniqueCandidateSkill: uniqueIndex('candidate_skill_unique_idx').on(table.candidateProfileId, table.skillId),
    deletedIdx: index('candidate_skills_deleted_idx').on(table.deleted)
  };
});

// Job Industries (Junction Table - Updated soft delete)
export const jobIndustries = pgTable('job_industries', {
  id: uuid('id').primaryKey().defaultRandom(), // Optional PK
  jobId: uuid('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  industryId: uuid('industry_id').notNull().references(() => industries.id, { onDelete: 'cascade' }),
  deleted: boolean('deleted').default(false).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(), // Keep if tracking relation changes needed
}, (table) => {
  // primaryKey({ columns: [table.jobId, table.industryId] }) // Alternative PK
  return {
    jobIdIdx: index('job_industries_job_id_idx').on(table.jobId),
    industryIdIdx: index('job_industries_industry_id_idx').on(table.industryId),
    uniqueJobIndustry: uniqueIndex('job_industry_unique_idx').on(table.jobId, table.industryId),
    deletedIdx: index('job_industries_deleted_idx').on(table.deleted)
  };
});

// Education Table (Linked to Candidate Profile)
export const education = pgTable('education', {
    id: uuid('id').primaryKey().defaultRandom(),
    candidateProfileId: uuid('candidate_profile_id').notNull().references(() => candidateProfiles.id, { onDelete: 'cascade' }),
    institution: text('institution').notNull(),
    degree: text('degree').notNull(),
    fieldOfStudy: text('field_of_study'),
    startDate: timestamp('start_date'), // Use timestamp or date type based on required precision
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

// Experience Table (Linked to Candidate Profile)
export const experience = pgTable('experience', {
    id: uuid('id').primaryKey().defaultRandom(),
    candidateProfileId: uuid('candidate_profile_id').notNull().references(() => candidateProfiles.id, { onDelete: 'cascade' }),
    jobTitle: text('job_title').notNull(),
    companyName: text('company_name').notNull(),
    location: text('location'), // Free text or link to locations table? Keep free text for simplicity here.
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


// Applications (Updated Status, Standard Soft Delete)
export const applications = pgTable('applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  candidateProfileId: uuid('candidate_profile_id').notNull().references(() => candidateProfiles.id, { onDelete: 'cascade' }),
  status: applicationStatusEnum('status').default('APPLIED').notNull(),
  resumeUrl: text('resume_url'), // Specific resume used for this application (if different from profile)
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
    // Composite index for querying applications for a specific job/candidate
    jobCandidateUniqueIdx: uniqueIndex('applications_job_candidate_unique_idx').on(table.jobId, table.candidateProfileId) // Should application be unique per job/candidate? Yes.
  };
});

// Saved Jobs (Standard Soft Delete)
export const savedJobs = pgTable('saved_jobs', {
  // id: uuid('id').primaryKey().defaultRandom(), // PK can be composite
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }), // User who saved
  jobId: uuid('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  deleted: boolean('deleted').default(false).notNull(), // Allows unsaving
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => {
  return {
    // Define composite primary key
    pk: primaryKey({ columns: [table.userId, table.jobId] }),
    // Indexes for querying by user or job separately might still be useful
    userIdIdx: index('saved_jobs_user_id_idx').on(table.userId),
    jobIdIdx: index('saved_jobs_job_id_idx').on(table.jobId),
    deletedIdx: index('saved_jobs_deleted_idx').on(table.deleted)
  };
});

// Tenders (Normalized Location/Sector, Standard Soft Delete)
export const tenders = pgTable('tenders', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  organizationName: text('organization_name').notNull(), // Could link to employerProfiles or a separate orgs table
  tenderType: tenderTypeEnum('tender_type').notNull(),
  sectorId: uuid('sector_id').references(() => sectors.id), // FK to sectors
  locationId: uuid('location_id').references(() => locations.id), // FK to locations
  deadline: timestamp('deadline'), // Removed timezone, handle timezone at application level if needed
  budgetRange: text('budget_range'),
  contactInformation: text('contact_information'),
  externalLink: text('external_link'),
  status: tenderStatusEnum('status').notNull().default('DRAFT'),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }), // User who posted
  deleted: boolean('deleted').default(false).notNull(), // Standard soft delete
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    titleIdx: index('tenders_title_idx').on(table.title),
    organizationNameIdx: index('tenders_organization_name_idx').on(table.organizationName),
    tenderTypeIdx: index('tenders_tender_type_idx').on(table.tenderType),
    sectorIdIdx: index('tenders_sector_id_idx').on(table.sectorId),
    locationIdIdx: index('tenders_location_id_idx').on(table.locationId),
    statusIdx: index('tenders_status_idx').on(table.status),
    deadlineIdx: index('tenders_deadline_idx').on(table.deadline),
    userIdIdx: index('tenders_user_id_idx').on(table.userId),
    deletedIdx: index('tenders_deleted_idx').on(table.deleted)
  };
});

// Payments Table (No changes needed from original good design)
export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').references(() => jobs.id, { onDelete: 'set null' }), // Nullable if payment not tied to a job, or job deleted
  employerProfileId: uuid('employer_profile_id').notNull().references(() => employerProfiles.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(), // Amount in smallest currency unit (e.g., bututs for GMD)
  currency: text('currency').notNull().default('GMD'),
  method: text('method').notNull(), // 'stripe', 'cash', 'mobile_money'
  status: text('status').notNull(), // 'pending', 'succeeded', 'failed'
  transactionId: text('transaction_id'), // Stripe charge ID or external ref
  metadata: text('metadata'), // Store JSON as text or use jsonb type if available/needed
  deleted: boolean('deleted').default(false).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    jobIdIdx: index('payments_job_id_idx').on(table.jobId),
    employerProfileIdIdx: index('payments_employer_profile_id_idx').on(table.employerProfileId),
    statusIdx: index('payments_status_idx').on(table.status),
    methodIdx: index('payments_method_idx').on(table.method),
    deletedIdx: index('payments_deleted_idx').on(table.deleted)
  };
});


// --- Relations ---

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  // One-to-one relationships based on role
  candidateProfile: one(candidateProfiles, {
    fields: [profiles.id],
    references: [candidateProfiles.profileId],
  }),
  employerProfile: one(employerProfiles, {
    fields: [profiles.id],
    references: [employerProfiles.profileId],
  }),
  // One-to-many relationships
  postedJobs: many(jobs), // Jobs posted by this profile (if employer) - Requires adjusted relation definition
  postedTenders: many(tenders), // Tenders posted by this profile
  savedJobs: many(savedJobs), // Jobs saved by this profile (if candidate)
  submittedApplications: many(applications) // Applications submitted by this profile (if candidate) - Requires adjusted relation definition
}));

export const locationsRelations = relations(locations, ({ many }) => ({
  employerProfiles: many(employerProfiles),
  jobs: many(jobs),
  tenders: many(tenders)
}));

export const industriesRelations = relations(industries, ({ many }) => ({
  employerProfiles: many(employerProfiles),
  jobIndustries: many(jobIndustries),
}));

export const sectorsRelations = relations(sectors, ({ many }) => ({
  tenders: many(tenders),
}));

export const employerProfilesRelations = relations(employerProfiles, ({ one, many }) => ({
  profile: one(profiles, { // Link back to base profile
    fields: [employerProfiles.profileId],
    references: [profiles.id],
    relationName: 'employerBaseProfile'
  }),
  location: one(locations, { // Link to structured location
    fields: [employerProfiles.locationId],
    references: [locations.id],
  }),
  industry: one(industries, { // Link to industry
    fields: [employerProfiles.industryId],
    references: [industries.id],
  }),
  jobs: many(jobs), // Jobs posted by this company
  payments: many(payments) // Payments made by this employer
}));

export const candidateProfilesRelations = relations(candidateProfiles, ({ one, many }) => ({
  profile: one(profiles, { // Link back to base profile
    fields: [candidateProfiles.profileId],
    references: [profiles.id],
    relationName: 'candidateBaseProfile'
  }),
  skills: many(candidateSkills), // Link to candidate's skills via junction table
  applications: many(applications), // Applications submitted by this candidate
  education: many(education), // Candidate's education history
  experience: many(experience) // Candidate's work experience
}));

export const skillsRelations = relations(skills, ({ many }) => ({
  jobSkills: many(jobSkills), // Link to jobs requiring this skill
  candidateSkills: many(candidateSkills) // Link to candidates possessing this skill
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  company: one(employerProfiles, { // Link to the posting company profile
    fields: [jobs.companyId],
    references: [employerProfiles.id],
  }),
  location: one(locations, { // Link to the job's structured location
    fields: [jobs.locationId],
    references: [locations.id]
  }),
  jobSkills: many(jobSkills), // Link to required skills via junction table
  jobIndustries: many(jobIndustries), // Link to relevant industries via junction table
  applications: many(applications), // Applications received for this job
  savedByUsers: many(savedJobs) // Link to users who saved this job
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

export const candidateSkillsRelations = relations(candidateSkills, ({ one }) => ({
  candidateProfile: one(candidateProfiles, {
    fields: [candidateSkills.candidateProfileId],
    references: [candidateProfiles.id],
  }),
  skill: one(skills, {
    fields: [candidateSkills.skillId],
    references: [skills.id],
  }),
}));

export const jobIndustriesRelations = relations(jobIndustries, ({ one }) => ({
  job: one(jobs, {
    fields: [jobIndustries.jobId],
    references: [jobs.id],
  }),
  industry: one(industries, {
    fields: [jobIndustries.industryId],
    references: [industries.id],
  }),
}));

export const educationRelations = relations(education, ({ one }) => ({
    candidateProfile: one(candidateProfiles, {
        fields: [education.candidateProfileId],
        references: [candidateProfiles.id],
    }),
}));

export const experienceRelations = relations(experience, ({ one }) => ({
    candidateProfile: one(candidateProfiles, {
        fields: [experience.candidateProfileId],
        references: [candidateProfiles.id],
    }),
}));


export const applicationsRelations = relations(applications, ({ one }) => ({
  job: one(jobs, {
    fields: [applications.jobId],
    references: [jobs.id],
  }),
  candidateProfile: one(candidateProfiles, { // Link to the specific candidate profile
    fields: [applications.candidateProfileId],
    references: [candidateProfiles.id],
  }),
}));

export const savedJobsRelations = relations(savedJobs, ({ one }) => ({
  user: one(profiles, { // Link to the user who saved the job
    fields: [savedJobs.userId],
    references: [profiles.id],
  }),
  job: one(jobs, { // Link to the saved job
    fields: [savedJobs.jobId],
    references: [jobs.id],
  }),
}));

export const tendersRelations = relations(tenders, ({ one }) => ({
  user: one(profiles, { // Link to the user who posted the tender
    fields: [tenders.userId],
    references: [profiles.id],
  }),
  location: one(locations, { // Link to tender location
    fields: [tenders.locationId],
    references: [locations.id],
  }),
  sector: one(sectors, { // Link to tender sector
    fields: [tenders.sectorId],
    references: [sectors.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  job: one(jobs, { // Link to the job being paid for (if applicable)
    fields: [payments.jobId],
    references: [jobs.id],
  }),
  employerProfile: one(employerProfiles, { // Link to the employer making the payment
    fields: [payments.employerProfileId],
    references: [employerProfiles.id],
  }),
}));

// --- Type Definitions (Using InferSelectModel for read types) ---

// Enum Types (Export if needed in application code)
// export type UserRole = (typeof userRoleEnum.enumValues)[number];
// ... other enums

// Profile Types
export type Profile = InferSelectModel<typeof profiles>;
export type NewProfile = InferInsertModel<typeof profiles>;

// Location Types
export type Location = InferSelectModel<typeof locations>;
export type NewLocation = InferInsertModel<typeof locations>;

// Industry Types
export type Industry = InferSelectModel<typeof industries>;
export type NewIndustry = InferInsertModel<typeof industries>;

// Sector Types
export type Sector = InferSelectModel<typeof sectors>;
export type NewSector = InferInsertModel<typeof sectors>;

// Employer Types
export type EmployerProfile = InferSelectModel<typeof employerProfiles>;
export type NewEmployerProfile = InferInsertModel<typeof employerProfiles>;

// Candidate Types
export type CandidateProfile = InferSelectModel<typeof candidateProfiles>;
export type NewCandidateProfile = InferInsertModel<typeof candidateProfiles>;

// Skill Types
export type Skill = InferSelectModel<typeof skills>;
export type NewSkill = InferInsertModel<typeof skills>;

// Job Types
export type Job = InferSelectModel<typeof jobs>;
export type NewJob = InferInsertModel<typeof jobs>;

// Job Skill Types
export type JobSkill = InferSelectModel<typeof jobSkills>;
export type NewJobSkill = InferInsertModel<typeof jobSkills>;

// Candidate Skill Types
export type CandidateSkill = InferSelectModel<typeof candidateSkills>;
export type NewCandidateSkill = InferInsertModel<typeof candidateSkills>;

// Job Industry Types
export type JobIndustry = InferSelectModel<typeof jobIndustries>;
export type NewJobIndustry = InferInsertModel<typeof jobIndustries>;

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

// Tender Types
export type Tender = InferSelectModel<typeof tenders>;
export type NewTender = InferInsertModel<typeof tenders>;

// Payment Types
export type Payment = InferSelectModel<typeof payments>;
export type NewPayment = InferInsertModel<typeof payments>;




























// OLD VERSION

// import {
//   pgTable,
//   uuid,
//   text,
//   timestamp,
//   boolean,
//   integer,
//   pgEnum,
//   primaryKey,
//   index,
//   unique,
//   uniqueIndex
// } from 'drizzle-orm/pg-core';
// import { relations, InferInsertModel, InferModel } from 'drizzle-orm';


// // First, let's add the necessary new enums
// export const jobTypeEnum = pgEnum('job_type', [
//   'FULL_TIME', 
//   'PART_TIME', 
//   'PERMANENT', 
//   'FIXED_TERM_CONTRACT', 
//   'CASUAL',
//   'SEASONAL',
//   'FREELANCE',
//   'APPRENTICESHIP',
//   'INTERNSHIP'
// ]); // Updated to match Indeed's job type options

// export const contractPeriodEnum = pgEnum('contract_period', ['DAYS', 'WEEKS', 'MONTHS', 'YEARS']);
// export const applicationMethodEnum = pgEnum('application_method', ['EMAIL', 'WEBSITE', 'PHONE', 'IN_PERSON']);
// export const scheduleTypeEnum = pgEnum('schedule_type', [
//   'MONDAY_TO_FRIDAY',
//   'WEEKENDS',
//   'EIGHT_HOUR_SHIFT',
//   'DAY_SHIFT',
//   'EVENING_SHIFT',
//   'NIGHT_SHIFT',
//   'MORNING_SHIFT',
//   'OVERTIME',
//   'ON_CALL'
// ]);


// // Country enum for standardization
// export const countryEnum = pgEnum('country', [
//   'GAMBIA', 
//   'SENEGAL', 
//   'NIGERIA', 
//   'GHANA', 
//   'CANADA',
//   'USA',
//   'UK',
//   'OTHER'
// ]);



// // Enums
// export const userRoleEnum = pgEnum('user_role', ['employer', 'candidate']);
// // export const jobTypeEnum = pgEnum('job_type', ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY']);
// export const workLocationEnum = pgEnum('work_location', ['REMOTE', 'HYBRID', 'ON_SITE']);
// export const salaryFrequencyEnum = pgEnum('salary_frequency', ['HOUR', 'DAY', 'WEEK', 'MONTH', 'YEAR']);
// export const applicationStatusEnum = pgEnum('application_status', [
//   'PENDING',
//   'REVIEWING',
//   'SHORTLISTED',
//   'INTERVIEW_SCHEDULED',
//   'INTERVIEWED',
//   'OFFER_EXTENDED',
//   'HIRED',
//   'REJECTED'
// ]);
// export const tenderType = pgEnum('tender_type', ['TENDER', 'PUBLIC_NOTICE']);
// export const tenderStatus = pgEnum('tender_status', ['DRAFT', 'PUBLISHED', 'CLOSED', 'CANCELLED']);
// export const companySizeEnum = pgEnum('company_size', ['1-10', '11-50', '51-200', '201-500', '500+']);
// export const experienceLevelEnum = pgEnum('experience_level', ['Entry', 'Junior', 'Mid-Level', 'Senior', 'Director', 'Executive']);

// // --- Tables ---

// // Profiles (Base User Information)
// export const profiles = pgTable('profiles', {
//   id: uuid('id').primaryKey().defaultRandom(),
//   userId: uuid('user_id').notNull().unique(), // Link to Supabase Auth user
//   fullName: text('full_name').notNull(),
//   email: text('email').notNull(), // Ensure this is unique if not using Supabase Auth email
//   avatarUrl: text('avatar_url'), // URL to Supabase Storage
//   role: userRoleEnum('role').notNull(),
//   deleted: boolean('deleted').default(false), // Soft delete pattern
//   createdAt: timestamp('created_at').notNull().defaultNow(),
//   updatedAt: timestamp('updated_at').notNull().defaultNow(),
// }, (table) => {
//   return {
//     emailIdx: index('email_idx').on(table.email),
//     userIdIdx: index('user_id_idx').on(table.userId),
//     roleIdx: index('role_idx').on(table.role)
//   };
// });

// // Employer Profiles
// export const employerProfiles = pgTable('employer_profiles', {
//   id: uuid('id').primaryKey().defaultRandom(),
//   profileId: uuid('profile_id').notNull().unique().references(() => profiles.id, { onDelete: 'cascade' }),
//   companyName: text('company_name').notNull(),
//   companySize: companySizeEnum('company_size').notNull(),
//   industry: text('industry').notNull(), // Consider a separate industries table (many-to-many)
//   companyDescription: text('company_description'),
//   website: text('website'),
//   location: text('location').notNull(),
//   deleted: boolean('deleted').default(false), // Soft delete pattern
//   createdAt: timestamp('created_at').notNull().defaultNow(),
//   updatedAt: timestamp('updated_at').notNull().defaultNow(),
// }, (table) => {
//   return {
//     companyNameIdx: index('company_name_idx').on(table.companyName),
//     industryIdx: index('industry_idx').on(table.industry),
//     locationIdx: index('employer_location_idx').on(table.location)
//   };
// });

// // Candidate Profiles
// export const candidateProfiles = pgTable('candidate_profiles', {
//   id: uuid('id').primaryKey().defaultRandom(),
//   profileId: uuid('profile_id').notNull().unique().references(() => profiles.id, { onDelete: 'cascade' }),
//   title: text('title').notNull(),
//   experienceLevel: experienceLevelEnum('experience_level').notNull(),
//   skills: text('skills').array(), // @deprecated - Use candidateSkills junction table instead
//   resumeUrl: text('resume_url'), // URL to Supabase Storage
//   linkedinUrl: text('linkedin_url'),
//   githubUrl: text('github_url'),
//   bio: text('bio'),
//   deleted: boolean('deleted').default(false), // Soft delete pattern
//   createdAt: timestamp('created_at').notNull().defaultNow(),
//   updatedAt: timestamp('updated_at').notNull().defaultNow(),
// }, (table) => {
//   return {
//     experienceLevelIdx: index('experience_level_idx').on(table.experienceLevel),
//     titleIdx: index('title_idx').on(table.title)
//   };
// });




// // Expanded locations table
// // export const locations = pgTable('locations', {
// //   id: uuid('id').primaryKey().defaultRandom(),
  
// //   // Address components
// //   streetNumber: text('street_number'), // Building number (e.g., "103")
// //   streetName: text('street_name'), // Street name (e.g., "Broome Rd")
// //   streetAddress: text('street_address'), // Full street address (e.g., "103 Broome Rd")
// //   unit: text('unit'), // Apartment/unit/suite number
// //   neighborhood: text('neighborhood'), // Neighborhood or area within town
  
// //   // City/Municipality information
// //   town: text('town'), // Town or city (e.g., "Brockville")
  
// //   // Regional divisions
// //   district: text('district'), // District within region
// //   region: text('region').notNull(), // State/Province/Region (e.g., "ON")
// //   regionFull: text('region_full'), // Full name of region (e.g., "Ontario")
  
// //   // Country information
// //   country: countryEnum('country').default('GAMBIA').notNull(), // Country code
// //   countryFull: text('country_full').default('The Gambia'), // Full country name
  
// //   // Postal information
// //   postalCode: text('postal_code'), // ZIP/Postal code
  
// //   // Geocoding for map functionality
// //   latitude: text('latitude'), // Decimal latitude coordinate
// //   longitude: text('longitude'), // Decimal longitude coordinate
  
// //   // Location type
// //   locationType: text('location_type').default('IN_PERSON'), // In-person, remote, hybrid, etc.
  
// //   // Display preferences
// //   displayOnJob: boolean('display_on_job').default(true), // Whether to show on job listing
// //   preciseLoc: boolean('precise_loc').default(true), // Whether to show precise location vs general area
  
// //   // Metadata
// //   formattedAddress: text('formatted_address'), // Full formatted address
// //   placeId: text('place_id'), // For integration with mapping services
// //   deleted: boolean('deleted').default(false), // Soft delete pattern
// //   createdAt: timestamp('created_at').notNull().defaultNow(),
// //   updatedAt: timestamp('updated_at').notNull().defaultNow(),
// // }, (table) => {
// //   return {
// //     // Indexes for common queries
// //     regionIdx: index('region_idx').on(table.region),
// //     townIdx: index('town_idx').on(table.town),
// //     countryIdx: index('country_idx').on(table.country),
// //     postalCodeIdx: index('postal_code_idx').on(table.postalCode),
    
// //     // Geocoding index for location-based queries
// //     geoIdx: index('geo_idx').on(table.latitude, table.longitude),
    
// //     // Full text search on address
// //     streetAddressIdx: index('street_address_idx').on(table.streetAddress),
    
// //     // Combined queries
// //     townRegionIdx: index('town_region_idx').on(table.town, table.region),
    
// //     // Soft delete index
// //     deletedIdx: index('location_deleted_idx').on(table.deleted)
// //   };
// // });

// // Location relations
// // export const locationRelations = relations(locations, ({ many }) => ({
// //   jobs: many(jobs)
// // }));



// // Locations (Structured for The Gambia)
// export const locations = pgTable('locations', {
//   id: uuid('id').primaryKey().defaultRandom(),
//   region: text('region').notNull(),
//   district: text('district'),
//   town: text('town'),
//   city: text('city'),
//   deleted: boolean('deleted').default(false), // Soft delete pattern
//   createdAt: timestamp('created_at').notNull().defaultNow(),
//   updatedAt: timestamp('updated_at').notNull().defaultNow(),
// }, (table) => {
//   return {
//     regionIdx: index('region_idx').on(table.region),
//     townIdx: index('town_idx').on(table.town),
//     cityIdx: index('city_idx').on(table.city)
//   };
// });



// // Updated Jobs table
// export const jobs = pgTable('jobs', {
//   id: uuid('id').primaryKey().defaultRandom(),
//   employerId: uuid('employer_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
//   companyId: uuid('company_id').notNull().references(() => employerProfiles.id, { onDelete: 'cascade' }),
//   title: text('title').notNull(),
//   locationId: uuid('location_id').references(() => locations.id),
  
//   // Job posting language (from Indeed)
//   jobLanguage: text('job_language').default('English'), // New: Language the job post is written in
  
//   // Number of openings (from Indeed)
//   numberOfOpenings: integer('number_of_openings').default(1), // New: Number of people to hire for this position
  
//   // Display address option (from Indeed)
//   displayAddress: boolean('display_address').default(true), // New: Whether to show full address in job post
  
//   // Core job details
//   description: text('description').notNull(),
//   educationRequirements: text('education_requirements').array().default([]),
//   experienceRequirements: text('experience_requirements').array().default([]),
//   experienceLevel: experienceLevelEnum('experience_level').notNull(),
  
//   // Language requirements (from Indeed)
//   languageRequirements: text('language_requirements').array(), // New: Required languages for the job
//   languageTrainingProvided: boolean('language_training_provided').default(false), // New: Whether language training is offered
  
//   // Job type and schedule
//   jobType: jobTypeEnum('job_type').notNull(), // Updated enum with more options
//   workLocation: workLocationEnum('work_location').notNull(),
  
//   // Schedule details (from Indeed)
//   schedule: scheduleTypeEnum('schedule').array(), // New: Work schedule options (Mon-Fri, weekends, etc)
//   expectedHours: integer('expected_hours'), // New: Hours per week
//   hoursType: text('hours_type').default('FIXED'), // New: Fixed or Maximum hours
  
//   // Contract details for fixed-term contracts (from Indeed)
//   contractLength: integer('contract_length'), // New: Length of contract
//   contractPeriod: contractPeriodEnum('contract_period'), // New: Period unit (days, months, etc)
  
//   // Start date (from Indeed)
//   plannedStartDate: timestamp('planned_start_date'), // New: Expected job start date
  
//   // Salary information
//   salaryRangeMin: integer('salary_range_min'),
//   salaryRangeMax: integer('salary_range_max'),
//   salaryCurrency: text('salary_currency').default('GMD'),
//   salaryFrequency: salaryFrequencyEnum('salary_frequency').notNull(),
//   salaryDisplayType: text('salary_display_type').default('RANGE'), // New: How to show salary (range, fixed, etc)
  
//   // Supplemental pay (from Indeed)
//   supplementalPay: text('supplemental_pay').array(), // New: Additional compensation types (overtime, bonuses, etc)
  
//   // Benefits
//   benefits: text('benefits').array(),
  
//   // Skills and requirements
//   skillsRequired: text('skills_required').array(), // @deprecated - Use jobSkills junction table instead
  
//   // Application settings (from Indeed)
//   applicationMethod: applicationMethodEnum('application_method'), // New: How candidates should apply
//   applicationInstructions: text('application_instructions'), // New: Special instructions for applicants
//   resumeRequired: boolean('resume_required').default(false), // New: Whether resume is mandatory
//   allowCandidateContact: boolean('allow_candidate_contact').default(false), // New: Let candidates contact employer directly
//   applicationDeadline: timestamp('application_deadline'),
  
//   // Job post metadata
//   slug: text('slug'),
//   isActive: boolean('is_active').default(true),
//   deleted: boolean('deleted').default(false),
//   expiresAt: timestamp('expires_at'),
//   createdAt: timestamp('created_at').notNull().defaultNow(),
//   updatedAt: timestamp('updated_at').notNull().defaultNow(),
// }, (table) => {
//   return {
//     titleIdx: index('job_title_idx').on(table.title),
//     employerIdIdx: index('employer_id_idx').on(table.employerId),
//     companyIdIdx: index('company_id_idx').on(table.companyId),
//     jobTypeIdx: index('job_type_idx').on(table.jobType),
//     workLocationIdx: index('work_location_idx').on(table.workLocation),
//     experienceLevelIdx: index('job_experience_level_idx').on(table.experienceLevel),
//     isActiveIdx: index('is_active_idx').on(table.isActive),
//     deletedIdx: index('job_deleted_idx').on(table.deleted),
//     applicationDeadlineIdx: index('application_deadline_idx').on(table.applicationDeadline),
//     plannedStartDateIdx: index('planned_start_date_idx').on(table.plannedStartDate), // New index for start date
//     // Composite indexes for common filtering patterns
//     jobTypeExpLevelIdx: index('job_type_exp_level_idx').on(table.jobType, table.experienceLevel),
//     salaryRangeIdx: index('salary_range_idx').on(table.salaryRangeMin, table.salaryRangeMax)
//   };
// });




// // // Jobs
// // export const jobs = pgTable('jobs', {
// //   id: uuid('id').primaryKey().defaultRandom(),
// //   employerId: uuid('employer_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
// //   companyId: uuid('company_id').notNull().references(() => employerProfiles.id, { onDelete: 'cascade' }), // Reference to employerProfiles
// //   title: text('title').notNull(),
// //   locationId: uuid('location_id').references(() => locations.id), // Foreign key to locations
// //   description: text('description').notNull(),
// //   educationRequirements: text('education_requirements').array().default([]),
// //   experienceRequirements: text('experience_requirements').array().default([]),
// //   salaryRangeMin: integer('salary_range_min'),
// //   salaryRangeMax: integer('salary_range_max'),
// //   salaryCurrency: text('salary_currency').default('GMD'),
// //   salaryFrequency: salaryFrequencyEnum('salary_frequency').notNull(),
// //   jobType: jobTypeEnum('job_type').notNull(),
// //   workLocation: workLocationEnum('work_location').notNull(),
// //   experienceLevel: experienceLevelEnum('experience_level').notNull(),
// //   benefits: text('benefits').array(),
// //   skillsRequired: text('skills_required').array(), // Will be replaced with jobSkills
// //   slug: text('slug'),
// //   isActive: boolean('is_active').default(true),
// //   deleted: boolean('deleted').default(false), // Soft delete
// //   expiresAt: timestamp('expires_at'),
// //   applicationDeadline: timestamp('application_deadline'),
// //   createdAt: timestamp('created_at').notNull().defaultNow(),
// //   updatedAt: timestamp('updated_at').notNull().defaultNow(),
// // }, (table) => {
// //   return {
// //     titleIdx: index('job_title_idx').on(table.title),
// //     employerIdIdx: index('employer_id_idx').on(table.employerId),
// //     companyIdIdx: index('company_id_idx').on(table.companyId),
// //     jobTypeIdx: index('job_type_idx').on(table.jobType),
// //     workLocationIdx: index('work_location_idx').on(table.workLocation),
// //     experienceLevelIdx: index('job_experience_level_idx').on(table.experienceLevel),
// //     isActiveIdx: index('is_active_idx').on(table.isActive),
// //     deletedIdx: index('job_deleted_idx').on(table.deleted),
// //     applicationDeadlineIdx: index('application_deadline_idx').on(table.applicationDeadline),
// //     // Composite indexes for common filtering patterns
// //     jobTypeExpLevelIdx: index('job_type_exp_level_idx').on(table.jobType, table.experienceLevel),
// //     salaryRangeIdx: index('salary_range_idx').on(table.salaryRangeMin, table.salaryRangeMax)
// //   };
// // });

// // Applications
// export const applications = pgTable('applications', {
//   id: uuid('id').primaryKey().defaultRandom(),
//   jobId: uuid('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
//   candidateId: uuid('candidate_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
//   status: applicationStatusEnum('status').default('PENDING'),
//   resumeUrl: text('resume_url'), // URL to Supabase Storage
//   coverLetterUrl: text('cover_letter_url'), // URL to Supabase Storage
//   usedProfileCv: boolean('used_profile_cv').default(false),
//   coverLetter: text('cover_letter'),
//   notes: text('notes'),
//   interviewDate: timestamp('interview_date'),
//   deleted: boolean('deleted').default(false), // Soft delete pattern
//   appliedAt: timestamp('applied_at').notNull().defaultNow(),
//   updatedAt: timestamp('updated_at').notNull().defaultNow(),
// }, (table) => {
//   return {
//     jobIdIdx: index('job_id_idx').on(table.jobId),
//     candidateIdIdx: index('candidate_id_idx').on(table.candidateId),
//     statusIdx: index('application_status_idx').on(table.status),
//     appliedAtIdx: index('applied_at_idx').on(table.appliedAt),
//     // Composite index for common query pattern
//     jobCandidateIdx: index('job_candidate_idx').on(table.jobId, table.candidateId)
//   };
// });

// // Saved Jobs
// export const savedJobs = pgTable('saved_jobs', {
//   id: uuid('id').primaryKey().defaultRandom(),
//   userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
//   jobId: uuid('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
//   deleted: boolean('deleted').default(false), // Soft delete pattern
//   createdAt: timestamp('created_at').notNull().defaultNow(),
// }, (table) => {
//   return {
//     userIdIdx: index('saved_jobs_user_id_idx').on(table.userId),
//     jobIdIdx: index('saved_jobs_job_id_idx').on(table.jobId),
//     userJobIdx: uniqueIndex('user_job_unique_idx').on(table.userId, table.jobId)
//   };
// });

// // Tenders
// export const tenders = pgTable('tenders', {
//   id: uuid('id').primaryKey().defaultRandom(),
//   title: text('title').notNull(),
//   description: text('description').notNull(),
//   organizationName: text('organization_name').notNull(), // Could link to an organizations table
//   tenderType: tenderType('tender_type').notNull(),
//   sector: text('sector'), // Consider a separate sectors table
//   location: text('location'), // Could link to the locations table
//   deadline: timestamp('deadline', { withTimezone: true }),
//   budgetRange: text('budget_range'),
//   contactInformation: text('contact_information'),
//   externalLink: text('external_link'),
//   status: tenderStatus('status').notNull().default('DRAFT'),
//   createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
//   updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
//   deletedAt: timestamp('deleted_at', { withTimezone: true }), // Using deletedAt for soft delete pattern to match existing pattern
//   userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
// }, (table) => {
//   return {
//     titleIdx: index('tender_title_idx').on(table.title),
//     organizationNameIdx: index('organization_name_idx').on(table.organizationName),
//     tenderTypeIdx: index('tender_type_idx').on(table.tenderType),
//     sectorIdx: index('sector_idx').on(table.sector),
//     statusIdx: index('tender_status_idx').on(table.status),
//     deadlineIdx: index('deadline_idx').on(table.deadline),
//     userIdIdx: index('tender_user_id_idx').on(table.userId),
//     deletedAtIdx: index('deleted_at_idx').on(table.deletedAt)
//   };
// });

// // Skills (Many-to-Many with Jobs)
// export const skills = pgTable('skills', {
//   id: uuid('id').primaryKey().defaultRandom(),
//   name: text('name').notNull().unique(), // Make skill names unique
//   deleted: boolean('deleted').default(false), // Soft delete pattern
//   createdAt: timestamp('created_at').notNull().defaultNow(),
//   updatedAt: timestamp('updated_at').notNull().defaultNow(),
// }, (table) => {
//   return {
//     nameIdx: index('skill_name_idx').on(table.name)
//   };
// });

// // Job Skills (Join Table)
// export const jobSkills = pgTable('job_skills', {
//   id: uuid('id').primaryKey().defaultRandom(),
//   jobId: uuid('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
//   skillId: uuid('skill_id').notNull().references(() => skills.id, { onDelete: 'cascade' }),
//   deleted: boolean('deleted').default(false), // Soft delete pattern
//   createdAt: timestamp('created_at').notNull().defaultNow(),
// }, (table) => {
//   return {
//     jobIdIdx: index('job_skills_job_id_idx').on(table.jobId),
//     skillIdIdx: index('job_skills_skill_id_idx').on(table.skillId),
//     uniqueJobSkill: uniqueIndex('job_skill_unique_idx').on(table.jobId, table.skillId)
//   };
// });

// // Candidate Skills (Junction Table)
// export const candidateSkills = pgTable('candidate_skills', {
//   id: uuid('id').primaryKey().defaultRandom(),
//   candidateId: uuid('candidate_id').notNull().references(() => candidateProfiles.id, { onDelete: 'cascade' }),
//   skillId: uuid('skill_id').notNull().references(() => skills.id, { onDelete: 'cascade' }),
//   deleted: boolean('deleted').default(false),
//   createdAt: timestamp('created_at').notNull().defaultNow(),
// }, (table) => {
//   return {
//     candidateIdIdx: index('candidate_skills_candidate_id_idx').on(table.candidateId),
//     skillIdIdx: index('candidate_skills_skill_id_idx').on(table.skillId),
//     uniqueCandidateSkill: uniqueIndex('candidate_skill_unique_idx').on(table.candidateId, table.skillId)
//   };
// });

// // Industries (Many-to-Many with Jobs) - Optional, but recommended
// export const industries = pgTable('industries', {
//   id: uuid('id').primaryKey().defaultRandom(),
//   name: text('name').notNull().unique(),
//   deleted: boolean('deleted').default(false), // Soft delete pattern
//   createdAt: timestamp('created_at').notNull().defaultNow(),
//   updatedAt: timestamp('updated_at').notNull().defaultNow(),
// }, (table) => {
//   return {
//     nameIdx: index('industry_name_idx').on(table.name)
//   };
// });

// // Job Industries (Join Table) - Optional
// export const jobIndustries = pgTable('job_industries', {
//   id: uuid('id').primaryKey().defaultRandom(),
//   jobId: uuid('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
//   industryId: uuid('industry_id').notNull().references(() => industries.id, { onDelete: 'cascade' }),
//   deleted: boolean('deleted').default(false), // Soft delete pattern
//   createdAt: timestamp('created_at').defaultNow(),
//   updatedAt: timestamp('updated_at').notNull().defaultNow(),
// }, (table) => {
//   return {
//     jobIdIdx: index('job_industries_job_id_idx').on(table.jobId),
//     industryIdIdx: index('job_industries_industry_id_idx').on(table.industryId),
//     uniqueJobIndustry: uniqueIndex('job_industry_unique_idx').on(table.jobId, table.industryId)
//   };
// });

// // --- Relations ---
// export const profilesRelations = relations(profiles, ({ many, one }) => ({
//   candidateProfile: one(candidateProfiles, {
//     fields: [profiles.id],
//     references: [candidateProfiles.profileId],
//   }),
//   employerProfile: one(employerProfiles, {
//     fields: [profiles.id],
//     references: [employerProfiles.profileId],
//   }),
//   applications: many(applications, {
//     relationName: 'candidate_applications'
//   }),
//   jobs: many(jobs),
//   savedJobs: many(savedJobs)
// }));

// export const candidateProfilesRelations = relations(candidateProfiles, ({ one, many }) => ({
//   profile: one(profiles, {
//     fields: [candidateProfiles.profileId],
//     references: [profiles.id],
//   }),
//   skills: many(candidateSkills)
// }));

// export const employerProfilesRelations = relations(employerProfiles, ({ one, many }) => ({
//   profile: one(profiles, {
//     fields: [employerProfiles.profileId],
//     references: [profiles.id],
//   }),
//   jobs: many(jobs)
// }));

// export const tenderRelations = relations(tenders, ({ one }) => ({
//   user: one(profiles, {
//     fields: [tenders.userId],
//     references: [profiles.id],
//   }),
// }));




// // Add new relationships to job table if needed
// export const jobRelations = relations(jobs, ({ many, one }) => ({
//   skills: many(jobSkills),
//   industries: many(jobIndustries),
//   employer: one(employerProfiles, {
//     fields: [jobs.employerId],
//     references: [employerProfiles.profileId],
//   }),
//   applications: many(applications),
//   location: one(locations, {
//     fields: [jobs.locationId],
//     references: [locations.id]
//   })
// }));



// // export const jobRelations = relations(jobs, ({ many, one }) => ({
// //   skills: many(jobSkills),
// //   industries: many(jobIndustries),
// //   employer: one(employerProfiles, {
// //     fields: [jobs.employerId],
// //     references: [employerProfiles.profileId],
// //   }),
// //   applications: many(applications),
// //   location: one(locations, {
// //     fields: [jobs.locationId],
// //     references: [locations.id]
// //   })
// // }));

// export const skillsRelations = relations(skills, ({ many }) => ({
//   jobs: many(jobSkills),
//   candidates: many(candidateSkills)
// }));

// export const jobSkillsRelations = relations(jobSkills, ({ one }) => ({
//   job: one(jobs, {
//     fields: [jobSkills.jobId],
//     references: [jobs.id],
//   }),
//   skill: one(skills, {
//     fields: [jobSkills.skillId],
//     references: [skills.id],
//   }),
// }));

// export const industriesRelations = relations(industries, ({ many }) => ({
//   jobs: many(jobIndustries),
// }));

// export const jobIndustriesRelations = relations(jobIndustries, ({ one }) => ({
//   job: one(jobs, {
//     fields: [jobIndustries.jobId],
//     references: [jobs.id],
//   }),
//   industry: one(industries, {
//     fields: [jobIndustries.industryId],
//     references: [industries.id],
//   }),
// }));

// // Add candidateSkills relations
// export const candidateSkillsRelations = relations(candidateSkills, ({ one }) => ({
//   candidate: one(candidateProfiles, {
//     fields: [candidateSkills.candidateId],
//     references: [candidateProfiles.id],
//   }),
//   skill: one(skills, {
//     fields: [candidateSkills.skillId],
//     references: [skills.id],
//   }),
// }));

// // --- Type Definitions ---
// export type UserRole = InferModel<typeof profiles>['role'];

// // Profile Types
// export type Profile = InferModel<typeof profiles>;
// export type NewProfile = InferInsertModel<typeof profiles>;

// // Employer Types
// export type EmployerProfile = InferModel<typeof employerProfiles>;
// export type NewEmployerProfile = InferInsertModel<typeof employerProfiles>;

// // Candidate Types
// export type CandidateProfile = InferModel<typeof candidateProfiles>;
// export type NewCandidateProfile = InferInsertModel<typeof candidateProfiles>;

// // Location Types
// export type Location = InferModel<typeof locations>;
// export type NewLocation = InferInsertModel<typeof locations>;

// // Job Types
// export type Job = InferModel<typeof jobs>;
// export type NewJob = InferInsertModel<typeof jobs>;

// // Application Types
// export type Application = InferModel<typeof applications>;
// export type NewApplication = InferInsertModel<typeof applications>;

// // Saved Job Types
// export type SavedJob = InferModel<typeof savedJobs>;
// export type NewSavedJob = InferInsertModel<typeof savedJobs>;

// // Tender Types
// export type Tender = InferModel<typeof tenders>;
// export type NewTender = InferInsertModel<typeof tenders>;

// // Skill Types
// export type Skill = InferModel<typeof skills>;
// export type NewSkill = InferInsertModel<typeof skills>;

// // Job Skill Types
// export type JobSkill = InferModel<typeof jobSkills>;
// export type NewJobSkill = InferInsertModel<typeof jobSkills>;

// // Candidate Skill Types
// export type CandidateSkill = InferModel<typeof candidateSkills>;
// export type NewCandidateSkill = InferInsertModel<typeof candidateSkills>;

// // Industry Types
// export type Industry = InferModel<typeof industries>;
// export type NewIndustry = InferInsertModel<typeof industries>;

// // Job Industry Types
// export type JobIndustry = InferModel<typeof jobIndustries>;
// export type NewJobIndustry = InferInsertModel<typeof jobIndustries>;


```