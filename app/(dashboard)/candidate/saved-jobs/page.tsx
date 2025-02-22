'use client';

import { motion } from 'framer-motion';
import { MapPin, Building2, Clock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const savedJobs = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'TechCorp Solutions',
    location: 'San Francisco, CA',
    type: 'Full-time',
    description: 'Lead frontend development initiatives and mentor junior developers. Expert in React, TypeScript, and modern web technologies. 5+ years experience required.',
    savedAt: '2 days ago',
  },
  {
    id: '2',
    title: 'UX/UI Designer',
    company: 'Design Studio Inc.',
    location: 'Remote',
    type: 'Contract',
    description: 'Create user-centered designs for web and mobile applications. Strong portfolio required with experience in Figma and design systems.',
    savedAt: '5 days ago',
  },
];

export default function SavedJobsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-2xl font-bold mb-2">Saved Jobs</h1>
          <p className="text-gray-600">Browse and manage your saved job listings</p>
        </div>

        <div className="space-y-4">
          {savedJobs.map((job) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border p-6 relative group"
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-5 w-5" />
              </Button>

              <div className="mb-4">
                <a
                  href={`/jobs/${job.id}`}
                  className="text-lg font-medium text-blue-600 hover:underline"
                >
                  {job.title}
                </a>
                <div className="flex items-center gap-2 text-gray-600 mt-1">
                  <Building2 className="h-4 w-4" />
                  <span>{job.company}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{job.type}</span>
                </div>
              </div>

              <p className="text-gray-600 mb-4">{job.description}</p>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Saved {job.savedAt}
                </span>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  View Job
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-8">
          <div className="text-sm text-gray-600">
            Showing 1 to 10 of 20 results
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="text-gray-600"
              disabled
            >
              Previous
            </Button>
            <Button variant="outline" className="bg-blue-600 text-white">
              1
            </Button>
            <Button variant="outline" className="text-gray-600">
              2
            </Button>
            <Button variant="outline" className="text-gray-600">
              3
            </Button>
            <Button variant="outline" className="text-gray-600">
              Next
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}