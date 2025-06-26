import { redirect } from 'next/navigation';
import { getUser } from '@/lib/supabase/server';
import { getCandidateProfileData } from './_queries';
import ProfileForm from './_components/profile-form';

interface PageProps {
  params: Promise<{}>;
  searchParams: Promise<{
    tab?: string;
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
  const [{ tab }, profileData] = await Promise.all([
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
        
        {hasProfile ? (
          <ProfileForm initialData={profileData} defaultTab={tab} />
        ) : (
          <ProfileForm defaultTab={tab} />
        )}
      </div>
    </div>
  );
} 