import { ConfirmResetForm } from './_components/ConfirmResetForm'
import { Metadata } from 'next'
import { getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Set New Password - Ligaye.com',
  description: 'Set a new password for your Ligaye.com account',
}

export default async function ConfirmResetPage() {
  // Check if user is already logged in
  const user = await getUser()
  
  // Note: We might want to allow password reset even if logged in,
  // particularly because this is a page that's linked from an email
  // and the user may have lost their old password.
  // However, we'll redirect them if they're already logged in, to avoid confusion.
  if (user) {
    redirect('/')
  }
  
  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-md">
        <ConfirmResetForm />
      </div>
    </div>
  )
}
 