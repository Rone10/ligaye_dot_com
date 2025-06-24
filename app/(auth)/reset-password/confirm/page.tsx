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
    token_hash?: string
    type?: string
    error?: string
    error_description?: string
  }>
}

export default async function ConfirmResetPage({ searchParams }: PageProps) {
  const params = await searchParams
  const { token_hash, type, error, error_description } = params

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

  // If we have tokens in the URL, verify them to establish a session
  if (token_hash && type) {
    const supabase = await createClient()
    
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as 'recovery',
      })

      if (verifyError) {
        console.error('Token verification error:', verifyError)
        // Redirect to error state
        redirect(`/reset-password/confirm?error=invalid_token&error_description=${encodeURIComponent('The reset link is invalid or has expired.')}`)
      }
      
      // Tokens verified successfully, session is now established
      // Continue to show the form
    } catch (error) {
      console.error('Token verification error:', error)
      redirect(`/reset-password/confirm?error=invalid_token&error_description=${encodeURIComponent('The reset link is invalid or has expired.')}`)
    }
  } else {
    // No tokens in URL - check if user already has a session
    const user = await getUser()
    
    if (!user) {
      // No session and no tokens - this means they accessed the page directly
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
  }
  
  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-md">
        <ConfirmResetForm />
      </div>
    </div>
  )
}
 