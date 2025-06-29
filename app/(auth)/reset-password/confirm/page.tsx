import { ConfirmResetForm } from './_components/ConfirmResetForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Set New Password - Ligaye.com',
  description: 'Set a new password for your Ligaye.com account',
}

interface PageProps {
  searchParams: Promise<{ 
    // Password reset code from email
    code?: string
    // Error handling
    error?: string
    error_description?: string
  }>
}

export default async function ConfirmResetPage({ searchParams }: PageProps) {
  const params = await searchParams
  console.log('params', params)
  const { code, error, error_description } = params
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
          <ConfirmResetForm resetCode={code} />
        </div>
      </div>
    )
  }

  // No code - they accessed the page directly
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
 