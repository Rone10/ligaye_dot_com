'use client';

import { motion } from 'framer-motion';
import { FileText, Users } from 'lucide-react';

const resources = [
  {
    title: 'Resume Writing Tips',
    description: 'Learn how to craft a compelling resume that stands out.',
    icon: FileText,
  },
  {
    title: 'Interview Preparation',
    description: 'Essential tips for acing your next job interview.',
    icon: Users,
  },
];

export function CareerTips() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border p-6"
    >
      <h2 className="text-lg font-semibold mb-4">Career Tips & Resources</h2>
      <div className="space-y-4">
        {resources.map((resource, index) => {
          const Icon = resource.icon;
          return (
            <div key={index} className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Icon className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="font-medium text-sm">{resource.title}</h3>
                <p className="text-sm text-gray-600">{resource.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}