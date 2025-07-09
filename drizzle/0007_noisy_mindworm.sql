CREATE TABLE "email_drafts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"recipient" text NOT NULL,
	"subject" text NOT NULL,
	"body_html" text NOT NULL,
	"body_text" text,
	"cc" text,
	"bcc" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "email_drafts" ADD CONSTRAINT "email_drafts_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "email_drafts_user_id_idx" ON "email_drafts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "email_drafts_status_idx" ON "email_drafts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "email_drafts_created_at_idx" ON "email_drafts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "email_drafts_deleted_idx" ON "email_drafts" USING btree ("deleted");