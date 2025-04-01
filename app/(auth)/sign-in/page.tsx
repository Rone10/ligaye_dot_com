import { SignInForm } from './_components/SignInForm'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Sign In - Ligaye.com',
  description: 'Sign in to your Ligaye.com account',
}

export default async function SignInPage() {
  // Check if user is already logged in
  const user = await getUser()
  
  // Redirect to home if already authenticated
  if (user) {
    redirect('/')
  }
  
  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-md">
        <SignInForm />
      </div>
    </div>
  )
} 