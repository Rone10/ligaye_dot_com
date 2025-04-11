import { redirect } from 'next/navigation';
import { getUser } from '@/lib/supabase/server';
import { getCandidateProfile } from './_queries';
import ProfileForm from './_components/profile-form';

interface PageProps {
  params: Promise<{}>;
  searchParams: Promise<{
    tab?: string;
  }>;
}

export default async function CandidateProfilePage({ params, searchParams }: PageProps) {
  // Get logged-in user
  const user = await getUser();
  
  // Handle unauthorized access
  if (!user) {
    redirect('/sign-in');
  }
  
  // Get tab from search params
  const { tab } = await searchParams;
  
  // Fetch candidate profile data
  const profileData = await getCandidateProfile(user.id);
  
  // Check if profile exists, if not show creation form
  const hasProfile = !!profileData?.candidateProfile;
  
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