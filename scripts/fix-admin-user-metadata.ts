/**
 * One-time script to fix Abdul Jalloh's user metadata
 * This script syncs the user's role from the database to their auth metadata
 */

import { syncUserRoleToMetadata } from '../lib/supabase/admin'

async function fixAdminUserMetadata() {
  console.log('🔄 Starting user metadata fix...')
  
  // Abdul Jalloh's user ID from the database query we ran earlier
  const userIdToFix = 'f4bb93b4-91ad-4c70-83c4-71b987764ff7'
  
  try {
    const result = await syncUserRoleToMetadata(userIdToFix)
    
    if (result.success) {
      console.log('✅ Successfully updated user metadata!')
      console.log('🎉 Abdul Jalloh should now be able to access the admin panel')
    } else {
      console.error('❌ Failed to update user metadata:', result.error)
    }
  } catch (error) {
    console.error('💥 Unexpected error:', error)
  }
}

// Run the script
fixAdminUserMetadata().then(() => {
  console.log('📋 Script completed')
  process.exit(0)
}).catch((error) => {
  console.error('💥 Script failed:', error)
  process.exit(1)
}) 