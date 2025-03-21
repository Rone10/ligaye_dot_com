CREATE TABLE "candidate_skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"candidate_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	"proficiency_level" text DEFAULT 'intermediate',
	"deleted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "candidate_skills" ADD CONSTRAINT "candidate_skills_candidate_id_candidate_profiles_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidate_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_skills" ADD CONSTRAINT "candidate_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "candidate_skills_candidate_id_idx" ON "candidate_skills" USING btree ("candidate_id");--> statement-breakpoint
CREATE INDEX "candidate_skills_skill_id_idx" ON "candidate_skills" USING btree ("skill_id");--> statement-breakpoint
CREATE UNIQUE INDEX "candidate_skill_unique_idx" ON "candidate_skills" USING btree ("candidate_id","skill_id");