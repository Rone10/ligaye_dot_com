# Email Drafts Migration Instructions

## Running the Migration

To create the email_drafts table, you need to run the migration SQL in your Supabase dashboard:

1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `0002_add_email_drafts.sql`
4. Paste and run the SQL in the editor

## What This Migration Does

This migration creates:

1. **email_drafts table** with the following columns:
   - `id` (UUID, primary key)
   - `user_id` (UUID, references profiles)
   - `recipient` (TEXT)
   - `subject` (TEXT)
   - `body_html` (TEXT)
   - `body_text` (TEXT, optional)
   - `cc` (TEXT, optional)
   - `bcc` (TEXT, optional)
   - `status` (TEXT, either 'draft' or 'sent')
   - `sent_at` (TIMESTAMP, optional)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)
   - `deleted` (BOOLEAN, for soft deletes)

2. **Indexes** for performance:
   - user_id
   - status
   - created_at
   - deleted

3. **RLS Policies** that ensure:
   - Only admin users can view email drafts
   - Only admin users can create email drafts
   - Admin users can only update/delete their own drafts
   - All operations are properly secured

4. **Auto-update trigger** for the updated_at column

## Verifying the Migration

After running the migration, you can verify it worked by:

1. Checking the table exists:
   ```sql
   SELECT * FROM email_drafts LIMIT 1;
   ```

2. Checking the RLS policies:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'email_drafts';
   ```

## Rollback

If you need to rollback this migration:

```sql
-- Drop the table (this will also drop all policies and triggers)
DROP TABLE IF EXISTS email_drafts CASCADE;
```