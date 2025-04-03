import { redirect } from 'next/navigation';
import { getUser } from '@/lib/supabase/server';
import { getEmployerProfile, getAllIndustries, getAllLocations, } from './_queries';
import EmployerProfileForm from './_components/employer-profile-form';

interface PageProps {
  params: Promise<{}>
}

export default async function EmployerProfilePage({ params }: PageProps) {
  // Get logged-in user
  const user = await getUser()

  if (!user) {
    redirect('/sign-in')
  }
  // TODO: check if user is admin then grant access otherwise redirect to employer profile page


  // check if user is employer
  const employerProfile = await getEmployerProfile(user.id)
  
  if (!employerProfile) {
    redirect('/employer/jobs/')
  }
  
  // Fetch employer profile data
  const profileData = await getEmployerProfile(user.id);
  
  // Check if profile exists, if not show creation form
  const hasProfile = !!profileData?.employerProfile;
  
  // Fetch all industries and locations for form
  const industries = await getAllIndustries();
  const locations = await getAllLocations();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Company Profile</h1>
        <p className="text-gray-600 mt-2">
          {hasProfile 
            ? "Manage your company profile information below." 
            : "Create your company profile to start posting jobs."}
        </p>
      </div>
      
      <div className="bg-white/70 backdrop-blur-lg rounded-2xl border border-gray-100 shadow-md p-6">
        <EmployerProfileForm 
          initialData={profileData || undefined} 
          industries={industries} 
          locations={locations} 
        />
      </div>
    </div>
  );
} 