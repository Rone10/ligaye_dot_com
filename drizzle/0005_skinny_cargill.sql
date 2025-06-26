CREATE TYPE "public"."coupon_applicable_to" AS ENUM('JOB_POSTING', 'TENDER', 'ALL');--> statement-breakpoint
CREATE TYPE "public"."coupon_discount_type" AS ENUM('PERCENTAGE', 'FIXED', 'FREE');--> statement-breakpoint
CREATE TABLE "coupon_redemptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coupon_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"payment_id" uuid,
	"job_id" uuid,
	"original_amount" integer NOT NULL,
	"discount_amount" integer NOT NULL,
	"final_amount" integer NOT NULL,
	"redeemed_at" timestamp DEFAULT now() NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"discount_type" "coupon_discount_type" NOT NULL,
	"discount_value" real NOT NULL,
	"max_uses" integer,
	"used_count" integer DEFAULT 0 NOT NULL,
	"max_uses_per_user" integer DEFAULT 1,
	"valid_from" timestamp NOT NULL,
	"valid_until" timestamp,
	"applicable_to" "coupon_applicable_to" DEFAULT 'JOB_POSTING' NOT NULL,
	"min_purchase_amount" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "coupons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "coupon_id" uuid;--> statement-breakpoint
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "coupon_redemptions_coupon_id_idx" ON "coupon_redemptions" USING btree ("coupon_id");--> statement-breakpoint
CREATE INDEX "coupon_redemptions_user_id_idx" ON "coupon_redemptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "coupon_redemptions_payment_id_idx" ON "coupon_redemptions" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX "coupon_redemptions_job_id_idx" ON "coupon_redemptions" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "coupon_redemptions_redeemed_at_idx" ON "coupon_redemptions" USING btree ("redeemed_at");--> statement-breakpoint
CREATE INDEX "coupon_redemptions_deleted_idx" ON "coupon_redemptions" USING btree ("deleted");--> statement-breakpoint
CREATE UNIQUE INDEX "coupon_redemptions_user_coupon_unique" ON "coupon_redemptions" USING btree ("user_id","coupon_id","payment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "coupons_code_idx" ON "coupons" USING btree ("code");--> statement-breakpoint
CREATE INDEX "coupons_valid_from_idx" ON "coupons" USING btree ("valid_from");--> statement-breakpoint
CREATE INDEX "coupons_valid_until_idx" ON "coupons" USING btree ("valid_until");--> statement-breakpoint
CREATE INDEX "coupons_is_active_idx" ON "coupons" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "coupons_applicable_to_idx" ON "coupons" USING btree ("applicable_to");--> statement-breakpoint
CREATE INDEX "coupons_deleted_idx" ON "coupons" USING btree ("deleted");--> statement-breakpoint
CREATE INDEX "coupons_active_valid_idx" ON "coupons" USING btree ("is_active","valid_from","valid_until");--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "payments_coupon_id_idx" ON "payments" USING btree ("coupon_id");