'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signInSchema } from './_utils/validation'
import { z } from 'zod'

export type SignInActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Server action for user sign-in
 * This action validates the form data and authenticates the user with Supabase Auth
 */
export async function signInUser(formData: FormData): Promise<SignInActionResult> {
  // Extract form data
  const data = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  // Validate form data
  try {
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
    
    // Ensure user was authenticated
    if (!authData.user) {
      return { 
        success: false, 
        error: 'Failed to authenticate user.' 
      }
    }
    
    // Success - return result
    return { success: true }
    
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string[]> = {}
      
      for (const issue of error.errors) {
        const field = issue.path[0] as string
        if (!fieldErrors[field]) {
          fieldErrors[field] = []
        }
        fieldErrors[field].push(issue.message)
      }
      
      return {
        success: false,
        fieldErrors
      }
    }
    
    // Handle other errors
    console.error('Sign-in error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }
  }
} 