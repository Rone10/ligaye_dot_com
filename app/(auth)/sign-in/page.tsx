import { SignInForm } from './_components/SignInForm'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'

// Force dynamic rendering since this page checks authentication
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Sign In - Ligaye',
  description: 'Sign in to your Ligaye account',
}

interface SignInPageProps {
  searchParams: Promise<{ redirect?: string }>
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  // Check if user is already logged in
  const user = await getUser()
  
  // Get the redirect parameter
  const { redirect: redirectTo } = await searchParams
  
  // Redirect to the specified page or home if already authenticated
  if (user) {
    redirect(redirectTo || '/')
  }
  
  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-md">
        <SignInForm redirectTo={redirectTo} />
      </div>
    </div>
  )
} 