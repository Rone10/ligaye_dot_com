import { 
  BriefcaseIcon, 
  BookmarkIcon, 
  UserCircle, 
  Clock, 
  LayoutDashboard, 
  ArrowRight,
  Search
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { getUser } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { candidateProfiles, applications, savedJobs, profiles } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { formatDistanceToNow } from 'date-fns';

export default async function CandidateDashboard() {
  const user = await getUser();
  
  // Initialize variables
  let profile = null;
  let candidateProfile = null;
  let applicationCount = 0;
  let savedJobsCount = 0;
  
  if (user) {
    // First, get the profile which maps to both candidateProfile and savedJobs
    const profileResult = await db()
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1);
    
    if (profileResult.length > 0) {
      profile = profileResult[0];
      
      // Now get the candidate profile
      const candidateProfileResult = await db()
        .select()
        .from(candidateProfiles)
        .where(eq(candidateProfiles.profileId, profile.id))
        .limit(1);
      
      if (candidateProfileResult.length > 0) {
        candidateProfile = candidateProfileResult[0];
        
        // Get application count
        const applicationsResult = await db()
          .select()
          .from(applications)
          .where(eq(applications.candidateProfileId, candidateProfile.id));
        
        applicationCount = applicationsResult.length;
      }
      
      // Get saved jobs count - this is associated with the profile, not candidate profile
      const savedJobsResult = await db()
        .select()
        .from(savedJobs)
        .where(
          and(
            eq(savedJobs.userId, profile.id),
            eq(savedJobs.deleted, false)
          )
        );
      
      savedJobsCount = savedJobsResult.length;
    }
  }
  
  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="glass-card p-8">
        <h1 className="text-3xl font-bold text-theme-dark mb-2">Welcome to Your Dashboard</h1>
        <p className="text-theme-gray-dark max-w-2xl">
          Track your job applications, manage your career profile, and discover new opportunities that match your skills.
        </p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card transition-all duration-300 hover:translate-y-[-5px] hover:shadow-level-3">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold text-theme-dark">Profile Status</CardTitle>
            <UserCircle className="h-5 w-5 text-primary-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-theme-dark">
              {candidateProfile?.resumeUrl ? 'Active' : 'Incomplete'}
            </div>
            <p className="text-sm text-theme-gray-dark mt-1">
              {candidateProfile?.resumeUrl 
                ? 'Your profile is ready for applications' 
                : 'Complete your profile to improve visibility'}
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Link 
              href="/candidate/profile" 
              className="flex items-center text-primary-blue font-medium hover:text-primary-blue-light transition-colors"
            >
              {candidateProfile?.resumeUrl ? 'Update Profile' : 'Complete Profile'} 
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardFooter>
        </Card>
        
        <Card className="glass-card transition-all duration-300 hover:translate-y-[-5px] hover:shadow-level-3">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold text-theme-dark">Applications</CardTitle>
            <BriefcaseIcon className="h-5 w-5 text-primary-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-theme-dark">{applicationCount}</div>
            <p className="text-sm text-theme-gray-dark mt-1">Active job applications</p>
          </CardContent>
          <CardFooter className="pt-0">
            <Link 
              href="/candidate/applications" 
              className="flex items-center text-primary-blue font-medium hover:text-primary-blue-light transition-colors"
            >
              View Applications <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardFooter>
        </Card>
        
        <Card className="glass-card transition-all duration-300 hover:translate-y-[-5px] hover:shadow-level-3">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold text-theme-dark">Saved Jobs</CardTitle>
            <BookmarkIcon className="h-5 w-5 text-primary-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-theme-dark">{savedJobsCount}</div>
            <p className="text-sm text-theme-gray-dark mt-1">Bookmarked job postings</p>
          </CardContent>
          <CardFooter className="pt-0">
            <Link 
              href="/candidate/saved-jobs" 
              className="flex items-center text-primary-blue font-medium hover:text-primary-blue-light transition-colors"
            >
              View Saved Jobs <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardFooter>
        </Card>
        
        <Card className="glass-card transition-all duration-300 hover:translate-y-[-5px] hover:shadow-level-3">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold text-theme-dark">Browse Jobs</CardTitle>
            <Search className="h-5 w-5 text-primary-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-theme-dark">Explore</div>
            <p className="text-sm text-theme-gray-dark mt-1">Find new opportunities</p>
          </CardContent>
          <CardFooter className="pt-0">
            <Link 
              href="/jobs" 
              className="flex items-center text-primary-blue font-medium hover:text-primary-blue-light transition-colors"
            >
              Browse All Jobs <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardFooter>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <Card className="glass-card p-6 rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold text-theme-dark">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/jobs">
              <div className="flex items-center p-4 border border-theme-gray rounded-lg hover:border-primary-blue hover:bg-theme-light transition-colors group">
                <div className="bg-primary-blue/10 p-3 rounded-lg group-hover:bg-primary-blue/20 transition-colors">
                  <Search className="h-5 w-5 text-primary-blue" />
                </div>
                <div className="ml-3">
                  <div className="text-theme-dark font-medium">Find Jobs</div>
                  <div className="text-xs text-theme-gray-dark">Browse listings</div>
                </div>
              </div>
            </Link>
            
            <Link href="/candidate/profile?tab=resume">
              <div className="flex items-center p-4 border border-theme-gray rounded-lg hover:border-primary-blue hover:bg-theme-light transition-colors group">
                <div className="bg-primary-blue/10 p-3 rounded-lg group-hover:bg-primary-blue/20 transition-colors">
                  <UserCircle className="h-5 w-5 text-primary-blue" />
                </div>
                <div className="ml-3">
                  <div className="text-theme-dark font-medium">Update Resume</div>
                  <div className="text-xs text-theme-gray-dark">Edit profile</div>
                </div>
              </div>
            </Link>
            
            <Link href="/candidate/applications">
              <div className="flex items-center p-4 border border-theme-gray rounded-lg hover:border-primary-blue hover:bg-theme-light transition-colors group">
                <div className="bg-primary-blue/10 p-3 rounded-lg group-hover:bg-primary-blue/20 transition-colors">
                  <BriefcaseIcon className="h-5 w-5 text-primary-blue" />
                </div>
                <div className="ml-3">
                  <div className="text-theme-dark font-medium">Track Applications</div>
                  <div className="text-xs text-theme-gray-dark">View progress</div>
                </div>
              </div>
            </Link>
            
            <Link href="/candidate/saved-jobs">
              <div className="flex items-center p-4 border border-theme-gray rounded-lg hover:border-primary-blue hover:bg-theme-light transition-colors group">
                <div className="bg-primary-blue/10 p-3 rounded-lg group-hover:bg-primary-blue/20 transition-colors">
                  <BookmarkIcon className="h-5 w-5 text-primary-blue" />
                </div>
                <div className="ml-3">
                  <div className="text-theme-dark font-medium">Saved Jobs</div>
                  <div className="text-xs text-theme-gray-dark">Review bookmarks</div>
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 