import { db } from '@/lib/db'
import { profiles, userRoleEnum } from '@/lib/db/schema'
import type { NewProfile } from '@/lib/db/schema'

/**
 * Creates a new user profile in the database
 * @param userId - The Supabase Auth user ID
 * @param fullName - The user's full name
 * @param role - The user's role (default: 'candidate')
 */
export async function createUserProfile(
  userId: string,
  fullName: string,
  role: typeof userRoleEnum.enumValues[number] = 'candidate'
): Promise<{ success: boolean; error?: string }> {
  try {
    await (await db())
      .insert(profiles)
      .values({
        userId,
        fullName,
        role,
      })
    
    return { success: true }
  } catch (error) {
    console.error('Failed to create user profile:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create user profile' 
    }
  }
} 