'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Briefcase, 
  Users, 
  Eye, 
  LightbulbIcon, 
  TrendingUp,
  LucideProps 
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getDashboardStats, 
  getActiveJobs, 
  getRecentApplicants, 
  getQuickTips,
  getProfileCompletion,
  DashboardStat,
  ActiveJob,
  RecentApplicant,
  QuickTip
} from '@/app/actions/employer/dashboard';
import { getUser } from '@/lib/supabase/server';

// Map of icon names to components
const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  Briefcase,
  Users,
  Eye,
  Clock,
  LightbulbIcon,
  TrendingUp,
};

export default function EmployerDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [activeJobs, setActiveJobs] = useState<ActiveJob[]>([]);
  const [recentApplicants, setRecentApplicants] = useState<RecentApplicant[]>([]);
  const [quickTips, setQuickTips] = useState<QuickTip[]>([]);
  const [profileCompletion, setProfileCompletion] = useState<number>(0);
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Load user data
        const user = await getUser();
        if (user?.user_metadata?.full_name) {
          setUserName(user.user_metadata.full_name.split(' ')[0] || 'there');
        }
        
        // Load dashboard data
        const [statsData, jobsData, applicantsData, tipsData, completionData] = await Promise.all([
          getDashboardStats(),
          getActiveJobs(),
          getRecentApplicants(),
          getQuickTips(),
          getProfileCompletion()
        ]);
        
        setStats(statsData);
        setActiveJobs(jobsData);
        setRecentApplicants(applicantsData);
        setQuickTips(tipsData);
        setProfileCompletion(completionData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-2xl font-bold mb-2">Welcome back, {userName || 'there'}!</h1>
          <p className="text-gray-600">Here's what's happening with your job postings today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = iconMap[stat.icon] || Users; // Fallback to Users if not found
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg border p-6"
              >
                <div className="flex items-center gap-4">
                  <div className={`${stat.className} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold">{stat.value}</div>
                    <div className="text-gray-600">{stat.label}</div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Jobs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Active Jobs</h2>
              <Button 
                className="bg-blue-600"
                onClick={() => router.push('/employer/jobs/create')}
              >
                Create Job
              </Button>
            </div>
            <div className="space-y-6">
              {activeJobs.length > 0 ? (
                activeJobs.map((job, index) => (
                  <div key={job.id} className="border-b last:border-0 pb-4 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{job.title}</h3>
                        <div className="text-sm text-gray-600">
                          {job.location}, {job.type}
                        </div>
                      </div>
                      <Badge className="bg-green-50 text-green-600">
                        {job.applicants} applicants
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      <Clock className="w-4 h-4 inline-block mr-1" />
                      Expires in {job.expiresIn}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No active jobs found. Create your first job posting!
                </div>
              )}
            </div>
            <Button 
              variant="link" 
              className="text-blue-600 mt-4"
              onClick={() => router.push('/employer/jobs')}
            >
              View all jobs →
            </Button>
          </motion.div>

          {/* Recent Applicants */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border p-6"
          >
            <h2 className="text-lg font-semibold mb-6">Recent Applicants</h2>
            <div className="space-y-6">
              {recentApplicants.length > 0 ? (
                recentApplicants.map((applicant) => (
                  <div key={applicant.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={applicant.avatar} alt={applicant.name} />
                        <AvatarFallback>{applicant.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{applicant.name}</div>
                        <div className="text-sm text-gray-600">
                          Applied for {applicant.position}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{applicant.timeAgo}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No recent applicants found.
                </div>
              )}
            </div>
            <Button 
              variant="link" 
              className="text-blue-600 mt-4"
              onClick={() => router.push('/employer/applications')}
            >
              View all applicants →
            </Button>
          </motion.div>

          {/* Quick Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border p-6"
          >
            <h2 className="text-lg font-semibold mb-6">Quick Tips</h2>
            <div className="space-y-6">
              {quickTips.map((tip, index) => {
                const Icon = iconMap[tip.icon] || LightbulbIcon; // Fallback to LightbulbIcon if not found
                return (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium">{tip.title}</h3>
                      <p className="text-sm text-gray-600">{tip.description}</p>
                      <Button variant="link" className="text-blue-600 p-0 h-auto mt-1">
                        Read more
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Account Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border p-6"
          >
            <h2 className="text-lg font-semibold mb-6">Account Status</h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Profile Completion</span>
                  <span>{profileCompletion}%</span>
                </div>
                <Progress value={profileCompletion} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Subscription Plan</div>
                    <div className="text-sm text-gray-600">Valid until March 2025</div>
                  </div>
                  <Badge className="bg-green-50 text-green-600">Premium</Badge>
                </div>
              </div>
              {profileCompletion < 100 && (
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push('/employer/company/edit')}
                  >
                    Complete Your Profile
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
} 