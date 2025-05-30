CREATE TABLE "tender_document_purchases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tender_id" uuid NOT NULL,
	"tender_payment_id" uuid NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tender_document_purchases_tender_payment_id_unique" UNIQUE("tender_payment_id")
);
--> statement-breakpoint
CREATE TABLE "tender_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tender_id" uuid NOT NULL,
	"storage_path" text NOT NULL,
	"original_filename" text NOT NULL,
	"file_size" integer,
	"mime_type" text,
	"deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tender_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tender_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'GMD' NOT NULL,
	"method" text DEFAULT 'stripe' NOT NULL,
	"status" text NOT NULL,
	"transaction_id" text,
	"stripe_session_id" text,
	"purchaser_full_name" text NOT NULL,
	"purchaser_email" text NOT NULL,
	"purchaser_phone" text,
	"deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tender_payments_transaction_id_unique" UNIQUE("transaction_id"),
	CONSTRAINT "tender_payments_stripe_session_id_unique" UNIQUE("stripe_session_id")
);
--> statement-breakpoint
ALTER TABLE "tenders" ADD COLUMN "documents_are_paid" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "tenders" ADD COLUMN "document_price" real;--> statement-breakpoint
ALTER TABLE "tenders" ADD COLUMN "document_currency" text DEFAULT 'GMD';--> statement-breakpoint
ALTER TABLE "tender_document_purchases" ADD CONSTRAINT "tender_document_purchases_tender_id_tenders_id_fk" FOREIGN KEY ("tender_id") REFERENCES "public"."tenders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tender_document_purchases" ADD CONSTRAINT "tender_document_purchases_tender_payment_id_tender_payments_id_fk" FOREIGN KEY ("tender_payment_id") REFERENCES "public"."tender_payments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tender_documents" ADD CONSTRAINT "tender_documents_tender_id_tenders_id_fk" FOREIGN KEY ("tender_id") REFERENCES "public"."tenders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tender_payments" ADD CONSTRAINT "tender_payments_tender_id_tenders_id_fk" FOREIGN KEY ("tender_id") REFERENCES "public"."tenders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "tender_doc_purchase_payment_unique_idx" ON "tender_document_purchases" USING btree ("tender_payment_id");--> statement-breakpoint
CREATE INDEX "tender_doc_purchase_tender_id_idx" ON "tender_document_purchases" USING btree ("tender_id");--> statement-breakpoint
CREATE INDEX "tender_doc_purchase_deleted_idx" ON "tender_document_purchases" USING btree ("deleted");--> statement-breakpoint
CREATE INDEX "tender_documents_tender_id_idx" ON "tender_documents" USING btree ("tender_id");--> statement-breakpoint
CREATE INDEX "tender_documents_deleted_idx" ON "tender_documents" USING btree ("deleted");--> statement-breakpoint
CREATE INDEX "tender_payments_tender_id_idx" ON "tender_payments" USING btree ("tender_id");--> statement-breakpoint
CREATE INDEX "tender_payments_transaction_id_idx" ON "tender_payments" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "tender_payments_stripe_session_id_idx" ON "tender_payments" USING btree ("stripe_session_id");--> statement-breakpoint
CREATE INDEX "tender_payments_purchaser_email_idx" ON "tender_payments" USING btree ("purchaser_email");--> statement-breakpoint
CREATE INDEX "tender_payments_status_idx" ON "tender_payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tender_payments_deleted_idx" ON "tender_payments" USING btree ("deleted");