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
      <div className="bg-gradient-to-r from-[#e9efff] to-[#f4f7ff] p-8 rounded-2xl shadow-sm border border-[rgba(255,255,255,0.5)]">
        <h1 className="text-3xl font-bold text-[#1a1e2d] mb-2">Welcome to Your Dashboard</h1>
        <p className="text-[#9aa3bc] max-w-2xl">
          Track your job applications, manage your career profile, and discover new opportunities that match your skills.
        </p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/70 backdrop-blur-md border border-[rgba(255,255,255,0.3)] shadow-[0_8px_32px_rgba(31,38,135,0.1)] transition-all duration-300 hover:translate-y-[-5px] hover:shadow-[0_15px_35px_rgba(31,38,135,0.15)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold text-[#1a1e2d]">Profile Status</CardTitle>
            <UserCircle className="h-5 w-5 text-[#4a6cfa]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1a1e2d]">
              {candidateProfile?.resumeUrl ? 'Active' : 'Incomplete'}
            </div>
            <p className="text-sm text-[#9aa3bc] mt-1">
              {candidateProfile?.resumeUrl 
                ? 'Your profile is ready for applications' 
                : 'Complete your profile to improve visibility'}
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Link 
              href="/candidate/profile" 
              className="flex items-center text-[#4a6cfa] font-medium hover:text-[#7b90ff] transition-colors"
            >
              {candidateProfile?.resumeUrl ? 'Update Profile' : 'Complete Profile'} 
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardFooter>
        </Card>
        
        <Card className="bg-white/70 backdrop-blur-md border border-[rgba(255,255,255,0.3)] shadow-[0_8px_32px_rgba(31,38,135,0.1)] transition-all duration-300 hover:translate-y-[-5px] hover:shadow-[0_15px_35px_rgba(31,38,135,0.15)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold text-[#1a1e2d]">Applications</CardTitle>
            <BriefcaseIcon className="h-5 w-5 text-[#4a6cfa]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1a1e2d]">{applicationCount}</div>
            <p className="text-sm text-[#9aa3bc] mt-1">Active job applications</p>
          </CardContent>
          <CardFooter className="pt-0">
            <Link 
              href="/candidate/applications" 
              className="flex items-center text-[#4a6cfa] font-medium hover:text-[#7b90ff] transition-colors"
            >
              View Applications <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardFooter>
        </Card>
        
        <Card className="bg-white/70 backdrop-blur-md border border-[rgba(255,255,255,0.3)] shadow-[0_8px_32px_rgba(31,38,135,0.1)] transition-all duration-300 hover:translate-y-[-5px] hover:shadow-[0_15px_35px_rgba(31,38,135,0.15)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold text-[#1a1e2d]">Saved Jobs</CardTitle>
            <BookmarkIcon className="h-5 w-5 text-[#4a6cfa]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1a1e2d]">{savedJobsCount}</div>
            <p className="text-sm text-[#9aa3bc] mt-1">Bookmarked job postings</p>
          </CardContent>
          <CardFooter className="pt-0">
            <Link 
              href="/candidate/saved-jobs" 
              className="flex items-center text-[#4a6cfa] font-medium hover:text-[#7b90ff] transition-colors"
            >
              View Saved Jobs <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardFooter>
        </Card>
        
        <Card className="bg-white/70 backdrop-blur-md border border-[rgba(255,255,255,0.3)] shadow-[0_8px_32px_rgba(31,38,135,0.1)] transition-all duration-300 hover:translate-y-[-5px] hover:shadow-[0_15px_35px_rgba(31,38,135,0.15)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold text-[#1a1e2d]">Browse Jobs</CardTitle>
            <Search className="h-5 w-5 text-[#4a6cfa]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1a1e2d]">Explore</div>
            <p className="text-sm text-[#9aa3bc] mt-1">Find new opportunities</p>
          </CardContent>
          <CardFooter className="pt-0">
            <Link 
              href="/jobs" 
              className="flex items-center text-[#4a6cfa] font-medium hover:text-[#7b90ff] transition-colors"
            >
              Browse All Jobs <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardFooter>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <Card className="bg-white/70 backdrop-blur-md border border-[rgba(255,255,255,0.3)] p-6 rounded-xl shadow-[0_8px_32px_rgba(31,38,135,0.1)]">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold text-[#1a1e2d]">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/jobs">
              <div className="flex items-center p-4 border border-[#e1e5f2] rounded-lg hover:border-[#4a6cfa] hover:bg-[#f8faff] transition-colors group">
                <div className="bg-[#e9efff] p-3 rounded-lg group-hover:bg-[#4a6cfa]/10 transition-colors">
                  <Search className="h-5 w-5 text-[#4a6cfa]" />
                </div>
                <div className="ml-3">
                  <div className="text-[#1a1e2d] font-medium">Find Jobs</div>
                  <div className="text-xs text-[#9aa3bc]">Browse listings</div>
                </div>
              </div>
            </Link>
            
            <Link href="/candidate/profile?tab=resume">
              <div className="flex items-center p-4 border border-[#e1e5f2] rounded-lg hover:border-[#4a6cfa] hover:bg-[#f8faff] transition-colors group">
                <div className="bg-[#e9efff] p-3 rounded-lg group-hover:bg-[#4a6cfa]/10 transition-colors">
                  <UserCircle className="h-5 w-5 text-[#4a6cfa]" />
                </div>
                <div className="ml-3">
                  <div className="text-[#1a1e2d] font-medium">Update Resume</div>
                  <div className="text-xs text-[#9aa3bc]">Edit profile</div>
                </div>
              </div>
            </Link>
            
            <Link href="/candidate/applications">
              <div className="flex items-center p-4 border border-[#e1e5f2] rounded-lg hover:border-[#4a6cfa] hover:bg-[#f8faff] transition-colors group">
                <div className="bg-[#e9efff] p-3 rounded-lg group-hover:bg-[#4a6cfa]/10 transition-colors">
                  <BriefcaseIcon className="h-5 w-5 text-[#4a6cfa]" />
                </div>
                <div className="ml-3">
                  <div className="text-[#1a1e2d] font-medium">Track Applications</div>
                  <div className="text-xs text-[#9aa3bc]">View progress</div>
                </div>
              </div>
            </Link>
            
            <Link href="/candidate/saved-jobs">
              <div className="flex items-center p-4 border border-[#e1e5f2] rounded-lg hover:border-[#4a6cfa] hover:bg-[#f8faff] transition-colors group">
                <div className="bg-[#e9efff] p-3 rounded-lg group-hover:bg-[#4a6cfa]/10 transition-colors">
                  <BookmarkIcon className="h-5 w-5 text-[#4a6cfa]" />
                </div>
                <div className="ml-3">
                  <div className="text-[#1a1e2d] font-medium">Saved Jobs</div>
                  <div className="text-xs text-[#9aa3bc]">Review bookmarks</div>
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 