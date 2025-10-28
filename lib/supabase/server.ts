'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { cache } from 'react'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 * Gets the current authenticated user (non-cached)
 * This function directly accesses cookies and should not be cached
 * to avoid async context issues during static generation
 */
export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/**
 * Helper: Get the current user and their profile (if any), and determine admin status.
 * This avoids relying solely on auth metadata and reads the canonical role from the profiles table.
 */
export async function getUserWithProfile() {
  const user = await getUser()
  if (!user) return { user: null, profile: null, isAdmin: false }

  try {
    const result = await (await db())
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1)
      .then(res => res[0] || null)

    const isAdmin = !!result && result.role === 'admin'

    return { user, profile: result, isAdmin }
  } catch (error) {
    console.error('Error fetching user profile in getUserWithProfile:', error)
    return { user, profile: null, isAdmin: false }
  }
}

/**
 * SIMPLE CACHED VERSION
 * Request-level cached user function - use this instead of getUser() everywhere
 * This maintains the user session across multiple calls in the same render pass
 */
export const getCachedUser = cache(async () => {
  return await getUser()
})

/**
 * Cached session verification that works with user data
 * This function is cached but doesn't directly access dynamic APIs
 * It should be called with user data that was already retrieved
 */
export const getCachedUserSession = cache(async (userId: string) => {
  try {
    // This function can perform database operations or other
    // non-dynamic processing based on the user ID
    return {
      isAuth: true,
      userId: userId,
      // Add any additional cached user data processing here
    }
  } catch (error) {
    console.log('Failed to process user session:', error)
    return null
  }
})

/**
 * Cached user data fetching function
 * This can be used for expensive operations that depend on user ID
 * but don't directly access cookies
 */
export const getCachedUserData = cache(async (userId: string) => {
  try {
    // Example: fetch additional user data from database
    // This is cached and safe because it doesn't use dynamic APIs
    return {
      userId,
      // Add any expensive user data operations here
    }
  } catch (error) {
    console.log('Failed to fetch cached user data:', error)
    return null
  }
})

/**
 * Utility function that combines non-cached auth check with cached processing
 * This follows Next.js best practices for async context management
 */
export async function getUserWithCachedData() {
  // First, get the user using non-cached function (accesses cookies)
  const user = await getUser()
  
  if (!user) {
    return null
  }
  
  // Then, use cached functions for any additional processing
  const [sessionData, userData] = await Promise.all([
    getCachedUserSession(user.id),
    getCachedUserData(user.id)
  ])
  
  return {
    user,
    session: sessionData,
    userData: userData
  }
}