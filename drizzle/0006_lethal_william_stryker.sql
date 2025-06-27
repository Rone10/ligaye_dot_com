CREATE TABLE "pricing_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"price_per_month" integer NOT NULL,
	"currency" text DEFAULT 'GMD' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pricing_config" ADD CONSTRAINT "pricing_config_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "pricing_config_active_idx" ON "pricing_config" USING btree ("active");--> statement-breakpoint
CREATE INDEX "pricing_config_created_at_idx" ON "pricing_config" USING btree ("created_at");