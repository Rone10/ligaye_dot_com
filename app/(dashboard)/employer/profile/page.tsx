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
    redirect('/sign-in?redirect=/employer/profile')
  }
  // TODO: check if user is admin then grant access otherwise redirect to employer profile page

  // Parallel data fetching for optimal performance
  const [employerProfile, industries, locations] = await Promise.all([
    getEmployerProfile(user.id),
    getAllIndustries(),
    getAllLocations()
  ]);
  
  if (!employerProfile) {
    redirect('/employer/jobs/')
  }
  
  // Check if profile exists, if not show creation form
  const hasProfile = !!employerProfile?.employerProfile;
  
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
      
      <div className=" backdrop-blur-lg rounded-2xl border border-gray-100 shadow-level-4 p-6">
        <EmployerProfileForm 
          initialData={employerProfile || undefined} 
          industries={industries} 
          locations={locations} 
        />
      </div>
    </div>
  );
} 