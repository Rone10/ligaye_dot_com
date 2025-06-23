'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { cache } from 'react'

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
 * Verifies the user session and returns session data
 * This function is cached to avoid duplicate requests during a render pass
 */
export const verifySession = cache(async () => {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.log('Session verification failed:', error.message)
      return null
    }
    
    if (!user) {
      return null
    }
    
    return { isAuth: true, userId: user.id, user }
  } catch (error) {
    console.log('Failed to verify session:', error)
    return null
  }
})

/**
 * Gets the current authenticated user
 * This function is cached to avoid duplicate requests during a render pass
 * Use this function throughout your application for consistent auth checks
 */
export const getUser = cache(async () => {
  try {
    const session = await verifySession()
    if (!session) return null
    
    // Return the user from the session
    // You can extend this to fetch additional user data from your database
    return session.user
  } catch (error) {
    console.log('Failed to fetch user:', error)
    return null
  }
})