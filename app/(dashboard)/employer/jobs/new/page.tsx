import { getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NewJobForm from './_components/NewJobForm'
import { getEmployerProfile } from './_queries'

export default async function NewJobPage() {
  const user = await getUser()

  if (!user) {
    redirect('/sign-in?redirect=/employer/jobs/new')
  }

  // check if user is employer
  const employerProfile = await getEmployerProfile(user.id)
  
  if (!employerProfile) {
    redirect('/employer/profile')
  }
  
  return (
    <div className="container max-w-4xl py-10 mx-auto">
      <h1 className="text-2xl md:text-3xl font-semibold mb-2 text-[#1a1e2d]">Post a New Job</h1>
      <p className="text-[#9aa3bc] mb-8">Create a new job posting for your company</p>
      <NewJobForm />
    </div>
  )
} 