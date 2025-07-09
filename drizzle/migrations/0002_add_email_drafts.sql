-- Migration: Add email_drafts table for individual email composition
-- This migration should be run in Supabase SQL Editor
-- After running, you may need to run: pnpm drizzle-kit push

-- Create email_drafts table
CREATE TABLE IF NOT EXISTS email_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  cc TEXT,
  bcc TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent')),
  sent_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted BOOLEAN NOT NULL DEFAULT false
);

-- Create indexes
CREATE INDEX IF NOT EXISTS email_drafts_user_id_idx ON email_drafts(user_id);
CREATE INDEX IF NOT EXISTS email_drafts_status_idx ON email_drafts(status);
CREATE INDEX IF NOT EXISTS email_drafts_created_at_idx ON email_drafts(created_at);
CREATE INDEX IF NOT EXISTS email_drafts_deleted_idx ON email_drafts(deleted);

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
CREATE TRIGGER update_email_drafts_updated_at BEFORE UPDATE ON email_drafts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();