'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { confirmResetSchema } from './_utils/validation'
import { z } from 'zod'

export type ConfirmResetActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Server action for confirming a password reset with an existing session
 * Used when the user is already authenticated via implicit flow
 */
export async function confirmPasswordResetWithSession(formData: FormData): Promise<ConfirmResetActionResult> {
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
    
    // Check if user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('User not authenticated:', userError)
      return { 
        success: false, 
        error: 'You must be authenticated to reset your password. Please use the link from your email.' 
      }
    }
    
    // Update the password for the authenticated user
    const { error: updateError } = await supabase.auth.updateUser({
      password: validatedData.password,
    })
    
    if (updateError) {
      console.error('Password update error:', updateError)
      return { 
        success: false, 
        error: updateError.message || 'Failed to update password. Please try again.' 
      }
    }
    
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

/**
 * Server action for confirming a password reset
 * Uses the reset code to update the password directly
 */
export async function confirmPasswordReset(formData: FormData): Promise<ConfirmResetActionResult> {
  // Extract form data
  const data = {
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  }
  
  // Extract reset code 
  const resetCode = formData.get('resetCode') as string | null

  // Validate form data
  try {
    const validatedData = confirmResetSchema.parse(data)
    
    // Create Supabase client
    const supabase = await createClient()
    
    // If we have a reset code, try to use it to establish session and update password
    if (resetCode) {
      try {
        // First, try to exchange the code for a session
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(resetCode)
        
        if (exchangeError) {
          console.error('Code exchange error:', exchangeError)
          return { 
            success: false, 
            error: 'The password reset link is invalid or has expired. Please request a new reset link.' 
          }
        }
        
        // Now update the password
        const { error: updateError } = await supabase.auth.updateUser({
          password: validatedData.password,
        })
        
        if (updateError) {
          console.error('Password update error:', updateError)
          return { 
            success: false, 
            error: updateError.message || 'Failed to update password. Please try again.' 
          }
        }
        
        return { success: true }
        
      } catch (error) {
        console.error('Reset code handling error:', error)
        return { 
          success: false, 
          error: 'The password reset link is invalid or has expired. Please request a new reset link.' 
        }
      }
    }
    
    // No reset code provided
    return { 
      success: false, 
      error: 'Invalid password reset request. Please use the link from your email.' 
    }
    
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