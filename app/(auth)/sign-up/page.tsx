import { SignUpForm } from './_components/SignUpForm'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'

// Force dynamic rendering since this page checks authentication
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Sign Up - Ligaye',
  description: 'Create an account on Ligaye to find or post jobs in Gambia',
}

export default async function SignUpPage() {
  // Check if user is already logged in
  const user = await getUser()
  
  // Redirect to home if already authenticated
  if (user) {
    redirect('/')
  }
  
  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-md">
        <SignUpForm />
      </div>
    </div>
  )
} 