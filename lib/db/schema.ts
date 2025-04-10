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
  foreignKey,
  real
} from 'drizzle-orm/pg-core';
import { relations, InferInsertModel, InferSelectModel } from 'drizzle-orm'; // Use InferSelectModel for select types

// --- Enums ---

// Core Enums
export const userRoleEnum = pgEnum('user_role', ['employer', 'candidate', 'admin']);
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
  educationRequirements: text('education_requirements').notNull().default(''), // Free text
  experienceRequirements: text('experience_requirements').notNull().default(''), // Free text
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
  salaryRangeMin: real('salary_range_min'),
  salaryRangeMax: real('salary_range_max'),
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