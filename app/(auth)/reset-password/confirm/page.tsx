import { ConfirmResetForm } from './_components/ConfirmResetForm'
import { Metadata } from 'next'
import { getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Set New Password - Ligaye.com',
  description: 'Set a new password for your Ligaye.com account',
}

interface PageProps {
  searchParams: Promise<{ 
    // New format (recommended)
    token_hash?: string
    type?: string
    // Old format (legacy)
    code?: string
    // Error handling
    error?: string
    error_description?: string
  }>
}

export default async function ConfirmResetPage({ searchParams }: PageProps) {
  const params = await searchParams
  console.log('params', params)
  const { token_hash, type, code, error, error_description } = params

  // If there's an error in the URL, show it
  if (error) {
    return (
      <div className="flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-red-800 font-semibold">Reset Link Error</h2>
            <p className="text-red-600 text-sm mt-1">
              {error_description || 'The password reset link is invalid or has expired.'}
            </p>
            <a 
              href="/reset-password" 
              className="text-red-700 underline text-sm mt-2 inline-block"
            >
              Request a new reset link
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Handle new format (token_hash + type) by establishing session
  if (token_hash && type) {
    const supabase = await createClient()
    
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as 'recovery',
      })

      if (verifyError) {
        console.error('Token verification error:', verifyError)
        redirect(`/reset-password/confirm?error=invalid_token&error_description=${encodeURIComponent('The reset link is invalid or has expired.')}`)
      }
      
      // Token verified successfully, session is now established
    } catch (error) {
      console.error('Token verification error:', error)
      redirect(`/reset-password/confirm?error=invalid_token&error_description=${encodeURIComponent('The reset link is invalid or has expired.')}`)
    }
  }

  // Check if user has a valid session (should be established by the reset link)
  const user = await getUser()
  
  // If we have a code parameter OR if user has an active session, show the form
  if (code || user) {
    return (
      <div className="flex items-center justify-center">
        <div className="w-full max-w-md">
          <ConfirmResetForm />
        </div>
      </div>
    )
  }

  // No session and no tokens - they accessed the page directly
  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h2 className="text-yellow-800 font-semibold">Invalid Access</h2>
          <p className="text-yellow-600 text-sm mt-1">
            You need to use the password reset link from your email to access this page.
          </p>
          <a 
            href="/reset-password" 
            className="text-yellow-700 underline text-sm mt-2 inline-block"
          >
            Request a new reset link
          </a>
        </div>
      </div>
    </div>
  )
}
 