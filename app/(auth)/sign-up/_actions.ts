'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createUserProfile } from './_queries'
import { signUpSchema } from './_utils/validation'
import { z } from 'zod'
import { signupArcjet } from '@/lib/arcjet'
import { headers } from 'next/headers'

export type SignUpActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Server action for user sign-up
 * This action validates the form data, creates a Supabase user, and creates a profile
 */
export async function signUpUser(formData: FormData): Promise<SignUpActionResult> {
  // Extract form data
  const data = {
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
    password: formData.get('password'),
    userRole: formData.get('userRole'),
  }

  // Arcjet protection - rate limiting, bot detection, and email validation
  const request = new Request('https://ligaye.com/sign-up', {
    headers: await headers(),
  });
  
  const decision = await signupArcjet.protect(request);
  
  if (decision.isDenied()) {
    return {
      success: false,
      error: 'Too many sign-up attempts. Please try again later.'
    };
  }

  // Validate form data
  try {
    const validatedData = signUpSchema.parse(data)
    
    // Create Supabase client
    const supabase = await createClient()
    
    // Attempt to sign up the user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/verify`,
        data: {
          first_name: validatedData.firstName,
          last_name: validatedData.lastName,
          role: validatedData.userRole,
        },
      },
    })
    
    // Handle Supabase Auth errors
    if (authError) {
      console.error('Supabase Auth error:', authError)
      return { 
        success: false, 
        error: authError.message 
      }
    }
    
    // Ensure user was created
    if (!authData.user) {
      return { 
        success: false, 
        error: 'Failed to create user account.' 
      }
    }
    
    // Create user profile in our database
    const fullName = `${validatedData.firstName} ${validatedData.lastName}`.trim()
    const profileResult = await createUserProfile(
      authData.user.id,
      fullName,
      validatedData.userRole // Use selected role
    )
    
    // Handle profile creation errors
    if (!profileResult.success) {
      console.error('Profile creation error:', profileResult.error)
      return {
        success: false,
        error: 'Account created but profile setup failed. Please contact support.'
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
    console.error('Sign-up error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }
  }
} 