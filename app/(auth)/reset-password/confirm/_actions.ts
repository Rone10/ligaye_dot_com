'use server'

import { createClient, getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { confirmResetSchema } from './_utils/validation'
import { z } from 'zod'

export type ConfirmResetActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Server action for confirming a password reset
 * This action validates the new password and updates it using Supabase Auth
 * Note: Session should be established client-side before calling this action
 */
export async function confirmPasswordReset(formData: FormData): Promise<ConfirmResetActionResult> {
  // Extract form data
  const data = {
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  }

  // Validate form data
  try {
    const validatedData = confirmResetSchema.parse(data)
    
    // Create Supabase client
    const supabase = await createClient()
    
    // Verify that we have a valid session
    // const user = await getUser()
    
    // if (!user) {
    //   console.error('Session verification error: no user found')
    //   return { 
    //     success: false, 
    //     error: 'Your password reset session has expired. Please request a new password reset link.' 
    //   }
    // }
    // console.log('user in confirmPasswordReset action', user)
    
    // Update the user's password
    const { error } = await supabase.auth.updateUser({
      password: validatedData.password,
    })
    
    // Handle Supabase Auth errors
    if (error) {
      console.error('Password reset confirmation error:', error)
      
      // Handle specific error types
      if (error.message.includes('session')) {
        return { 
          success: false, 
          error: 'Your password reset session has expired. Please request a new password reset link.' 
        }
      }
      
      return { 
        success: false, 
        error: error.message || 'Failed to reset password. Please try again.' 
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
    console.error('Password reset confirmation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }
  }
} 