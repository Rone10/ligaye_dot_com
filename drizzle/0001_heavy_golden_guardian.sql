CREATE TYPE "public"."application_method" AS ENUM('EMAIL', 'WEBSITE', 'PHONE', 'IN_PERSON');--> statement-breakpoint
CREATE TYPE "public"."contract_period" AS ENUM('DAYS', 'WEEKS', 'MONTHS', 'YEARS');--> statement-breakpoint
CREATE TYPE "public"."country" AS ENUM('GAMBIA', 'SENEGAL', 'NIGERIA', 'GHANA', 'CANADA', 'USA', 'UK', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."schedule_type" AS ENUM('MONDAY_TO_FRIDAY', 'WEEKENDS', 'EIGHT_HOUR_SHIFT', 'DAY_SHIFT', 'EVENING_SHIFT', 'NIGHT_SHIFT', 'MORNING_SHIFT', 'OVERTIME', 'ON_CALL');--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "job_language" text DEFAULT 'English';--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "number_of_openings" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "display_address" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "language_requirements" text[];--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "language_training_provided" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "schedule" "schedule_type"[];--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "expected_hours" integer;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "hours_type" text DEFAULT 'FIXED';--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "contract_length" integer;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "contract_period" "contract_period";--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "planned_start_date" timestamp;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "salary_display_type" text DEFAULT 'RANGE';--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "supplemental_pay" text[];--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "application_method" "application_method";--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "application_instructions" text;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "resume_required" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "allow_candidate_contact" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "city" text;--> statement-breakpoint
CREATE INDEX "planned_start_date_idx" ON "jobs" USING btree ("planned_start_date");--> statement-breakpoint
CREATE INDEX "city_idx" ON "locations" USING btree ("city");--> statement-breakpoint
ALTER TABLE "public"."jobs" ALTER COLUMN "job_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."job_type";--> statement-breakpoint
CREATE TYPE "public"."job_type" AS ENUM('FULL_TIME', 'PART_TIME', 'PERMANENT', 'FIXED_TERM_CONTRACT', 'CASUAL', 'SEASONAL', 'FREELANCE', 'APPRENTICESHIP', 'INTERNSHIP');--> statement-breakpoint
ALTER TABLE "public"."jobs" ALTER COLUMN "job_type" SET DATA TYPE "public"."job_type" USING "job_type"::"public"."job_type";