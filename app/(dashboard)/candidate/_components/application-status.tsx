'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const applications = [
  {
    position: 'Senior Frontend Developer',
    company: 'TechCorp Solutions',
    status: 'Under Review',
  },
  {
    position: 'UX Designer',
    company: 'Creative Agency Ltd',
    status: 'Interview Scheduled',
  },
  {
    position: 'Product Manager',
    company: 'Innovation Hub',
    status: 'Applied',
  },
];

const stats = [
  {
    label: 'Applications',
    value: '3',
    subtext: 'Pending Review',
    className: 'bg-blue-50',
    textColor: 'text-blue-600',
  },
  {
    label: 'Interview',
    value: '1',
    subtext: 'Scheduled',
    className: 'bg-green-50',
    textColor: 'text-green-600',
  },
  {
    label: 'Applications',
    value: '5',
    subtext: 'Sent This Week',
    className: 'bg-purple-50',
    textColor: 'text-purple-600',
  },
];

export function ApplicationStatus() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Application Status</h2>
        <Button variant="link" className="text-blue-600">
          View All Applications
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className={`rounded-lg p-4 ${stat.className}`}>
            <div className={`font-semibold ${stat.textColor}`}>
              {stat.value} {stat.label}
            </div>
            <div className="text-sm text-gray-600">{stat.subtext}</div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {applications.map((app, index) => (
          <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
            <div>
              <div className="font-medium">{app.position}</div>
              <div className="text-sm text-gray-600">{app.company}</div>
            </div>
            <Badge
              className={
                app.status === 'Under Review'
                  ? 'bg-yellow-50 text-yellow-600'
                  : app.status === 'Interview Scheduled'
                  ? 'bg-green-50 text-green-600'
                  : 'bg-gray-50 text-gray-600'
              }
            >
              {app.status}
            </Badge>
          </div>
        ))}
      </div>
    </motion.div>
  );
}