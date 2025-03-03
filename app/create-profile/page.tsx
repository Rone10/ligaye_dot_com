import { getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileCreationForm } from './_components/ProfileCreationForm'

export default async function CreateProfilePage() {
  // Get authenticated user
  const user = await getUser()
  
  // If no user is authenticated, redirect to sign-in
  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Create Your Profile</h1>
      <ProfileCreationForm user={user} />
    </div>
  )
} 