import { getUser, getCachedUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NewJobForm from './_components/NewJobForm'
import { getEmployerProfile } from './_queries'
import { getFreePostingStatus } from '@/lib/utils/system-settings'
import { CheckCircle, Gift } from 'lucide-react'

export default async function NewJobPage() {
  const user = await getCachedUser()

  if (!user) {
    redirect('/sign-in?redirect=/employer/jobs/new')
  }

  // Check if user is employer
  // const employerProfile = await getEmployerProfile(user.id)
  if (user.user_metadata.role !== 'employer') {
    redirect('/sign-in?redirect=/employer/jobs/new')
  }

  // if (!employerProfile) {
  //   redirect('/employer/profile')
  // }

  // Get free posting status
  const freePostingStatus = await getFreePostingStatus()

  return (
    <div className="container max-w-4xl py-10 mx-auto">
      <h1 className="text-2xl md:text-3xl font-semibold mb-2 text-[#1a1e2d]">Post a New Job</h1>
      <p className="text-[#9aa3bc] mb-8">Create a new job posting for your company</p>

      {/* Free Posting Banner */}
      {freePostingStatus.isCurrentlyActive && (
        <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
              <Gift className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-800">Free Job Posting Active!</h3>
              <p className="text-sm text-green-700">
                Post your job for free during this promotional campaign.
                {freePostingStatus.timeRemaining && freePostingStatus.timeRemaining > 0 && (
                  <span className="ml-1">
                    Campaign ends {new Date(Date.now() + freePostingStatus.timeRemaining).toLocaleDateString()}.
                  </span>
                )}
              </p>
            </div>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
        </div>
      )}

      <NewJobForm freePostingActive={freePostingStatus.isCurrentlyActive} />
    </div>
  )
} 