'use server'

import { createClient } from '@/lib/supabase/server'
import { requestResetSchema } from './_utils/validation'
import { z } from 'zod'

export type RequestResetActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Server action for requesting a password reset
 * This action validates the email and sends a password reset email via Supabase Auth
 */
export async function requestPasswordReset(formData: FormData): Promise<RequestResetActionResult> {
  // Extract form data
  const email = formData.get('email')

  // Validate form data
  try {
    const validatedData = requestResetSchema.parse({ email })
    
    // Create Supabase client
    const supabase = await createClient()
    
    // Get the base URL for redirects
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    // Request a password reset
    const { error } = await supabase.auth.resetPasswordForEmail(validatedData.email, {
      redirectTo: `${baseUrl}/reset-password/confirm`,
    })
    
    // Handle Supabase Auth errors
    if (error) {
      console.error('Password reset request error:', error)
      // Return generic error message to prevent email enumeration
      return { 
        success: false, 
        error: 'Unable to process your request. Please try again later.' 
      }
    }
    
    // Success - always return success even if email doesn't exist (security best practice)
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
    console.error('Password reset request error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again later.'
    }
  }
} 