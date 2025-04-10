ALTER TABLE "jobs" ALTER COLUMN "education_requirements" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "education_requirements" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "education_requirements" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "experience_requirements" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "experience_requirements" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "experience_requirements" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "salary_range_min" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "salary_range_max" SET DATA TYPE real;