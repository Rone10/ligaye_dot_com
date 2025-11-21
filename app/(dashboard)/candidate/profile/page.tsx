import { redirect } from 'next/navigation';
import { getUser } from '@/lib/supabase/server';
import { getCandidateProfileData } from './_queries';
import ProfileForm from './_components/profile-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface PageProps {
  params: Promise<{}>;
  searchParams: Promise<{
    tab?: string;
    error?: string;
    redirect?: string;
  }>;
}

// Helper function for authentication (outside cache scope)
async function checkProfileAccess(): Promise<{ user: any; hasAccess: boolean }> {
  const user = await getUser()
  if (!user) {
    return { user: null, hasAccess: false }
  }
  
  return { user, hasAccess: true }
}

export default async function CandidateProfilePage({ params, searchParams }: PageProps) {
  // Step 1: Authentication check OUTSIDE cache scope
  const { user, hasAccess } = await checkProfileAccess()
  
  // Handle unauthorized access
  if (!hasAccess || !user) {
    redirect('/sign-in?redirect=/candidate/profile')
  }
  
  // Step 2: Await search params and fetch cached data (no auth logic inside)
  const [{ tab, error, redirect: redirectUrl }, profileData] = await Promise.all([
    searchParams,
    getCandidateProfileData(user.id)
  ])

  // Check if profile exists, if not show creation form
  const hasProfile = !!profileData?.candidateProfile

  return (
    <div className="container mx-auto py-10 max-w-5xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Your Professional Profile</h1>
          <p className="text-gray-500 mt-1">Complete your profile to help employers find you</p>
        </div>

        {error === 'profileIncomplete' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Profile Required</AlertTitle>
            <AlertDescription>
              To apply for jobs, you must complete your candidate profile. Please fill out the required information below.
            </AlertDescription>
          </Alert>
        )}

        {hasProfile ? (
          <ProfileForm initialData={profileData} defaultTab={tab} />
        ) : (
          <ProfileForm defaultTab={tab} />
        )}
      </div>
    </div>
  );
} 