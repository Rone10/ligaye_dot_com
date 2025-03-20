import { Suspense } from 'react';
import { ProfileForm } from '../_components/profile-form';
import { getCandidateProfile } from '@/app/actions/candidate/profile';
import { Skeleton } from '@/components/ui/skeleton';

// Loading component for Suspense fallback
function ProfileFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border shadow-sm">
        <div className="p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
          <div className="space-y-4 mt-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Server component to fetch profile data
async function ProfileContent() {
  // Fetch candidate profile data
  const profile = await getCandidateProfile();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your professional profile information
        </p>
      </div>
      
      <ProfileForm profile={profile} />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <div className="container py-6 max-w-4xl mx-auto">
      <Suspense fallback={<ProfileFormSkeleton />}>
        <ProfileContent />
      </Suspense>
    </div>
  );
}