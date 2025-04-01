import { RequestResetForm } from './_components/RequestResetForm'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Reset Password - Ligaye.com',
  description: 'Reset your password for Ligaye.com',
}

export default async function ResetPasswordPage() {
  // Check if user is already logged in
  const user = await getUser()
  
  // Redirect to home if already authenticated
  if (user) {
    redirect('/')
  }
  
  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-md">
        <RequestResetForm />
      </div>
    </div>
  )
} 