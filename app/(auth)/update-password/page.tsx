import { UpdatePasswordForm } from './_components/UpdatePasswordForm'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'

// Force dynamic rendering since this page checks authentication
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Update Password - Ligaye.com',
  description: 'Update your account password',
}

export default async function UpdatePasswordPage() {
  // Check if user is logged in
  const user = await getUser()
  
  // Redirect to sign-in if not authenticated
  if (!user) {
    redirect('/sign-in?redirect=/update-password')
  }
  
  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-md">
        <UpdatePasswordForm />
      </div>
    </div>
  )
} 