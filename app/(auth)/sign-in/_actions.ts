'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signInSchema } from './_utils/validation'
import { z } from 'zod'
import type { AuthUser } from '@supabase/supabase-js'

export type SignInActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Server action for user sign-in
 * This action validates the form data, authenticates the user with Supabase Auth,
 * and redirects them to their respective profile page based on their role.
 */
export async function signInUser(formData: FormData): Promise<SignInActionResult> {
  let authUser: AuthUser | null = null; // Variable to hold user data outside try block

  try {
    // Extract and validate form data
    const data = {
      email: formData.get('email'),
      password: formData.get('password'),
    }
    const validatedData = signInSchema.parse(data)

    // Create Supabase client
    const supabase = await createClient()

    // Attempt to sign in the user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    })

    // Handle Supabase Auth errors
    if (authError) {
      console.error('Supabase Auth error:', authError)
      return {
        success: false,
        error: 'Invalid email or password. Please try again.'
      }
    }

    // Ensure user was authenticated and store it
    if (!authData.user) {
      return {
        success: false,
        error: 'Failed to authenticate user.'
      }
    }
    authUser = authData.user; // Assign user data here

    // NOTE: We no longer return { success: true } from within the try block

  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      const fieldErrors: { [key: string]: string[] } = {};

      error.errors.forEach((issue) => {
        const field = issue.path.join('.');
        if (!fieldErrors[field]) {
          fieldErrors[field] = [];
        }
        (fieldErrors[field] as string[]).push(issue.message);
      });

      return {
        success: false,
        fieldErrors
      };
    }

    // Handle other unexpected errors during validation/auth
    console.error('Sign-in validation/auth error:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during sign-in setup';
    return {
      success: false,
      error: errorMessage
    };
  }

  // --- Redirection logic moved outside the try...catch block ---

  // Check if we successfully got the user data
  if (!authUser) {
    // This should technically not be reached if the try block succeeded without returning
    // But it guards against potential logic errors.
    console.error('Sign-in error: Auth user data missing after try block.');
    return { 
      success: false, 
      error: 'An internal error occurred during sign-in. Please try again.' 
    };
  }

  // Redirect based on role stored in Supabase Auth user_metadata
  const userRole = authUser.user_metadata?.role;
  // console.log('userRole', userRole) // Keep console log if needed for debugging

  if (userRole === 'candidate') {
    redirect('/candidate/profile');
  } else if (userRole === 'employer') {
    redirect('/employer/profile');
  } else {
    // Handle missing/unexpected role in metadata or redirect to a default dashboard
    console.warn(
      `Role not found in user_metadata for user ID: ${authUser.id}. Redirecting to home.`
    );
    redirect('/'); // Redirect to home page as a fallback
  }

  // Note: Because redirect() throws, code below this point in the successful path won't execute,
  // so we don't need to explicitly return a success object here.
} 