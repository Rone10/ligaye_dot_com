CREATE TYPE "public"."application_method" AS ENUM('EMAIL', 'WEBSITE', 'PHONE', 'IN_PERSON', 'PLATFORM');--> statement-breakpoint
CREATE TYPE "public"."application_status" AS ENUM('APPLIED', 'REVIEWING', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'OFFER_EXTENDED', 'HIRED', 'REJECTED', 'WITHDRAWN');--> statement-breakpoint
CREATE TYPE "public"."company_size" AS ENUM('1-10', '11-50', '51-200', '201-500', '500+');--> statement-breakpoint
CREATE TYPE "public"."contract_period" AS ENUM('DAYS', 'WEEKS', 'MONTHS', 'YEARS');--> statement-breakpoint
CREATE TYPE "public"."experience_level" AS ENUM('Entry', 'Junior', 'Mid-Level', 'Senior', 'Director', 'Executive');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('DRAFT', 'PENDING_PAYMENT', 'ACTIVE', 'EXPIRED', 'FILLED', 'DELETED');--> statement-breakpoint
CREATE TYPE "public"."job_type" AS ENUM('FULL_TIME', 'PART_TIME', 'PERMANENT', 'FIXED_TERM_CONTRACT', 'CASUAL', 'SEASONAL', 'FREELANCE', 'APPRENTICESHIP', 'INTERNSHIP');--> statement-breakpoint
CREATE TYPE "public"."salary_display_type" AS ENUM('RANGE', 'FIXED', 'STARTING_AMOUNT', 'MAXIMUM_AMOUNT', 'NEGOTIABLE');--> statement-breakpoint
CREATE TYPE "public"."salary_frequency" AS ENUM('HOUR', 'DAY', 'WEEK', 'MONTH', 'YEAR');--> statement-breakpoint
CREATE TYPE "public"."schedule_type" AS ENUM('MONDAY_TO_FRIDAY', 'WEEKENDS', 'EIGHT_HOUR_SHIFT', 'DAY_SHIFT', 'EVENING_SHIFT', 'NIGHT_SHIFT', 'MORNING_SHIFT', 'OVERTIME', 'ON_CALL');--> statement-breakpoint
CREATE TYPE "public"."tender_status" AS ENUM('DRAFT', 'PUBLISHED', 'CLOSED', 'CANCELLED', 'DELETED');--> statement-breakpoint
CREATE TYPE "public"."tender_type" AS ENUM('TENDER', 'PUBLIC_NOTICE');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('employer', 'candidate');--> statement-breakpoint
CREATE TYPE "public"."work_location" AS ENUM('REMOTE', 'HYBRID', 'ON_SITE');--> statement-breakpoint
CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"candidate_profile_id" uuid NOT NULL,
	"status" "application_status" DEFAULT 'APPLIED' NOT NULL,
	"resume_url" text,
	"resume_filename" text,
	"cover_letter_url" text,
	"cover_letter_filename" text,
	"cover_letter_text" text,
	"notes" text,
	"interview_date" timestamp,
	"deleted" boolean DEFAULT false NOT NULL,
	"applied_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "candidate_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"title" text,
	"experience_level" "experience_level",
	"resume_url" text,
	"resume_filename" text,
	"linkedin_url" text,
	"github_url" text,
	"portfolio_url" text,
	"bio" text,
	"deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "candidate_profiles_profile_id_unique" UNIQUE("profile_id")
);
--> statement-breakpoint
CREATE TABLE "candidate_skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"candidate_profile_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "education" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"candidate_profile_id" uuid NOT NULL,
	"institution" text NOT NULL,
	"degree" text NOT NULL,
	"field_of_study" text,
	"start_date" timestamp,
	"end_date" timestamp,
	"description" text,
	"deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employer_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"company_name" text NOT NULL,
	"company_size" "company_size",
	"industry_id" uuid,
	"company_description" text,
	"website" text,
	"location_id" uuid,
	"hq_address_display" text,
	"company_logo_url" text,
	"deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "employer_profiles_profile_id_unique" UNIQUE("profile_id")
);
--> statement-breakpoint
CREATE TABLE "experience" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"candidate_profile_id" uuid NOT NULL,
	"job_title" text NOT NULL,
	"company_name" text NOT NULL,
	"location" text,
	"start_date" timestamp,
	"end_date" timestamp,
	"is_current" boolean DEFAULT false,
	"description" text,
	"deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "industries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "industries_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "job_industries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"industry_id" uuid NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"location_id" uuid,
	"work_location" "work_location" NOT NULL,
	"job_language" text DEFAULT 'English',
	"number_of_openings" integer DEFAULT 1,
	"display_address" boolean DEFAULT true,
	"education_requirements" text[] DEFAULT '{}',
	"experience_requirements" text[] DEFAULT '{}',
	"experience_level" "experience_level",
	"language_requirements" text[],
	"language_training_provided" boolean DEFAULT false,
	"job_type" "job_type" NOT NULL,
	"schedule" "schedule_type"[],
	"expected_hours" integer,
	"hours_type" text DEFAULT 'FIXED',
	"contract_length" integer,
	"contract_period" "contract_period",
	"planned_start_date" timestamp,
	"salary_range_min" integer,
	"salary_range_max" integer,
	"salary_currency" text DEFAULT 'GMD' NOT NULL,
	"salary_frequency" "salary_frequency",
	"salary_display_type" "salary_display_type" DEFAULT 'NEGOTIABLE',
	"supplemental_pay" text[],
	"benefits" text[],
	"application_method" "application_method" DEFAULT 'PLATFORM',
	"application_instructions" text,
	"application_url" text,
	"application_email" text,
	"resume_required" boolean DEFAULT true,
	"allow_candidate_contact" boolean DEFAULT false,
	"application_deadline" timestamp,
	"status" "job_status" DEFAULT 'DRAFT' NOT NULL,
	"published_at" timestamp,
	"expires_at" timestamp,
	"slug" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "jobs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"region" text NOT NULL,
	"district" text,
	"city" text,
	"deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid,
	"employer_profile_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'GMD' NOT NULL,
	"method" text NOT NULL,
	"status" text NOT NULL,
	"transaction_id" text,
	"metadata" text,
	"deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"full_name" text NOT NULL,
	"avatar_url" text,
	"role" "user_role" NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "saved_jobs" (
	"user_id" uuid NOT NULL,
	"job_id" uuid NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "saved_jobs_user_id_job_id_pk" PRIMARY KEY("user_id","job_id")
);
--> statement-breakpoint
CREATE TABLE "sectors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sectors_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "skills_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "tenders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"organization_name" text NOT NULL,
	"tender_type" "tender_type" NOT NULL,
	"sector_id" uuid,
	"location_id" uuid,
	"deadline" timestamp,
	"budget_range" text,
	"contact_information" text,
	"external_link" text,
	"status" "tender_status" DEFAULT 'DRAFT' NOT NULL,
	"user_id" uuid NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_candidate_profile_id_candidate_profiles_id_fk" FOREIGN KEY ("candidate_profile_id") REFERENCES "public"."candidate_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_profiles" ADD CONSTRAINT "candidate_profiles_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_skills" ADD CONSTRAINT "candidate_skills_candidate_profile_id_candidate_profiles_id_fk" FOREIGN KEY ("candidate_profile_id") REFERENCES "public"."candidate_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_skills" ADD CONSTRAINT "candidate_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "education" ADD CONSTRAINT "education_candidate_profile_id_candidate_profiles_id_fk" FOREIGN KEY ("candidate_profile_id") REFERENCES "public"."candidate_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employer_profiles" ADD CONSTRAINT "employer_profiles_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employer_profiles" ADD CONSTRAINT "employer_profiles_industry_id_industries_id_fk" FOREIGN KEY ("industry_id") REFERENCES "public"."industries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employer_profiles" ADD CONSTRAINT "employer_profiles_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experience" ADD CONSTRAINT "experience_candidate_profile_id_candidate_profiles_id_fk" FOREIGN KEY ("candidate_profile_id") REFERENCES "public"."candidate_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_industries" ADD CONSTRAINT "job_industries_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_industries" ADD CONSTRAINT "job_industries_industry_id_industries_id_fk" FOREIGN KEY ("industry_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_skills" ADD CONSTRAINT "job_skills_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_skills" ADD CONSTRAINT "job_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_company_id_employer_profiles_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."employer_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_employer_profile_id_employer_profiles_id_fk" FOREIGN KEY ("employer_profile_id") REFERENCES "public"."employer_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_jobs" ADD CONSTRAINT "saved_jobs_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_jobs" ADD CONSTRAINT "saved_jobs_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenders" ADD CONSTRAINT "tenders_sector_id_sectors_id_fk" FOREIGN KEY ("sector_id") REFERENCES "public"."sectors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenders" ADD CONSTRAINT "tenders_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenders" ADD CONSTRAINT "tenders_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "applications_job_id_idx" ON "applications" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "applications_candidate_profile_id_idx" ON "applications" USING btree ("candidate_profile_id");--> statement-breakpoint
CREATE INDEX "applications_status_idx" ON "applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "applications_applied_at_idx" ON "applications" USING btree ("applied_at");--> statement-breakpoint
CREATE INDEX "applications_deleted_idx" ON "applications" USING btree ("deleted");--> statement-breakpoint
CREATE UNIQUE INDEX "applications_job_candidate_unique_idx" ON "applications" USING btree ("job_id","candidate_profile_id");--> statement-breakpoint
CREATE INDEX "candidate_profiles_profile_id_idx" ON "candidate_profiles" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "candidate_profiles_experience_level_idx" ON "candidate_profiles" USING btree ("experience_level");--> statement-breakpoint
CREATE INDEX "candidate_profiles_title_idx" ON "candidate_profiles" USING btree ("title");--> statement-breakpoint
CREATE INDEX "candidate_profiles_deleted_idx" ON "candidate_profiles" USING btree ("deleted");--> statement-breakpoint
CREATE INDEX "candidate_skills_candidate_profile_id_idx" ON "candidate_skills" USING btree ("candidate_profile_id");--> statement-breakpoint
CREATE INDEX "candidate_skills_skill_id_idx" ON "candidate_skills" USING btree ("skill_id");--> statement-breakpoint
CREATE UNIQUE INDEX "candidate_skill_unique_idx" ON "candidate_skills" USING btree ("candidate_profile_id","skill_id");--> statement-breakpoint
CREATE INDEX "candidate_skills_deleted_idx" ON "candidate_skills" USING btree ("deleted");--> statement-breakpoint
CREATE INDEX "education_candidate_profile_id_idx" ON "education" USING btree ("candidate_profile_id");--> statement-breakpoint
CREATE INDEX "education_deleted_idx" ON "education" USING btree ("deleted");--> statement-breakpoint
CREATE INDEX "employer_profiles_profile_id_idx" ON "employer_profiles" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "employer_profiles_company_name_idx" ON "employer_profiles" USING btree ("company_name");--> statement-breakpoint
CREATE INDEX "employer_profiles_industry_id_idx" ON "employer_profiles" USING btree ("industry_id");--> statement-breakpoint
CREATE INDEX "employer_profiles_location_id_idx" ON "employer_profiles" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX "employer_profiles_deleted_idx" ON "employer_profiles" USING btree ("deleted");--> statement-breakpoint
CREATE INDEX "experience_candidate_profile_id_idx" ON "experience" USING btree ("candidate_profile_id");--> statement-breakpoint
CREATE INDEX "experience_deleted_idx" ON "experience" USING btree ("deleted");--> statement-breakpoint
CREATE INDEX "industries_name_idx" ON "industries" USING btree ("name");--> statement-breakpoint
CREATE INDEX "industries_deleted_idx" ON "industries" USING btree ("deleted");--> statement-breakpoint
CREATE INDEX "job_industries_job_id_idx" ON "job_industries" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "job_industries_industry_id_idx" ON "job_industries" USING btree ("industry_id");--> statement-breakpoint
CREATE UNIQUE INDEX "job_industry_unique_idx" ON "job_industries" USING btree ("job_id","industry_id");--> statement-breakpoint
CREATE INDEX "job_industries_deleted_idx" ON "job_industries" USING btree ("deleted");--> statement-breakpoint
CREATE INDEX "job_skills_job_id_idx" ON "job_skills" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "job_skills_skill_id_idx" ON "job_skills" USING btree ("skill_id");--> statement-breakpoint
CREATE UNIQUE INDEX "job_skill_unique_idx" ON "job_skills" USING btree ("job_id","skill_id");--> statement-breakpoint
CREATE INDEX "job_skills_deleted_idx" ON "job_skills" USING btree ("deleted");--> statement-breakpoint
CREATE INDEX "jobs_company_id_idx" ON "jobs" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "jobs_title_idx" ON "jobs" USING btree ("title");--> statement-breakpoint
CREATE INDEX "jobs_location_id_idx" ON "jobs" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX "jobs_work_location_idx" ON "jobs" USING btree ("work_location");--> statement-breakpoint
CREATE INDEX "jobs_job_type_idx" ON "jobs" USING btree ("job_type");--> statement-breakpoint
CREATE INDEX "jobs_experience_level_idx" ON "jobs" USING btree ("experience_level");--> statement-breakpoint
CREATE INDEX "jobs_status_idx" ON "jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "jobs_expires_at_idx" ON "jobs" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "jobs_application_deadline_idx" ON "jobs" USING btree ("application_deadline");--> statement-breakpoint
CREATE INDEX "jobs_planned_start_date_idx" ON "jobs" USING btree ("planned_start_date");--> statement-breakpoint
CREATE INDEX "jobs_slug_idx" ON "jobs" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "jobs_status_expires_at_idx" ON "jobs" USING btree ("status","expires_at");--> statement-breakpoint
CREATE INDEX "jobs_job_type_exp_level_idx" ON "jobs" USING btree ("job_type","experience_level");--> statement-breakpoint
CREATE INDEX "jobs_salary_range_idx" ON "jobs" USING btree ("salary_range_min","salary_range_max");--> statement-breakpoint
CREATE INDEX "locations_region_idx" ON "locations" USING btree ("region");--> statement-breakpoint
CREATE INDEX "locations_city_idx" ON "locations" USING btree ("city");--> statement-breakpoint
CREATE INDEX "locations_deleted_idx" ON "locations" USING btree ("deleted");--> statement-breakpoint
CREATE INDEX "payments_job_id_idx" ON "payments" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "payments_employer_profile_id_idx" ON "payments" USING btree ("employer_profile_id");--> statement-breakpoint
CREATE INDEX "payments_status_idx" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payments_method_idx" ON "payments" USING btree ("method");--> statement-breakpoint
CREATE INDEX "payments_deleted_idx" ON "payments" USING btree ("deleted");--> statement-breakpoint
CREATE INDEX "profiles_user_id_idx" ON "profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "profiles_role_idx" ON "profiles" USING btree ("role");--> statement-breakpoint
CREATE INDEX "profiles_deleted_idx" ON "profiles" USING btree ("deleted");--> statement-breakpoint
CREATE INDEX "saved_jobs_user_id_idx" ON "saved_jobs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "saved_jobs_job_id_idx" ON "saved_jobs" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "saved_jobs_deleted_idx" ON "saved_jobs" USING btree ("deleted");--> statement-breakpoint
CREATE INDEX "sectors_name_idx" ON "sectors" USING btree ("name");--> statement-breakpoint
CREATE INDEX "sectors_deleted_idx" ON "sectors" USING btree ("deleted");--> statement-breakpoint
CREATE INDEX "skills_name_idx" ON "skills" USING btree ("name");--> statement-breakpoint
CREATE INDEX "skills_deleted_idx" ON "skills" USING btree ("deleted");--> statement-breakpoint
CREATE INDEX "tenders_title_idx" ON "tenders" USING btree ("title");--> statement-breakpoint
CREATE INDEX "tenders_organization_name_idx" ON "tenders" USING btree ("organization_name");--> statement-breakpoint
CREATE INDEX "tenders_tender_type_idx" ON "tenders" USING btree ("tender_type");--> statement-breakpoint
CREATE INDEX "tenders_sector_id_idx" ON "tenders" USING btree ("sector_id");--> statement-breakpoint
CREATE INDEX "tenders_location_id_idx" ON "tenders" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX "tenders_status_idx" ON "tenders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tenders_deadline_idx" ON "tenders" USING btree ("deadline");--> statement-breakpoint
CREATE INDEX "tenders_user_id_idx" ON "tenders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "tenders_deleted_idx" ON "tenders" USING btree ("deleted");