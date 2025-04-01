'use server'

import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { updatePasswordSchema } from './_utils/validation'
import { z } from 'zod'

export type UpdatePasswordActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Server action for updating a logged-in user's password
 * This action validates the passwords and updates it using Supabase Auth
 */
export async function updatePassword(formData: FormData): Promise<UpdatePasswordActionResult> {
  // Extract form data
  const data = {
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
  }

  // Validate form data
  try {
    const validatedData = updatePasswordSchema.parse(data)
    
    // Create Supabase client and ensure user is logged in
    const supabase = await createClient()
    const user = await getUser()
    
    if (!user) {
      return { 
        success: false, 
        error: 'You must be logged in to update your password.' 
      }
    }
    
    // First, verify the current password by signing in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email || '',
      password: validatedData.currentPassword,
    })
    
    if (signInError) {
      console.error('Current password verification error:', signInError)
      return { 
        success: false, 
        error: 'Current password is incorrect.' 
      }
    }
    
    // Now update the password
    const { error: updateError } = await supabase.auth.updateUser({
      password: validatedData.newPassword,
    })
    
    // Handle Supabase Auth errors
    if (updateError) {
      console.error('Password update error:', updateError)
      return { 
        success: false, 
        error: updateError.message || 'Failed to update password.' 
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
    console.error('Password update error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }
  }
} 