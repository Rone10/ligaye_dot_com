-- Email Drafts Table Migration with RLS Policies
-- Generated from Drizzle schema
-- Copy and paste this entire file into Supabase SQL Editor

-- Create the email_drafts table
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

-- Add foreign key constraint
ALTER TABLE "email_drafts" ADD CONSTRAINT "email_drafts_user_id_profiles_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") 
  ON DELETE cascade ON UPDATE no action;

-- Create indexes for performance
CREATE INDEX "email_drafts_user_id_idx" ON "email_drafts" USING btree ("user_id");
CREATE INDEX "email_drafts_status_idx" ON "email_drafts" USING btree ("status");
CREATE INDEX "email_drafts_created_at_idx" ON "email_drafts" USING btree ("created_at");
CREATE INDEX "email_drafts_deleted_idx" ON "email_drafts" USING btree ("deleted");

-- Add check constraint for status
ALTER TABLE "email_drafts" ADD CONSTRAINT "email_drafts_status_check" 
  CHECK (status IN ('draft', 'sent'));

-- Enable Row Level Security
ALTER TABLE email_drafts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Policy: Admin users can view all email drafts
CREATE POLICY "Admins can view all email drafts" ON email_drafts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admin users can create email drafts
CREATE POLICY "Admins can create email drafts" ON email_drafts
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
    AND user_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- Policy: Admin users can update their own email drafts
CREATE POLICY "Admins can update their own email drafts" ON email_drafts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
    AND user_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- Policy: Admin users can delete their own email drafts
CREATE POLICY "Admins can delete their own email drafts" ON email_drafts
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
    AND user_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_email_drafts_updated_at 
  BEFORE UPDATE ON email_drafts
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON email_drafts TO authenticated;
GRANT ALL ON email_drafts TO service_role;

-- Verify the table was created successfully
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'email_drafts'
ORDER BY ordinal_position;