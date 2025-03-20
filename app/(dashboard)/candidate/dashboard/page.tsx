import { Suspense } from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ApplicationStatus } from '../_components/application-status';
import { RecommendedJobs } from '../_components/recommended-jobs';
import { SavedJobs } from '../_components/saved-jobs';
import { ProfileCompleteness } from '../_components/profile-completeness';
import { CareerTips } from '../_components/career-tips';
import { getCandidateDashboardData } from '@/app/actions/candidate/dashboard';
import { getCandidateProfile } from '@/app/actions/candidate/profile';

// Loading component for Suspense fallback
function DashboardLoadingSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        
        <div className="rounded-lg border p-6 space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
        
        <div className="rounded-lg border p-6 space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg space-y-2">
                <Skeleton className="h-5 w-64" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="lg:w-80 space-y-6">
        <div className="rounded-lg border p-6 space-y-4">
          <Skeleton className="h-6 w-28" />
          <div className="space-y-3">
            {Array(2).fill(0).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>
        
        <div className="rounded-lg border p-6 space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    </div>
  );
}

// Server component to fetch dashboard data
async function DashboardContent() {
  // Fetch necessary data for the dashboard
  const profile = await getCandidateProfile();
  
  // Extract candidate name from profile
  const candidateName = profile?.profile?.fullName || "Candidate";
  
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Main Content */}
      <div className="flex-1 space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Welcome back, {candidateName.split(' ')[0]}!</h1>
          <p className="text-muted-foreground">Here's an overview of your job search progress.</p>
        </div>

        <ApplicationStatus />
        <RecommendedJobs />
      </div>

      {/* Sidebar */}
      <div className="lg:w-80 space-y-6">
        <SavedJobs />
        <ProfileCompleteness />
        <CareerTips />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="hidden md:block  max-w-xl mx-auto w-2/3 ">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search jobs..."
                className="pl-9 w-full"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <Bell className="h-5 w-5 text-gray-600" />
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e" alt="User Avatar" />
              </Avatar>
              <span className="text-sm font-medium">My Account</span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<DashboardLoadingSkeleton />}>
          <DashboardContent />
        </Suspense>
      </div>
    </div>
  );
}