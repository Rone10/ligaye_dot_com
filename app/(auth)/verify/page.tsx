import { Metadata } from 'next'
import { VerificationStatus } from './_components/VerificationStatus'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Verify Email - Ligaye.com',
  description: 'Verify your email address for Ligaye.com',
}

interface VerifyPageProps {
  searchParams: {
    token_hash?: string
    type?: string
    error?: string
    error_description?: string
  }
}

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  // Check if this is a callback URL with token from Supabase Auth
  const hasAuthParams = searchParams.token_hash && searchParams.type

  // Check for errors
  const hasErrors = searchParams.error || searchParams.error_description

  let status: 'success' | 'error' | 'pending' = 'pending'
  let message: string | undefined

  if (hasAuthParams) {
    // This page is being called as part of the email verification callback
    if (searchParams.type === 'email_change' || searchParams.type === 'signup') {
      // For email verification, we can display success
      status = 'success'
      message = 'Your email has been successfully verified. You can now sign in to your account.'
    } else {
      // If we're receiving other types of callbacks, we need to check session
      const supabase = await createClient()
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session) {
        status = 'error'
        message = 'Verification failed. Please try again or contact support.'
      } else {
        status = 'success'
        message = 'Authentication successful. You are now signed in.'
      }
    }
  } else if (hasErrors) {
    // Handle authentication errors
    status = 'error'
    message = searchParams.error_description || 'Verification failed. Please try again or contact support.'
  } else {
    // Default case - user navigated here directly
    status = 'pending'
    message = 'Please check your email for a verification link to complete the sign-up process.'
  }

  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-md">
        <VerificationStatus status={status} message={message} />
      </div>
    </div>
  )
} 