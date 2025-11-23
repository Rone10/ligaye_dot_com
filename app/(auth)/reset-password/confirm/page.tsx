import { ConfirmResetForm } from './_components/ConfirmResetForm'
import { HashFragmentHandler } from './_components/HashFragmentHandler'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Set New Password - Ligaye',
  description: 'Set a new password for your Ligaye account',
}

interface PageProps {
  searchParams: Promise<{ 
    // Password reset code from email
    code?: string
    // Source of the request (e.g., 'mobile')
    source?: string
    // Error handling
    error?: string
    error_description?: string
  }>
}

export default async function ConfirmResetPage({ searchParams }: PageProps) {
  const params = await searchParams
  console.log('params', params)
  const { code, source, error, error_description } = params
  console.log('params', params)

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

  // If we have a code parameter, show the password reset form
  if (code) {
    return (
      <div className="flex items-center justify-center">
        <div className="w-full max-w-md">
          <ConfirmResetForm resetCode={code} source={source} />
        </div>
      </div>
    )
  }

  // No code - check if this might be an implicit flow (hash fragment)
  // The HashFragmentHandler will process any hash fragments on the client side
  return (
    <HashFragmentHandler>
      <div className="flex items-center justify-center">
        <div className="w-full max-w-md">
          <ConfirmResetForm source={source} isImplicitFlow={true} />
        </div>
      </div>
    </HashFragmentHandler>
  )
}
 