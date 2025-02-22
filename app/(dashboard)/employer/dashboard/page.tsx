'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { stats, activeJobs, recentApplicants, quickTips } from '@/app/actions/employer/mock-data';

export default function EmployerDashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-2xl font-bold mb-2">Welcome back, John!</h1>
          <p className="text-gray-600">Here's what's happening with your job postings today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
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
              <Button className="bg-blue-600">Create Job</Button>
            </div>
            <div className="space-y-6">
              {activeJobs.map((job, index) => (
                <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
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
              ))}
            </div>
            <Button variant="link" className="text-blue-600 mt-4">
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
              {recentApplicants.map((applicant, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <img src={applicant.avatar} alt={applicant.name} />
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
              ))}
            </div>
            <Button variant="link" className="text-blue-600 mt-4">
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
                const Icon = tip.icon;
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
                  <span>85%</span>
                </div>
                <Progress value={85} className="h-2" />
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
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
} 