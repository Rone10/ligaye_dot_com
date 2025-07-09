import { createClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import path from 'path';

async function runMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing required environment variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'drizzle/migrations/0002_add_email_drafts.sql');
    const migrationSQL = await fs.readFile(migrationPath, 'utf-8');

    // Execute the migration
    const { error } = await supabase.from('_migrations').insert({ 
      name: '0002_add_email_drafts.sql',
      executed_at: new Date().toISOString()
    }).single();

    if (error && !error.message.includes('duplicate key')) {
      console.error('Error recording migration:', error);
    }

    // Run the actual SQL
    const { error: sqlError } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });

    if (sqlError) {
      console.error('Error executing migration:', sqlError);
      process.exit(1);
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();