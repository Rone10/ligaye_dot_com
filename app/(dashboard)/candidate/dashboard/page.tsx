'use client';

import { motion } from 'framer-motion';
import { Search, Bell, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { ApplicationStatus } from '../_components/application-status';
import { RecommendedJobs } from '../_components/recommended-jobs';
import { SavedJobs } from '../_components/saved-jobs';
import { ProfileCompleteness } from '../_components/profile-completeness';
import { CareerTips } from '../_components/career-tips';

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
                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e" alt="John Smith" />
              </Avatar>
              <span className="text-sm font-medium">John Smith</span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-2xl font-bold mb-1">Welcome back, John!</h1>
              <p className="text-gray-600">Here's an overview of your job search progress.</p>
            </motion.div>

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
      </div>
    </div>
  );
}