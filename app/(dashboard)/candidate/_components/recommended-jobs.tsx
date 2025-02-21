'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const recommendedJobs = [
  {
    position: 'Senior Frontend Developer',
    company: 'TechCorp Solutions',
    location: 'Banjul',
    description: 'Lead frontend development initiatives and mentor junior developers. 5+ years experience required.',
    badge: 'New',
  },
  {
    position: 'Product Designer',
    company: 'Design Studio',
    location: 'Remote',
    description: 'Create user-centered designs for web and mobile applications. Strong portfolio required.',
    badge: 'Featured',
  },
];

export function RecommendedJobs() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border p-6"
    >
      <h2 className="text-lg font-semibold mb-6">Recommended Jobs</h2>
      <div className="space-y-6">
        {recommendedJobs.map((job, index) => (
          <div key={index} className="border-b last:border-0 pb-6 last:pb-0">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium">{job.position}</h3>
                <div className="text-sm text-gray-600">
                  {job.company} • {job.location}
                </div>
              </div>
              <Badge
                className={
                  job.badge === 'New'
                    ? 'bg-blue-50 text-blue-600'
                    : 'bg-purple-50 text-purple-600'
                }
              >
                {job.badge}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-4">{job.description}</p>
            <Button variant="outline" className="text-blue-600">
              View Job
            </Button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}