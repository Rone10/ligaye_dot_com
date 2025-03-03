CREATE TYPE "public"."application_status" AS ENUM('PENDING', 'REVIEWING', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'OFFER_EXTENDED', 'HIRED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."company_size" AS ENUM('1-10', '11-50', '51-200', '201-500', '500+');--> statement-breakpoint
CREATE TYPE "public"."experience_level" AS ENUM('Entry', 'Junior', 'Mid-Level', 'Senior', 'Director', 'Executive');--> statement-breakpoint
CREATE TYPE "public"."job_type" AS ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY');--> statement-breakpoint
CREATE TYPE "public"."salary_frequency" AS ENUM('HOUR', 'DAY', 'WEEK', 'MONTH', 'YEAR');--> statement-breakpoint
CREATE TYPE "public"."tender_status" AS ENUM('DRAFT', 'PUBLISHED', 'CLOSED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."tender_type" AS ENUM('TENDER', 'PUBLIC_NOTICE');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('employer', 'candidate');--> statement-breakpoint
CREATE TYPE "public"."work_location" AS ENUM('REMOTE', 'HYBRID', 'ON_SITE');--> statement-breakpoint
CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"candidate_id" uuid NOT NULL,
	"status" "application_status" DEFAULT 'PENDING',
	"resume_url" text,
	"cover_letter_url" text,
	"used_profile_cv" boolean DEFAULT false,
	"cover_letter" text,
	"notes" text,
	"interview_date" timestamp,
	"deleted" boolean DEFAULT false,
	"applied_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "candidate_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"title" text NOT NULL,
	"experience_level" "experience_level" NOT NULL,
	"skills" text[],
	"resume_url" text,
	"linkedin_url" text,
	"github_url" text,
	"bio" text,
	"deleted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "candidate_profiles_profile_id_unique" UNIQUE("profile_id")
);
--> statement-breakpoint
CREATE TABLE "employer_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"company_name" text NOT NULL,
	"company_size" "company_size" NOT NULL,
	"industry" text NOT NULL,
	"company_description" text,
	"website" text,
	"location" text NOT NULL,
	"deleted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "employer_profiles_profile_id_unique" UNIQUE("profile_id")
);
--> statement-breakpoint
CREATE TABLE "industries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"deleted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "industries_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "job_industries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"industry_id" uuid NOT NULL,
	"deleted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	"deleted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employer_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"title" text NOT NULL,
	"location_id" uuid,
	"description" text NOT NULL,
	"education_requirements" text[] DEFAULT '{}',
	"experience_requirements" text[] DEFAULT '{}',
	"salary_range_min" integer,
	"salary_range_max" integer,
	"salary_currency" text DEFAULT 'GMD',
	"salary_frequency" "salary_frequency" NOT NULL,
	"job_type" "job_type" NOT NULL,
	"work_location" "work_location" NOT NULL,
	"experience_level" "experience_level" NOT NULL,
	"benefits" text[],
	"skills_required" text[],
	"slug" text,
	"is_active" boolean DEFAULT true,
	"deleted" boolean DEFAULT false,
	"expires_at" timestamp,
	"application_deadline" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"region" text NOT NULL,
	"district" text,
	"town" text,
	"deleted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"avatar_url" text,
	"role" "user_role" NOT NULL,
	"deleted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "saved_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"job_id" uuid NOT NULL,
	"deleted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"deleted" boolean DEFAULT false,
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
	"sector" text,
	"location" text,
	"deadline" timestamp with time zone,
	"budget_range" text,
	"contact_information" text,
	"external_link" text,
	"status" "tender_status" DEFAULT 'DRAFT' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_candidate_id_profiles_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_profiles" ADD CONSTRAINT "candidate_profiles_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employer_profiles" ADD CONSTRAINT "employer_profiles_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_industries" ADD CONSTRAINT "job_industries_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_industries" ADD CONSTRAINT "job_industries_industry_id_industries_id_fk" FOREIGN KEY ("industry_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_skills" ADD CONSTRAINT "job_skills_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_skills" ADD CONSTRAINT "job_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_employer_id_profiles_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_company_id_employer_profiles_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."employer_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_jobs" ADD CONSTRAINT "saved_jobs_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_jobs" ADD CONSTRAINT "saved_jobs_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenders" ADD CONSTRAINT "tenders_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "job_id_idx" ON "applications" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "candidate_id_idx" ON "applications" USING btree ("candidate_id");--> statement-breakpoint
CREATE INDEX "application_status_idx" ON "applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "applied_at_idx" ON "applications" USING btree ("applied_at");--> statement-breakpoint
CREATE INDEX "job_candidate_idx" ON "applications" USING btree ("job_id","candidate_id");--> statement-breakpoint
CREATE INDEX "experience_level_idx" ON "candidate_profiles" USING btree ("experience_level");--> statement-breakpoint
CREATE INDEX "title_idx" ON "candidate_profiles" USING btree ("title");--> statement-breakpoint
CREATE INDEX "company_name_idx" ON "employer_profiles" USING btree ("company_name");--> statement-breakpoint
CREATE INDEX "industry_idx" ON "employer_profiles" USING btree ("industry");--> statement-breakpoint
CREATE INDEX "employer_location_idx" ON "employer_profiles" USING btree ("location");--> statement-breakpoint
CREATE INDEX "industry_name_idx" ON "industries" USING btree ("name");--> statement-breakpoint
CREATE INDEX "job_industries_job_id_idx" ON "job_industries" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "job_industries_industry_id_idx" ON "job_industries" USING btree ("industry_id");--> statement-breakpoint
CREATE UNIQUE INDEX "job_industry_unique_idx" ON "job_industries" USING btree ("job_id","industry_id");--> statement-breakpoint
CREATE INDEX "job_skills_job_id_idx" ON "job_skills" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "job_skills_skill_id_idx" ON "job_skills" USING btree ("skill_id");--> statement-breakpoint
CREATE UNIQUE INDEX "job_skill_unique_idx" ON "job_skills" USING btree ("job_id","skill_id");--> statement-breakpoint
CREATE INDEX "job_title_idx" ON "jobs" USING btree ("title");--> statement-breakpoint
CREATE INDEX "employer_id_idx" ON "jobs" USING btree ("employer_id");--> statement-breakpoint
CREATE INDEX "company_id_idx" ON "jobs" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "job_type_idx" ON "jobs" USING btree ("job_type");--> statement-breakpoint
CREATE INDEX "work_location_idx" ON "jobs" USING btree ("work_location");--> statement-breakpoint
CREATE INDEX "job_experience_level_idx" ON "jobs" USING btree ("experience_level");--> statement-breakpoint
CREATE INDEX "is_active_idx" ON "jobs" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "job_deleted_idx" ON "jobs" USING btree ("deleted");--> statement-breakpoint
CREATE INDEX "application_deadline_idx" ON "jobs" USING btree ("application_deadline");--> statement-breakpoint
CREATE INDEX "job_type_exp_level_idx" ON "jobs" USING btree ("job_type","experience_level");--> statement-breakpoint
CREATE INDEX "salary_range_idx" ON "jobs" USING btree ("salary_range_min","salary_range_max");--> statement-breakpoint
CREATE INDEX "region_idx" ON "locations" USING btree ("region");--> statement-breakpoint
CREATE INDEX "town_idx" ON "locations" USING btree ("town");--> statement-breakpoint
CREATE INDEX "email_idx" ON "profiles" USING btree ("email");--> statement-breakpoint
CREATE INDEX "user_id_idx" ON "profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "role_idx" ON "profiles" USING btree ("role");--> statement-breakpoint
CREATE INDEX "saved_jobs_user_id_idx" ON "saved_jobs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "saved_jobs_job_id_idx" ON "saved_jobs" USING btree ("job_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_job_unique_idx" ON "saved_jobs" USING btree ("user_id","job_id");--> statement-breakpoint
CREATE INDEX "skill_name_idx" ON "skills" USING btree ("name");--> statement-breakpoint
CREATE INDEX "tender_title_idx" ON "tenders" USING btree ("title");--> statement-breakpoint
CREATE INDEX "organization_name_idx" ON "tenders" USING btree ("organization_name");--> statement-breakpoint
CREATE INDEX "tender_type_idx" ON "tenders" USING btree ("tender_type");--> statement-breakpoint
CREATE INDEX "sector_idx" ON "tenders" USING btree ("sector");--> statement-breakpoint
CREATE INDEX "tender_status_idx" ON "tenders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "deadline_idx" ON "tenders" USING btree ("deadline");--> statement-breakpoint
CREATE INDEX "tender_user_id_idx" ON "tenders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "deleted_at_idx" ON "tenders" USING btree ("deleted_at");