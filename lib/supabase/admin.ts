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
export const supabaseAdmin = hasServiceRoleKey
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

/**
 * Update user metadata for a specific user
 * 
 * NOTE: This function requires the SUPABASE_SERVICE_ROLE_KEY to be set
 * in environment variables.
 */
export async function updateUserMetadata(userId: string, metadata: Record<string, any>) {
  try {
    // Return null if we don't have admin access
    if (!supabaseAdmin) {
      console.warn('Cannot update user metadata - missing SUPABASE_SERVICE_ROLE_KEY')
      return { success: false, error: 'Admin client not available' }
    }
    
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: metadata
    })
    
    if (error) {
      console.error('Error updating user metadata:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, user: data.user }
  } catch (error) {
    console.error('Unexpected error in updateUserMetadata:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

/**
 * Sync user role from database to auth metadata
 * This function reads the role from the profiles table and updates the auth metadata
 */
export async function syncUserRoleToMetadata(userId: string) {
  try {
    if (!supabaseAdmin) {
      console.warn('Cannot sync user role - missing SUPABASE_SERVICE_ROLE_KEY')
      return { success: false, error: 'Admin client not available' }
    }

    // First, get the user's role from the database
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('user_id', userId)
      .eq('deleted', false)
      .single()

    if (profileError || !profileData) {
      console.error('Error fetching user profile:', profileError)
      return { success: false, error: 'User profile not found' }
    }

    // Then update the user metadata with the correct role
    const result = await updateUserMetadata(userId, { role: profileData.role })
    
    if (result.success) {
      console.log(`Successfully synced role '${profileData.role}' to metadata for user ${userId}`)
    }
    
    return result
  } catch (error) {
    console.error('Unexpected error in syncUserRoleToMetadata:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}
  