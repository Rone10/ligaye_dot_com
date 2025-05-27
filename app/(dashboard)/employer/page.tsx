import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BriefcaseIcon, 
  UsersIcon, 
  CalendarIcon, 
  Eye,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getEmployerDashboardData } from './_actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// We still need 'force-dynamic' because this page uses cookies for authentication
// However, the actual data fetching is still cached using unstable_cache
export const dynamic = 'force-dynamic';

export default async function EmployerDashboard() {
  // Data will be cached based on the unstable_cache configuration in _queries.ts
  // Cache will be invalidated when jobs or applications change
  const { data, error } = await getEmployerDashboardData();

  // Handle errors from the action
  if (error || !data) {
    return (
      <Alert variant="destructive" className="mt-8">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error Loading Dashboard</AlertTitle>
        <AlertDescription>
          {error || 'An unexpected error occurred. Please try again or contact support.'}
          {/* Optionally add a link to profile setup if profile not found */}
          {error?.includes('profile not found') && (
            <p className="mt-2">
              Please ensure your employer profile is complete. 
              <Link href="/employer/profile" className="font-medium underline">
                Go to Profile Setup
              </Link>
            </p>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  const { statsData, recentJobs, recentApplications, userName } = data;
  
  const stats = [
    { 
      title: 'Active Jobs', 
      value: statsData.activeJobs.toString(), 
      icon: BriefcaseIcon,
      href: '/employer/jobs',
      color: 'bg-primary-blue/10 text-primary-blue'
    },
    { 
      title: 'Total Applicants', // Note: Uses placeholder logic in query
      value: statsData.totalApplicants.toString(), 
      icon: UsersIcon,
      href: '/employer/jobs/applicants',
      color: 'bg-purple-500/10 text-purple-600'
    },
    {
      title: 'Expiring Soon', 
      value: statsData.expiringJobs.toString(), 
      icon: CalendarIcon,
      href: '/employer/jobs?filter=expiring', // Suggesting a potential filter param
      color: 'bg-amber-500/10 text-amber-600'
    }
  ];

  return (
    <div className="space-y-8 py-4">
      {/* Welcome section */}
      <div className="relative overflow-hidden rounded-xl  p-8 bg-primary-blue">
        <div className="absolute right-0 top-0 -translate-y-1/2 translate-x-1/3">
          <div className="h-96 w-96 rounded-full blur-3xl"></div>
        </div>
        <div className="relative text-white">
          <div className="mb-2 flex items-center">
            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
              <BriefcaseIcon className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium ">Employer Portal</p>
          </div>
          <h1 className="text-3xl font-bold tracking-tight  md:text-4xl">
            Welcome back, <span className="relative inline-block">
              {userName}
              <span className="absolute -bottom-1 left-0 h-1 w-full bg-white/40 rounded"></span>
            </span>
          </h1>
          <p className="mt-3 max-w-lg ">
            Manage your job postings, review applications, and grow your team with Ligaye&apos;s comprehensive employer tools.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/employer/jobs/new">
              <Button className="bg-white text-[#4a6cfa] hover:bg-white/90 hover:text-[#2d4eff] transition-all">
                Post a New Job
              </Button>
            </Link>
            <Link href="/employer/jobs">
              <Button variant="outline" className="bg-white text-[#4a6cfa] hover:bg-white/90 hover:text-[#2d4eff] transition-all">
                View My Jobs
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Stats section */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <Link key={index} href={stat.href}>
            <Card className="overflow-hidden hover:shadow-md transition-all duration-300 hover:translate-y-[-3px] cursor-pointer border-t-4 border-t-[#4a6cfa]/80">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-full ${stat.color}`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{stat.value}</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      
      {/* Recent activity section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>
              Latest candidates who applied to your job openings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentApplications && recentApplications.length > 0 ? (
                recentApplications.map((app) => (
                  <div key={app.applicationId} className="flex items-center gap-4 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={app.candidateAvatarUrl ?? undefined} alt={app.candidateName ?? 'Candidate'} />
                      <AvatarFallback>
                        <UsersIcon className="h-5 w-5 text-muted-foreground" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Link href={`/employer/jobs/applicants/${app.applicationId}`}>
                        <p className="text-sm font-medium truncate">{app.candidateName ?? 'Unknown Candidate'}</p>
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        Applied for{' '}
                        <Link href={`/employer/jobs/${app.jobId}`} className="hover:underline font-medium">
                          {app.jobTitle}
                        </Link>{' '}
                        {app.appliedAt ? formatDistanceToNow(app.appliedAt, { addSuffix: true }) : ''}
                      </p>
                    </div>
                    <Link href={`/employer/jobs/applicants/${app.applicationId}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No recent applications found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Job Postings</CardTitle>
            <CardDescription>
              Your latest 5 job postings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentJobs.length > 0 ? (
              <div className="space-y-2">
                {recentJobs.map((job) => (
                  <div key={job.id} className="flex items-center gap-4 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                    <div className="h-10 w-10 rounded-full bg-primary-blue/10 flex items-center justify-center">
                      <BriefcaseIcon className="h-5 w-5 text-primary-blue" />
                    </div>
                    <div className="flex-1">
                      <Link href={`/employer/jobs/${job.id}`} className="hover:underline">
                        <p className="text-sm font-medium line-clamp-1">{job.title}</p>
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        Posted {job.createdAt ? formatDistanceToNow(job.createdAt, { addSuffix: true }) : 'recently'}
                      </p>
                    </div>
                    <Badge variant={job.status === 'ACTIVE' ? 'default' : 'secondary'} className="capitalize">
                      {job.status}
                    </Badge>
                    <Link href={`/employer/jobs/${job.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                You haven&apos;t posted any jobs yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 