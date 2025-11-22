'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signInSchema } from './_utils/validation'
import { z } from 'zod'
import type { AuthUser } from '@supabase/supabase-js'
import { db } from '@/lib/db'
import { profiles, candidateProfiles, employerProfiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { authArcjet } from '@/lib/arcjet'
import { headers } from 'next/headers'

export type SignInActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  emailNotVerified?: boolean;
  userEmail?: string;
}

export type ResendVerificationResult = {
  success: boolean;
  error?: string;
}

/**
 * Server action to resend verification email
 * This action allows users who haven't verified their email to request a new verification link
 */
export async function resendVerificationEmail(email: string): Promise<ResendVerificationResult> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/verify`
      }
    })

    if (error) {
      console.error('Resend verification email error:', error)
      return {
        success: false,
        error: 'Failed to resend verification email. Please try again later.'
      }
    }

    return {
      success: true
    }
  } catch (error) {
    console.error('Unexpected error resending verification email:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    }
  }
}

/**
 * Server action for user sign-in
 * This action validates the form data, authenticates the user with Supabase Auth,
 * checks for profile existence, and redirects them to the appropriate page
 * (dashboard or profile creation).
 */
export async function signInUser(formData: FormData): Promise<SignInActionResult> {
  // Rate limiting check
  const request = new Request('https://ligaye.com/sign-in', {
    headers: await headers(),
  });
  
  const decision = await authArcjet.protect(request);
  
  if (decision.isDenied()) {
    return {
      success: false,
      error: 'Too many sign-in attempts. Please try again later.'
    };
  }
  
  let authUser: AuthUser | null = null;

  // --- Authentication Logic (inside try...catch) ---
  try {
    const data = {
      email: formData.get('email'),
      password: formData.get('password'),
    }
    const validatedData = signInSchema.parse(data)
    const supabase = await createClient()
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    })

    if (authError) {
      console.error('Supabase Auth error:', authError)

      // Check if the error is due to unverified email
      const errorMessage = authError.message.toLowerCase()
      if (
        errorMessage.includes('email not confirmed') ||
        errorMessage.includes('not confirmed') ||
        errorMessage.includes('email confirmation')
      ) {
        return {
          success: false,
          error: 'Please verify your email address before signing in. Check your inbox for the verification link.',
          emailNotVerified: true,
          userEmail: validatedData.email
        }
      }

      // Generic error for invalid credentials or other auth issues
      return {
        success: false,
        error: 'Invalid email or password. Please try again.'
      }
    }
    if (!authData.user) {
      return {
        success: false,
        error: 'Failed to authenticate user.'
      }
    }
    authUser = authData.user
    // console.log('authUser', authUser)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: { [key: string]: string[] } = {}
      error.errors.forEach((issue) => {
        const field = issue.path.join('.')
        if (!fieldErrors[field]) fieldErrors[field] = []
        fieldErrors[field].push(issue.message)
      })
      return {
        success: false,
        fieldErrors
      }
    }
    console.error('Sign-in validation/auth error:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during sign-in setup'
    return {
      success: false,
      error: errorMessage
    }
  }

  // --- Profile Check & Redirection Logic (outside try...catch) ---

  if (!authUser) {
    console.error('Sign-in error: Auth user data missing after try block.')
    return {
      success: false,
      error: 'An internal error occurred during sign-in. Please try again.'
    }
  }

  // Get the redirect parameter from form data
  const redirectTo = formData.get('redirectTo') as string | null

  const userId = authUser.id; // This is the Supabase Auth User ID
  const userRole = authUser.user_metadata?.role;
  let redirectPath = '/' // Default fallback

  // If a specific redirect URL was provided, use it (but validate it's safe)
  if (redirectTo && redirectTo.startsWith('/')) {
    redirectPath = redirectTo
  } else {
    // Use the existing role-based redirect logic
    try {
      const database = await db();

      // 1. Find the base profile using the Supabase Auth User ID
      const baseProfile = await database.query.profiles.findFirst({
        where: eq(profiles.userId, userId),
        columns: { id: true } // We need the profiles.id
      });

      if (!baseProfile) {
        // This should not happen if signup creates a base profile correctly
        console.error(`Base profile not found for userId: ${userId}. Redirecting to home.`);
        redirectPath = '/'
      } else {
        const profileId = baseProfile.id; // The ID from the profiles table

        // 2. Check for specific profile existence based on role
        if (userRole === 'candidate') {
          const existingSpecificProfile = await database.query.candidateProfiles.findFirst({
            // Assuming the FK column in candidateProfiles is named 'profileId'
            where: eq(candidateProfiles.profileId, profileId),
          });
          redirectPath = existingSpecificProfile ? '/candidate' : '/candidate/profile';
        } else if (userRole === 'employer') {
          const existingSpecificProfile = await database.query.employerProfiles.findFirst({
            // Assuming the FK column in employerProfiles is named 'profileId'
            where: eq(employerProfiles.profileId, profileId),
          });
          redirectPath = existingSpecificProfile ? '/employer' : '/employer/profile';
        } else if (userRole === 'admin') {
          redirectPath = '/admin/users'
        } else {
          console.warn(`Unknown role ('${userRole}') found for userId: ${userId}. Redirecting to home.`);
          redirectPath = '/'
        }
      }
    } catch (dbError) {
      console.error(`Database error during profile check for userId ${userId} (Role: ${userRole}):`, dbError);
      // Fallback strategy: Redirect to profile page, as we don't know if it exists
      if (userRole === 'candidate') {
        redirectPath = '/candidate/profile';
      } else if (userRole === 'employer') {
        redirectPath = '/employer/profile';
      } else {
        redirectPath = '/' // Fallback to home if role is unknown
      }
    }
  }

  // Perform the redirect
  redirect(redirectPath);

  // This part is unreachable because redirect() throws
} 