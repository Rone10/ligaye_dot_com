import { createClient } from '@supabase/supabase-js'

// Check if we have the service role key available
const hasServiceRoleKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY

// Warn if the key is missing
if (!hasServiceRoleKey) {
  console.warn(
    'SUPABASE_SERVICE_ROLE_KEY is missing from environment variables.\n' +
    'Admin functions like getUserById will not work properly.\n' +
    'Add this key to your .env file to enable admin features.'
  )
}

// Create a Supabase client with admin privileges if the service role key is available
const supabaseAdmin = hasServiceRoleKey
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : null

/**
 * Get a user by their Supabase user ID
 * 
 * NOTE: This function requires the SUPABASE_SERVICE_ROLE_KEY to be set
 * in environment variables.
 */
export async function getUserById(userId: string) {
  try {
    // Return null if we don't have admin access
    if (!supabaseAdmin) {
      console.warn('Cannot get user by ID - missing SUPABASE_SERVICE_ROLE_KEY')
      return null
    }
    
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId)
    
    if (error) {
      console.error('Error fetching user by ID:', error)
      return null
    }
    
    return data.user
  } catch (error) {
    console.error('Unexpected error in getUserById:', error)
    return null
  }
}
  